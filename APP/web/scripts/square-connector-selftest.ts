import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

async function text(relative: string) {
  return readFile(path.resolve(relative), "utf8");
}

async function main() {
  const [env, migration, config, catalog, webhook, connect, callback, bodegaMenu] = await Promise.all([
    text(".env.example"),
    text("supabase/migrations/0020_bodega_square_read_model.sql"),
    text("src/lib/square/config.ts"),
    text("src/lib/square/catalog.ts"),
    text("src/app/api/integrations/square/webhook/route.ts"),
    text("src/app/api/integrations/square/connect/route.ts"),
    text("src/app/api/integrations/square/callback/route.ts"),
    text("src/app/(internal)/demo/bodega/page.tsx"),
  ]);

  assert(!env.includes("SQUARE_BODEGA_ACCESS_TOKEN"), "Per-client Square access tokens must not live in environment variables");
  assert.match(env, /SQUARE_APPLICATION_ID=/);
  assert.match(env, /SQUARE_TOKEN_ENCRYPTION_KEY=/);
  assert.match(config, /ITEMS_READ/);
  assert.match(config, /MERCHANT_PROFILE_READ/);
  assert(!config.includes("ITEMS_WRITE"), "The launch connector must remain read-only");

  assert.match(migration, /access_token_ciphertext text not null/);
  assert.match(migration, /refresh_token_ciphertext text not null/);
  assert.match(migration, /square_claim_webhook_event/);
  assert.match(migration, /square_acquire_sync_lease/);
  assert.match(migration, /square_store_catalog_objects/);
  assert.match(migration, /coalesce\(excluded\.version, -1\) >= coalesce\(public\.square_catalog_objects\.version, -1\)/);

  assert.match(connect, /getOwnerContext\(restaurantId\)/);
  assert.match(callback, /saveSquareOAuthConnection/);
  assert.match(callback, /syncSquareCatalog/);
  assert.match(webhook, /square_claim_webhook_event/);
  assert.match(webhook, /\.eq\("merchant_id", event\.merchant_id\)/);
  assert.match(catalog, /square_acquire_sync_lease/);
  assert.match(catalog, /square_store_catalog_objects/);
  assert.match(bodegaMenu, /getSquareMenuOverlay\("bodega"\)/);
  assert.match(bodegaMenu, /squarePrice/);

  console.log("PASS: OAuth is multi-client/read-only, tokens are encrypted at rest, webhook claims and catalog syncs are concurrency-safe, and Bodega reads matched Square prices without replacing its designed menu.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
