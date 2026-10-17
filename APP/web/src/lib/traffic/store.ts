// Storage for traffic events. SEPARATE from Supabase by design (project
// guardrail). Two backends, chosen by env:
//
//   - Postgres (production): connect the dedicated Neon Marketplace resource
//     with prefix TRAFFIC_DATABASE, which injects TRAFFIC_DATABASE_DATABASE_URL.
//     TRAFFIC_DATABASE_URL remains a manual fallback. Never use Supabase here.
//   - File (dev/test only): JSONL under TRAFFIC_DATA_DIR (default .data).
//     Production fails closed when neither Postgres URL is available.
//
// Each report query is scoped to one verified site_id. It runs directly
// against raw events; a daily rollup table is documented as a future
// optimization in TECH_ARCHITECTURE/TRAFFIC_COUNTER.md.

import { promises as fs } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import type { DailyReport, NormalizedEvent, ObservationWindow, PathCount, RangeReport, ReferrerCount, TrafficStore } from "./types";
import { todayRange } from "./date";
import { trafficSite } from "./sites";

const TOP_LIMIT = 10;

function eventKey(event: NormalizedEvent): string {
  if (event.eventId) return createHash("sha256").update(`${event.siteId}:${event.source}:${event.eventId}`).digest("hex");
  return createHash("sha256").update(JSON.stringify([
    event.siteId, event.ts, event.path, event.visitorId, event.referrerHost, event.eventType,
  ])).digest("hex");
}

function uniqueEvents(events: NormalizedEvent[]): NormalizedEvent[] {
  const seen = new Set<string>();
  return events.filter((event) => {
    const key = eventKey(event);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function localDay(ts: number, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(ts));
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function buildRangeReport(events: NormalizedEvent[], siteId: string, timezone: string): RangeReport {
  const visits = uniqueEvents(events).filter((event) => event.eventType === "pageview");
  const days = new Map<string, NormalizedEvent[]>();
  const paths = new Map<string, number>();
  const referrers = new Map<string, number>();
  for (const event of visits) {
    const day = localDay(event.ts, timezone);
    const dayEvents = days.get(day);
    if (dayEvents) dayEvents.push(event);
    else days.set(day, [event]);
    paths.set(event.path, (paths.get(event.path) ?? 0) + 1);
    if (event.referrerHost) referrers.set(event.referrerHost, (referrers.get(event.referrerHost) ?? 0) + 1);
  }
  const top = (values: Map<string, number>) => [...values]
    .map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count).slice(0, TOP_LIMIT);
  return {
    siteId, pageviews: visits.length, identifiedPageviews: visits.filter((event) => event.visitorId).length, uniqueVisitors: new Set(visits.map((event) => event.visitorId).filter(Boolean)).size,
    daily: [...days].map(([date, rows]) => ({ date, pageviews: rows.length,
      visitors: new Set(rows.map((row) => row.visitorId).filter(Boolean)).size })).sort((a, b) => a.date.localeCompare(b.date)),
    topPaths: top(paths).map(({ key, count }) => ({ path: key, count })),
    topReferrers: top(referrers).map(({ key, count }) => ({ referrer: key, count })),
    lastUpdated: visits.length ? new Date(visits.reduce((latest, event) => Math.max(latest, event.ts), 0)).toISOString() : null,
  };
}

function buildReport(
  events: NormalizedEvent[],
  siteId: string,
  timezone: string,
  dateStr: string,
): DailyReport {
  events = uniqueEvents(events);
  const pageviews = events.filter((event) => event.eventType === "pageview").length;
  const visitors = new Set(events.map((event) => event.visitorId).filter(Boolean));
  const pathCounts = new Map<string, number>();
  const referrerCounts = new Map<string, number>();
  let lastUpdatedMs = 0;

  for (const event of events) {
    if (event.eventType === "pageview") {
      pathCounts.set(event.path, (pathCounts.get(event.path) ?? 0) + 1);
    }
    if (event.referrerHost) {
      referrerCounts.set(event.referrerHost, (referrerCounts.get(event.referrerHost) ?? 0) + 1);
    }
    if (event.ts > lastUpdatedMs) lastUpdatedMs = event.ts;
  }

  const topPaths: PathCount[] = [...pathCounts.entries()]
    .map(([p, count]) => ({ path: p, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_LIMIT);
  const topReferrers: ReferrerCount[] = [...referrerCounts.entries()]
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_LIMIT);

  return {
    siteId,
    date: dateStr,
    timezone,
    pageviews,
    uniqueVisitors: visitors.size,
    topPaths,
    topReferrers,
    lastUpdated: new Date(lastUpdatedMs || Date.now()).toISOString(),
  };
}

class FileTrafficStore implements TrafficStore {
  private readonly file: string;

  constructor(dir: string) {
    this.file = path.join(dir, "traffic-events.jsonl");
  }

  async insertEvents(events: NormalizedEvent[]): Promise<void> {
    if (!events.length) return;
    if (events.some((event) => !trafficSite(event.siteId))) throw new Error("Unknown traffic site");
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    const lines = events.map((event) => JSON.stringify(event)).join("\n") + "\n";
    await fs.appendFile(this.file, lines, "utf8");
  }

  async getTodayReport(siteId: string, timezone: string): Promise<DailyReport> {
    if (!trafficSite(siteId)) throw new Error("Unknown traffic site");
    const { dateStr, startMs, endMs } = todayRange(timezone);
    let raw = "";
    try {
      raw = await fs.readFile(this.file, "utf8");
    } catch {
      return buildReport([], siteId, timezone, dateStr);
    }
    const events: NormalizedEvent[] = [];
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      try {
        const event = JSON.parse(line) as NormalizedEvent;
        if (event.siteId === siteId && event.ts >= startMs && event.ts < endMs) events.push(event);
      } catch {
        // skip corrupt line
      }
    }
    return buildReport(events, siteId, timezone, dateStr);
  }

  async getRangeReport(siteId: string, startMs: number, endMs: number, timezone: string, onlyPath?: string): Promise<RangeReport> {
    if (!trafficSite(siteId)) throw new Error("Unknown traffic site");
    let raw = "";
    try { raw = await fs.readFile(this.file, "utf8"); } catch { return buildRangeReport([], siteId, timezone); }
    const events: NormalizedEvent[] = [];
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      try {
        const event = JSON.parse(line) as NormalizedEvent;
        if (event.siteId === siteId && event.ts >= startMs && event.ts < endMs &&
            (!onlyPath || event.path === onlyPath)) events.push(event);
      } catch { /* skip corrupt line */ }
    }
    return buildRangeReport(events, siteId, timezone);
  }

  async getObservationWindow(siteId: string): Promise<ObservationWindow> {
    if (!trafficSite(siteId)) throw new Error("Unknown traffic site");
    let raw = "";
    try { raw = await fs.readFile(this.file, "utf8"); }
    catch { return { firstObservedAt: null, lastObservedAt: null }; }
    let first = Infinity;
    let last = -Infinity;
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      try {
        const event = JSON.parse(line) as NormalizedEvent;
        if (event.siteId !== siteId || event.eventType !== "pageview" || !Number.isFinite(event.ts)) continue;
        first = Math.min(first, event.ts);
        last = Math.max(last, event.ts);
      } catch { /* skip corrupt line */ }
    }
    return {
      firstObservedAt: Number.isFinite(first) ? new Date(first).toISOString() : null,
      lastObservedAt: Number.isFinite(last) ? new Date(last).toISOString() : null,
    };
  }
}

