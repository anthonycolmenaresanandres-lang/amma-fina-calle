// Path/referrer sanitization. Two jobs:
//   1. Privacy + guardrails: never store anything that identifies a customer.
//      Authenticated portals (/owner/[id], /customers/*) and internal/auth/api
//      routes are collapsed to non-identifying labels (we keep the hit count,
//      drop the identity). Public storefront routes (/m/[id], marketing pages)
//      are preserved — those are public URLs and are exactly the traffic we
//      want to report on (e.g. a restaurant's public menu).
//   2. Cardinality: collapse opaque id segments (UUIDs, long hex, numeric ids)
//      to `:id` so reports group cleanly.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LONG_HEX_RE = /^[0-9a-f]{16,}$/i;
const NUMERIC_RE = /^\d+$/;

// Top-level prefixes whose deeper segments must never be stored with identity.
// We keep a count under the bare prefix so total traffic is still visible.
const PRIVATE_PREFIXES = new Set(["owner", "customers"]);

// Prefixes that are not meaningful "website traffic" and are dropped entirely.
const DROP_PREFIXES = new Set(["api", "auth", "_next"]);

function isOpaqueId(segment: string): boolean {
  return UUID_RE.test(segment) || LONG_HEX_RE.test(segment) || NUMERIC_RE.test(segment);
}

/**
 * Returns the sanitized path, or `null` if the event should be dropped.
 */
export function sanitizePath(rawPath: string): string | null {
  if (!rawPath) return "/";
  // Drop query string and hash; keep only the pathname.
  let path = rawPath.split("#")[0].split("?")[0].trim();
  if (!path.startsWith("/")) path = `/${path}`;
  // Collapse duplicate slashes and trailing slash (except root).
  path = path.replace(/\/{2,}/g, "/");
  if (path.length > 1) path = path.replace(/\/+$/, "");

  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return "/";

  const head = segments[0].toLowerCase();
  if (DROP_PREFIXES.has(head)) return null;
  if (PRIVATE_PREFIXES.has(head)) {
    // Count the visit, hide who: /owner/<id>/... -> /owner/:private
    return `/${head}/:private`;
  }

  const cleaned = segments.map((segment) => (isOpaqueId(segment) ? ":id" : segment));
  return `/${cleaned.join("/")}`;
}

/**
 * Extracts a bare host from a referrer URL, or `null`. Same-origin and empty
 * referrers return `null` so they don't pollute "top referrers".
 */
export function referrerHost(rawReferrer: string | null | undefined, selfOrigin?: string): string | null {
  if (!rawReferrer) return null;
  try {
    const url = new URL(rawReferrer);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (!host) return null;
    if (selfOrigin) {
      try {
        const self = new URL(selfOrigin).hostname.toLowerCase().replace(/^www\./, "");
        if (host === self) return null;
      } catch {
        // ignore malformed selfOrigin
      }
    }
    return host;
  } catch {
    return null;
  }
}
