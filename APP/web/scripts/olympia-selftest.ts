import assert from "node:assert/strict";
import { localReviewAllowed } from "../src/app/olympia/review-gate";
import { olympiaMenu } from "../src/app/olympia/menu-data";
import { olympiaRounds, olympiaSkin } from "../src/app/olympia/play/config";
import { CAFERUSH_LEVELS } from "../src/caferush/config";

for (const host of ["localhost:3119", "127.0.0.1:3119", "[::1]:3119", "localhost"]) {
  assert.equal(localReviewAllowed("1", host, null), true);
  assert.equal(localReviewAllowed(undefined, host, null), false);
  assert.equal(localReviewAllowed("0", host, null), false);
  assert.equal(localReviewAllowed("1", host, "finacalleos.com"), false);
}
for (const host of [null, "finacalleos.com", "localhost.example.com", "localhost:3119, evil.com", "localhost/evil", "127.0.0.2", "evil@localhost"]) {
  assert.equal(localReviewAllowed("1", host, null), false);
}
assert.equal(localReviewAllowed("1", "localhost:3119", "localhost:3119"), true);
assert.equal(olympiaRounds, CAFERUSH_LEVELS, "Rules must be shared, not customized for this prospect");
assert.equal(olympiaSkin.prospect, true);
assert.equal(olympiaSkin.assets, undefined, "Primitive game must not request any art or service");
const items = olympiaMenu.flatMap(group => group.items);
assert.equal(items.length, 8);
assert.equal(new Set(items.map(item => item.name)).size, 8);
assert(items.every(item => Object.keys(item).join() === "name"), "Provisional items must not imply prices, ingredients or availability");
assert(olympiaSkin.items.some(item => item.kind === "good") && olympiaSkin.items.some(item => item.kind === "bad"));
console.log("PASS Olympia: localhost/flag gates, forwarded-host rejection, provisional menu, standard rounds, asset-free skin.");
