// Domain types for the draft-first booking core (see PRODUCT_MODULES/AI_PHONE_ASSISTANT_PLAN.md).

export interface Service { name: string; durationMin: number }

export interface Slot { startIso: string; endIso: string }

export interface Customer { name?: string; phone?: string; notes?: string }

export type DraftStatus = "open" | "confirmed" | "committed" | "expired" | "cancelled";

export interface Draft {
  draftId: string;
  callId: string;
  service: string;
  slot: Slot;
  customer: Customer;
  status: DraftStatus;
  createdAt: number;
  expiresAt: number;
  bookingRef?: string; // set once committed
}

export interface BookingResult { bookingRef: string; startIso: string; service: string }

export type SyncStatus = "pending" | "ok" | "error";

export interface PosSyncAttempt {
  syncId: string;
  draftId: string;
  operation: string;
  idempotencyKey: string;
  status: SyncStatus;
  retryCount: number;
  responseRef?: string;
  lastError?: string;
  at: number;
}

export interface CallRecord {
  callId: string;
  fromPhone?: string;
  status: "active" | "ended";
  startedAt: number;
  endedAt?: number;
}

export interface AuditLog {
  auditId: string;
  entityType: string;
  entityId: string;
  eventType: string;
  before?: unknown;
  after?: unknown;
  at: number;
}
