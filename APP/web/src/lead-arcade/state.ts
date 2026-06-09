// Event-sourced state for the Lead Arcade. The event log is persisted; the
// visible world (per-lead state, HUD totals, funnel) is always derived by
// folding the log. One click in the UI appends exactly one business event.

import type { ActionType, LeadEvent, LeadState, Stage } from "./types";
import { SEED_EVENTS } from "./seed";

const STORAGE_KEY = "fina-calle-conquest-events-v1";

const ACTION_STAGE: Partial<Record<ActionType, Stage>> = {
  SCOUTED: "prospect",
  SURVEYED: "surveyed",
  PITCHED: "pitched",
  CLOSED: "client",
};

/** Fold the event log into a map of derived lead state. */
export function deriveLeads(events: LeadEvent[]): Map<string, LeadState> {
  const map = new Map<string, LeadState>();
  for (const e of events) {
    if (e.action === "SCOUTED" && e.meta) {
      map.set(e.leadId, {
        meta: e.meta, stage: "prospect", mrr: 0, collected: 0, upgrades: 0, lastAt: e.at,
      });
      continue;
    }
    const s = map.get(e.leadId);
    if (!s) continue;
    s.lastAt = e.at;
    const stage = ACTION_STAGE[e.action];
    if (stage) s.stage = stage;
    if (e.action === "CLOSED") s.mrr = e.amount ?? s.mrr;
    if (e.action === "COLLECTED") s.collected += e.amount ?? 0;
    if (e.action === "UPGRADED") {
      s.upgrades += 1;
      s.stage = "flagship";
      s.mrr += e.amount ?? 0;
    }
  }
  return map;
}

/** The single next pipeline action available for a stage (UI button). */
export function nextAction(stage: Stage): { action: ActionType; label: string } | null {
  switch (stage) {
    case "prospect": return { action: "SURVEYED", label: "Survey (run dossier)" };
    case "surveyed": return { action: "PITCHED", label: "Pitch (stamp demo + reach out)" };
    case "pitched": return { action: "CLOSED", label: "Convert (close the deal)" };
    case "client": return { action: "COLLECTED", label: "Collect payment" };
    case "flagship": return { action: "COLLECTED", label: "Collect payment" };
    default: return null;
  }
}

export interface Totals {
  mrr: number; // run-rate (sum of client mrr)
  clients: number;
  collected: number; // cumulative recorded payments
  territoryPct: number; // converted / total
  funnel: Record<Stage, number>;
  total: number;
}

export function selectTotals(leads: Map<string, LeadState>): Totals {
  const funnel: Record<Stage, number> = { prospect: 0, surveyed: 0, pitched: 0, client: 0, flagship: 0 };
  let mrr = 0, clients = 0, collected = 0;
  for (const s of leads.values()) {
    funnel[s.stage] += 1;
    collected += s.collected;
    if (s.stage === "client" || s.stage === "flagship") { clients += 1; mrr += s.mrr; }
  }
  const total = leads.size || 1;
  return { mrr, clients, collected, territoryPct: clients / total, funnel, total: leads.size };
}

// ---- persistence (client-only; static export has no server) ----
export function loadEvents(): LeadEvent[] {
  if (typeof window === "undefined") return SEED_EVENTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_EVENTS;
    const parsed = JSON.parse(raw) as LeadEvent[];
    return Array.isArray(parsed) && parsed.length ? parsed : SEED_EVENTS;
  } catch {
    return SEED_EVENTS;
  }
}

export function saveEvents(events: LeadEvent[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

export function resetEvents(): LeadEvent[] {
  if (typeof window !== "undefined") {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }
  return SEED_EVENTS;
}
