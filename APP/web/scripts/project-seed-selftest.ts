import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
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
assert.ok(!seedSkin.assets, "No client-owned logo, background, or catcher art is allowed before approval");
assert.deepEqual(seedRounds.map((_, index) => seedSkinForRound(index).items.map((item) => item.id)), [["ube", "aswang"], ["pandan", "aswang"], ["turon", "aswang"]]);
const pandan = seedSkin.items.find((item) => item.id === "pandan");
assert.equal(pandan?.asset, "/assets/project-seed/seed-rush/buko-pandan-latte-v1.webp");
assert.ok(statSync(new URL("../public/assets/project-seed/seed-rush/buko-pandan-latte-v1.webp", import.meta.url)).size <= 40_000, "Buko Pandan game asset must remain lightweight");
assert.ok(seedSkin.items.filter((item) => item.id === "ube" || item.id === "turon").every((item) => !item.asset), "Other drink art must not be misidentified");
const aswang = seedSkin.items.find((item) => item.id === "aswang");
assert.deepEqual(aswang && { kind: aswang.kind, shape: aswang.shape, asset: aswang.asset }, { kind: "bad", shape: "bad-vibes", asset: "/assets/project-seed/seed-rush/aswang-v1.webp" });
assert.ok(statSync(new URL("../public/assets/project-seed/seed-rush/aswang-v1.webp", import.meta.url)).size <= 40_000, "Aswang game asset must remain lightweight");
const gameSource = readFileSync(new URL("../src/app/play/project-seed/SeedRushClient.tsx", import.meta.url), "utf8");
assert.equal(gameSource.match(/Tabi-tabi po\./g)?.length, 1, "Respectful passage phrase must appear exactly once");
assert.match(gameSource, /A respectful request for passage in Filipino folk tradition\./);
assert.equal(guestMenuAbsoluteUrl("project-seed"), "https://finacalleos.com/project-seed/menu");
console.log("Project Seed menu/game source and route checks passed.");
