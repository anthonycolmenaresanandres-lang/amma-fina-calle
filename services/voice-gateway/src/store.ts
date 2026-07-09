// Event-sourced-ish store (the data model from the plan: calls / drafts / messages /
// pos_sync_attempts / audit_logs). Default backend is in-memory with an optional,
// **atomic** JSON snapshot (STORE_SNAPSHOT) so a single always-on instance survives
// restarts — enough to pilot. For multi-instance scale-out, move to Postgres using the
// relational schema in `db/schema.sql` (same entities, same keys).

import { randomUUID } from "node:crypto";
import { writeFileSync, readFileSync, existsSync, renameSync } from "node:fs";
import type { AuditLog, CallRecord, Draft, Message, PosSyncAttempt } from "./types";

interface DB {
  calls: Record<string, CallRecord>;
  drafts: Record<string, Draft>;
  posSync: Record<string, PosSyncAttempt>; // keyed by idempotencyKey
  messages: Message[];
  audit: AuditLog[];
  turns: Record<string, CallTurnTelemetry>; // keyed by callId — SoundGate turn-quality KPIs
}

// Turn-quality telemetry per call (the SoundGate KPIs surfaced in /stats — see
// SOUNDGATE.md). Additive + best-effort: recording never changes call behavior, and the
// hot-path increments don't force a snapshot write (they ride the next persist()).
interface CallTurnTelemetry {
  callId: string;
  tenantId: string;
  speechStarts: number;         // caller speech detections (Realtime VAD speech_started)
  bargeIns: number;             // interruptions honored (agent yielded the floor)
  transientsSuppressed: number; // debounce HELD the floor (blip / one-word backchannel)
  realtimeErrors: number;       // OpenAI Realtime error events (e.g. insufficient_quota)
  lastErrorCode?: string;       // most recent Realtime error code/type
  ttfaMsSamples: number[];      // user speech_stopped -> first agent audio (responsiveness)
  lastBargeInAt?: number;       // for hang-up-after-interruption detection
  hangupAfterInterruption: boolean;
}

export type Store = ReturnType<typeof createStore>;

