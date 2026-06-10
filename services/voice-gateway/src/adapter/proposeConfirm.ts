// Propose-and-confirm connector — the universal fallback. Needs ZERO integration:
// it offers slots from the business's open hours and records each booking as a
// PENDING request (provisional ref) for staff to confirm into whatever system they
// actually use. This is what lets us sell to ANY business regardless of POS.

import { config } from "../config";
import { slotsForDate } from "../hours";
import type { BookingResult, Customer, Service, Slot } from "../types";
import type { BookingConnector } from "./types";

const pending = new Map<string, BookingResult>(); // idempotencyKey -> result

export class ProposeConfirmConnector implements BookingConnector {
  readonly name = "proposeconfirm";

  async listServices(): Promise<Service[]> {
    return config.business.services;
  }

  // No live calendar — offer hourly slots across the business's open window, and
  // nothing at all on closed days (the orchestrator then offers another day).
  async checkAvailability({ date }: { date: string; service: string }): Promise<Slot[]> {
    return slotsForDate(date);
  }

  async book({ slot, service, idempotencyKey }: { slot: Slot; service: string; customer: Customer; idempotencyKey: string }): Promise<BookingResult> {
    const existing = pending.get(idempotencyKey);
    if (existing) return existing; // idempotent
    const result: BookingResult = { bookingRef: `PENDING-${idempotencyKey.slice(0, 8)}`, startIso: slot.startIso, service, pending: true };
    pending.set(idempotencyKey, result);
    return result;
  }
}