class PostgresTrafficStore implements TrafficStore {
  private readonly connectionString: string;
  private poolPromise: Promise<import("@vercel/postgres").VercelPool> | null = null;

  constructor(connectionString: string, pool?: import("@vercel/postgres").VercelPool) {
    this.connectionString = connectionString;
    if (pool) this.poolPromise = Promise.resolve(pool);
  }

  private async getPool() {
    if (!this.poolPromise) this.poolPromise = this.initializePool();
    try { return await this.poolPromise; }
    catch (error) { this.poolPromise = null; throw error; }
  }

  private async initializePool() {
    // Connection construction only. Schema lives in traffic/migrations and is
    // applied separately with explicit approval. First report issues SELECTs.
    const { createPool } = await import("@vercel/postgres");
    return createPool({ connectionString: this.connectionString, max: 2, connectionTimeoutMillis: 3000, query_timeout: 3000, idleTimeoutMillis: 1000 });
  }

  async getCollectionChecks(siteId: string, startMs: number, endMs: number) {
    const pool = await this.getPool();
    try {
      const result = await pool.query(`SELECT start_at, end_at, checked_at, healthy, probe_ok
        FROM traffic_collection_checks WHERE site_id = $1 AND
        ((end_at >= $2 AND start_at <= $3) OR start_at =
          (SELECT MIN(start_at) FROM traffic_collection_checks WHERE site_id = $1 AND healthy))
        ORDER BY start_at LIMIT 10000`,
        [siteId, new Date(startMs).toISOString(), new Date(Math.max(endMs, Date.now())).toISOString()]);
      return result.rows.map((row) => ({ start: new Date(row.start_at).toISOString(), end: new Date(row.end_at).toISOString(),
        checkedAt: new Date(row.checked_at).toISOString(), healthy: row.healthy === true, probeHealthy: row.probe_ok === true }));
    } catch (error) {
      if ((error as { code?: string }).code === "42P01") return []; // no coverage evidence, never zero
      throw error;
    }
  }

