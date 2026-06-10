// Minimal in-memory event-sourced-ish store (the data model from the plan:
// calls / transcripts / drafts / approvals / pos_sync_attempts / audit_logs).
// v0 keeps it in memory with an optional JSON snapshot; swap for Postgres later.

import { randomUUID } from "node:crypto";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import type { AuditLog, CallRecord, Draft, PosSyncAttempt } from "./types";

interface DB {
  calls: Record<string, CallRecord>;
  drafts: Record<string, Draft>;
  posSync: Record<string, PosSyncAttempt>; // keyed by idempotencyKey
  audit: AuditLog[];
}

const SNAPSHOT = process.env.STORE_SNAPSHOT ?? ""; // optional path for persistence

const db: DB = load();

function load(): DB {
  if (SNAPSHOT && existsSync(SNAPSHOT)) {
    try { return JSON.parse(readFileSync(SNAPSHOT, "utf8")) as DB; } catch { /* fall through */ }
  }
  return { calls: {}, drafts: {}, posSync: {}, audit: [] };
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

  audit(entityType: string, entityId: string, eventType: string, before?: unknown, after?: unknown): void {
    db.audit.push({ auditId: randomUUID(), entityType, entityId, eventType, before, after, at: Date.now() });
    persist();
  },
  auditCount(): number { return db.audit.length; },
  bookingCount(): number { return Object.values(db.drafts).filter((d) => d.status === "committed").length; },
};
