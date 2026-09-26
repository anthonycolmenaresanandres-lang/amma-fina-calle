import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { SquareConfig } from "./config";

type SquareCatalogObject = {
  id: string;
  type: string;
  version?: number;
  updated_at?: string;
  is_deleted?: boolean;
  item_data?: { name?: string };
  category_data?: { name?: string };
  modifier_list_data?: { name?: string };
  [key: string]: unknown;
};

type SearchResponse = {
  objects?: SquareCatalogObject[];
  cursor?: string;
  latest_time?: string;
  errors?: Array<{ detail?: string }>;
};

const RESTAURANT_ID = "bodega";
const OBJECT_TYPES = ["ITEM", "CATEGORY", "MODIFIER_LIST"];

export async function syncBodegaSquareCatalog(config: SquareConfig, triggerEventId?: string) {
  const admin = getSupabaseAdmin();
  const { data: connection } = await admin.from("square_connections")
    .select("last_catalog_time")
    .eq("restaurant_id", RESTAURANT_ID)
    .maybeSingle();

  await admin.from("square_connections").upsert({
    restaurant_id: RESTAURANT_ID,
    merchant_id: config.merchantId,
    location_id: config.locationId,
    environment: config.environment,
    updated_at: new Date().toISOString(),
  }, { onConflict: "restaurant_id" });

  const { data: run, error: runError } = await admin.from("square_sync_runs").insert({
    restaurant_id: RESTAURANT_ID,
    trigger_event_id: triggerEventId ?? null,
    status: "running",
  }).select("id").single();
  if (runError || !run) throw new Error("Square sync log is unavailable.");

  let cursor: string | undefined;
  let latestTime: string | undefined;
  let count = 0;
  try {
    do {
      const body: Record<string, unknown> = {
        include_deleted_objects: true,
        object_types: OBJECT_TYPES,
        ...(connection?.last_catalog_time ? { begin_time: connection.last_catalog_time } : {}),
        ...(cursor ? { cursor } : {}),
      };
      const response = await fetch(`${config.apiBase}/v2/catalog/search`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
          "Square-Version": config.apiVersion,
        },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json() as SearchResponse;
      if (!response.ok || result.errors?.length) throw new Error(result.errors?.[0]?.detail || `Square catalog returned ${response.status}.`);
      const objects = result.objects ?? [];
      if (objects.length) {
        const { error } = await admin.from("square_catalog_objects").upsert(objects.map((object) => ({
          restaurant_id: RESTAURANT_ID,
          square_id: object.id,
          object_type: object.type,
          version: object.version ?? null,
          square_updated_at: object.updated_at ?? null,
          deleted: object.is_deleted === true,
          payload: object,
          synced_at: new Date().toISOString(),
        })), { onConflict: "restaurant_id,square_id" });
        if (error) throw new Error("Square catalog snapshot could not be stored.");
        count += objects.length;
      }
      latestTime = result.latest_time ?? latestTime;
      cursor = result.cursor;
    } while (cursor);

    const now = new Date().toISOString();
    await Promise.all([
      admin.from("square_connections").update({
        ...(latestTime ? { last_catalog_time: latestTime } : {}),
        last_synced_at: now,
        last_error: null,
        updated_at: now,
      }).eq("restaurant_id", RESTAURANT_ID),
      admin.from("square_sync_runs").update({ status: "complete", object_count: count, finished_at: now, error: null }).eq("id", run.id),
    ]);
    return { count, latestTime };
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 600) : "Square catalog sync failed.";
    const now = new Date().toISOString();
    await Promise.all([
      admin.from("square_connections").update({ last_error: message, updated_at: now }).eq("restaurant_id", RESTAURANT_ID),
      admin.from("square_sync_runs").update({ status: "failed", finished_at: now, error: message }).eq("id", run.id),
    ]);
    throw error;
  }
}

export type SquareInsight = {
  connected: boolean;
  environment?: string;
  lastSyncedAt?: string;
  lastError?: string;
  activeItems: number;
  recent: Array<{ id: string; type: string; name: string; updatedAt?: string; deleted: boolean }>;
};

function objectName(payload: Record<string, unknown>): string {
  for (const key of ["item_data", "category_data", "modifier_list_data"]) {
    const data = payload[key];
    if (data && typeof data === "object" && "name" in data && typeof data.name === "string") return data.name;
  }
  return "Unnamed Square object";
}

export async function getBodegaSquareInsight(): Promise<SquareInsight> {
  try {
    const admin = getSupabaseAdmin();
    const [{ data: connection }, { count }, { data: recent }] = await Promise.all([
      admin.from("square_connections").select("environment,last_synced_at,last_error").eq("restaurant_id", RESTAURANT_ID).maybeSingle(),
      admin.from("square_catalog_objects").select("square_id", { count: "exact", head: true }).eq("restaurant_id", RESTAURANT_ID).eq("object_type", "ITEM").eq("deleted", false),
      admin.from("square_catalog_objects").select("square_id,object_type,square_updated_at,deleted,payload").eq("restaurant_id", RESTAURANT_ID).order("square_updated_at", { ascending: false }).limit(12),
    ]);
    return {
      connected: Boolean(connection),
      environment: connection?.environment,
      lastSyncedAt: connection?.last_synced_at ?? undefined,
      lastError: connection?.last_error ?? undefined,
      activeItems: count ?? 0,
      recent: (recent ?? []).map((row) => ({
        id: row.square_id,
        type: row.object_type,
        name: objectName((row.payload ?? {}) as Record<string, unknown>),
        updatedAt: row.square_updated_at ?? undefined,
        deleted: row.deleted === true,
      })),
    };
  } catch {
    return { connected: false, activeItems: 0, recent: [] };
  }
}