  // Explicitly activated monitor POST only. Never called by reports/GETs.
  async recordCollectionProbe(siteId: string, healthy: boolean, checkedAt: number) {
    if (!trafficSite(siteId)) throw new Error("Unknown traffic site");
    const pool = await this.getPool();
    const end = new Date(checkedAt).toISOString();
    const prior = await pool.query(`SELECT checked_at, probe_ok FROM traffic_collection_checks
      WHERE site_id = $1 AND checked_at < $2 ORDER BY checked_at DESC LIMIT 1`, [siteId, end]);
    const previous = prior.rows[0];
    const gap = previous ? checkedAt - new Date(previous.checked_at).getTime() : Infinity;
    const contiguous = gap > 0 && gap <= 15 * 60000;
    const start = contiguous ? new Date(previous.checked_at).toISOString() : new Date(checkedAt - 1).toISOString();
    await pool.query(`INSERT INTO traffic_collection_checks(site_id, start_at, end_at, checked_at, healthy, probe_ok)
      VALUES($1,$2,$3,$3,$4,$5) ON CONFLICT DO NOTHING`, [siteId, start, end, healthy && (!contiguous || previous.probe_ok === true), healthy]);
  }

  async insertEvents(events: NormalizedEvent[]): Promise<void> {
    if (!events.length) return;
    if (events.some((event) => !trafficSite(event.siteId))) throw new Error("Unknown traffic site");
    const pool = await this.getPool();
    for (const event of events) {
      await pool.sql`
        INSERT INTO traffic_events (site_id, ts, path, referrer_host, visitor_id, event_type, event_key)
        VALUES (${event.siteId}, to_timestamp(${event.ts} / 1000.0), ${event.path}, ${event.referrerHost}, ${event.visitorId}, ${event.eventType}, ${eventKey(event)})
        ON CONFLICT (event_key) DO NOTHING
      `;
    }
  }

  async getTodayReport(siteId: string, timezone: string): Promise<DailyReport> {
    if (!trafficSite(siteId)) throw new Error("Unknown traffic site");
    const pool = await this.getPool();
    const { dateStr, startMs, endMs } = todayRange(timezone);
    const start = new Date(startMs).toISOString();
    const end = new Date(endMs).toISOString();

    const totals = await pool.sql`
      SELECT
        COUNT(*) FILTER (WHERE event_type = 'pageview') AS pageviews,
        COUNT(DISTINCT NULLIF(visitor_id, '')) AS unique_visitors,
        MAX(ts) AS last_updated
      FROM traffic_events
      WHERE site_id = ${siteId} AND ts >= ${start} AND ts < ${end}
    `;
    const paths = await pool.sql`
      SELECT path, COUNT(*) AS count
      FROM traffic_events
      WHERE site_id = ${siteId} AND ts >= ${start} AND ts < ${end} AND event_type = 'pageview'
      GROUP BY path ORDER BY count DESC LIMIT ${TOP_LIMIT}
    `;
    const referrers = await pool.sql`
      SELECT referrer_host AS referrer, COUNT(*) AS count
      FROM traffic_events
      WHERE site_id = ${siteId} AND ts >= ${start} AND ts < ${end} AND referrer_host IS NOT NULL
      GROUP BY referrer_host ORDER BY count DESC LIMIT ${TOP_LIMIT}
    `;

    const row = totals.rows[0] ?? {};
    return {
      siteId,
      date: dateStr,
      timezone,
      pageviews: Number(row.pageviews ?? 0),
      uniqueVisitors: Number(row.unique_visitors ?? 0),
      topPaths: paths.rows.map((r) => ({ path: String(r.path), count: Number(r.count) })),
      topReferrers: referrers.rows.map((r) => ({ referrer: String(r.referrer), count: Number(r.count) })),
      lastUpdated: row.last_updated ? new Date(row.last_updated).toISOString() : new Date().toISOString(),
    };
  }

