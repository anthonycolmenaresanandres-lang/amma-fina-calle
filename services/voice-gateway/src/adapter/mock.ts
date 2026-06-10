// Deterministic mock connector — lets the whole pipeline (and the simulator) run
// with zero external keys. Generates a few open slots per day and "books" in memory.

import { config } from "../config";
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
    // open slots at 10:00, 11:00, 14:00, 15:30 local on the requested date
    const times = ["10:00", "11:00", "14:00", "15:30"];
    return times
      .map((t) => {
        const start = new Date(`${date}T${t}:00`);
        const end = new Date(start.getTime() + 60 * 60000);
        return { startIso: start.toISOString(), endIso: end.toISOString() };
      })
      .filter((s) => !takenSlots.has(s.startIso));
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
