// Square Appointments (Bookings API) connector. Best-effort real integration —
// VERIFY against current Square API docs before production. Gated on the Square
// config; returns null from the factory when unconfigured so we fall back to
// propose-and-confirm. Keep bookings + payments inside Square (the Orders API
// charges 1% on non-Square payments).

import type { BookingResult, Customer, Service, Slot } from "../types";
import type { BookingConnector } from "./types";
import type { Tenant } from "../tenant";

const SQUARE_VERSION = "2024-10-17";

interface SqAvailability { start_at: string }

function timeoutFetch(url: string, init: RequestInit, ms = 6000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(t));
}

export class SquareConnector implements BookingConnector {
  readonly name = "square";
  private sq: NonNullable<Tenant["square"]>;
  private business: Tenant["business"];

  constructor(tenant: Tenant) {
    this.sq = tenant.square!; // factory only builds this when configured
    this.business = tenant.business;
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.sq.accessToken}`,
      "Square-Version": SQUARE_VERSION,
      "Content-Type": "application/json",
    };
  }

  async listServices(): Promise<Service[]> {
    return this.business.services; // catalog lookup could replace this later
  }

  async checkAvailability({ date }: { date: string }): Promise<Slot[]> {
    const sq = this.sq;
    const body = {
      query: {
        filter: {
          start_at_range: { start_at: `${date}T00:00:00Z`, end_at: `${date}T23:59:59Z` },
          location_id: sq.locationId,
          segment_filters: [{ service_variation_id: sq.serviceVariationId, ...(sq.teamMemberId ? { team_member_id_filter: { any: [sq.teamMemberId] } } : {}) }],
        },
      },
    };
    const res = await timeoutFetch(`${sq.baseUrl}/v2/bookings/availability/search`, { method: "POST", headers: this.headers(), body: JSON.stringify(body) });
    if (!res.ok) return [];
    const json = (await res.json()) as { availabilities?: SqAvailability[] };
    return (json.availabilities ?? []).map((a) => {
      const start = new Date(a.start_at);
      return { startIso: start.toISOString(), endIso: new Date(start.getTime() + 60 * 60000).toISOString() };
    });
  }

  async book({ slot, service, customer, idempotencyKey }: { slot: Slot; service: string; customer: Customer; idempotencyKey: string }): Promise<BookingResult> {
    const sq = this.sq;
    const body = {
      idempotency_key: idempotencyKey,
      booking: {
        location_id: sq.locationId,
        start_at: slot.startIso,
        customer_note: `${service} — ${customer.name ?? "phone guest"}${customer.phone ? ` (${customer.phone})` : ""} via Fina Calle voice`,
        appointment_segments: [{ service_variation_id: sq.serviceVariationId, team_member_id: sq.teamMemberId, duration_minutes: 60, service_variation_version: 1 }],
      },
    };
    const res = await timeoutFetch(`${sq.baseUrl}/v2/bookings`, { method: "POST", headers: this.headers(), body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`square booking failed: ${res.status}`);
    const json = (await res.json()) as { booking?: { id?: string; start_at?: string } };
    return { bookingRef: json.booking?.id ?? idempotencyKey.slice(0, 8), startIso: json.booking?.start_at ?? slot.startIso, service };
  }
}
