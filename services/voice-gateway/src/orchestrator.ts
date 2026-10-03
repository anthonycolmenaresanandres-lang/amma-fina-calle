// Draft-first orchestrator: the AI tool-calls land here. We validate against the
// tenant's connector, build an auditable DRAFT, and only COMMIT on explicit
// confirmation — idempotently, so a retried/duplicated confirm never double-books.
// Every handler is tenant-scoped (multi-tenant: one gateway, many businesses).

import { connectorFor } from "./adapter";
import { store } from "./store";
import { notifyStaff, notificationWording } from "./notify";
import { getTenantById, getTenantByNumber, type Tenant } from "./tenant";
import type { CallOutcome, Customer, Draft, NotificationResult, Slot, StaffNotification } from "./types";

const DRAFT_TTL_MS = 10 * 60_000;

// Persist pending before the one bounded attempt. A process interruption stays
// unconfirmed; endpoint acceptance is never proof of human receipt.
async function notifyAndRecord(
  tenant: Tenant, callId: string, entityType: StaffNotification["entityType"],
  entityId: string, purpose: StaffNotification["purpose"], text: string,
): Promise<NotificationResult> {
  const record: StaffNotification = {
    notificationId: store.id(), callId, tenantId: tenant.id, entityType, entityId,
    purpose, createdAt: Date.now(), result: { status: "pending" },
  };
  store.putNotification(record);
  const result = await notifyStaff(text, tenant.notify?.staffWebhookUrl);
  store.putNotification({ ...record, completedAt: Date.now(), result });
  store.audit("notification", record.notificationId, "notification.result", undefined, result);
  return result;
}

function pendingBookingText(draft: Draft): string {
  const notice = store.notificationsForCall(draft.callId).find((n) =>
    n.entityType === "draft" && n.entityId === draft.draftId);
  return "Your booking request is recorded but is not a confirmed booking (ref " +
    draft.bookingRef + "). " + notificationWording(notice?.result);
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" });
}

export async function checkAvailability(tenant: Tenant, callId: string, date: string, service: string): Promise<{ slots: Slot[]; text: string }> {
  const slots = await connectorFor(tenant).checkAvailability({ date, service });
  store.audit("call", callId, "check_availability", { date, service }, { count: slots.length });
  if (slots.length === 0) return { slots, text: `No open ${service} slots on ${date}. Offer another day or take a message.` };
  const list = slots.slice(0, 4).map((s) => fmtTime(s.startIso)).join(", ");
  return { slots, text: `Open ${service} slots on ${date}: ${list}. (Use hold_slot with the chosen start time.)` };
}

export async function holdSlot(tenant: Tenant, callId: string, startIso: string, service: string, customer: Customer): Promise<{ draft: Draft; text: string }> {
  const date = startIso.slice(0, 10);
  const slots = await connectorFor(tenant).checkAvailability({ date, service });
  const slot = slots.find((s) => s.startIso === startIso);
  if (!slot) throw new Error("that time isn't actually open — re-check availability");
  const draft: Draft = {
    draftId: store.id(), callId, tenantId: tenant.id, service, slot, customer,
    status: "open", createdAt: Date.now(), expiresAt: Date.now() + DRAFT_TTL_MS,
  };
  store.putDraft(draft);
  store.audit("draft", draft.draftId, "draft.create", undefined, draft);
  return { draft, text: `Draft held: ${service} for ${customer.name ?? "guest"} at ${fmtTime(startIso)}. Read this back and ask the caller to confirm, then call confirm_booking.` };
}

export async function confirmBooking(draftId: string): Promise<{ bookingRef: string; text: string; idempotent: boolean }> {
  const draft = store.getDraft(draftId);
  if (!draft) throw new Error("unknown draft");
  if (draft.status === "committed" && draft.bookingRef) {
    return { bookingRef: draft.bookingRef, text: draft.pendingConfirm ? pendingBookingText(draft) : `Already booked (ref ${draft.bookingRef}).`, idempotent: true };
  }
  const tenant = getTenantById(draft.tenantId) ?? getTenantByNumber(undefined);

  const idempotencyKey = draftId;
  const prior = store.getSync(idempotencyKey);
  if (prior?.status === "ok" && prior.responseRef) {
    return { bookingRef: prior.responseRef, text: `This request was already recorded (ref ${prior.responseRef}); its confirmation status must be verified.`, idempotent: true };
  }

  store.putSync({ syncId: store.id(), draftId, operation: "order.commit", idempotencyKey, status: "pending", retryCount: prior ? prior.retryCount + 1 : 0, at: Date.now() });
  try {
    const result = await connectorFor(tenant).book({ slot: draft.slot, service: draft.service, customer: draft.customer, idempotencyKey });
    store.putSync({ syncId: store.id(), draftId, operation: "order.commit", idempotencyKey, status: "ok", retryCount: 0, responseRef: result.bookingRef, at: Date.now() });
    const before = { ...draft };
    draft.status = "committed"; draft.bookingRef = result.bookingRef; draft.pendingConfirm = !!result.pending;
    store.putDraft(draft);
    store.audit("draft", draftId, "order.commit", before, draft);
    if (result.pending) {
      await notifyAndRecord(tenant, draft.callId, "draft", draftId, "booking_request",
        `New booking request at ${tenant.business.name}: ${draft.service} for ${draft.customer.name ?? "guest"}` +
        `${draft.customer.phone ? ` (${draft.customer.phone})` : ""} at ${fmtTime(result.startIso)} — please confirm (ref ${result.bookingRef}).`,
      );
    }
    const text = result.pending
      ? pendingBookingText(draft)
      : `Booked! Confirmation ${result.bookingRef} for ${fmtTime(result.startIso)}.`;
    return { bookingRef: result.bookingRef, text, idempotent: false };
  } catch (err) {
    store.putSync({ syncId: store.id(), draftId, operation: "order.commit", idempotencyKey, status: "error", retryCount: prior ? prior.retryCount + 1 : 0, lastError: String(err), at: Date.now() });
    store.audit("draft", draftId, "order.commit.error", undefined, { error: String(err) });
    return { bookingRef: "", text: "I couldn't complete the booking just now. I can record a message instead; no booking is confirmed.", idempotent: false };
  }
}

