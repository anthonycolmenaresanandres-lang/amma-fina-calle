// Draft-first orchestrator: the AI tool-calls land here. We validate against the
// tenant's connector, build an auditable DRAFT, and only COMMIT on explicit
// confirmation — idempotently, so a retried/duplicated confirm never double-books.
// Every handler is tenant-scoped (multi-tenant: one gateway, many businesses).

import { connectorFor } from "./adapter";
import { store } from "./store";
import { notifyStaff } from "./notify";
import { getTenantById, getTenantByNumber, type Tenant } from "./tenant";
import type { Customer, Draft, Slot } from "./types";

const DRAFT_TTL_MS = 10 * 60_000;

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
    return { bookingRef: draft.bookingRef, text: `Already booked (ref ${draft.bookingRef}).`, idempotent: true };
  }
  const tenant = getTenantById(draft.tenantId) ?? getTenantByNumber(undefined);

  const idempotencyKey = draftId;
  const prior = store.getSync(idempotencyKey);
  if (prior?.status === "ok" && prior.responseRef) {
    return { bookingRef: prior.responseRef, text: `Already booked (ref ${prior.responseRef}).`, idempotent: true };
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
      // Fire-and-forget: a pending booking needs a human to confirm it into their system.
      void notifyStaff(
        `New booking request at ${tenant.business.name}: ${draft.service} for ${draft.customer.name ?? "guest"}` +
        `${draft.customer.phone ? ` (${draft.customer.phone})` : ""} at ${fmtTime(result.startIso)} — please confirm (ref ${result.bookingRef}).`,
        tenant.notify?.staffWebhookUrl,
      );
    }
    const text = result.pending
      ? `Got it — I've requested ${fmtTime(result.startIso)}; the team will confirm shortly (ref ${result.bookingRef}).`
      : `Booked! Confirmation ${result.bookingRef} for ${fmtTime(result.startIso)}.`;
    return { bookingRef: result.bookingRef, text, idempotent: false };
  } catch (err) {
    store.putSync({ syncId: store.id(), draftId, operation: "order.commit", idempotencyKey, status: "error", retryCount: prior ? prior.retryCount + 1 : 0, lastError: String(err), at: Date.now() });
    store.audit("draft", draftId, "order.commit.error", undefined, { error: String(err) });
    return { bookingRef: "", text: "I couldn't complete the booking just now — let me take your details and have the team confirm.", idempotent: false };
  }
}

/** Capture a message / lead when we can't (or shouldn't) book — never lose the caller. */
export async function takeMessage(tenant: Tenant, callId: string, customer: Customer, reason: string): Promise<{ messageId: string; text: string }> {
  const messageId = store.id();
  store.putMessage({ messageId, callId, tenantId: tenant.id, customer, reason, at: Date.now() });
  store.audit("message", messageId, "message.capture", undefined, { customer, reason });
  void notifyStaff(
    `New message for ${tenant.business.name}: ${customer.name ?? "a caller"}` +
    `${customer.phone ? ` (${customer.phone})` : ""} — "${reason}". Please follow up.`,
    tenant.notify?.staffWebhookUrl,
  );
  return { messageId, text: `Got it — I've taken a message for the team and someone will follow up${customer.phone ? ` at ${customer.phone}` : ""}. Anything else?` };
}

/** What did this call achieve? Used for the end-of-call summary + missed-call alerts. */
export function summarizeCall(callId: string): { outcome: "booked" | "message" | "missed"; text: string } {
  const booked = store.draftsForCall(callId).filter((d) => d.status === "committed");
  if (booked.length) {
    return { outcome: "booked", text: `booked ${booked.map((b) => `${b.service} (${b.bookingRef})`).join(", ")}` };
  }
  const msgs = store.messagesForCall(callId);
  if (msgs.length) {
    return { outcome: "message", text: `message taken: ${msgs.map((m) => m.reason).join("; ")}` };
  }
  return { outcome: "missed", text: "call ended with no booking and no message" };
}

/** End a call once: record it ended, audit a summary, and alert staff on a missed call. */
export async function finalizeCall(callId: string): Promise<void> {
  const call = store.getCall(callId);
  if (!call || call.status === "ended") return; // idempotent — stop + close both fire
  const tenant = getTenantById(call.tenantId) ?? getTenantByNumber(undefined);
  const summary = summarizeCall(callId);
  store.endCall(callId);
  store.audit("call", callId, "call.summary", undefined, summary);
  if (summary.outcome === "missed") {
    void notifyStaff(
      `Missed call at ${tenant.business.name}: the caller hung up with no booking and no message` +
      `${call.fromPhone ? ` (from ${call.fromPhone})` : ""} — consider a follow-up.`,
      tenant.notify?.staffWebhookUrl,
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