  async getRangeReport(siteId: string, startMs: number, endMs: number, timezone: string, onlyPath?: string): Promise<RangeReport> {
    if (!trafficSite(siteId)) throw new Error("Unknown traffic site");
    const pool = await this.getPool();
    const start = new Date(startMs).toISOString();
    const end = new Date(endMs).toISOString();
    const allPaths = !onlyPath;
    const selectedPath = onlyPath ?? "";
    const totals = await pool.sql`
      SELECT COUNT(*) AS pageviews, COUNT(*) FILTER (WHERE visitor_id <> '') AS identified_pageviews, COUNT(DISTINCT NULLIF(visitor_id, '')) AS visitors, MAX(ts) AS last_updated
      FROM traffic_events WHERE site_id = ${siteId} AND ts >= ${start} AND ts < ${end}
        AND event_type = 'pageview' AND (${allPaths} OR path = ${selectedPath})
    `;
    const daily = await pool.sql`
      SELECT to_char(ts AT TIME ZONE ${timezone}, 'YYYY-MM-DD') AS day,
        COUNT(*) AS pageviews, COUNT(DISTINCT NULLIF(visitor_id, '')) AS visitors
      FROM traffic_events WHERE site_id = ${siteId} AND ts >= ${start} AND ts < ${end}
        AND event_type = 'pageview' AND (${allPaths} OR path = ${selectedPath})
      GROUP BY day ORDER BY day
    `;
    const paths = await pool.sql`
      SELECT path, COUNT(*) AS count FROM traffic_events
      WHERE site_id = ${siteId} AND ts >= ${start} AND ts < ${end}
        AND event_type = 'pageview' AND (${allPaths} OR path = ${selectedPath})
      GROUP BY path ORDER BY count DESC LIMIT ${TOP_LIMIT}
    `;
    const referrers = await pool.sql`
      SELECT referrer_host AS referrer, COUNT(*) AS count FROM traffic_events
      WHERE site_id = ${siteId} AND ts >= ${start} AND ts < ${end}
        AND event_type = 'pageview' AND referrer_host IS NOT NULL
        AND (${allPaths} OR path = ${selectedPath})
      GROUP BY referrer_host ORDER BY count DESC LIMIT ${TOP_LIMIT}
    `;
    const row = totals.rows[0] ?? {};
    return {
      siteId, pageviews: Number(row.pageviews ?? 0), identifiedPageviews: Number(row.identified_pageviews ?? 0), uniqueVisitors: Number(row.visitors ?? 0),
      daily: daily.rows.map((item) => ({ date: String(item.day), pageviews: Number(item.pageviews), visitors: Number(item.visitors) })),
      topPaths: paths.rows.map((item) => ({ path: String(item.path), count: Number(item.count) })),
      topReferrers: referrers.rows.map((item) => ({ referrer: String(item.referrer), count: Number(item.count) })),
      lastUpdated: row.last_updated ? new Date(row.last_updated).toISOString() : null,
    };
  }

  async getObservationWindow(siteId: string): Promise<ObservationWindow> {
    if (!trafficSite(siteId)) throw new Error("Unknown traffic site");
    const pool = await this.getPool();
    const result = await pool.sql`
      SELECT MIN(ts) AS first_observed, MAX(ts) AS last_observed
      FROM traffic_events WHERE site_id = ${siteId} AND event_type = 'pageview'
    `;
    const row = result.rows[0] ?? {};
    return {
      firstObservedAt: row.first_observed ? new Date(row.first_observed).toISOString() : null,
      lastObservedAt: row.last_observed ? new Date(row.last_observed).toISOString() : null,
    };
  }
}

let cached: TrafficStore | null = null;

export function trafficDatabaseUrl(): string | undefined {
  const url = process.env.TRAFFIC_DATABASE_DATABASE_URL?.trim() || process.env.TRAFFIC_DATABASE_URL?.trim();
  if (url) {
    const parsed = new URL(url);
    if (!["postgres:", "postgresql:"].includes(parsed.protocol) || /supabase/i.test(parsed.hostname)) throw new Error("DEDICATED_TRAFFIC_DATABASE_REQUIRED");
    if ([process.env.DATABASE_URL, process.env.POSTGRES_URL, process.env.NEXT_PUBLIC_SUPABASE_URL].includes(url)) throw new Error("DEDICATED_TRAFFIC_DATABASE_REQUIRED");
  }
  return url;
}

export function getTrafficStore(): TrafficStore {
  if (cached) return cached;
  const connectionString = trafficDatabaseUrl();
  if (connectionString) {
    cached = new PostgresTrafficStore(connectionString);
  } else {
    if (process.env.VERCEL_ENV === "production") throw new Error("TRAFFIC_DATABASE_NOT_CONFIGURED");
    cached = new FileTrafficStore(process.env.TRAFFIC_DATA_DIR || ".data");
  }
  return cached;
}

export const __test = { FileTrafficStore, PostgresTrafficStore, buildReport, buildRangeReport };
