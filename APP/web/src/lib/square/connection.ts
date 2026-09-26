import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { decryptSquareToken, encryptSquareToken } from "./crypto";
import { getSquareAppConfig, type SquareEnvironment } from "./config";
import { refreshSquareOAuthToken, type SquareMerchantContext, type SquareOAuthToken } from "./oauth";

const REFRESH_AFTER_MS = 6 * 24 * 60 * 60 * 1000;

type SquareConnectionRow = {
  restaurant_id: string;
  merchant_id: string;
  merchant_name: string | null;
  location_id: string | null;
  environment: SquareEnvironment;
  access_token_ciphertext: string;
  refresh_token_ciphertext: string;
  token_expires_at: string;
  token_refreshed_at: string;
  last_catalog_time: string | null;
};

export type SquareConnection = {
  restaurantId: string;
  merchantId: string;
  merchantName?: string;
  locationId?: string;
  environment: SquareEnvironment;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: string;
  tokenRefreshedAt: string;
  lastCatalogTime?: string;
};

async function loadConnectionRow(restaurantId: string): Promise<SquareConnectionRow | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from("square_connections")
    .select("restaurant_id,merchant_id,merchant_name,location_id,environment,access_token_ciphertext,refresh_token_ciphertext,token_expires_at,token_refreshed_at,last_catalog_time")
    .eq("restaurant_id", restaurantId)
    .maybeSingle();
  if (error) throw new Error("Square connection storage is unavailable.");
  return data as SquareConnectionRow | null;
}

function materialize(row: SquareConnectionRow): SquareConnection {
  return {
    restaurantId: row.restaurant_id,
    merchantId: row.merchant_id,
    merchantName: row.merchant_name ?? undefined,
    locationId: row.location_id ?? undefined,
    environment: row.environment,
    accessToken: decryptSquareToken(row.access_token_ciphertext),
    refreshToken: decryptSquareToken(row.refresh_token_ciphertext),
    tokenExpiresAt: row.token_expires_at,
    tokenRefreshedAt: row.token_refreshed_at,
    lastCatalogTime: row.last_catalog_time ?? undefined,
  };
}

function refreshIsDue(value: string) {
  const refreshedAt = new Date(value).getTime();
  return !Number.isFinite(refreshedAt) || Date.now() - refreshedAt >= REFRESH_AFTER_MS;
}

export async function saveSquareOAuthConnection(
  restaurantId: string,
  token: SquareOAuthToken,
  context: SquareMerchantContext = {},
) {
  const config = getSquareAppConfig();
  if (!config) throw new Error("Square OAuth is not configured.");
  const admin = getSupabaseAdmin();
  const existing = await loadConnectionRow(restaurantId);
  const merchantChanged = Boolean(existing && existing.merchant_id !== token.merchant_id);
  const now = new Date().toISOString();

  if (merchantChanged) {
    await admin.from("square_catalog_objects").delete().eq("restaurant_id", restaurantId);
  }

  const accessTokenCiphertext = encryptSquareToken(token.access_token);
  const refreshTokenCiphertext = encryptSquareToken(token.refresh_token);
  const { error } = await admin.from("square_connections").upsert({
    restaurant_id: restaurantId,
    merchant_id: token.merchant_id,
    merchant_name: context.merchantName ?? null,
    location_id: context.locationId ?? null,
    environment: config.environment,
    access_token_ciphertext: accessTokenCiphertext,
    refresh_token_ciphertext: refreshTokenCiphertext,
    token_expires_at: token.expires_at,
    token_refreshed_at: now,
    scopes: [...config.scopes],
    connected_at: now,
    last_error: null,
    ...(merchantChanged ? { last_catalog_time: null, last_synced_at: null } : {}),
    updated_at: now,
  }, { onConflict: "restaurant_id" });
  if (error) throw new Error("Square connection could not be saved. This Square merchant might already be linked to another restaurant.");
}

export async function refreshSquareConnection(restaurantId: string): Promise<SquareConnection> {
  const config = getSquareAppConfig();
  if (!config) throw new Error("Square OAuth is not configured.");
  const row = await loadConnectionRow(restaurantId);
  if (!row) throw new Error("Square is not connected for this restaurant.");
  if (row.environment !== config.environment) throw new Error("Square connection environment does not match the application environment.");

  const token = await refreshSquareOAuthToken(config, decryptSquareToken(row.refresh_token_ciphertext));
  if (token.merchant_id !== row.merchant_id) throw new Error("Square refreshed a token for an unexpected merchant.");
  const now = new Date().toISOString();
  const accessTokenCiphertext = encryptSquareToken(token.access_token);
  const refreshTokenCiphertext = encryptSquareToken(token.refresh_token);
  const { error } = await getSupabaseAdmin().from("square_connections").update({
    access_token_ciphertext: accessTokenCiphertext,
    refresh_token_ciphertext: refreshTokenCiphertext,
    token_expires_at: token.expires_at,
    token_refreshed_at: now,
    last_error: null,
    updated_at: now,
  }).eq("restaurant_id", restaurantId).eq("merchant_id", row.merchant_id);
  if (error) throw new Error("Refreshed Square credentials could not be stored.");

  return materialize({
    ...row,
    access_token_ciphertext: accessTokenCiphertext,
    refresh_token_ciphertext: refreshTokenCiphertext,
    token_expires_at: token.expires_at,
    token_refreshed_at: now,
  });
}

export async function getSquareConnection(
  restaurantId: string,
  options: { refreshIfDue?: boolean } = {},
): Promise<SquareConnection | null> {
  const row = await loadConnectionRow(restaurantId);
  if (!row) return null;
  const config = getSquareAppConfig();
  if (!config) throw new Error("Square OAuth is not configured.");
  if (row.environment !== config.environment) throw new Error("Square connection environment does not match the application environment.");
  if (options.refreshIfDue !== false && refreshIsDue(row.token_refreshed_at)) {
    return refreshSquareConnection(restaurantId);
  }
  return materialize(row);
}

export async function getSquareConnectionMetadata(restaurantId: string) {
  const row = await loadConnectionRow(restaurantId);
  return row ? { merchantId: row.merchant_id, environment: row.environment } : null;
}

export async function deleteSquareConnection(restaurantId: string) {
  const { error } = await getSupabaseAdmin().from("square_connections").delete().eq("restaurant_id", restaurantId);
  if (error) throw new Error("Square connection could not be removed locally.");
}

export async function refreshDueSquareConnections() {
  const admin = getSupabaseAdmin();
  const cutoff = new Date(Date.now() - REFRESH_AFTER_MS).toISOString();
  const { data, error } = await admin.from("square_connections")
    .select("restaurant_id")
    .lt("token_refreshed_at", cutoff)
    .order("token_refreshed_at", { ascending: true })
    .limit(100);
  if (error) throw new Error("Square refresh queue could not be loaded.");

  let refreshed = 0;
  const failed: string[] = [];
  for (const row of (data ?? []) as Array<{ restaurant_id: string }>) {
    try {
      await refreshSquareConnection(row.restaurant_id);
      refreshed += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message.slice(0, 600) : "Square token refresh failed.";
      failed.push(row.restaurant_id);
      await admin.from("square_connections").update({ last_error: message, updated_at: new Date().toISOString() }).eq("restaurant_id", row.restaurant_id);
    }
  }
  return { refreshed, failed };
}
