import { NextRequest, NextResponse } from "next/server";
import { refreshDueSquareConnections } from "@/lib/square/connection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  // CRON_SECRET also authenticates traffic reports. Renew tokens only after a
  // separate, explicit Square activation; adding report credentials is insufficient.
  if (process.env.SQUARE_REFRESH_CRON_ENABLED !== "true") {
    return NextResponse.json({ ok: false, reason: "square_refresh_disabled" }, { status: 503 });
  }
  try {
    const result = await refreshDueSquareConnections();
    return NextResponse.json({ ok: true, ...result }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
