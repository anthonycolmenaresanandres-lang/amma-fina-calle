import assert from "node:assert/strict";
import { gameFeatures, OFFICIAL_MENU_URL, seedMenuGroups, seedMenuItemHref } from "../src/app/(internal)/demo/project-seed/menu-data";
import { seedRounds, seedSkin, seedSkinForRound } from "../src/app/play/project-seed/config";
import { guestMenuAbsoluteUrl } from "../src/lib/guest-menu";

const items = seedMenuGroups.flatMap((group) => group.items);
assert.equal(items.length, 25);
assert.equal(new Set(items.map((item) => item.id)).size, items.length);
assert.ok(items.every((item) => item.price === null && item.source === OFFICIAL_MENU_URL));
assert.deepEqual(seedMenuGroups.map((group) => group.id), ["signature", "cold-brew", "coffee", "tea-more"]);
assert.ok(items.every((item) => !/gingerbread|coquito|pastr/i.test(item.name)));
for (const feature of gameFeatures) {
  assert.ok(items.some((item) => item.id === feature.id), `${feature.id} must resolve to a menu item`);
  assert.equal(seedMenuItemHref(feature.id), `/project-seed/menu#${feature.id}`);
}
assert.equal(seedRounds.length, 3);
assert.deepEqual(seedRounds.map((round) => round.rules.durationSec), [20, 25, 30]);
assert.deepEqual(seedRounds.map((round) => round.rules.targetScore), [120, 180, 300]);
assert.ok(seedRounds.every((round) => round.rules.failOnBadCatch));
assert.ok(seedSkin.prospect);
assert.ok(!seedSkin.assets, "No client-owned imagery or logo is allowed before approval");
assert.deepEqual(seedRounds.map((_, index) => seedSkinForRound(index).items.map((item) => item.id)), [["ube", "spill"], ["pandan", "spill"], ["turon", "spill"]]);
assert.equal(guestMenuAbsoluteUrl("project-seed"), "https://finacalleos.com/project-seed/menu");
console.log("Project Seed menu/game source and route checks passed.");
