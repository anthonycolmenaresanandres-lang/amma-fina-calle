// Protected report endpoint. Returns today's aggregates for a local CLI
// (scripts/traffic-today.ts) or any internal caller holding TRAFFIC_REPORT_TOKEN.
// Bearer token, constant-time compare, never logged.

import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getTrafficStore } from "@/lib/traffic/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function tokenMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function extractToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length).trim();
  return request.headers.get("x-traffic-report-token");
}

export async function GET(request: Request) {
  const expected = process.env.TRAFFIC_REPORT_TOKEN;
  if (!expected) {
    return NextResponse.json({ ok: false, reason: "report_token_not_configured" }, { status: 503 });
  }
  const provided = extractToken(request);
  if (!provided || !tokenMatches(provided, expected)) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  const timezone = process.env.TRAFFIC_TIMEZONE || "America/New_York";
  try {
    const report = await getTrafficStore().getTodayReport(timezone);
    return NextResponse.json({ ok: true, ...report });
  } catch (error) {
    console.error("[traffic/today] report error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false, reason: "report_failed" }, { status: 500 });
  }
}
