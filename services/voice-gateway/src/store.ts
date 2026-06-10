// Minimal in-memory event-sourced-ish store (the data model from the plan:
// calls / transcripts / drafts / approvals / pos_sync_attempts / audit_logs).
// v0 keeps it in memory with an optional JSON snapshot; swap for Postgres later.

import { randomUUID } from "node:crypto";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import type { AuditLog, CallRecord, Draft, Message, PosSyncAttempt } from "./types";

interface DB {
  calls: Record<string, CallRecord>;
  drafts: Record<string, Draft>;
  posSync: Record<string, PosSyncAttempt>; // keyed by idempotencyKey
  messages: Message[];
  audit: AuditLog[];
}

const SNAPSHOT = process.env.STORE_SNAPSHOT ?? ""; // optional path for persistence

const db: DB = load();

function load(): DB {
  const empty: DB = { calls: {}, drafts: {}, posSync: {}, messages: [], audit: [] };
  if (SNAPSHOT && existsSync(SNAPSHOT)) {
    try { return { ...empty, ...(JSON.parse(readFileSync(SNAPSHOT, "utf8")) as Partial<DB>) }; } catch { /* fall through */ }
  }
  return empty;
}
function persist(): void {
  if (SNAPSHOT) { try { writeFileSync(SNAPSHOT, JSON.stringify(db, null, 2)); } catch { /* ignore */ } }
}

export const store = {
  id: () => randomUUID(),

  createCall(fromPhone?: string): CallRecord {
    const c: CallRecord = { callId: randomUUID(), fromPhone, status: "active", startedAt: Date.now() };
    db.calls[c.callId] = c; persist(); return c;
  },
  endCall(callId: string): void {
    const c = db.calls[callId]; if (c) { c.status = "ended"; c.endedAt = Date.now(); persist(); }
  },

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

  /** Rollup for the ROI / call-analytics view (/stats, npm run report). */
  stats(): {
    calls: number; activeCalls: number; drafts: number;
    bookings: number; confirmedBookings: number; pendingBookings: number;
    messages: number; handledPct: number; conversionPct: number; syncErrors: number; audits: number;
  } {
    const calls = Object.values(db.calls);
    const drafts = Object.values(db.drafts);
    const committed = drafts.filter((d) => d.status === "committed");
    const pendingBookings = committed.filter((d) => d.pendingConfirm).length;
    const confirmedBookings = committed.length - pendingBookings;
    const syncErrors = Object.values(db.posSync).filter((s) => s.status === "error").length;
    // "Handled" = the call ended in a booking OR a captured message (i.e. not lost).
    const handled = committed.length + db.messages.length;
    return {
      calls: calls.length,
      activeCalls: calls.filter((c) => c.status === "active").length,
      drafts: drafts.length,
      bookings: committed.length,
      confirmedBookings,
      pendingBookings,
      messages: db.messages.length,
      handledPct: calls.length ? Math.round((handled / calls.length) * 100) : 0,
      conversionPct: calls.length ? Math.round((committed.length / calls.length) * 100) : 0,
      syncErrors,
      audits: db.audit.length,
    };
  },
};
