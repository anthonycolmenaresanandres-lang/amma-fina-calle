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
}

export type Store = ReturnType<typeof createStore>;

/** Build a store. Pass a snapshot path to make it durable (atomic write-through). */
export function createStore(snapshotPath = "") {
  const empty = (): DB => ({ calls: {}, drafts: {}, posSync: {}, messages: [], audit: [] });

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

    /** Rollup for the ROI / call-analytics view (/stats, npm run report). Optionally
     *  scoped to a single tenant so each client sees only their own numbers. */
    stats(tenantId?: string): {
      calls: number; activeCalls: number; drafts: number;
      bookings: number; confirmedBookings: number; pendingBookings: number;
      messages: number; missedCalls: number; handledPct: number; conversionPct: number; syncErrors: number; audits: number;
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
      };
    },
  };
}

// App-wide singleton. Set STORE_SNAPSHOT to a path on a mounted volume to make it durable.
export const store = createStore(process.env.STORE_SNAPSHOT ?? "");
