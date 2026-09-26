import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { syncBodegaSquareCatalog } from "@/lib/square/catalog";
import { getBodegaSquareConfig } from "@/lib/square/config";
import { verifySquareSignature } from "@/lib/square/signature";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_WEBHOOK_BYTES = 1024 * 1024;

function response(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}

export async function POST(request: Request) {
  const config = getBodegaSquareConfig();
  if (!config) return response({ ok: false, message: "Square is not connected." }, 503);

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_WEBHOOK_BYTES) return response({ ok: false }, 413);
  if (!verifySquareSignature({
    notificationUrl: config.webhookUrl,
    rawBody,
    signatureKey: config.webhookSignatureKey,
    signature: request.headers.get("x-square-hmacsha256-signature"),
  })) return response({ ok: false }, 403);

  let event: { event_id?: string; merchant_id?: string; type?: string; created_at?: string };
  try { event = JSON.parse(rawBody); } catch { return response({ ok: false }, 400); }
  if (!event.event_id || !event.type || event.merchant_id !== config.merchantId) return response({ ok: false }, 400);

  const admin = getSupabaseAdmin();
  const { data: existing } = await admin.from("square_webhook_events")
    .select("status")
    .eq("event_id", event.event_id)
    .maybeSingle();
  if (existing?.status === "processed") return response({ ok: true, duplicate: true });
  const { error: eventError } = await admin.from("square_webhook_events").upsert({
    event_id: event.event_id,
    restaurant_id: "bodega",
    merchant_id: event.merchant_id,
    event_type: event.type,
    event_created_at: event.created_at ?? null,
    status: "received",
    error: null,
  }, { onConflict: "event_id", ignoreDuplicates: false });
  if (eventError) return response({ ok: false }, 503);

  if (event.type !== "catalog.version.updated") {
    await admin.from("square_webhook_events").update({ status: "processed", processed_at: new Date().toISOString() }).eq("event_id", event.event_id);
    return response({ ok: true, ignored: true });
  }

  try {
    const sync = await syncBodegaSquareCatalog(config, event.event_id);
    await admin.from("square_webhook_events").update({ status: "processed", processed_at: new Date().toISOString(), error: null }).eq("event_id", event.event_id);
    return response({ ok: true, objects: sync.count });
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 600) : "Square sync failed.";
    await admin.from("square_webhook_events").update({ status: "failed", processed_at: new Date().toISOString(), error: message }).eq("event_id", event.event_id);
    return response({ ok: false }, 503);
  }
}
