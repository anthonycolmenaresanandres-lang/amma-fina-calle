import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { gameFeatures, OFFICIAL_MENU_URL, seedMenuGroups, seedMenuItemHref } from "../src/app/(internal)/demo/project-seed/menu-data";
import { seedRounds, seedRoundShowcase, seedSkin, seedSkinForRound } from "../src/app/play/project-seed/config";
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
assert.deepEqual(seedRounds.map((round) => round.rules.targetScore), [80, 110, 140]);
assert.ok(seedRounds.every((round) => round.rules.failOnBadCatch));
assert.ok(seedRounds.every((round) => round.rules.fallSpeed[0] >= 0.48));
assert.ok(seedSkin.prospect);
assert.ok(!seedSkin.assets, "No client-owned logo, background, or catcher art is allowed before approval");
assert.deepEqual(seedRounds.map((_, index) => seedSkinForRound(index).items.map((item) => item.id)), [
  ["buko-pandan", "dark-iced-coffee", "aswang"],
  ["borahae-latte", "iced-green-latte", "aswang"],
  ["sugar-custard-swirl-pastry", "purple-rolled-pastry", "aswang"],
]);
assert.equal(seedRoundShowcase.length, 3);
const products = seedSkin.items.filter((item) => item.kind === "good");
assert.equal(products.length, 6);
assert.ok(products.every((item) => item.asset?.startsWith("/assets/project-seed/seed-rush/") && item.asset.endsWith("-v1.webp")));
for (const item of products) {
  const file = new URL(`../public${item.asset}`, import.meta.url);
  assert.ok(statSync(file).size <= 40_000, `${item.id} game asset must remain lightweight`);
}
assert.ok(products.every((item) => !/\bUbe\b|\bTuron\b/i.test(item.label)), "Unmatched art must not be assigned an official menu identity");
const aswang = seedSkin.items.find((item) => item.id === "aswang");
assert.deepEqual(aswang && { kind: aswang.kind, shape: aswang.shape, asset: aswang.asset }, { kind: "bad", shape: "bad-vibes", asset: "/assets/project-seed/seed-rush/aswang-v1.webp" });
assert.ok(statSync(new URL("../public/assets/project-seed/seed-rush/aswang-v1.webp", import.meta.url)).size <= 40_000, "Aswang game asset must remain lightweight");
const gameSource = readFileSync(new URL("../src/app/play/project-seed/SeedRushClient.tsx", import.meta.url), "utf8");
assert.match(gameSource, /itemScale: 3\.75/, "Product display size must be three times the previous 1.25 scale");
assert.equal(gameSource.match(/Tabi-tabi po\./g)?.length, 1, "Respectful passage phrase must appear exactly once");
assert.match(gameSource, /A respectful request for passage in Filipino folk tradition\./);
assert.equal(guestMenuAbsoluteUrl("project-seed"), "https://finacalleos.com/project-seed/menu");
console.log("Project Seed menu/game source and route checks passed.");
