import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { squareSignature, verifySquareSignature } from "../src/lib/square/signature";

async function main() {
  const notificationUrl = "https://example.test/api/integrations/square/webhook";
  const body = '{"event_id":"evt-1","type":"catalog.version.updated"}';
  const key = "test-signature-key";
  const signature = squareSignature(notificationUrl, body, key);
  assert(verifySquareSignature({ notificationUrl, rawBody: body, signatureKey: key, signature }));
  assert(!verifySquareSignature({ notificationUrl, rawBody: body + " ", signatureKey: key, signature }));
  assert(!verifySquareSignature({ notificationUrl, rawBody: body, signatureKey: key, signature: null }));

  const launchDir = path.resolve("public/assets/bodega/launch");
  const manifest = JSON.parse(await readFile(path.join(launchDir, "manifest.json"), "utf8")) as {
    assets: Array<{ file: string; width: number; height: number; sha256: string }>;
  };
  assert.equal(manifest.assets.length, 10);
  for (const asset of manifest.assets) {
    const bytes = await readFile(path.join(launchDir, asset.file));
    const metadata = await sharp(bytes).metadata();
    assert.equal(metadata.width, asset.width);
    assert.equal(metadata.height, asset.height);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256);
    assert((asset.width === 1080 && asset.height === 1350) || (asset.width === 1080 && asset.height === 1920));
  }

  const rewardMigration = await readFile(path.resolve("supabase/migrations/0019_bodega_seven_day_launch_window.sql"), "utf8");
  assert.match(rewardMigration, /active = false, daily_limit = 5/);
  assert.match(rewardMigration, /starts_at timestamptz/);
  assert.match(rewardMigration, /ends_at timestamptz/);

  const guestRoute = await readFile(path.resolve("src/app/api/bodega/guest-notes/route.ts"), "utf8");
  assert.match(guestRoute, /restaurantId: "bodega"/);
  assert.match(guestRoute, /BODEGA_GUEST_NOTES_EMAIL/);
  assert(!/@[a-z0-9.-]+\.[a-z]{2,}/i.test(guestRoute), "No Bodega email address may be committed");

  console.log("PASS: Square signature tamper checks, ten deterministic social exports, inactive five-per-day launch migration, and Bodega note routing without a committed recipient.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
