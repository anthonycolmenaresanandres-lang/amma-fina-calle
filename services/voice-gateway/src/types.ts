// Domain types for the draft-first booking core (see PRODUCT_MODULES/AI_PHONE_ASSISTANT_PLAN.md).

export interface Service { name: string; durationMin: number }

// A business's Knowledge Pack — the per-tenant variables (everything else is frozen).
export interface BusinessPack {
  name: string;
  kind: string;
  timezone: string;
  services: Service[];
  hours: string;       // human-readable display string
  openDays: number[];  // weekday indices, 0=Sun
  openHour: number;    // 24h local
  closeHour: number;
}

export interface Slot { startIso: string; endIso: string }

export interface Customer { name?: string; phone?: string; notes?: string }

export type DraftStatus = "open" | "confirmed" | "committed" | "expired" | "cancelled";

export interface Draft {
  draftId: string;
  callId: string;
  tenantId: string;
  service: string;
  slot: Slot;
  customer: Customer;
  status: DraftStatus;
  createdAt: number;
  expiresAt: number;
  bookingRef?: string; // set once committed
  pendingConfirm?: boolean; // committed as a PENDING request (staff must confirm into their system)
}

export interface BookingResult { bookingRef: string; startIso: string; service: string; pending?: boolean }

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
  tenantId: string;
  fromPhone?: string;
  status: "active" | "ended";
  startedAt: number;
  endedAt?: number;
}

// A captured message / lead — when the bot can't book (after-hours, no fit, off-menu
// request) it still captures the caller so the business never loses the opportunity.
export interface Message {
  messageId: string;
  callId: string;
  tenantId: string;
  customer: Customer;
  reason: string;
  at: number;
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
