import "server-only";

import { todayRange } from "./date";
import { siteFilter, TRAFFIC_SITES, TRAFFIC_TEAM_ID, trafficSite, type TrafficSite } from "./sites";

const API_BASE = "https://api.vercel.com/v1/query/web-analytics/visits";
type AnalyticsCountResponse = { data?: { pageviews?: number; visitors?: number } };
type AggregateRow = Record<string, unknown> & {
  count?: number; pageviews?: number; visitors?: number;
  timestamp?: string; requestPath?: string; referrerHostname?: string;
};
type AggregateResponse = { data?: AggregateRow[] };
type AuthMode = "access-token" | "oidc";
type AuthCandidate = { token: string; mode: AuthMode };

export type TrafficReport =
  | {
      state: "ready"; siteId: TrafficSite["id"]; siteName: string; domains: readonly string[];
      source: "Vercel Web Analytics"; authMode: AuthMode; since: string; until: string;
      pageviews: number; visitors: number;
      daily: Array<{ date: string; pageviews: number; visitors: number }>;
      topPaths: Array<{ path: string; pageviews: number; visitors: number }>;
      topReferrers: Array<{ referrer: string; pageviews: number; visitors: number }>;
    }
  | { state: "unconfigured" | "unavailable"; siteId: TrafficSite["id"]; siteName: string; reason: string };

export type BodegaTrafficReport =
  | (Extract<TrafficReport, { state: "ready" }> & { gamePageviews: number; gameVisitors: number })
  | Extract<TrafficReport, { state: "unconfigured" | "unavailable" }>;
export type TrafficRange = { since: string; until: string };

function authCandidates(): AuthCandidate[] {
  const explicit = process.env.VERCEL_WEB_ANALYTICS_TOKEN?.trim() || process.env.VERCEL_TOKEN?.trim() || "";
  const oidc = process.env.VERCEL_OIDC_TOKEN?.trim() || "";
  const candidates: AuthCandidate[] = [];
  if (explicit) candidates.push({ token: explicit, mode: "access-token" });
  if (oidc && oidc !== explicit) candidates.push({ token: oidc, mode: "oidc" });
  return candidates;
}

function number(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value
    : typeof value === "string" && Number.isFinite(Number(value)) ? Number(value) : 0;
}
function pageviews(row: AggregateRow): number { return number(row.pageviews ?? row.count); }
function dimension(value: unknown, fallback = "Direct / unknown"): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

async function requestJson<T>(site: TrafficSite, endpoint: "count" | "aggregate", params: URLSearchParams): Promise<{ data: T; mode: AuthMode }> {
  const candidates = authCandidates();
  if (!candidates.length) throw new Error("NO_ANALYTICS_AUTH");
  params.set("projectId", site.projectId);
  params.set("teamId", process.env.VERCEL_WEB_ANALYTICS_TEAM_ID?.trim() || TRAFFIC_TEAM_ID);
  let lastStatus = 0;
  for (const candidate of candidates) {
    const response = await fetch(`${API_BASE}/${endpoint}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${candidate.token}` }, cache: "no-store", signal: AbortSignal.timeout(12000),
    });
    lastStatus = response.status;
    if (response.ok) return { data: (await response.json()) as T, mode: candidate.mode };
    if (response.status !== 401 && response.status !== 403) throw new Error(`VERCEL_ANALYTICS_${response.status}`);
  }
  throw new Error(`VERCEL_ANALYTICS_AUTH_${lastStatus || 401}`);
}

function period(days: number): TrafficRange {
  const safeDays = Math.max(1, Math.min(90, Math.floor(days)));
  const until = new Date();
  return { since: new Date(until.getTime() - safeDays * 86400000).toISOString(), until: until.toISOString() };
}
export function previousEasternDay(now = Date.now()): { date: string; range: TrafficRange } {
  const day = todayRange("America/New_York", now - 86400000);
  return { date: day.dateStr, range: { since: new Date(day.startMs).toISOString(), until: new Date(day.endMs).toISOString() } };
}

