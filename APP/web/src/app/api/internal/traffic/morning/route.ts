import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin/auth";
import { dailyTrafficPeriod, dateStringInTz, TRAFFIC_TIMEZONE, TRAFFIC_SCHEDULES, trafficPeriodsForDeliveryDate, trafficScheduleDecision } from "@/lib/traffic/date";
import { morningEmailStatus, sendTrafficDeliveryReport, trafficDeliveryStatus } from "@/lib/traffic/morning-email";
import { getMorningTrafficReports, getTrafficPeriodReports } from "@/lib/traffic/site-traffic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };
function reply(body: object, status = 200) { return NextResponse.json(body, { status, headers }); }

function authorized(request: Request, expected: string): boolean {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ") || header.length > 520) return false;
  const provided = Buffer.from(header.slice(7));
  const secret = Buffer.from(expected);
  return provided.length === secret.length && timingSafeEqual(provided, secret);
}

// Signed-in operations-admin inspection only; it can never invoke the mailer.
export async function GET() {
  const admin = await getAdminContext();
  if (admin.state !== "authorized") return reply({ ok: false, reason: "unauthorized" }, 401);
  const { date, reports } = await getMorningTrafficReports();
  let delivery;
  try { delivery = await trafficDeliveryStatus(trafficPeriodsForDeliveryDate(dateStringInTz(TRAFFIC_TIMEZONE, Date.now()))); }
  catch { delivery = { state: "ledger_unavailable" }; }
  return reply({ ok: true, dryRun: true, date,
    readyToSend: process.env.VERCEL_ENV === "production" && morningEmailStatus().enabled && morningEmailStatus().configured &&
      Boolean(process.env.TRAFFIC_MAIL_TRIGGER_SECRET?.trim()) && (!delivery || delivery.state === "pending"),
    mailTriggerConfigured: Boolean(process.env.TRAFFIC_MAIL_TRIGGER_SECRET?.trim()),
    email: morningEmailStatus(),
    scheduleEnabled: process.env.TRAFFIC_SCHEDULE_ENABLED === "true",
    testEnabled: process.env.TRAFFIC_EMAIL_TEST_ENABLED === "true",
    testReadbackConfirmed: process.env.TRAFFIC_EMAIL_TEST_READBACK_CONFIRMED === "true",
    delivery,
    recoveryEnabled: process.env.TRAFFIC_EMAIL_RECOVERY_ENABLED === "true",
    sites: reports.map((report) => ({ siteId: report.siteId, state: report.state,
      ...(report.state === "ready" ? {} : { reason: report.reason }) })),
  });
}

