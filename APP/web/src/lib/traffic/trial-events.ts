import { parseFirstParty } from "./first-party";
import type { NormalizedEvent } from "./types";

export const TRIAL_PATHS = {
  "project-seed": { menu: "/demo/project-seed", game: "/play/project-seed" },
  "el-mariachi": { menu: "/el-mariachi", game: "/el-mariachi/play" },
} as const;
export type TrialSiteId = keyof typeof TRIAL_PATHS;
export type TrialMetrics = { menuPageviews: number; gamePageviews: number; gameStarts: number; gameCompletions: number };
export function isTrialSite(id: string): id is TrialSiteId { return Object.hasOwn(TRIAL_PATHS, id); }
export function enabledTrialSites(): TrialSiteId[] {
  return (Object.keys(TRIAL_PATHS) as TrialSiteId[]).filter(id => process.env.TRAFFIC_TRIAL_COLLECTION_ENABLED === "true" ||
    process.env[id === "el-mariachi" ? "TRAFFIC_EL_MARIACHI_COLLECTION_ENABLED" : "TRAFFIC_SEED_COLLECTION_ENABLED"] === "true");
}
export function trialCollectionEnabled(): boolean { return enabledTrialSites().length > 0; }

/** Exact public brand routes; no caller tenant, score, run/session or visitor ID. */
export function parseTrialEvent(raw: unknown, origin: string, now = Date.now()): NormalizedEvent | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const input = raw as Record<string, unknown>;
  if (Object.keys(input).some(key => !["id", "ts", "hostname", "path", "referrer", "eventType"].includes(key))) return null;
  const type = input.eventType ?? "pageview";
  if (typeof type !== "string") return null;
  const baseType = type.replace(/^qa_/, "");
  if (!["pageview", "game_start", "game_complete"].includes(baseType)) return null;
  const event = parseFirstParty({ ...input, eventType: "pageview" }, origin, now);
  if (!event || !isTrialSite(event.siteId)) return null;
  const paths = TRIAL_PATHS[event.siteId];
  if (event.path !== paths.menu && event.path !== paths.game) return null;
  if (baseType !== "pageview" && event.path !== paths.game) return null;
  return { ...event, eventType: String(type) };
}

export function countTrialEvents(siteId: TrialSiteId, events: NormalizedEvent[]): TrialMetrics {
  const paths = TRIAL_PATHS[siteId];
  const matching = events.filter(event => event.siteId === siteId);
  return {
    menuPageviews: matching.filter(e => e.eventType === "pageview" && e.path === paths.menu).length,
    gamePageviews: matching.filter(e => e.eventType === "pageview" && e.path === paths.game).length,
    gameStarts: matching.filter(e => e.eventType === "game_start" && e.path === paths.game).length,
    gameCompletions: matching.filter(e => e.eventType === "game_complete" && e.path === paths.game).length,
  };
}

export function parseCollectionEvent(raw: unknown, origin: string, gates: { firstParty: boolean; trials: boolean; trialSites?: string[] }, now = Date.now()): NormalizedEvent | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const candidate = parseFirstParty({ ...raw, eventType: "pageview" }, origin, now);
  if (candidate && isTrialSite(candidate.siteId)) return gates.trials && (!gates.trialSites || gates.trialSites.includes(candidate.siteId)) ? parseTrialEvent(raw, origin, now) : null;
  return gates.firstParty ? parseFirstParty(raw, origin, now) : null;
}