async function count(site: TrafficSite, filter: string, range: TrafficRange) {
  const result = await requestJson<AnalyticsCountResponse>(site, "count", new URLSearchParams({ filter, ...range }));
  if (!result.data.data || !Number.isFinite(Number(result.data.data.pageviews)) ||
      !Number.isFinite(Number(result.data.data.visitors))) throw new Error("VERCEL_ANALYTICS_INVALID_COUNT");
  return { pageviews: number(result.data.data.pageviews), visitors: number(result.data.data.visitors), mode: result.mode };
}
async function aggregate(site: TrafficSite, by: "day" | "requestPath" | "referrerHostname", filter: string, range: TrafficRange, limit: number) {
  const result = await requestJson<AggregateResponse>(site, "aggregate", new URLSearchParams({ by, filter, ...range, limit: String(limit) }));
  if (!Array.isArray(result.data.data)) throw new Error("VERCEL_ANALYTICS_INVALID_AGGREGATE");
  return result.data.data;
}
function unavailable(site: TrafficSite, error: unknown): Extract<TrafficReport, { state: "unconfigured" | "unavailable" }> {
  const message = error instanceof Error ? error.message : "unknown";
  return { state: "unavailable", siteId: site.id, siteName: site.name,
    reason: message.startsWith("VERCEL_ANALYTICS_AUTH_")
      ? "Vercel rejected the available analytics credential for this project. Configure a server-only token with access to it."
      : "Vercel Web Analytics could not be queried for this site. No traffic estimate is shown." };
}

export async function getSiteTrafficReport(site: TrafficSite, range: TrafficRange, options: { breakdowns?: boolean } = {}): Promise<TrafficReport> {
  if (!authCandidates().length) return { state: "unconfigured", siteId: site.id, siteName: site.name,
    reason: "No server-side Vercel Analytics credential is configured. Set VERCEL_WEB_ANALYTICS_TOKEN if deployment OIDC is unavailable." };
  try {
    const filter = siteFilter(site);
    const totalPromise = count(site, filter, range);
    const detailPromise = options.breakdowns === false ? null : Promise.all([
      aggregate(site, "day", filter, range, 90),
      aggregate(site, "requestPath", filter, range, 50),
      aggregate(site, "referrerHostname", filter, range, 20),
    ]);
    const [total, details] = await Promise.all([totalPromise, detailPromise]);
    const [dailyRows, pathRows, referrerRows] = details ?? [[], [], []];
    const daily = dailyRows.map((row) => ({ date: dimension(row.timestamp, "").slice(0, 10),
      pageviews: pageviews(row), visitors: number(row.visitors) }))
      .filter((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.date)).sort((a, b) => a.date.localeCompare(b.date));
    const topPaths = pathRows.map((row) => ({ path: dimension(row.requestPath, ""),
      pageviews: pageviews(row), visitors: number(row.visitors) }))
      .filter((row) => row.path.startsWith("/")).sort((a, b) => b.pageviews - a.pageviews);
    const topReferrers = referrerRows.map((row) => ({ referrer: dimension(row.referrerHostname),
      pageviews: pageviews(row), visitors: number(row.visitors) })).sort((a, b) => b.pageviews - a.pageviews);
    return { state: "ready", siteId: site.id, siteName: site.name, domains: site.domains,
      source: "Vercel Web Analytics", authMode: total.mode, ...range,
      pageviews: total.pageviews, visitors: total.visitors, daily, topPaths, topReferrers };
  } catch (error) { return unavailable(site, error); }
}

export async function getAllSiteTrafficReports(days = 30): Promise<TrafficReport[]> {
  const range = period(days);
  return Promise.all(TRAFFIC_SITES.map((site) => getSiteTrafficReport(site, range)));
}
export async function getMorningTrafficReports(now = Date.now()) {
  const { date, range } = previousEasternDay(now);
  const reports = await Promise.all(TRAFFIC_SITES.map((site) => getSiteTrafficReport(site, range, { breakdowns: false })));
  return { date, range, reports };
}

// Compatibility for the existing Bodega-only admin dashboard.
export async function getBodegaTrafficReport(days = 30): Promise<BodegaTrafficReport> {
  const site = trafficSite("bodega")!;
  const range = period(days);
  const report = await getSiteTrafficReport(site, range);
  if (report.state !== "ready") return report;
  try {
    const game = await count(site, `${siteFilter(site)} and requestPath eq '/bodega-sessions-review'`, range);
    return { ...report, gamePageviews: game.pageviews, gameVisitors: game.visitors };
  } catch (error) { return unavailable(site, error); }
}

export const __test = { number, pageviews, period };
