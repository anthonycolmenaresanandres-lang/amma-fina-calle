import "server-only";

import { todayRange } from "./date";
import { getTrafficStore } from "./store";
import { TRAFFIC_SITES, trafficSite, type TrafficSite } from "./sites";

export type TrafficRange = { since: string; until: string };
export type TrafficReport =
  | {
      state: "ready"; siteId: TrafficSite["id"]; siteName: string; domains: readonly string[]; analyticsUrl: string;
      source: "Vercel Web Analytics drain"; since: string; until: string; lastUpdated: string;
      pageviews: number; visitors: number;
      daily: Array<{ date: string; pageviews: number; visitors: number }>;
      topPaths: Array<{ path: string; pageviews: number }>;
      topReferrers: Array<{ referrer: string; pageviews: number }>;
    }
  | { state: "unconfigured" | "unavailable"; siteId: TrafficSite["id"]; siteName: string; domains: readonly string[]; analyticsUrl: string; reason: string };

export type BodegaTrafficReport =
  | (Extract<TrafficReport, { state: "ready" }> & { gamePageviews: number; gameVisitors: number })
  | Extract<TrafficReport, { state: "unconfigured" | "unavailable" }>;

function period(days: number): TrafficRange {
  const safeDays = Math.max(1, Math.min(90, Math.floor(days)));
  const until = new Date();
  return { since: new Date(until.getTime() - safeDays * 86400000).toISOString(), until: until.toISOString() };
}

export function previousEasternDay(now = Date.now()): { date: string; range: TrafficRange } {
  const day = todayRange("America/New_York", now - 86400000);
  return { date: day.dateStr, range: { since: new Date(day.startMs).toISOString(), until: new Date(day.endMs).toISOString() } };
}

export async function getSiteTrafficReport(site: TrafficSite, range: TrafficRange): Promise<TrafficReport> {
  if (process.env.VERCEL_ENV === "production" && !process.env.TRAFFIC_DATABASE_URL?.trim()) {
    return { state: "unconfigured", siteId: site.id, siteName: site.name, domains: site.domains, analyticsUrl: site.analyticsUrl,
      reason: "A dedicated traffic database and verified Vercel Web Analytics drain must be connected before this site can report traffic." };
  }
  try {
    const report = await getTrafficStore().getRangeReport(site.id, Date.parse(range.since), Date.parse(range.until), "America/New_York");
    if (!report.pageviews || !report.lastUpdated) {
      return { state: "unavailable", siteId: site.id, siteName: site.name, domains: site.domains, analyticsUrl: site.analyticsUrl,
        reason: "No verified public pageviews have been received for this site in this period. This is not a confirmed zero." };
    }
    return {
      state: "ready", siteId: site.id, siteName: site.name, domains: site.domains, analyticsUrl: site.analyticsUrl,
      source: "Vercel Web Analytics drain", ...range, lastUpdated: report.lastUpdated,
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
