import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSquareAppConfig } from "./config";
import { getSquareConnection } from "./connection";

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

const OBJECT_TYPES = ["ITEM", "CATEGORY", "MODIFIER_LIST"];

export type SquareSyncResult = {
  count: number;
  latestTime?: string;
  skipped: boolean;
};

export async function syncSquareCatalog(
  restaurantId: string,
  options: { trigger?: "oauth" | "webhook" | "manual" | "scheduled"; triggerEventId?: string } = {},
): Promise<SquareSyncResult> {
  const config = getSquareAppConfig();
  if (!config) throw new Error("Square OAuth is not configured.");
  const connection = await getSquareConnection(restaurantId);
  if (!connection) throw new Error("Square is not connected for this restaurant.");
  const admin = getSupabaseAdmin();

  const { data: lease, error: leaseError } = await admin.rpc("square_acquire_sync_lease", {
    p_restaurant_id: restaurantId,
    p_lease_seconds: 180,
  });
  if (leaseError) throw new Error("Square sync lock is unavailable.");
  if (!lease) return { count: 0, latestTime: connection.lastCatalogTime, skipped: true };

  const { data: run, error: runError } = await admin.from("square_sync_runs").insert({
    restaurant_id: restaurantId,
    trigger_event_id: options.triggerEventId ?? null,
    trigger: options.trigger ?? "manual",
    status: "running",
  }).select("id").single();
  if (runError || !run) {
    await admin.rpc("square_finish_catalog_sync", {
      p_restaurant_id: restaurantId,
      p_lease_token: lease,
      p_latest_time: null,
      p_error: "Square sync log is unavailable.",
    });
    throw new Error("Square sync log is unavailable.");
  }

  let cursor: string | undefined;
  let latestTime: string | undefined;
  let count = 0;
  try {
    do {
      const body: Record<string, unknown> = {
        include_deleted_objects: true,
        object_types: OBJECT_TYPES,
        ...(connection.lastCatalogTime ? { begin_time: connection.lastCatalogTime } : {}),
        ...(cursor ? { cursor } : {}),
      };
      const response = await fetch(`${config.apiBase}/v2/catalog/search`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${connection.accessToken}`,
          "Content-Type": "application/json",
          "Square-Version": config.apiVersion,
        },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json() as SearchResponse;
      if (!response.ok || result.errors?.length) {
        throw new Error(result.errors?.[0]?.detail || `Square catalog returned ${response.status}.`);
      }

      const rows = (result.objects ?? []).map((object) => ({
        square_id: object.id,
        object_type: object.type,
        version: object.version ?? null,
        square_updated_at: object.updated_at ?? null,
        deleted: object.is_deleted === true,
        payload: object,
        synced_at: new Date().toISOString(),
      }));
      if (rows.length) {
        const { data: stored, error } = await admin.rpc("square_store_catalog_objects", {
          p_restaurant_id: restaurantId,
          p_objects: rows,
        });
        if (error) throw new Error("Square catalog snapshot could not be stored.");
        count += typeof stored === "number" ? stored : rows.length;
      }
      latestTime = result.latest_time ?? latestTime;
      cursor = result.cursor;
    } while (cursor);

    const now = new Date().toISOString();
    const { data: finished, error: finishError } = await admin.rpc("square_finish_catalog_sync", {
      p_restaurant_id: restaurantId,
      p_lease_token: lease,
      p_latest_time: latestTime ?? null,
      p_error: null,
    });
    if (finishError || finished !== true) throw new Error("Square sync checkpoint could not be finalized.");
    await admin.from("square_sync_runs").update({
      status: "complete",
      object_count: count,
      finished_at: now,
      error: null,
    }).eq("id", run.id);
    return { count, latestTime, skipped: false };
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 600) : "Square catalog sync failed.";
    const now = new Date().toISOString();
    await Promise.all([
      admin.rpc("square_finish_catalog_sync", {
        p_restaurant_id: restaurantId,
        p_lease_token: lease,
        p_latest_time: null,
        p_error: message,
      }),
      admin.from("square_sync_runs").update({ status: "failed", finished_at: now, error: message }).eq("id", run.id),
    ]);
    throw error;
  }
}

export type SquareInsight = {
  connected: boolean;
  appConfigured: boolean;
  environment?: string;
  merchantName?: string;
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

export async function getSquareInsight(restaurantId: string): Promise<SquareInsight> {
  const appConfigured = Boolean(getSquareAppConfig());
  try {
    const admin = getSupabaseAdmin();
    const [{ data: connection }, { count }, { data: recent }] = await Promise.all([
      admin.from("square_connections")
        .select("environment,merchant_name,last_synced_at,last_error")
        .eq("restaurant_id", restaurantId)
        .maybeSingle(),
      admin.from("square_catalog_objects")
        .select("square_id", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId)
        .eq("object_type", "ITEM")
        .eq("deleted", false),
      admin.from("square_catalog_objects")
        .select("square_id,object_type,square_updated_at,deleted,payload")
        .eq("restaurant_id", restaurantId)
        .order("square_updated_at", { ascending: false })
        .limit(12),
    ]);
    return {
      connected: Boolean(connection),
      appConfigured,
      environment: connection?.environment,
      merchantName: connection?.merchant_name ?? undefined,
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
    return { connected: false, appConfigured, activeItems: 0, recent: [] };
  }
}
