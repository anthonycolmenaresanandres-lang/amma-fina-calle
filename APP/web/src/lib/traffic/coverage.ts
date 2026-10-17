import type { CollectionCheck } from "./types";
export type CoverageState = "waiting" | "stale" | "partial" | "measured-zero" | "ready";
export interface CoverageAssessment {
  state: CoverageState;
  complete: boolean;
  fresh: boolean;
  evidence: "configuration-only";
  ingestionVerified: false;
  checkedAt: string | null;
  lastSuccessfulCheck: string | null;
  collectionStart: null;
  configurationCheckStart: string | null;
  configurationChecksInRange: number | null;
  coveredUntil: null;
}
export function assessCoverage(checks: CollectionCheck[], _since: string, _until: string, pageviews: number, now = Date.now()): CoverageAssessment {
  const valid = checks.filter((check) => Number.isFinite(Date.parse(check.start)) && Number.isFinite(Date.parse(check.end)) &&
    Number.isFinite(Date.parse(check.checkedAt)) && Date.parse(check.end) > Date.parse(check.start) &&
    Date.parse(check.end) - Date.parse(check.start) <= 900000 && Date.parse(check.checkedAt) >= Date.parse(check.end) &&
    Date.parse(check.checkedAt) <= now + 60000);
  const latest = [...valid].sort((a,b) => Date.parse(b.checkedAt) - Date.parse(a.checkedAt))[0];
  // Existing checks prove only page/configuration availability. Even contiguous
  // successful checks do not prove JS delivery/execution or event INSERTs.
  // This implementation has no verified ingestion-path evidence, so it cannot
  // establish complete coverage, a collection start, or measured-zero traffic.
  const complete = false;
  let state: CoverageState = (pageviews || valid.length) ? "partial" : "waiting";
  const fresh = Boolean(latest && (latest.probeHealthy ?? latest.healthy) && now - Date.parse(latest.checkedAt) <= 30 * 60000);
  const lastSuccessfulCheck = [...valid].filter((check) => check.probeHealthy ?? check.healthy).sort((a,b) => Date.parse(b.checkedAt) - Date.parse(a.checkedAt))[0]?.checkedAt ?? null;
  if (latest && !fresh) state = "stale";
  return { state, complete, fresh, evidence: "configuration-only", ingestionVerified: false,
    checkedAt: latest?.checkedAt ?? null, lastSuccessfulCheck, collectionStart: null,
    configurationCheckStart: valid.sort((a,b) => Date.parse(a.start) - Date.parse(b.start))[0]?.start ?? null,
    configurationChecksInRange: valid.find((check) => check.checksInRange !== undefined)?.checksInRange ?? null,
    coveredUntil: null };
}