// Mail-only capability: no report-token or shared CRON_SECRET fallback, no
// caller-supplied recipient, date range, SQL, records, or configuration writes.
export async function POST(request: Request) {
  if (process.env.VERCEL_ENV !== "production" || process.env.TRAFFIC_EMAIL_ENABLED !== "true") {
    return reply({ ok: false, reason: "email_delivery_disabled" }, 503);
  }
  const secret = process.env.TRAFFIC_MAIL_TRIGGER_SECRET?.trim();
  if (!secret || secret.length < 32 || secret.length > 512) return reply({ ok: false, reason: "mail_trigger_not_configured" }, 503);
  if (!authorized(request, secret)) return reply({ ok: false, reason: "unauthorized" }, 401);
  if (new URL(request.url).search) return reply({ ok: false, reason: "unsupported_query" }, 400);
  let input: { mode?: unknown; schedule?: unknown; deliveryDate?: unknown };
  try {
    if (!request.headers.get("content-type")?.startsWith("application/json")) throw new Error();
    const reader = request.body?.getReader();
    if (!reader) throw new Error();
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 256) { await reader.cancel(); throw new Error(); }
      chunks.push(value);
    }
    input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!input || Array.isArray(input) || typeof input !== "object" ||
      Object.keys(input).some((key) => !["mode", "schedule", "deliveryDate"].includes(key))) throw new Error();
  } catch { return reply({ ok: false, reason: "invalid_request" }, 400); }

  const now = Date.now();
  let periods;
  if (input.mode === "test") {
    if (input.schedule !== undefined || input.deliveryDate !== undefined) return reply({ ok: false, reason: "invalid_request" }, 400);
    if (process.env.TRAFFIC_EMAIL_TEST_ENABLED !== "true") return reply({ ok: false, reason: "test_delivery_disabled" }, 503);
    periods = [dailyTrafficPeriod(now)];
  } else if (typeof input.mode === "string" && ["scheduled", "check", "recovery"].includes(input.mode)) {
    if (input.mode === "scheduled" && (typeof input.schedule !== "string" || !TRAFFIC_SCHEDULES.includes(input.schedule))) {
      return reply({ ok: false, reason: "invalid_schedule" }, 400);
    }
    if (input.mode !== "scheduled" && input.schedule !== undefined) return reply({ ok: false, reason: "invalid_request" }, 400);
    if (process.env.TRAFFIC_SCHEDULE_ENABLED !== "true" ||
      process.env.TRAFFIC_EMAIL_TEST_READBACK_CONFIRMED !== "true") {
      return reply({ ok: false, reason: "schedule_disabled_until_test_readback" }, 503);
    }
    const today = dateStringInTz(TRAFFIC_TIMEZONE, now);
    if (typeof input.deliveryDate !== "string") return reply({ ok: false, reason: "invalid_delivery_date" }, 400);
    try { periods = trafficPeriodsForDeliveryDate(input.deliveryDate); }
    catch { return reply({ ok: false, reason: "invalid_delivery_date" }, 400); }
    if (input.deliveryDate > today) return reply({ ok: false, reason: "invalid_delivery_date" }, 400);
    if (input.mode === "recovery" && (process.env.TRAFFIC_EMAIL_RECOVERY_ENABLED !== "true" || input.deliveryDate !== today)) {
      return reply({ ok: false, reason: "recovery_not_authorized" }, 403);
    }
    if (!periods.length) return reply({ ok: true, skipped: true, reason: "not_due" });
    try {
      const existing = await trafficDeliveryStatus(periods);
      if (existing?.state === "accepted") return reply({ ok: true, accepted: true, deduplicated: true });
      if (existing && existing.state !== "pending") return reply({ ok: false, reason: "delivery_reconciliation_required" }, 409);
    } catch { return reply({ ok: false, reason: "delivery_ledger_unavailable" }, 503); }
    if (input.mode === "check") return reply({ ok: false, reason: "due_report_not_accepted" }, 503);
    if (input.mode === "scheduled") {
      const decision = trafficScheduleDecision(input.schedule as string, input.deliveryDate, now);
      if (decision.state === "skip") return reply({ ok: true, skipped: true, reason: decision.reason });
      if (decision.state === "missed") return reply({ ok: false, reason: decision.reason }, 410);
    }
  } else return reply({ ok: false, reason: "invalid_mode" }, 400);

  try {
    // Query both complete intervals independently, then make exactly one send.
    const bundles = await Promise.all(periods.map(async (period) => ({
      period, reports: await getTrafficPeriodReports(period),
    })));
    const reports = bundles.flatMap((bundle) => bundle.reports);
    // No provider call if every source is unavailable/unconfigured. Partial
    // records remain useful, with explicit unverified coverage in the email.
    if (reports.every((report) => report.state === "unconfigured" || report.state === "unavailable")) {
      return reply({ ok: false, reason: "report_data_unavailable" }, 503);
    }
    const delivery = await sendTrafficDeliveryReport(bundles, input.mode === "test" ? "test" : "scheduled");
    return reply({ ok: delivery.sent, accepted: delivery.sent, deduplicated: delivery.deduplicated === true,
      periods: periods.map(({ kind, first, last }) => ({ kind, first, last })),
      ...(!delivery.sent ? { reason: delivery.reason, ...(delivery.providerError ? { providerError: delivery.providerError } : {}) } : {}) },
      delivery.sent ? 200 : 502);
  } catch { return reply({ ok: false, reason: "report_delivery_unconfirmed" }, 502); }
}
