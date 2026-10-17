import "server-only";

import { previousEasternDay, completeDays, validateRange } from "./date";
import { assessCoverage } from "./coverage";
import type { RangeReport } from "./types";
import { getTrafficStore, trafficDatabaseUrl } from "./store";
import { ALL_TRAFFIC_SITES as TRAFFIC_SITES, trafficSite, type TrafficSite } from "./sites";

export type TrafficRange = { since: string; until: string; timezone?: string };
type Diagnostics = { siteKind?: TrafficSite["kind"]; since?: string; until?: string; timezone?: string; checkedAt?: string | null; lastSuccessfulCheck?: string | null; collectionStart?: string | null; firstObservedAt?: string | null; lastObservedAt?: string | null; coverage?: ReturnType<typeof assessCoverage>; observedPageviews?: number; observedIdentifiers?: number; identifiedPageviews?: number; recorded?: RangeReport };
export type TrafficReport = Diagnostics & (
  | {
      state: "ready"; siteId: TrafficSite["id"]; siteName: string; domains: readonly string[]; analyticsUrl: string;
      source: "Vercel Web Analytics drain" | "First-party pageviews / historical drain"; since: string; until: string; lastUpdated: string; firstObservedAt: string;
      pageviews: number; visitors: number;
      daily: Array<{ date: string; pageviews: number; visitors: number }>;
      topPaths: Array<{ path: string; pageviews: number }>;
      topReferrers: Array<{ referrer: string; pageviews: number }>;
    }
  | { state: "empty"; siteId: TrafficSite["id"]; siteName: string; domains: readonly string[]; analyticsUrl: string;
      reason: string; firstObservedAt: string; lastObservedAt: string }
  | { state: "unconfigured" | "unavailable" | "waiting" | "partial" | "stale" | "measured-zero"; siteId: TrafficSite["id"]; siteName: string; domains: readonly string[]; analyticsUrl: string; reason: string });

export type BodegaTrafficReport =
  | (Extract<TrafficReport, { state: "ready" }> & { gamePageviews: number; gameVisitors: number })
  | Exclude<TrafficReport, { state: "ready" }>;

function period(days: number): TrafficRange { return completeDays(days); }

export async function getSiteTrafficReport(site: TrafficSite, range: TrafficRange): Promise<TrafficReport> {
  const timezone = range.timezone ?? "America/New_York";
  validateRange(range, timezone);
  const base = { siteId: site.id, siteName: site.name, siteKind: site.kind, domains: site.domains, analyticsUrl: site.analyticsUrl,
    since: range.since, until: range.until, timezone };
  try {
    if (process.env.VERCEL_ENV === "production" && !trafficDatabaseUrl()) {
      return { ...base, state: "unconfigured", reason: "Dedicated traffic database is not configured. Missing data is not zero." };
    }
    const store = getTrafficStore();
    const [report, observed, checks] = await Promise.all([
      store.getRangeReport(site.id, Date.parse(range.since), Date.parse(range.until), timezone),
      store.getObservationWindow(site.id),
      store.getCollectionChecks?.(site.id, Date.parse(range.since), Date.parse(range.until)) ?? Promise.resolve([]),
    ]);
    const coverage = assessCoverage(checks, range.since, range.until, report.pageviews);
    const diagnostics = { ...base, coverage, checkedAt: coverage.checkedAt, lastSuccessfulCheck: coverage.lastSuccessfulCheck, collectionStart: coverage.collectionStart,
      firstObservedAt: observed.firstObservedAt, lastObservedAt: observed.lastObservedAt,
      identifiedPageviews: report.identifiedPageviews ?? 0 };
    if (coverage.state !== "ready") {
      const reason = {
        waiting: "Collection coverage is unverified; no measured zero is inferred from an empty event set.",
        partial: "Recorded pageviews have unverified ingestion coverage. Page/configuration probes cannot prove collector delivery or event writes; earlier traffic is not backfilled.",
        stale: "Configuration probes are stale or failed. Ingestion coverage remains unverified.",
        "measured-zero": "No pageviews recorded in a fully covered interval with independent collection checks.",
      }[coverage.state];
      return { ...diagnostics, state: coverage.state, reason, observedPageviews: report.pageviews, observedIdentifiers: report.uniqueVisitors, recorded: report };
    }
    return { ...diagnostics, state: "ready", source: "First-party pageviews / historical drain",
      since: range.since, until: range.until, lastUpdated: report.lastUpdated ?? range.until,
      firstObservedAt: observed.firstObservedAt ?? range.until,
      pageviews: report.pageviews, visitors: report.uniqueVisitors, daily: report.daily,
      topPaths: report.topPaths.map((row) => ({ path: row.path, pageviews: row.count })),
      topReferrers: report.topReferrers.map((row) => ({ referrer: row.referrer, pageviews: row.count })),
    };
  } catch {
    console.error("[traffic/report] dedicated traffic store query failed", site.id);
    return { ...base, state: "unavailable", reason: "Dedicated traffic store unavailable. No estimate or measured zero is shown." };
  }
}

export async function getAllSiteTrafficReports(days = 30): Promise<TrafficReport[]> {
  const range = period(days);
  return Promise.all(TRAFFIC_SITES.map((site) => getSiteTrafficReport(site, range)));
}

export async function getMorningTrafficReports(now = Date.now()) {
  const { date, range } = previousEasternDay(now);
  const reports = await Promise.all(TRAFFIC_SITES.map((site) => getSiteTrafficReport(site, range)));
  return { date, range, reports };
}

export async function getBodegaTrafficReport(days = 30): Promise<BodegaTrafficReport> {
  const site = trafficSite("bodega")!;
  const range = period(days);
  const report = await getSiteTrafficReport(site, range);
  if (report.state !== "ready") return report;
  try {
    const game = await getTrafficStore().getRangeReport(site.id, Date.parse(range.since), Date.parse(range.until),
      "America/New_York", "/bodega-sessions-review");
    return { ...report, gamePageviews: game.pageviews, gameVisitors: game.uniqueVisitors };
  } catch {
    console.error("[traffic/report] Bodega game query failed");
    return { state: "unavailable", siteId: site.id, siteName: site.name, domains: site.domains, analyticsUrl: site.analyticsUrl,
      reason: "The Bodega game traffic store could not be read. No traffic estimate is shown." };
  }
}

export const __test = { period };
