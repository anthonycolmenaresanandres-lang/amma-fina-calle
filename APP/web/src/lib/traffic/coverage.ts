import type { CollectionCheck } from "./types";
export type CoverageState = "waiting" | "stale" | "partial" | "measured-zero" | "ready";
export function assessCoverage(checks: CollectionCheck[], since: string, until: string, pageviews: number, now = Date.now()) {
  const start = Date.parse(since), end = Date.parse(until);
  const valid = checks.filter((check) => Number.isFinite(Date.parse(check.start)) && Number.isFinite(Date.parse(check.end)) &&
    Number.isFinite(Date.parse(check.checkedAt)) && Date.parse(check.end) > Date.parse(check.start) &&
    Date.parse(check.end) - Date.parse(check.start) <= 900000 && Date.parse(check.checkedAt) >= Date.parse(check.end) &&
    Date.parse(check.checkedAt) <= now + 60000);
  const latest = [...valid].sort((a,b) => Date.parse(b.checkedAt) - Date.parse(a.checkedAt))[0];
  let coveredUntil = start;
  // Healthy intervals must form an unbroken union. Failed checks invalidate
  // overlapping coverage; no event timestamp is treated as a health heartbeat.
  const failures = valid.filter((check) => !check.healthy);
  for (const check of valid.filter((check) => check.healthy).sort((a,b) => Date.parse(a.start) - Date.parse(b.start))) {
    const a = Date.parse(check.start), b = Date.parse(check.end);
    if (failures.some((failed) => Date.parse(failed.start) < b && Date.parse(failed.end) > a)) continue;
    if (a <= coveredUntil && b > coveredUntil) coveredUntil = b;
  }
  const complete = coveredUntil >= end;
  let state: CoverageState = complete ? (pageviews === 0 ? "measured-zero" : "ready") : (pageviews || valid.length) ? "partial" : "waiting";
  // Historical complete coverage remains valid after collection subsequently
  // stops. Freshness describes current collection separately from that period.
  const fresh = Boolean(latest && (latest.probeHealthy ?? latest.healthy) && now - Date.parse(latest.checkedAt) <= 30 * 60000);
  const lastSuccessfulCheck = [...valid].filter((check) => check.probeHealthy ?? check.healthy).sort((a,b) => Date.parse(b.checkedAt) - Date.parse(a.checkedAt))[0]?.checkedAt ?? null;
  if (!complete && latest && !fresh) state = "stale";
  return { state, complete, fresh, checkedAt: latest?.checkedAt ?? null, lastSuccessfulCheck,
    collectionStart: valid.filter((c) => c.healthy).sort((a,b) => Date.parse(a.start) - Date.parse(b.start))[0]?.start ?? null,
    coveredUntil: new Date(Math.min(end, coveredUntil)).toISOString() };
}
