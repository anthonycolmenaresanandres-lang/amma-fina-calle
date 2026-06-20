// Parses a Vercel Analytics Drain payload into normalized events.
//
// Vercel delivers `vercel.analytics.v2` events either as a JSON array or as
// newline-delimited JSON (NDJSON). Fields we rely on: timestamp, path,
// eventType, deviceId/sessionId. `referrer` is read when present (the v2
// schema does not always include an external referrer — topReferrers is
// best-effort). Unparseable lines are skipped, never thrown, so a single bad
// record can't drop a whole batch.

import type { NormalizedEvent } from "./types";
import { referrerHost, sanitizePath } from "./sanitize";

interface RawAnalyticsEvent {
  schema?: string;
  eventType?: string;
  eventName?: string;
  timestamp?: number;
  path?: string;
  origin?: string;
  referrer?: string;
  deviceId?: number | string;
  sessionId?: number | string;
}

function toRawEvents(body: string): RawAnalyticsEvent[] {
  const trimmed = body.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  const events: RawAnalyticsEvent[] = [];
  for (const line of trimmed.split("\n")) {
    const candidate = line.trim();
    if (!candidate) continue;
    try {
      events.push(JSON.parse(candidate));
    } catch {
      // skip malformed line
    }
  }
  return events;
}

export function parseDrainPayload(body: string): NormalizedEvent[] {
  const normalized: NormalizedEvent[] = [];
  for (const raw of toRawEvents(body)) {
    if (typeof raw !== "object" || raw === null) continue;
    const eventType = raw.eventType === "event" ? raw.eventName || "event" : raw.eventType || "pageview";
    const path = sanitizePath(typeof raw.path === "string" ? raw.path : "");
    if (path === null) continue; // dropped route (api/auth/etc.)

    const visitorRaw = raw.deviceId ?? raw.sessionId;
    const visitorId = visitorRaw === undefined || visitorRaw === null ? "unknown" : String(visitorRaw);
    const ts = typeof raw.timestamp === "number" && Number.isFinite(raw.timestamp) ? raw.timestamp : Date.now();

    normalized.push({
      ts,
      path,
      referrerHost: referrerHost(raw.referrer, raw.origin),
      visitorId,
      eventType,
    });
  }
  return normalized;
}
