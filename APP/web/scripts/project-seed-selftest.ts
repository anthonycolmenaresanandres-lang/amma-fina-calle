import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { gameFeatures, OCTOBER_LAUNCH_AT, OCTOBER_SOURCE, OFFICIAL_MENU_URL, octoberMenuGroups, octoberMenuIsLive, seedMenuGroups, seedMenuItemHref } from "../src/app/(internal)/demo/project-seed/menu-data";
import { seedRounds, seedRoundShowcase, seedSkin, seedSkinForRound } from "../src/app/play/project-seed/config";
import { octoberRounds, octoberRoundShowcase, octoberSkin, octoberSkinForRound } from "../src/app/play/project-seed/october-config";
import { BODEGA_CHAPTERS } from "../src/bodega-fall/campaign";
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
assert.deepEqual(seedRounds.map((round) => round.rules.fallSpeed), BODEGA_CHAPTERS.slice(0, 3).map((chapter) => chapter.fallSpeed), "Seed Rush should use the first three Bodega fall-speed ranges");
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
assert.doesNotMatch(gameSource, /Tabi-tabi po/);
assert.equal(guestMenuAbsoluteUrl("project-seed"), "https://finacalleos.com/project-seed/menu");
const octoberItems = octoberMenuGroups.flatMap((group) => group.items);
assert.equal(octoberItems.length, 8);
assert.equal(new Set(octoberItems.map((entry) => entry.id)).size, 8);
assert.ok(octoberItems.every((entry) => entry.source === OCTOBER_SOURCE && entry.price === null));
assert.deepEqual(octoberMenuGroups.map((group) => group.id), ["october-lattes", "october-non-coffee"]);
assert.deepEqual(octoberItems.filter((entry) => entry.options?.includes("cold brew")).map((entry) => entry.id), ["dwende-latte", "pms-latte"]);
assert.equal(octoberMenuIsLive(OCTOBER_LAUNCH_AT - 1), false);
assert.equal(octoberMenuIsLive(OCTOBER_LAUNCH_AT), true);
assert.deepEqual(octoberRounds.map((round) => round.rules.badChance), [0.30, 0.38, 0.45]);
assert.deepEqual(octoberRounds.map((round) => round.rules.spawnEveryMs), [900, 800, 700]);
assert.deepEqual(octoberRounds.map((round) => round.rules.fallSpeed), [[1.28, 1.58], [1.50, 1.80], [1.73, 2.10]]);
assert.deepEqual(octoberRounds.map((round) => round.rules.durationSec), [20, 25, 30]);
assert.ok(octoberRounds.every((round) => round.rules.failOnBadCatch));
assert.deepEqual(octoberRoundShowcase, seedRoundShowcase);
assert.ok(octoberRoundShowcase.every((round, index) => {
  const good = octoberSkinForRound(index).items.filter((entry) => entry.kind === "good");
  return good.length === 2 && good.every((entry) => products.some((product) => product.id === entry.id));
}));
assert.equal(octoberSkin.items.filter((entry) => entry.kind === "bad").length, 1);
assert.ok(octoberSkin.assets?.background);
for (const entry of octoberSkin.items.filter((item) => item.kind === "good")) {
  assert.ok(entry.asset?.startsWith("/assets/project-seed/seed-rush/"));
  assert.ok(statSync(new URL(`../public${entry.asset}`, import.meta.url)).size < 40_000);
}
assert.ok(statSync(new URL(`../public${octoberSkin.assets.background}`, import.meta.url)).size < 100_000);
// Even with the planned hazard share, enough good items can arrive to reach each target.
assert.ok(octoberRounds.every((round) => Math.floor(round.rules.durationSec * 1000 / round.rules.spawnEveryMs) * (1 - round.rules.badChance) * 10 >= round.rules.targetScore));
console.log("Project Seed menu/game source and route checks passed.");
