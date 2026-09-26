import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { syncSquareCatalog } from "@/lib/square/catalog";
import { deleteSquareConnection } from "@/lib/square/connection";
import { getSquareWebhookConfig } from "@/lib/square/config";
import { verifySquareSignature } from "@/lib/square/signature";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_WEBHOOK_BYTES = 1024 * 1024;

type SquareWebhookEvent = {
  event_id?: string;
  merchant_id?: string;
  type?: string;
  created_at?: string;
};

function response(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
  });
}

export async function POST(request: Request) {
  const webhook = getSquareWebhookConfig();
  if (!webhook) return response({ ok: false, message: "Square webhook is not configured." }, 503);

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_WEBHOOK_BYTES) return response({ ok: false }, 413);
  if (!verifySquareSignature({
    notificationUrl: webhook.notificationUrl,
    rawBody,
    signatureKey: webhook.signatureKey,
    signature: request.headers.get("x-square-hmacsha256-signature"),
  })) return response({ ok: false }, 403);

  let event: SquareWebhookEvent;
  try { event = JSON.parse(rawBody); } catch { return response({ ok: false }, 400); }
  if (!event.event_id || !event.type || !event.merchant_id) return response({ ok: false }, 400);

  const admin = getSupabaseAdmin();
  const { data: connection, error: connectionError } = await admin.from("square_connections")
    .select("restaurant_id")
    .eq("merchant_id", event.merchant_id)
    .maybeSingle();
  if (connectionError) return response({ ok: false }, 503);
  if (!connection?.restaurant_id) return response({ ok: true, ignored: true });
  const restaurantId = connection.restaurant_id as string;

  const { data: claimed, error: claimError } = await admin.rpc("square_claim_webhook_event", {
    p_event_id: event.event_id,
    p_restaurant_id: restaurantId,
    p_merchant_id: event.merchant_id,
    p_event_type: event.type,
    p_event_created_at: event.created_at ?? null,
  });
  if (claimError) return response({ ok: false }, 503);
  if (claimed !== true) return response({ ok: true, duplicate: true });

  if (event.type === "oauth.authorization.revoked") {
    try {
      await deleteSquareConnection(restaurantId);
      await admin.from("square_webhook_events").update({
        status: "processed",
        processed_at: new Date().toISOString(),
        error: null,
      }).eq("event_id", event.event_id);
      return response({ ok: true, disconnected: true });
    } catch (error) {
      const message = error instanceof Error ? error.message.slice(0, 600) : "Square disconnect handling failed.";
      await admin.from("square_webhook_events").update({ status: "failed", error: message }).eq("event_id", event.event_id);
      return response({ ok: false }, 503);
    }
  }

  if (event.type !== "catalog.version.updated") {
    await admin.from("square_webhook_events").update({
      status: "processed",
      processed_at: new Date().toISOString(),
      error: null,
    }).eq("event_id", event.event_id);
    return response({ ok: true, ignored: true });
  }

  try {
    const sync = await syncSquareCatalog(restaurantId, { trigger: "webhook", triggerEventId: event.event_id });
    if (sync.skipped) throw new Error("Another Square catalog sync is still running.");
    await admin.from("square_webhook_events").update({
      status: "processed",
      processed_at: new Date().toISOString(),
      error: null,
    }).eq("event_id", event.event_id);
    return response({ ok: true, objects: sync.count });
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 600) : "Square sync failed.";
    await admin.from("square_webhook_events").update({ status: "failed", error: message }).eq("event_id", event.event_id);
    return response({ ok: false }, 503);
  }
}
