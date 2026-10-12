import assert from "node:assert/strict";
import { olympiaMenu, olympiaMenuSource, olympiaSections } from "../src/app/olympia/menu-data";
import { olympiaRounds, olympiaSkin } from "../src/app/olympia/play/config";
import { CAFERUSH_LEVELS } from "../src/caferush/config";

assert.equal(olympiaRounds, CAFERUSH_LEVELS, "Rules must remain shared");
assert.equal(olympiaSkin.prospect, true);
assert.equal(olympiaSkin.assets, undefined, "Primitive game must not request any art or service");
assert(olympiaSkin.items.some(item => item.kind === "good") && olympiaSkin.items.some(item => item.kind === "bad"));

const source = olympiaMenuSource;
const items = olympiaMenu.flatMap(group => group.items);
assert.equal(source.sourceUrl, "https://www.doordash.com/store/34805753");
assert.equal(source.orderMethod, "Delivery");
assert.equal(source.observedDate, "2026-10-12");
assert.equal(items.length, 39, "Only the 39 verified unique entries may ship");
assert.equal(new Set(items.map(item => item.name)).size, items.length, "Do not duplicate featured items");
assert.equal(new Set(items.map(item => item.id)).size, items.length);
assert.deepEqual(olympiaMenu.map(group => group.items.length), [10, 11, 3, 5, 10]);
for (const group of olympiaMenu) {
  assert(group.items.length > 0, "Do not imply coverage with empty category headings");
  for (const item of group.items) {
    const index = Number(item.id?.replace("olympia-item-", "")) - 1;
    const original = source.items[index];
    assert(original, "Every item needs a traceable captured source");
    assert.equal(group.sourceCategory, original.observedCategory, "Never infer category membership");
    assert.equal(item.name, original.name.replace(/\s+/g, " ").trim());
    assert.equal(item.description, original.description?.replace(/\s+/g, " ").trim());
    assert.match(original.price, /^\$\d+\.\d{2}$/);
    assert.equal(item.priceLabel, original.price + " · DoorDash", "Each price must identify its delivery source");
    assert.equal(item.options, undefined, "Uncaptured variants must stay unknown");
  }
}
for (const section of olympiaSections) {
  assert(olympiaMenu.some(group => group.id === section.id) || ["juice", "visit"].includes(section.id));
}
console.log("PASS Olympia: 39 unique source-matched selected items, delivery prices, genuine groups, standard game.");
