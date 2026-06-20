// Storage for traffic events. SEPARATE from Supabase by design (project
// guardrail). Two backends, chosen by env:
//
//   - Postgres (production): set TRAFFIC_DATABASE_URL to a dedicated database
//     connection string (Vercel Postgres / Neon / etc. — NOT the Supabase one).
//   - File (dev/test/fallback): JSONL under TRAFFIC_DATA_DIR (default .data),
//     used automatically when TRAFFIC_DATABASE_URL is absent.
//
// The report query runs directly against raw events — fine for a single
// storefront's volume. A daily rollup table is documented as a future
// optimization in TECH_ARCHITECTURE/TRAFFIC_COUNTER.md.

import { promises as fs } from "node:fs";
import path from "node:path";
import type { DailyReport, NormalizedEvent, PathCount, ReferrerCount, TrafficStore } from "./types";
import { todayRange } from "./date";

const TOP_LIMIT = 10;

function buildReport(
  events: NormalizedEvent[],
  timezone: string,
  dateStr: string,
): DailyReport {
  const pageviews = events.filter((event) => event.eventType === "pageview").length;
  const visitors = new Set(events.map((event) => event.visitorId));
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
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    const lines = events.map((event) => JSON.stringify(event)).join("\n") + "\n";
    await fs.appendFile(this.file, lines, "utf8");
  }

  async getTodayReport(timezone: string): Promise<DailyReport> {
    const { dateStr, startMs, endMs } = todayRange(timezone);
    let raw = "";
    try {
      raw = await fs.readFile(this.file, "utf8");
    } catch {
      return buildReport([], timezone, dateStr);
    }
    const events: NormalizedEvent[] = [];
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      try {
        const event = JSON.parse(line) as NormalizedEvent;
        if (event.ts >= startMs && event.ts < endMs) events.push(event);
      } catch {
        // skip corrupt line
      }
    }
    return buildReport(events, timezone, dateStr);
  }
}

class PostgresTrafficStore implements TrafficStore {
  private readonly connectionString: string;
  private pool: import("@vercel/postgres").VercelPool | null = null;
  private initialized = false;

  constructor(connectionString: string) {
    this.connectionString = connectionString;
  }

  private async getPool() {
    if (!this.pool) {
      const { createPool } = await import("@vercel/postgres");
      this.pool = createPool({ connectionString: this.connectionString });
    }
    if (!this.initialized) {
      await this.pool.sql`
        CREATE TABLE IF NOT EXISTS traffic_events (
          id BIGSERIAL PRIMARY KEY,
          ts TIMESTAMPTZ NOT NULL,
          path TEXT NOT NULL,
          referrer_host TEXT,
          visitor_id TEXT NOT NULL,
          event_type TEXT NOT NULL
        )
      `;
      await this.pool.sql`CREATE INDEX IF NOT EXISTS traffic_events_ts_idx ON traffic_events (ts)`;
      this.initialized = true;
    }
    return this.pool;
  }

  async insertEvents(events: NormalizedEvent[]): Promise<void> {
    if (!events.length) return;
    const pool = await this.getPool();
    for (const event of events) {
      await pool.sql`
        INSERT INTO traffic_events (ts, path, referrer_host, visitor_id, event_type)
        VALUES (to_timestamp(${event.ts} / 1000.0), ${event.path}, ${event.referrerHost}, ${event.visitorId}, ${event.eventType})
      `;
    }
  }

  async getTodayReport(timezone: string): Promise<DailyReport> {
    const pool = await this.getPool();
    const { dateStr, startMs, endMs } = todayRange(timezone);
    const start = new Date(startMs).toISOString();
    const end = new Date(endMs).toISOString();

    const totals = await pool.sql`
      SELECT
        COUNT(*) FILTER (WHERE event_type = 'pageview') AS pageviews,
        COUNT(DISTINCT visitor_id) AS unique_visitors,
        MAX(ts) AS last_updated
      FROM traffic_events
      WHERE ts >= ${start} AND ts < ${end}
    `;
    const paths = await pool.sql`
      SELECT path, COUNT(*) AS count
      FROM traffic_events
      WHERE ts >= ${start} AND ts < ${end} AND event_type = 'pageview'
      GROUP BY path ORDER BY count DESC LIMIT ${TOP_LIMIT}
    `;
    const referrers = await pool.sql`
      SELECT referrer_host AS referrer, COUNT(*) AS count
      FROM traffic_events
      WHERE ts >= ${start} AND ts < ${end} AND referrer_host IS NOT NULL
      GROUP BY referrer_host ORDER BY count DESC LIMIT ${TOP_LIMIT}
    `;

    const row = totals.rows[0] ?? {};
    return {
      date: dateStr,
      timezone,
      pageviews: Number(row.pageviews ?? 0),
      uniqueVisitors: Number(row.unique_visitors ?? 0),
      topPaths: paths.rows.map((r) => ({ path: String(r.path), count: Number(r.count) })),
      topReferrers: referrers.rows.map((r) => ({ referrer: String(r.referrer), count: Number(r.count) })),
      lastUpdated: row.last_updated ? new Date(row.last_updated).toISOString() : new Date().toISOString(),
    };
  }
}

let cached: TrafficStore | null = null;

export function getTrafficStore(): TrafficStore {
  if (cached) return cached;
  const connectionString = process.env.TRAFFIC_DATABASE_URL;
  if (connectionString) {
    cached = new PostgresTrafficStore(connectionString);
  } else {
    cached = new FileTrafficStore(process.env.TRAFFIC_DATA_DIR || ".data");
  }
  return cached;
}

export const __test = { FileTrafficStore, PostgresTrafficStore, buildReport };
