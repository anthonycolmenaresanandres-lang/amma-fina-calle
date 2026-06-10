// Deterministic mock connector — lets the whole pipeline (and the simulator) run
// with zero external keys. Generates open slots within the tenant's hours and "books"
// in memory. State is per-instance so each tenant's mock is isolated.

import { slotsForDate } from "../hours";
import type { BookingResult, BusinessPack, Customer, Service, Slot } from "../types";
import type { BookingConnector } from "./types";

export class MockConnector implements BookingConnector {
  readonly name = "mock";
  private booked = new Map<string, BookingResult>(); // idempotencyKey -> result
  private takenSlots = new Set<string>(); // startIso already booked

  constructor(private business: BusinessPack) {}

  async listServices(): Promise<Service[]> {
    return this.business.services;
  }

  async checkAvailability({ date }: { date: string; service: string }): Promise<Slot[]> {
    // Hourly slots within the business's open window (none on closed days), minus
    // anything already booked in this process.
    return slotsForDate(this.business, date).filter((s) => !this.takenSlots.has(s.startIso));
  }

  async book({ slot, service, idempotencyKey }: { slot: Slot; service: string; customer: Customer; idempotencyKey: string }): Promise<BookingResult> {
    const existing = this.booked.get(idempotencyKey);
    if (existing) return existing; // idempotent: same key -> same booking, no double-book
    if (this.takenSlots.has(slot.startIso)) throw new Error("slot just taken");
    const result: BookingResult = { bookingRef: `MOCK-${idempotencyKey.slice(0, 8)}`, startIso: slot.startIso, service };
    this.booked.set(idempotencyKey, result);
    this.takenSlots.add(slot.startIso);
    return result;
  }
}
