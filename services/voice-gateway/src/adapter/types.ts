// The unified booking/POS adapter contract. The voice engine only ever tool-calls
// THIS interface; each connector (mock, Cal.com, Square, MoeGo, ...) implements it.
// Keeps the engine frozen and the per-client work down to "pick a connector".

import type { BookingResult, Customer, Service, Slot } from "../types";

export interface BookingConnector {
  readonly name: string;
  listServices(): Promise<Service[]>;
  /** Live availability for a given local date (yyyy-mm-dd) and service. */
  checkAvailability(args: { date: string; service: string }): Promise<Slot[]>;
  /** Commit a validated draft into the real system. MUST be idempotent on idempotencyKey. */
  book(args: { slot: Slot; service: string; customer: Customer; idempotencyKey: string }): Promise<BookingResult>;
}
