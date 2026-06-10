// Draft-first orchestrator: the AI tool-calls land here. We validate against the
// connector, build an auditable DRAFT, and only COMMIT on explicit confirmation —
// idempotently, so a retried/duplicated confirm never double-books.

import { getConnector } from "./adapter";
import { store } from "./store";
import type { Customer, Draft, Slot } from "./types";

const DRAFT_TTL_MS = 10 * 60_000;

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" });
}

export async function checkAvailability(callId: string, date: string, service: string): Promise<{ slots: Slot[]; text: string }> {
  const slots = await getConnector().checkAvailability({ date, service });
  store.audit("call", callId, "check_availability", { date, service }, { count: slots.length });
  if (slots.length === 0) return { slots, text: `No open ${service} slots on ${date}. Offer another day or take a message.` };
  const list = slots.slice(0, 4).map((s) => fmtTime(s.startIso)).join(", ");
  return { slots, text: `Open ${service} slots on ${date}: ${list}. (Use hold_slot with the chosen start time.)` };
}

export async function holdSlot(callId: string, startIso: string, service: string, customer: Customer): Promise<{ draft: Draft; text: string }> {
  const date = startIso.slice(0, 10);
  const slots = await getConnector().checkAvailability({ date, service });
  const slot = slots.find((s) => s.startIso === startIso);
  if (!slot) throw new Error("that time isn't actually open — re-check availability");
  const draft: Draft = {
    draftId: store.id(), callId, service, slot, customer,
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

  const idempotencyKey = draftId;
  const prior = store.getSync(idempotencyKey);
  if (prior?.status === "ok" && prior.responseRef) {
    return { bookingRef: prior.responseRef, text: `Already booked (ref ${prior.responseRef}).`, idempotent: true };
  }

  store.putSync({ syncId: store.id(), draftId, operation: "order.commit", idempotencyKey, status: "pending", retryCount: prior ? prior.retryCount + 1 : 0, at: Date.now() });
  try {
    const result = await getConnector().book({ slot: draft.slot, service: draft.service, customer: draft.customer, idempotencyKey });
    store.putSync({ syncId: store.id(), draftId, operation: "order.commit", idempotencyKey, status: "ok", retryCount: 0, responseRef: result.bookingRef, at: Date.now() });
    const before = { ...draft };
    draft.status = "committed"; draft.bookingRef = result.bookingRef; store.putDraft(draft);
    store.audit("draft", draftId, "order.commit", before, draft);
    return { bookingRef: result.bookingRef, text: `Booked! Confirmation ${result.bookingRef} for ${fmtTime(result.startIso)}.`, idempotent: false };
  } catch (err) {
    store.putSync({ syncId: store.id(), draftId, operation: "order.commit", idempotencyKey, status: "error", retryCount: prior ? prior.retryCount + 1 : 0, lastError: String(err), at: Date.now() });
    store.audit("draft", draftId, "order.commit.error", undefined, { error: String(err) });
    return { bookingRef: "", text: "I couldn't complete the booking just now — let me take your details and have the team confirm.", idempotent: false };
  }
}

/** Single dispatch used by the realtime engine + the simulator. Returns a string for the model. */
export async function runTool(callId: string, name: string, args: Record<string, unknown>): Promise<string> {
  try {
    if (name === "list_services") {
      const s = await getConnector().listServices();
      return "Services: " + s.map((x) => `${x.name} (${x.durationMin}m)`).join(", ");
    }
    if (name === "check_availability") {
      return (await checkAvailability(callId, String(args.date), String(args.service))).text;
    }
    if (name === "hold_slot") {
      const customer: Customer = { name: args.customer_name as string | undefined, phone: args.customer_phone as string | undefined };
      const { draft, text } = await holdSlot(callId, String(args.start_iso), String(args.service), customer);
      return `${text} [draft_id=${draft.draftId}]`;
    }
    if (name === "confirm_booking") {
      return (await confirmBooking(String(args.draft_id))).text;
    }
    return `unknown tool: ${name}`;
  } catch (err) {
    return `tool error: ${String(err)}`;
  }
}
