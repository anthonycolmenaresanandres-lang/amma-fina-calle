import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin/auth";
import { morningEmailStatus, sendMorningReport } from "@/lib/traffic/morning-email";
import { getMorningTrafficReports } from "@/lib/traffic/site-traffic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request, expected: string): boolean {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;
  const provided = Buffer.from(header.slice(7).trim());
  const secret = Buffer.from(expected);
  return provided.length === secret.length && timingSafeEqual(provided, secret);
}

export async function GET(request: Request) {
  const dryRun = new URL(request.url).searchParams.get("dryRun") === "1";
  const secret = process.env.CRON_SECRET?.trim();
  if (dryRun) {
    // The signed-in operations admin can inspect the previous day's coverage
    // without handling the cron key. This path cannot call the mailer.
    const admin = await getAdminContext();
    if (admin.state !== "authorized") return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  } else {
    if (!secret) return NextResponse.json({ ok: false, reason: "cron_secret_not_configured" }, { status: 503 });
    if (!authorized(request, secret)) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  const { date, reports } = await getMorningTrafficReports();
  const ready = reports.filter((report) => report.state === "ready");
  if (dryRun) {
    return NextResponse.json({ ok: true, dryRun: true, date,
      readyToSend: Boolean(secret) && morningEmailStatus().configured && ready.length > 0,
      cronConfigured: Boolean(secret), email: morningEmailStatus(),
      squareRefreshEnabled: process.env.SQUARE_REFRESH_CRON_ENABLED === "true",
      sites: reports.map((report) => ({ siteId: report.siteId, state: report.state,
        ...(report.state === "ready" ? {} : { reason: report.reason }) })),
    }, { headers: { "Cache-Control": "private, no-store" } });
  }
  if (!ready.length) {
    console.error("[traffic/morning] no verified site figures for:", date);
    return NextResponse.json({ ok: false, date, reason: "no_verified_figures" }, { status: 503 });
  }
  try {
    const delivery = await sendMorningReport(date, reports);
    if (!delivery.sent) {
      console.error("[traffic/morning] email not sent:", delivery.reason);
      return NextResponse.json({ ok: false, date, reason: delivery.reason }, { status: 503 });
    }
    return NextResponse.json({ ok: true, date, sites: ready.map((report) => report.siteId),
      incomplete: reports.filter((report) => report.state !== "ready").map((report) => report.siteId) });
  } catch (error) {
    console.error("[traffic/morning] delivery failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ ok: false, date, reason: "delivery_failed" }, { status: 502 });
  }
}
