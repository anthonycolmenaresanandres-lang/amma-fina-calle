import { referrerHost, sanitizePath } from "./sanitize";
import { ALL_TRAFFIC_SITES, siteForPublicVisit } from "./sites";
import type { NormalizedEvent } from "./types";

export const MAX_BODY_BYTES = 2048;
export function activeSource(): "first-party" | "drain" | "disabled" {
  const source = process.env.TRAFFIC_INGESTION_SOURCE;
  return source === "first-party" || source === "drain" ? source : "disabled";
}
export function verifiedOrigin(raw: string | null): URL | null {
  try {
    const url = new URL(raw ?? "");
    if (url.protocol !== "https:" || url.port || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash ||
      !ALL_TRAFFIC_SITES.some((site) => site.domains.includes(url.hostname))) return null;
    return url;
  } catch { return null; }
}
export function parseFirstParty(raw: unknown, origin: string, now = Date.now()): NormalizedEvent | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const input = raw as Record<string, unknown>;
  const url = verifiedOrigin(origin);
  if (!url || input.hostname !== url.hostname || input.internal === true ||
      input.siteId !== undefined || input.site_id !== undefined || // identity comes from host + path
      typeof input.path !== "string" || typeof input.id !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.id) ||
      typeof input.ts !== "number" || !Number.isFinite(input.ts) ||
      input.ts < now - 300000 || input.ts > now + 60000) return null;
  const path = sanitizePath(input.path);
  const site = path && siteForPublicVisit(url.hostname, path);
  if (!site || !path) return null;
  return { siteId: site.id, hostname: url.hostname, ts: input.ts, path, eventId: input.id,
    source: "first-party", visitorId: "", eventType: "pageview",
    referrerHost: referrerHost(typeof input.referrer === "string" ? input.referrer : null, origin) };
}
// Bounded memory; no raw IP, cookie, fingerprint, or user identifier. This is
// per-instance load shedding, not a distributed spending cap or bot guarantee.
export class AdmissionBudget {
  private minute = -1;
  private total = 0;
  private sites = new Map<string, number>();
  allow(siteId: string, now = Date.now()): boolean {
    const minute = Math.floor(now / 60000);
    if (this.minute !== minute) { this.minute = minute; this.total = 0; this.sites.clear(); }
    const count = this.sites.get(siteId) ?? 0;
    if (this.total >= 600 || count >= 120) return false;
    this.total++; this.sites.set(siteId, count + 1); return true;
  }
}
export async function boundedText(request: Request, limit = MAX_BODY_BYTES): Promise<string> {
  if (Number(request.headers.get("content-length") ?? 0) > limit) throw new Error("BODY_TOO_LARGE");
  const reader = request.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new Error("BODY_TOO_LARGE"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let at = 0;
  for (const chunk of chunks) { bytes.set(chunk, at); at += chunk.length; }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
