import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { syncSquareCatalog } from "@/lib/square/catalog";
import { deleteSquareConnection } from "@/lib/square/connection";
import { getSquareAppConfig, getSquareWebhookConfig } from "@/lib/square/config";
import { verifySquareSignature } from "@/lib/square/signature";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_WEBHOOK_BYTES = 1024 * 1024;
function response(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: {
    "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
    ...(status === 503 ? { "Retry-After": "30" } : {}),
  } });
}

export async function POST(request: Request) {
  const webhook = getSquareWebhookConfig();
  const config = getSquareAppConfig();
  if (!webhook || !config) return response({ ok: false, message: "Square webhook is not configured." }, 503);
  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > MAX_WEBHOOK_BYTES) return response({ ok: false }, 413);
  if (!verifySquareSignature({ notificationUrl: webhook.notificationUrl, rawBody,
    signatureKey: webhook.signatureKey, signature: request.headers.get("x-square-hmacsha256-signature") })) return response({ ok: false }, 403);
  let event: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(rawBody);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return response({ ok: false }, 400);
    event = parsed as Record<string, unknown>;
  } catch { return response({ ok: false }, 400); }
  if (typeof event.event_id !== "string" || !event.event_id || typeof event.type !== "string"
    || !event.type || typeof event.merchant_id !== "string" || !event.merchant_id) return response({ ok: false }, 400);
  const eventId = event.event_id;
  const createdAt = typeof event.created_at === "string" && Number.isFinite(Date.parse(event.created_at)) ? event.created_at : null;
  const admin = getSupabaseAdmin();
  const { data: connection, error: connectionError } = await admin.from("square_connections")
    .select("restaurant_id,connection_generation,connected_at")
    .eq("merchant_id", event.merchant_id).eq("environment", config.environment).maybeSingle();
  if (connectionError) return response({ ok: false }, 503);
  if (!connection?.restaurant_id) return response({ ok: true, ignored: true });
  const restaurantId = connection.restaurant_id as string;
  const { data: claimed, error: claimError } = await admin.rpc("square_claim_webhook_event", {
    p_event_id: eventId, p_restaurant_id: restaurantId, p_merchant_id: event.merchant_id,
    p_event_type: event.type, p_event_created_at: createdAt,
  });
  if (claimError) return response({ ok: false }, 503);
  if (claimed !== true) {
    const { data, error } = await admin.from("square_webhook_events").select("status").eq("event_id", eventId).maybeSingle();
    // A worker may die after claiming the event. Only completed work is a 200;
    // in-flight/failed claims must remain retryable by Square.
    return !error && data?.status === "processed"
      ? response({ ok: true, duplicate: true }) : response({ ok: false, retry: true }, 503);
  }
  try {
    let count: number | undefined;
    if (event.type === "oauth.authorization.revoked") {
      // A delayed revocation from before a fresh authorization cannot unlink it.
      const predatesConnection = createdAt && Date.parse(createdAt) < Date.parse(connection.connected_at);
      if (!predatesConnection) await deleteSquareConnection(restaurantId, connection.connection_generation);
    } else if (event.type === "catalog.version.updated") {
      const sync = await syncSquareCatalog(restaurantId, { trigger: "webhook", triggerEventId: eventId });
      if (sync.skipped) throw new Error("Another Square catalog sync is still running.");
      count = sync.count;
    }
    const { error } = await admin.from("square_webhook_events").update({ status: "processed",
      processed_at: new Date().toISOString(), error: null }).eq("event_id", eventId);
    if (error) throw new Error("Square webhook completion could not be recorded.");
    return response({ ok: true, ...(count === undefined ? {} : { objects: count }) });
  } catch {
    await admin.from("square_webhook_events").update({ status: "failed", error: "Square webhook processing needs a retry." }).eq("event_id", eventId);
    return response({ ok: false }, 503);
  }
}