/** Build a store. Pass a snapshot path to make it durable (atomic write-through). */
export function createStore(snapshotPath = "") {
  const empty = (): DB => ({ calls: {}, drafts: {}, posSync: {}, messages: [], audit: [], turns: {} });

  function load(): DB {
    if (snapshotPath && existsSync(snapshotPath)) {
      try { return { ...empty(), ...(JSON.parse(readFileSync(snapshotPath, "utf8")) as Partial<DB>) }; } catch { /* fall through */ }
    }
    return empty();
  }

  const db: DB = load();

  // Atomic: write a temp file then rename over the target, so a crash mid-write can
  // never leave a half-written (corrupt) snapshot.
  function persist(): void {
    if (!snapshotPath) return;
    try {
      const tmp = `${snapshotPath}.tmp`;
      writeFileSync(tmp, JSON.stringify(db, null, 2));
      renameSync(tmp, snapshotPath);
    } catch { /* ignore — persistence is best-effort, never blocks a call */ }
  }

  function turnRec(callId: string, tenantId: string): CallTurnTelemetry {
    let t = db.turns[callId];
    if (!t) {
      t = { callId, tenantId, speechStarts: 0, bargeIns: 0, transientsSuppressed: 0,
        realtimeErrors: 0, ttfaMsSamples: [], hangupAfterInterruption: false };
      db.turns[callId] = t;
    }
    return t;
  }

  return {
    id: () => randomUUID(),

    createCall(fromPhone?: string, tenantId = "default"): CallRecord {
      const c: CallRecord = { callId: randomUUID(), tenantId, fromPhone, status: "active", startedAt: Date.now() };
      db.calls[c.callId] = c; persist(); return c;
    },
    getCall(callId: string): CallRecord | undefined { return db.calls[callId]; },
    endCall(callId: string): void {
      const c = db.calls[callId]; if (c) { c.status = "ended"; c.endedAt = Date.now(); persist(); }
    },

    draftsForCall(callId: string): Draft[] { return Object.values(db.drafts).filter((d) => d.callId === callId); },
    messagesForCall(callId: string): Message[] { return db.messages.filter((m) => m.callId === callId); },

    putDraft(d: Draft): void { db.drafts[d.draftId] = d; persist(); },
    getDraft(id: string): Draft | undefined { return db.drafts[id]; },

    /** Idempotent sync record keyed by idempotencyKey. Returns existing if present. */
    getSync(key: string): PosSyncAttempt | undefined { return db.posSync[key]; },
    putSync(s: PosSyncAttempt): void { db.posSync[s.idempotencyKey] = s; persist(); },

    putMessage(m: Message): void { db.messages.push(m); persist(); },
    messageCount(): number { return db.messages.length; },

    audit(entityType: string, entityId: string, eventType: string, before?: unknown, after?: unknown): void {
      db.audit.push({ auditId: randomUUID(), entityType, entityId, eventType, before, after, at: Date.now() });
      persist();
    },
    auditCount(): number { return db.audit.length; },
    bookingCount(): number { return Object.values(db.drafts).filter((d) => d.status === "committed").length; },

    // --- SoundGate turn telemetry (hot-path increments skip persist; flushed by next persist) ---
    recordSpeechStart(callId: string, tenantId = "default"): void { turnRec(callId, tenantId).speechStarts++; },
    recordBargeIn(callId: string, tenantId = "default"): void {
      const t = turnRec(callId, tenantId); t.bargeIns++; t.lastBargeInAt = Date.now();
    },
    recordTransientSuppressed(callId: string, tenantId = "default"): void { turnRec(callId, tenantId).transientsSuppressed++; },
    recordRealtimeError(callId: string, tenantId = "default", code?: string): void {
      const t = turnRec(callId, tenantId); t.realtimeErrors++; if (code) t.lastErrorCode = code; persist();
    },
    recordTtfa(callId: string, tenantId: string, ms: number): void {
      if (ms > 0) turnRec(callId, tenantId).ttfaMsSamples.push(Math.round(ms));
    },
    /** Called on call end: if a barge-in happened within `windowMs`, flag a likely
     *  awkward-interruption hang-up (an early-warning UX signal). */
    markHangupIfRecentBargeIn(callId: string, windowMs = 4000): void {
      const t = db.turns[callId];
      if (t?.lastBargeInAt && Date.now() - t.lastBargeInAt <= windowMs) { t.hangupAfterInterruption = true; persist(); }
    },
    turnTelemetry(callId: string): CallTurnTelemetry | undefined { return db.turns[callId]; },

    /** Rollup for the ROI / call-analytics view (/stats, npm run report). Optionally
     *  scoped to a single tenant so each client sees only their own numbers. */
    stats(tenantId?: string): {
      calls: number; activeCalls: number; drafts: number;
      bookings: number; confirmedBookings: number; pendingBookings: number;
      messages: number; missedCalls: number; handledPct: number; conversionPct: number; syncErrors: number; audits: number;
      speechStarts: number; bargeIns: number; transientsSuppressed: number; realtimeErrors: number;
      hangupsAfterInterruption: number; ttfaAvgMs: number; ttfaP50Ms: number;
    } {
      const inScope = <T extends { tenantId: string }>(x: T): boolean => !tenantId || x.tenantId === tenantId;
      const calls = Object.values(db.calls).filter(inScope);
      const drafts = Object.values(db.drafts).filter(inScope);
      const messages = db.messages.filter(inScope);
      const committed = drafts.filter((d) => d.status === "committed");
      const pendingBookings = committed.filter((d) => d.pendingConfirm).length;
      const confirmedBookings = committed.length - pendingBookings;
      const draftIds = new Set(drafts.map((d) => d.draftId));
      const syncErrors = Object.values(db.posSync).filter((s) => s.status === "error" && (!tenantId || draftIds.has(s.draftId))).length;
      // "Handled" = the call ended in a booking OR a captured message (i.e. not lost).
      const handled = committed.length + messages.length;
      // "Missed" = an ENDED call that produced neither a booking nor a message.
      const missedCalls = calls.filter((c) => c.status === "ended"
        && !committed.some((d) => d.callId === c.callId)
        && !messages.some((m) => m.callId === c.callId)).length;
      // Turn-quality (SoundGate) rollup.
      const turns = Object.values(db.turns).filter(inScope);
      const sumT = (f: (t: CallTurnTelemetry) => number): number => turns.reduce((n, t) => n + f(t), 0);
      const ttfa = turns.flatMap((t) => t.ttfaMsSamples);
      const ttfaSorted = [...ttfa].sort((a, b) => a - b);
      return {
        calls: calls.length,
        activeCalls: calls.filter((c) => c.status === "active").length,
        drafts: drafts.length,
        bookings: committed.length,
        confirmedBookings,
        pendingBookings,
        messages: messages.length,
        missedCalls,
        handledPct: calls.length ? Math.round((handled / calls.length) * 100) : 0,
        conversionPct: calls.length ? Math.round((committed.length / calls.length) * 100) : 0,
        syncErrors,
        audits: db.audit.length,
        speechStarts: sumT((t) => t.speechStarts),
        bargeIns: sumT((t) => t.bargeIns),
        transientsSuppressed: sumT((t) => t.transientsSuppressed),
        realtimeErrors: sumT((t) => t.realtimeErrors),
        hangupsAfterInterruption: turns.filter((t) => t.hangupAfterInterruption).length,
        ttfaAvgMs: ttfa.length ? Math.round(ttfa.reduce((a, b) => a + b, 0) / ttfa.length) : 0,
        ttfaP50Ms: ttfaSorted.length ? ttfaSorted[Math.floor((ttfaSorted.length - 1) / 2)]! : 0,
      };
    },
  };
}

// App-wide singleton. Set STORE_SNAPSHOT to a path on a mounted volume to make it durable.
export const store = createStore(process.env.STORE_SNAPSHOT ?? "");
