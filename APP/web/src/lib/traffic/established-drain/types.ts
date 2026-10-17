// Shared types for the first-party traffic counter.
//
// Source of truth is Vercel Web Analytics, forwarded to us via a Vercel
// Drain (Vercel analytics schema v1/v2). We normalize public pageviews, store them
// in a SEPARATE store (not Supabase — see TECH_ARCHITECTURE/TRAFFIC_COUNTER.md),
// and serve aggregates from a protected report endpoint. No names, emails,
// phone numbers, or IPs are ever stored — only Vercel's anonymized device id.

export interface NormalizedEvent {
  /** Verified public site registry ID. Events without one are discarded. */
  siteId: string;
  /** Epoch milliseconds. */
  ts: number;
  /** Sanitized path (dynamic ids collapsed, query string dropped). */
  path: string;
  /** External referrer host, when the drain provides one. */
  referrerHost: string | null;
  /** Vercel's anonymized device/session id — our "unique visitor" key. */
  visitorId: string;
  /** "pageview" or a custom analytics event name. */
  eventType: string;
}

export interface PathCount {
  path: string;
  count: number;
}

export interface ReferrerCount {
  referrer: string;
  count: number;
}

export interface DailyReport {
  siteId: string;
  date: string; // YYYY-MM-DD in `timezone`
  timezone: string;
  pageviews: number;
  uniqueVisitors: number;
  topPaths: PathCount[];
  topReferrers: ReferrerCount[];
  lastUpdated: string; // ISO timestamp of the most recent stored event (or now)
}

export interface RangeReport {
  siteId: string;
  pageviews: number;
  uniqueVisitors: number;
  daily: Array<{ date: string; pageviews: number; visitors: number }>;
  topPaths: PathCount[];
  topReferrers: ReferrerCount[];
  lastUpdated: string | null;
}

export interface ObservationWindow {
  firstObservedAt: string | null;
  lastObservedAt: string | null;
}

export interface TrafficStore {
  insertEvents(events: NormalizedEvent[]): Promise<void>;
  getTodayReport(siteId: string, timezone: string): Promise<DailyReport>;
  getRangeReport(siteId: string, startMs: number, endMs: number, timezone: string, path?: string): Promise<RangeReport>;
  getObservationWindow(siteId: string): Promise<ObservationWindow>;
}
