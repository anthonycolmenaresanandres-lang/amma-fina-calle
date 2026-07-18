import assert from "node:assert/strict";
import {
  buildOwnerAppManifest,
  isSafeRestaurantId,
  ownerAppPath,
} from "../src/lib/owner/app-manifest";

const manifest = buildOwnerAppManifest("colattao");

assert.equal(isSafeRestaurantId("colattao"), true);
assert.equal(isSafeRestaurantId("burger-mas-2"), true);
assert.equal(isSafeRestaurantId("../customers"), false);
assert.equal(isSafeRestaurantId("Colattao"), false);
assert.equal(ownerAppPath("colattao"), "/owner/colattao");
assert.equal(manifest.id, "/owner/colattao");
assert.equal(manifest.start_url, "/owner/colattao");
assert.equal(manifest.scope, "/owner/colattao");
assert.equal(manifest.display, "standalone");
assert.equal(manifest.short_name, "Fina Owner");
assert.deepEqual(
  manifest.icons?.map((icon) => [icon.sizes, icon.type, icon.purpose]),
  [
    ["192x192", "image/png", "any"],
    ["192x192", "image/png", "maskable"],
    ["512x512", "image/png", "any"],
    ["512x512", "image/png", "maskable"],
  ],
);

assert.throws(() => ownerAppPath("../customers"), /Invalid restaurant id/);

console.log("owner app manifest self-test: PASS");
