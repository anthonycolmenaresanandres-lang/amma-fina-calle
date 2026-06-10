// Multi-tenant registry. One deployed gateway serves many businesses; each inbound
// call is routed to a Tenant by the Twilio number that was dialled. A Tenant bundles
// the only per-client variables — the Knowledge Pack (hours/services), the booking
// connector + its creds, the staff-notify webhook, and the spoken disclosure.
//
// Source of truth: a JSON file at TENANTS_FILE (an array of partial Tenants, each
// merged over the env-derived default). With no file, the env config becomes a single
// catch-all "default" tenant — so single-client deploys keep working unchanged.

import { existsSync, readFileSync } from "node:fs";
import { config } from "./config";
import type { BusinessPack } from "./types";

export type ConnectorKind = "mock" | "calcom" | "square" | "webhook" | "proposeconfirm";

export interface Tenant {
  id: string;
  phoneNumbers: string[]; // normalized digits; empty array = catch-all
  business: BusinessPack;
  connector: ConnectorKind;
  calcom?: typeof config.calcom;
  square?: typeof config.square;
  webhook?: typeof config.webhook;
  notify?: typeof config.notify;
  disclosure: string;
  voice: string;
}

/** Phone numbers compared as digits only (so "+1 (555) 000-1111" === "15550001111"). */
export function normalizePhone(s: string): string {
  return (s ?? "").replace(/\D/g, "");
}

function defaultTenant(): Tenant {
  return {
    id: "default",
    phoneNumbers: (process.env.DEFAULT_TENANT_NUMBERS ?? "").split(",").map(normalizePhone).filter(Boolean),
    business: { ...config.business },
    connector: config.connector,
    calcom: config.calcom,
    square: config.square,
    webhook: config.webhook,
    notify: config.notify,
    disclosure: config.disclosure,
    voice: config.voice,
  };
}

function mergeTenant(def: Tenant, t: Partial<Tenant>, i: number): Tenant {
  return {
    id: t.id ?? `tenant-${i}`,
    phoneNumbers: (t.phoneNumbers ?? []).map(normalizePhone).filter(Boolean),
    business: { ...def.business, ...(t.business ?? {}) },
    connector: t.connector ?? def.connector,
    calcom: t.calcom ?? def.calcom,
    square: t.square ?? def.square,
    webhook: t.webhook ?? def.webhook,
    notify: t.notify ?? def.notify,
    disclosure: t.disclosure ?? def.disclosure,
    voice: t.voice ?? def.voice,
  };
}

function loadTenants(): Tenant[] {
  const def = defaultTenant();
  const file = process.env.TENANTS_FILE ?? "";
  if (file && existsSync(file)) {
    try {
      const raw = JSON.parse(readFileSync(file, "utf8")) as Partial<Tenant>[];
      if (Array.isArray(raw) && raw.length) return raw.map((t, i) => mergeTenant(def, t, i));
    } catch (e) {
      console.warn(`[tenant] failed to load TENANTS_FILE (${file}): ${String(e)} — using env default`);
    }
  }
  return [def];
}

// Lazy + memoized so tests can set TENANTS_FILE before the first access.
let _tenants: Tenant[] | null = null;
let _byId: Map<string, Tenant> | null = null;
function registry(): Tenant[] { return (_tenants ??= loadTenants()); }
function byId(): Map<string, Tenant> { return (_byId ??= new Map(registry().map((t) => [t.id, t]))); }

export function allTenants(): Tenant[] { return registry(); }
export function getTenantById(id?: string): Tenant | undefined { return id ? byId().get(id) : undefined; }

/** Resolve the tenant for a dialled number; falls back to a catch-all (or the first). */
export function getTenantByNumber(to?: string): Tenant {
  const digits = normalizePhone(to ?? "");
  if (digits) {
    const hit = registry().find((t) => t.phoneNumbers.includes(digits));
    if (hit) return hit;
  }
  return registry().find((t) => t.phoneNumbers.length === 0) ?? registry()[0]!;
}
