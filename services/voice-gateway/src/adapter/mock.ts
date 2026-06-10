// Deterministic mock connector — lets the whole pipeline (and the simulator) run
// with zero external keys. Generates a few open slots per day and "books" in memory.

import { config } from "../config";
import { slotsForDate } from "../hours";
import type { BookingResult, Customer, Service, Slot } from "../types";
import type { BookingConnector } from "./types";

const booked = new Map<string, BookingResult>(); // idempotencyKey -> result
const takenSlots = new Set<string>(); // startIso already booked

export class MockConnector implements BookingConnector {
  readonly name = "mock";

  async listServices(): Promise<Service[]> {
    return config.business.services;
  }

  async checkAvailability({ date }: { date: string; service: string }): Promise<Slot[]> {
    // Hourly slots within the business's open window (none on closed days), minus
    // anything already booked in this process.
    return slotsForDate(date).filter((s) => !takenSlots.has(s.startIso));
  }

  async book({ slot, service, idempotencyKey }: { slot: Slot; service: string; customer: Customer; idempotencyKey: string }): Promise<BookingResult> {
    const existing = booked.get(idempotencyKey);
    if (existing) return existing; // idempotent: same key -> same booking, no double-book
    if (takenSlots.has(slot.startIso)) throw new Error("slot just taken");
    const result: BookingResult = { bookingRef: `MOCK-${idempotencyKey.slice(0, 8)}`, startIso: slot.startIso, service };
    booked.set(idempotencyKey, result);
    takenSlots.add(slot.startIso);
    return result;
  }
}
