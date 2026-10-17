// Vercel Analytics Drain receiver. Vercel POSTs `vercel.analytics.v2` events
// here (configured via the Drains API / dashboard, pointed at this URL with a
// custom `x-traffic-secret` header). We authenticate, parse, sanitize, store,
// and return 200 quickly. Bot filtering is handled upstream by Vercel.

import { NextResponse } from "next/server";
import { verifyDrainRequest } from "@/lib/traffic/signature";
import { parseDrainPayload } from "@/lib/traffic/parse-drain";
import { getTrafficStore } from "@/lib/traffic/store";
import { activeSource, boundedText } from "@/lib/traffic/first-party";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (process.env.VERCEL_ENV !== "production" || activeSource() !== "drain") return new Response(null, { status: 202 });
  let rawBody: string;
  try { rawBody = await boundedText(request, 65536); } catch { return new Response(null, { status: 413 }); }

  const authorized = verifyDrainRequest({
    rawBody,
    secret: process.env.TRAFFIC_DRAIN_SECRET,
    headerSecret: request.headers.get("x-traffic-secret"),
    vercelSignature: request.headers.get("x-vercel-signature"),
  });
  if (!authorized) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const events = parseDrainPayload(rawBody);
  const sites = Object.fromEntries(
    [...new Set(events.map((event) => event.siteId))].map((siteId) => [
      siteId, events.filter((event) => event.siteId === siteId).length,
    ])
  );
  if (events.length) {
    try {
      await getTrafficStore().insertEvents(events);
    } catch {
      // Never make Vercel retry-storm on a transient store error in a way that
      // surfaces detail; log server-side and accept.
      console.error("[traffic/drain] store unavailable");
      return NextResponse.json({ ok: false }, { status: 500 });
    }
  }

  console.info("[traffic/drain] verified production pageviews", { received: events.length, sites });
  return NextResponse.json({ ok: true, received: events.length, sites });
}

// Vercel's drain setup may probe with a GET/HEAD; respond cheaply.
export async function GET() {
  return NextResponse.json({ ok: true });
}