/** Capture first, then report the observed notification result without promising a callback. */
export async function takeMessage(tenant: Tenant, callId: string, customer: Customer, reason: string): Promise<{ messageId: string; text: string }> {
  const messageId = store.id();
  store.putMessage({ messageId, callId, tenantId: tenant.id, customer, reason, at: Date.now() });
  store.audit("message", messageId, "message.capture", undefined, { customer, reason });
  const result = await notifyAndRecord(tenant, callId, "message", messageId, "message",
    "New message for " + tenant.business.name + ": " + (customer.name ?? "a caller") +
    (customer.phone ? " (" + customer.phone + ")" : "") + ' - "' + reason + '". Please follow up.',
  );
  return { messageId, text: "I've recorded your message. " + notificationWording(result) + " Anything else?" };
}

/** Deterministic outcome label, not a conversational summary or a delivered per-call report. */
export function summarizeCall(callId: string): { outcome: CallOutcome; text: string } {
  const outcome = store.callOutcome(callId);
  const descriptions: Record<CallOutcome, string> = {
    booked: "confirmed booking recorded",
    booking_requested: "booking request recorded; confirmation pending",
    message: "message captured; see separate notification result",
    answered: "response audio sent after caller speech; resolution and playback unverified",
    missed: "call ended without a recorded action or response audio after caller speech",
    unknown: "legacy call lacks sufficient evidence to classify as answered or missed",
  };
  return { outcome, text: descriptions[outcome] };
}

/** End once; only new calls with no recorded response/action generate a missed-call alert. */
export async function finalizeCall(callId: string): Promise<void> {
  const call = store.getCall(callId);
  if (!call || call.status === "ended") return;
  const tenant = getTenantById(call.tenantId);
  const summary = summarizeCall(callId);
  store.endCall(callId);
  store.markHangupIfRecentBargeIn(callId);
  store.audit("call", callId, "call.summary", undefined, summary);
  // An unavailable historical tenant must not notify another tenant's destination.
  if (summary.outcome === "missed" && tenant) {
    await notifyAndRecord(tenant, callId, "call", callId, "missed_call",
      "Call at " + tenant.business.name + " ended without a recorded booking, message, or response audio after caller speech" +
      (call.fromPhone ? " (from " + call.fromPhone + ")" : "") + " - review if follow-up is appropriate.",
    );
  }
}

/** Single dispatch used by the realtime engine + the simulator. Returns a string for the model. */
export async function runTool(tenant: Tenant, callId: string, name: string, args: Record<string, unknown>): Promise<string> {
  try {
    if (name === "list_services") {
      const s = await connectorFor(tenant).listServices();
      return "Services: " + s.map((x) => `${x.name} (${x.durationMin}m)`).join(", ");
    }
    if (name === "check_availability") {
      return (await checkAvailability(tenant, callId, String(args.date), String(args.service))).text;
    }
    if (name === "hold_slot") {
      const customer: Customer = { name: args.customer_name as string | undefined, phone: args.customer_phone as string | undefined };
      const { draft, text } = await holdSlot(tenant, callId, String(args.start_iso), String(args.service), customer);
      return `${text} [draft_id=${draft.draftId}]`;
    }
    if (name === "confirm_booking") {
      return (await confirmBooking(String(args.draft_id))).text;
    }
    if (name === "take_message") {
      const customer: Customer = { name: args.customer_name as string | undefined, phone: args.customer_phone as string | undefined };
      return (await takeMessage(tenant, callId, customer, String(args.reason ?? "callback requested"))).text;
    }
    return `unknown tool: ${name}`;
  } catch (err) {
    return `tool error: ${String(err)}`;
  }
}
