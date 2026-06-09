// Event-sourced state for the Lead Arcade. The event log is persisted; the
// visible world (per-lead state, HUD totals, funnel, goals, activity) is always
// derived by folding the log. One click in the UI appends exactly one event.

import type { ActionType, LeadEvent, LeadState, Stage } from "./types";
import { ACTION_VERB } from "./types";
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
        meta: { ...e.meta }, stage: "prospect", mrr: 0, collected: 0, upgrades: 0, lastAt: e.at,
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
    if (e.action === "UPDATED" && e.patch) {
      const p = e.patch;
      if (p.name !== undefined) s.meta.name = p.name;
      if (p.businessType !== undefined) s.meta.businessType = p.businessType;
      if (p.notes !== undefined) s.meta.notes = p.notes;
      if (p.followUp !== undefined) s.meta.followUp = p.followUp;
      if (p.position !== undefined) s.meta.position = p.position;
      s.meta.dossier = {
        ...s.meta.dossier,
        ...(p.rating !== undefined ? { rating: p.rating } : {}),
        ...(p.signature !== undefined ? { signature: p.signature } : {}),
        ...(p.fit !== undefined ? { fit: p.fit } : {}),
      };
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

// ---- private goals + streak (SDT-safe progression; no leaderboard) ----
const DAY = 86400000;
const dayKey = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export interface Goals {
  weekConversions: number;
  weekTarget: number;
  weekSurveys: number;
  streakDays: number; // consecutive days (ending today) with >=1 event
}

export function selectGoals(events: LeadEvent[], weekTarget = 1, now = Date.now()): Goals {
  const weekAgo = now - 7 * DAY;
  let weekConversions = 0, weekSurveys = 0;
  const days = new Set<string>();
  for (const e of events) {
    days.add(dayKey(e.at));
    if (e.at >= weekAgo) {
      if (e.action === "CLOSED") weekConversions += 1;
      if (e.action === "SURVEYED") weekSurveys += 1;
    }
  }
  let streak = 0;
  for (let d = new Date(now); ; d = new Date(d.getTime() - DAY)) {
    if (days.has(d.toISOString().slice(0, 10))) streak += 1;
    else break;
  }
  return { weekConversions, weekTarget, weekSurveys, streakDays: streak };
}

// ---- activity feed ----
export interface Activity { at: number; text: string; action: ActionType }

export function selectActivity(events: LeadEvent[], limit = 20): Activity[] {
  const names = new Map<string, string>();
  for (const e of events) if (e.action === "SCOUTED" && e.meta) names.set(e.leadId, e.meta.name);
  // later renames
  for (const e of events) if (e.action === "UPDATED" && e.patch?.name) names.set(e.leadId, e.patch.name);
  const out: Activity[] = [];
  for (const e of events) {
    const name = names.get(e.leadId) ?? e.leadId;
    let text = `${name} — ${ACTION_VERB[e.action]}`;
    if (e.action === "CLOSED" && e.amount) text += ` ($${e.amount}/mo)`;
    if (e.action === "COLLECTED" && e.amount) text += ` ($${e.amount})`;
    if (e.action === "UPGRADED") text += ` (+$${e.amount ?? 0}/mo)`;
    out.push({ at: e.at, text, action: e.action });
  }
  return out.reverse().slice(0, limit);
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

export function exportEvents(events: LeadEvent[]): string {
  return JSON.stringify(events, null, 2);
}

/** Parse + validate an imported log. Throws on malformed input. */
export function importEvents(json: string): LeadEvent[] {
  const parsed = JSON.parse(json) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Expected an array of events");
  for (const e of parsed) {
    if (typeof e !== "object" || e === null) throw new Error("Bad event");
    const ev = e as Partial<LeadEvent>;
    if (typeof ev.leadId !== "string" || typeof ev.action !== "string" || typeof ev.at !== "number") {
      throw new Error("Event missing leadId/action/at");
    }
  }
  return parsed as LeadEvent[];
}
