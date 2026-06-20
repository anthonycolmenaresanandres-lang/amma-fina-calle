// Shared types for the first-party traffic counter.
//
// Source of truth is Vercel Web Analytics, forwarded to us via a Vercel
// Drain (schema `vercel.analytics.v2`). We normalize those events, store them
// in a SEPARATE store (not Supabase — see TECH_ARCHITECTURE/TRAFFIC_COUNTER.md),
// and serve aggregates from a protected report endpoint. No names, emails,
// phone numbers, or IPs are ever stored — only Vercel's anonymized device id.

export interface NormalizedEvent {
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
  date: string; // YYYY-MM-DD in `timezone`
  timezone: string;
  pageviews: number;
  uniqueVisitors: number;
  topPaths: PathCount[];
  topReferrers: ReferrerCount[];
  lastUpdated: string; // ISO timestamp of the most recent stored event (or now)
}

export interface TrafficStore {
  insertEvents(events: NormalizedEvent[]): Promise<void>;
  getTodayReport(timezone: string): Promise<DailyReport>;
}
