// Generic webhook / Zapier-Make bridge connector. Lets us book into ANY system
// that doesn't have a native connector (e.g. MoeGo, Gingr, PetExec, or a Zap):
// the client wires a Zapier/Make/Cloud-Function endpoint that speaks this simple
// JSON contract, and we tool-call it. Gated on a configured book URL.

import { config } from "../config";
import type { BookingResult, Customer, Service, Slot } from "../types";
import type { BookingConnector } from "./types";

export interface WebhookUrls { availabilityUrl: string; bookUrl: string; secret?: string }

function timeoutFetch(url: string, init: RequestInit, ms = 6000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(t));
}

export class WebhookConnector implements BookingConnector {
  readonly name = "webhook";
  private urls: WebhookUrls;

  constructor(urls: WebhookUrls = config.webhook) {
    this.urls = urls;
  }

  private headers(): Record<string, string> {
    return { "Content-Type": "application/json", ...(this.urls.secret ? { "X-Fina-Calle-Secret": this.urls.secret } : {}) };
  }

  async listServices(): Promise<Service[]> {
    return config.business.services;
  }

  async checkAvailability({ date, service }: { date: string; service: string }): Promise<Slot[]> {
    if (!this.urls.availabilityUrl) return [];
    try {
      const res = await timeoutFetch(this.urls.availabilityUrl, { method: "POST", headers: this.headers(), body: JSON.stringify({ date, service }) });
      if (!res.ok) return [];
      const json = (await res.json()) as { slots?: Slot[] };
      return Array.isArray(json.slots) ? json.slots : [];
    } catch {
      return [];
    }
  }

  async book({ slot, service, customer, idempotencyKey }: { slot: Slot; service: string; customer: Customer; idempotencyKey: string }): Promise<BookingResult> {
    const res = await timeoutFetch(this.urls.bookUrl, {
      method: "POST", headers: this.headers(),
      body: JSON.stringify({ slot, service, customer, idempotencyKey }),
    });
    if (!res.ok) throw new Error(`webhook booking failed: ${res.status}`);
    const json = (await res.json()) as { bookingRef?: string; startIso?: string; pending?: boolean };
    return {
      bookingRef: json.bookingRef ?? idempotencyKey.slice(0, 8),
      startIso: json.startIso ?? slot.startIso,
      service,
      pending: json.pending,
    };
  }
}
