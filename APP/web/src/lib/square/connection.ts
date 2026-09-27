import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { decryptSquareToken, encryptSquareToken } from "./crypto";
import { getSquareAppConfig, type SquareEnvironment } from "./config";
import { listSquareLocations, refreshSquareOAuthToken, type SquareLocation, type SquareMerchantContext, type SquareOAuthToken } from "./oauth";

const REFRESH_AFTER_MS = 6 * 24 * 60 * 60 * 1000;

type SquareConnectionRow = {
  restaurant_id: string;
  merchant_id: string;
  merchant_name: string | null;
  location_id: string | null;
  environment: SquareEnvironment;
  connection_generation: string;
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
  generation: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: string;
  tokenRefreshedAt: string;
  lastCatalogTime?: string;
};

async function loadConnectionRow(restaurantId: string): Promise<SquareConnectionRow | null> {
  const { data, error } = await getSupabaseAdmin().from("square_connections")
    .select("restaurant_id,merchant_id,merchant_name,location_id,environment,connection_generation,access_token_ciphertext,refresh_token_ciphertext,token_expires_at,token_refreshed_at,last_catalog_time")
    .eq("restaurant_id", restaurantId).maybeSingle();
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
    generation: row.connection_generation,
    accessToken: decryptSquareToken(row.access_token_ciphertext),
    refreshToken: decryptSquareToken(row.refresh_token_ciphertext),
    tokenExpiresAt: row.token_expires_at,
    tokenRefreshedAt: row.token_refreshed_at,
    lastCatalogTime: row.last_catalog_time ?? undefined,
  };
}

function refreshIsDue(row: SquareConnectionRow) {
  const refreshedAt = new Date(row.token_refreshed_at).getTime();
  const expiresAt = new Date(row.token_expires_at).getTime();
  return !Number.isFinite(refreshedAt) || !Number.isFinite(expiresAt)
    || Date.now() - refreshedAt >= REFRESH_AFTER_MS || expiresAt <= Date.now() + 24 * 60 * 60 * 1000;
}

export async function saveSquareOAuthConnection(
  restaurantId: string,
  token: SquareOAuthToken,
  context: SquareMerchantContext = {},
) {
  const config = getSquareAppConfig();
  if (!config) throw new Error("Square OAuth is not configured.");
  // Replacement and catalog cleanup must succeed or roll back together. Never
  // delete a snapshot in a separate request before checking merchant uniqueness.
  const { error } = await getSupabaseAdmin().rpc("square_replace_oauth_connection", {
    p_connection: {
      restaurant_id: restaurantId,
      merchant_id: token.merchant_id,
      merchant_name: context.merchantName ?? null,
      location_id: context.locationId ?? null,
      environment: config.environment,
      access_token_ciphertext: encryptSquareToken(token.access_token),
      refresh_token_ciphertext: encryptSquareToken(token.refresh_token),
      token_expires_at: token.expires_at,
      scopes: [...config.scopes],
    },
  });
  if (error) throw new Error("Square connection could not be saved. The merchant may already be linked to another restaurant.");
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
  const { data, error } = await getSupabaseAdmin().from("square_connections").update({
    access_token_ciphertext: accessTokenCiphertext,
    refresh_token_ciphertext: refreshTokenCiphertext,
    token_expires_at: token.expires_at,
    token_refreshed_at: now,
    last_error: null,
    updated_at: now,
  }).eq("restaurant_id", restaurantId).eq("connection_generation", row.connection_generation)
    .eq("access_token_ciphertext", row.access_token_ciphertext).select("restaurant_id").maybeSingle();
  if (error) throw new Error("Refreshed Square credentials could not be stored.");
  if (!data) {
    const current = await loadConnectionRow(restaurantId);
    if (!current || current.connection_generation !== row.connection_generation) throw new Error("Square connection changed during refresh.");
    return materialize(current);
  }
  return materialize({ ...row, access_token_ciphertext: accessTokenCiphertext,
    refresh_token_ciphertext: refreshTokenCiphertext, token_expires_at: token.expires_at, token_refreshed_at: now });
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
  return options.refreshIfDue !== false && refreshIsDue(row) ? refreshSquareConnection(restaurantId) : materialize(row);
}

export async function getSquareConnectionMetadata(restaurantId: string) {
  const row = await loadConnectionRow(restaurantId);
  return row ? { merchantId: row.merchant_id, environment: row.environment, generation: row.connection_generation } : null;
}

export async function getSquareLocationsForOwner(restaurantId: string): Promise<SquareLocation[]> {
  const config = getSquareAppConfig();
  const connection = await getSquareConnection(restaurantId);
  if (!config || !connection) throw new Error("Square is not connected for this restaurant.");
  return (await listSquareLocations(config, connection.accessToken)).filter((location) => location.status === "ACTIVE");
}

export async function selectSquareLocation(restaurantId: string, locationId: string): Promise<void> {
  const config = getSquareAppConfig();
  const connection = await getSquareConnection(restaurantId);
  if (!config || !connection) throw new Error("Square is not connected for this restaurant.");
  const locations = await listSquareLocations(config, connection.accessToken);
  if (!locations.some((location) => location.id === locationId && location.status === "ACTIVE")) {
    throw new Error("The selected Square location is not active for this merchant.");
  }
  const { data, error } = await getSupabaseAdmin().from("square_connections")
    .update({ location_id: locationId, updated_at: new Date().toISOString() })
    .eq("restaurant_id", restaurantId).eq("merchant_id", connection.merchantId)
    .eq("connection_generation", connection.generation).select("restaurant_id").maybeSingle();
  if (error || !data) throw new Error("Square connection changed before the location was saved.");
}

export async function deleteSquareConnection(restaurantId: string, expectedGeneration?: string) {
  let deletion = getSupabaseAdmin().from("square_connections").delete().eq("restaurant_id", restaurantId);
  if (expectedGeneration) deletion = deletion.eq("connection_generation", expectedGeneration);
  // The FK added in 0022 deletes square_catalog_objects atomically, including revocations.
  const { error } = await deletion;
  if (error) throw new Error("Square connection could not be removed locally.");
}

export async function refreshDueSquareConnections() {
  const admin = getSupabaseAdmin();
  const config = getSquareAppConfig();
  if (!config) throw new Error("Square OAuth is not configured.");
  const cutoff = new Date(Date.now() - REFRESH_AFTER_MS).toISOString();
  const { data, error } = await admin.from("square_connections").select("restaurant_id,connection_generation")
    .eq("environment", config.environment).lt("token_refreshed_at", cutoff)
    .order("token_refreshed_at", { ascending: true }).limit(100);
  if (error) throw new Error("Square refresh queue could not be loaded.");
  let refreshed = 0;
  const failed: string[] = [];
  for (const row of (data ?? []) as Array<{ restaurant_id: string; connection_generation: string }>) {
    try { await refreshSquareConnection(row.restaurant_id); refreshed += 1; } catch {
      failed.push(row.restaurant_id);
      await admin.from("square_connections").update({ last_error: "Square token refresh needs attention.", updated_at: new Date().toISOString() })
        .eq("restaurant_id", row.restaurant_id).eq("connection_generation", row.connection_generation);
    }
  }
  return { refreshed, failed };
}
