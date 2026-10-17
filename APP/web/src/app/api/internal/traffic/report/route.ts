import { timingSafeEqual } from "node:crypto";
import { calendarRange, completeDays, TRAFFIC_TIMEZONE } from "@/lib/traffic/date";
import { getAdminContext } from "@/lib/admin/auth";
import { ALL_TRAFFIC_SITES } from "@/lib/traffic/sites";
import { getSiteTrafficReport } from "@/lib/traffic/site-traffic";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };
export async function GET(request: Request) {
  const expected = process.env.TRAFFIC_REPORT_TOKEN?.trim();
  const provided = request.headers.get("authorization")?.replace(/^Bearer /, "");
  const tokenOK = expected && provided && Buffer.byteLength(expected) === Buffer.byteLength(provided) &&
    timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
  if (!tokenOK && (await getAdminContext()).state !== "authorized") return Response.json({ reason: "unauthorized" }, { status: 401, headers });
  const query = new URL(request.url).searchParams;
  try {
    const timezone = query.get("timezone") ?? "America/New_York";
    if (timezone !== TRAFFIC_TIMEZONE) return Response.json({ reason: "unsupported_timezone", supportedTimezone: TRAFFIC_TIMEZONE }, { status: 400, headers });
    const first = query.get("start"), last = query.get("end");
    if (Boolean(first) !== Boolean(last)) throw new Error("BOTH_DATES_REQUIRED");
    const range = first && last ? calendarRange(first, last, timezone) : completeDays(30, Date.now(), timezone);
    const siteId = query.get("site");
    const sites = ALL_TRAFFIC_SITES.filter((site) => !siteId || site.id === siteId);
    if (!sites.length) throw new Error("UNKNOWN_SITE");
    const reports = await Promise.all(sites.map((site) => getSiteTrafficReport(site, range)));
    return Response.json({ range, reports, note: "Pageviews; optional distinct tracked identifiers are not people or QR scans. No cross-site distinct total." }, { headers });
  } catch { return Response.json({ reason: "invalid_date_range_or_site" }, { status: 400, headers }); }
}
