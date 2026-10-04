export type TableVisit = { status: "active"; visitId: string; guestId: string; tableId: string; expiresAt: string };
export const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export function isTableVisit(value: unknown): value is TableVisit {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<TableVisit>;
  return v.status === "active" && typeof v.visitId === "string" && UUID.test(v.visitId)
    && typeof v.guestId === "string" && UUID.test(v.guestId) && typeof v.tableId === "string"
    && typeof v.expiresAt === "string" && Number.isFinite(Date.parse(v.expiresAt));
}
export function sameOrigin(request: Request): boolean {
  try {
    const value = request.headers.get("origin");
    if (!value || request.headers.get("sec-fetch-site") === "cross-site") return false;
    const origin = new URL(value);
    // Next normalizes loopback addresses in NextRequest.url. Compare the actual
    // HTTP Host so local and proxied deployments enforce the same boundary.
    const host = request.headers.get("host") ?? new URL(request.url).host;
    return ["http:", "https:"].includes(origin.protocol) && origin.origin === value && origin.host === host;
  } catch { return false; }
}
