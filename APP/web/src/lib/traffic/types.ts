// Shared types for the first-party traffic counter.
//
// Anonymous first-party pageviews, plus existing attributed drain history.
// Dedicated store only; no names, emails, phone numbers or raw IPs. Historical
// tracked identifiers are scoped by site/type; anonymous pageviews carry none.

export interface NormalizedEvent {
  /** Random page-load/navigation ID; retries keep the same ID. */
  eventId?: string;
  source?: "first-party" | "drain";
  hostname?: string;
  /** Verified public site registry ID. Events without one are discarded. */
  siteId: string;
  /** Epoch milliseconds. */
  ts: number;
  /** Sanitized path (dynamic ids collapsed, query string dropped). */
  path: string;
  /** External referrer host, when the drain provides one. */
  referrerHost: string | null;
  /** Site-scoped tracked identifier, or empty when unmeasured. Never a person. */
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
  identifiedPageviews?: number;
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
  getCollectionChecks?(siteId: string, startMs: number, endMs: number): Promise<CollectionCheck[]>;
  recordCollectionProbe?(siteId: string, healthy: boolean, checkedAt: number): Promise<void>;
}

export interface CollectionCheck {
  start: string;
  end: string;
  checkedAt: string;
  healthy: boolean;
  probeHealthy?: boolean;
}
