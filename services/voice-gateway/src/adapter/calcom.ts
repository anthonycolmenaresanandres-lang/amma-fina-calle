// Cal.com connector (API v2). Best-effort real integration — VERIFY against current
// Cal.com docs before production (endpoints/fields/version header move). On any
// unexpected response it degrades to empty/throw so the orchestrator can fall back
// to take-a-message rather than guess.

import { config } from "../config";
import type { BookingResult, Customer, Service, Slot } from "../types";
import type { BookingConnector } from "./types";

const API_VERSION = "2024-08-13";

function headers(): Record<string, string> {
  return {
    Authorization: `Bearer ${config.calcom.apiKey}`,
    "cal-api-version": API_VERSION,
    "Content-Type": "application/json",
  };
}

async function withTimeout(url: string, init: RequestInit, ms = 6000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { ...init, signal: ctrl.signal }); }
  finally { clearTimeout(t); }
}

export class CalComConnector implements BookingConnector {
  readonly name = "calcom";

  async listServices(): Promise<Service[]> {
    // v0: services come from the Knowledge Pack; the Cal.com event type defines duration.
    return config.business.services;
  }

  async checkAvailability({ date }: { date: string }): Promise<Slot[]> {
    const start = `${date}T00:00:00.000Z`;
    const end = `${date}T23:59:59.999Z`;
    const url = `${config.calcom.baseUrl}/slots?eventTypeId=${config.calcom.eventTypeId}` +
      `&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&timeZone=${encodeURIComponent(config.calcom.timeZone)}`;
    const res = await withTimeout(url, { headers: headers() });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: { slots?: Record<string, { time: string }[]> } };
    const byDay = json.data?.slots ?? {};
    const out: Slot[] = [];
    for (const day of Object.keys(byDay)) {
      for (const s of byDay[day] ?? []) {
        const startD = new Date(s.time);
        out.push({ startIso: startD.toISOString(), endIso: new Date(startD.getTime() + 60 * 60000).toISOString() });
      }
    }
    return out;
  }

  async book({ slot, service, customer, idempotencyKey }: { slot: Slot; service: string; customer: Customer; idempotencyKey: string }): Promise<BookingResult> {
    const email = customer.phone ? `${customer.phone.replace(/\D/g, "")}@phone.finacalleos.com` : "guest@phone.finacalleos.com";
    const body = {
      start: slot.startIso,
      eventTypeId: config.calcom.eventTypeId,
      attendee: { name: customer.name ?? "Phone guest", email, timeZone: config.calcom.timeZone, phoneNumber: customer.phone },
      metadata: { service, source: "fina-calle-voice", idempotencyKey },
    };
    const res = await withTimeout(`${config.calcom.baseUrl}/bookings`, { method: "POST", headers: headers(), body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`cal.com booking failed: ${res.status}`);
    const json = (await res.json()) as { data?: { uid?: string; id?: number; start?: string } };
    const ref = json.data?.uid ?? String(json.data?.id ?? idempotencyKey.slice(0, 8));
    return { bookingRef: ref, startIso: json.data?.start ?? slot.startIso, service };
  }
}
