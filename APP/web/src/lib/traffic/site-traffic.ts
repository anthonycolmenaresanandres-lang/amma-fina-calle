import "server-only";

import { previousEasternDay } from "./date";
import { getTrafficStore, trafficDatabaseUrl } from "./store";
import { TRAFFIC_SITES, trafficSite, type TrafficSite } from "./sites";

export type TrafficRange = { since: string; until: string };
export type TrafficReport =
  | {
      state: "ready"; siteId: TrafficSite["id"]; siteName: string; domains: readonly string[]; analyticsUrl: string;
      source: "Vercel Web Analytics drain"; since: string; until: string; lastUpdated: string; firstObservedAt: string;
      pageviews: number; visitors: number;
      daily: Array<{ date: string; pageviews: number; visitors: number }>;
      topPaths: Array<{ path: string; pageviews: number }>;
      topReferrers: Array<{ referrer: string; pageviews: number }>;
    }
  | { state: "empty"; siteId: TrafficSite["id"]; siteName: string; domains: readonly string[]; analyticsUrl: string;
      reason: string; firstObservedAt: string; lastObservedAt: string }
  | { state: "unconfigured" | "unavailable" | "waiting"; siteId: TrafficSite["id"]; siteName: string; domains: readonly string[]; analyticsUrl: string; reason: string };

export type BodegaTrafficReport =
  | (Extract<TrafficReport, { state: "ready" }> & { gamePageviews: number; gameVisitors: number })
  | Exclude<TrafficReport, { state: "ready" }>;

function period(days: number): TrafficRange {
  const safeDays = Math.max(1, Math.min(90, Math.floor(days)));
  const until = new Date();
  return { since: new Date(until.getTime() - safeDays * 86400000).toISOString(), until: until.toISOString() };
}

export async function getSiteTrafficReport(site: TrafficSite, range: TrafficRange): Promise<TrafficReport> {
  if (process.env.VERCEL_ENV === "production") {
    const missing = [
      !trafficDatabaseUrl() ? "dedicated traffic database" : null,
      !process.env.TRAFFIC_DRAIN_SECRET?.trim() ? "analytics drain signing secret" : null,
    ].filter(Boolean);
    if (missing.length) {
      return { state: "unconfigured", siteId: site.id, siteName: site.name, domains: site.domains, analyticsUrl: site.analyticsUrl,
        reason: `Production setup is missing: ${missing.join(" and ")}.` };
    }
  }
  try {
    const store = getTrafficStore();
    const [report, observed] = await Promise.all([
      store.getRangeReport(site.id, Date.parse(range.since), Date.parse(range.until), "America/New_York"),
      store.getObservationWindow(site.id),
    ]);
    if (!report.pageviews || !report.lastUpdated) {
      if (observed.firstObservedAt && observed.lastObservedAt) {
        return { state: "empty", siteId: site.id, siteName: site.name, domains: site.domains, analyticsUrl: site.analyticsUrl,
          firstObservedAt: observed.firstObservedAt, lastObservedAt: observed.lastObservedAt,
          reason: "No verified pageviews were received for this site in the selected period. Check the feed before treating this as zero visits." };
      }
      return { state: "waiting", siteId: site.id, siteName: site.name, domains: site.domains, analyticsUrl: site.analyticsUrl,
        reason: "No verified production pageview has been received for this site yet. Check its analytics feed and public paths." };
    }
    return {
      state: "ready", siteId: site.id, siteName: site.name, domains: site.domains, analyticsUrl: site.analyticsUrl,
      source: "Vercel Web Analytics drain", ...range, lastUpdated: report.lastUpdated,
      firstObservedAt: observed.firstObservedAt ?? report.lastUpdated,
      pageviews: report.pageviews, visitors: report.uniqueVisitors, daily: report.daily,
      topPaths: report.topPaths.map((row) => ({ path: row.path, pageviews: row.count })),
      topReferrers: report.topReferrers.map((row) => ({ referrer: row.referrer, pageviews: row.count })),
    };
  } catch {
    console.error("[traffic/report] dedicated traffic store query failed", site.id);
    return { state: "unavailable", siteId: site.id, siteName: site.name, domains: site.domains, analyticsUrl: site.analyticsUrl,
      reason: "The site-scoped traffic store could not be read. No traffic estimate is shown." };
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
