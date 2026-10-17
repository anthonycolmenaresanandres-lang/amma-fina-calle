// Query/hash/identity never persist. Apply before public route attribution.
const PRIVATE = /^(api|auth|_next|owner|customers|command-center|lead-arcade|table-os|pilot)(\/|$)/i;
export function taggedInternal(raw: string): boolean {
  const query = raw.split("?", 2)[1]?.split("#", 1)[0] ?? "";
  const params = new URLSearchParams(query);
  return ["traffic_test", "internal_test", "qa", "e2e"].some((key) => params.has(key));
}
export function sanitizePath(raw: string): string | null {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.length > 512 || taggedInternal(raw)) return null;
  let path: string;
  try { path = decodeURIComponent(raw.split(/[?#]/, 1)[0]); } catch { return null; }
  if (/[\\\u0000-\u0020@]/.test(path) || path.includes("%") || path.includes("//")) return null;
  const segments = path.split("/").filter(Boolean);
  if (segments.some((part) => part === "." || part === "..")) return null;
  path = "/" + segments.join("/");
  if (PRIVATE.test(path.slice(1))) return null;
  if (/^\/table\/(maracaibo|las-palmas-lynnhaven)\/[0-9]{1,2}$/.test(path)) {
    const table = Number(segments[2]);
    if (table < 1 || table > 40) return null;
    return `/table/${segments[1]}/:table`;
  }
  if (/^\/news\/[a-z0-9-]{1,96}$/.test(path) && path !== "/news/about") return "/news/:article";
  if (!/^\/[a-zA-Z0-9/_:.\-]*$/.test(path)) return null;
  return "/" + segments.map((part) => /^(?:\d+|[0-9a-f]{16,}|[0-9a-f]{8}-[0-9a-f-]{27})$/i.test(part) ? ":id" : part).join("/");
}
export function referrerHost(raw: string | null | undefined, selfOrigin?: string): string | null {
  if (!raw || raw.length > 2048) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (selfOrigin && host === new URL(selfOrigin).hostname.toLowerCase().replace(/^www\./, "")) return null;
    return host || null;
  } catch { return null; }
}
