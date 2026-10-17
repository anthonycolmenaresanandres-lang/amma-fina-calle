// Parses a Vercel Analytics Drain payload into normalized events.
//
// Vercel delivers Web Analytics events as a JSON array or NDJSON. Accept only
// production pageviews with a verified project, hostname and public path;
// custom events and unattributable rows never enter traffic reports. Referrer
// is best-effort. Unparseable lines are skipped, not thrown.

import type { NormalizedEvent } from "./types";
import { createHash } from "node:crypto";
import { referrerHost, sanitizePath } from "./sanitize";
import { siteForPublicVisit } from "./sites";

interface RawAnalyticsEvent {
  schema?: string;
  eventType?: string;
  projectId?: string;
  vercelEnvironment?: string;
  timestamp?: number;
  path?: string;
  origin?: string;
  requestHostname?: string;
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

export function parseDrainPayload(body: string, now = Date.now()): NormalizedEvent[] {
  if (Buffer.byteLength(body) > 65536) return [];
  const normalized: NormalizedEvent[] = [];
  for (const raw of toRawEvents(body)) {
    if (typeof raw !== "object" || raw === null) continue;
    if ((raw.schema !== "vercel.analytics.v1" && raw.schema !== "vercel.analytics.v2") ||
        raw.eventType !== "pageview" || raw.vercelEnvironment !== "production" ||
        typeof raw.path !== "string" || !raw.path.startsWith("/") ||
        typeof raw.timestamp !== "number" || !Number.isFinite(raw.timestamp) || raw.timestamp < now - 86400000 || raw.timestamp > now + 60000) continue;
    const path = sanitizePath(raw.path);
    if (path === null) continue; // dropped route (api/auth/etc.)
    let host = typeof raw.requestHostname === "string" ? raw.requestHostname : "";
    if (!host && raw.origin) {
      try { host = new URL(raw.origin).hostname; } catch { /* no attributable host */ }
    }
    if (host && raw.origin) {
      try { if (new URL(raw.origin).hostname !== host) continue; } catch { continue; }
    }
    const site = siteForPublicVisit(host, path);
    if (!site) continue; // Unknown/preview/private routes never enter a site report.
    if (raw.projectId !== site.projectId) continue;

    const visitorRaw = raw.deviceId ?? raw.sessionId;
    if (visitorRaw !== undefined && !["number", "string"].includes(typeof visitorRaw)) continue;
    if (String(visitorRaw ?? "").length > 128) continue;
    const kind = raw.deviceId !== undefined ? "device" : "session";
    const visitorId = visitorRaw === undefined || visitorRaw === null || String(visitorRaw) === "" ? "" :
      createHash("sha256").update(`${site.id}:${kind}:${String(visitorRaw)}`).digest("hex");
    const ts = raw.timestamp;

    normalized.push({
      siteId: site.id,
      source: "drain",
      hostname: host,
      ts,
      path,
      referrerHost: referrerHost(raw.referrer, raw.origin),
      visitorId,
      eventType: "pageview",
    });
  }
  return normalized;
}
