import assert from "node:assert/strict";
import { olympiaMenu } from "../src/app/olympia/menu-data";
import { olympiaRounds, olympiaSkin } from "../src/app/olympia/play/config";
import { CAFERUSH_LEVELS } from "../src/caferush/config";

assert.equal(olympiaRounds, CAFERUSH_LEVELS, "Rules must be shared, not customized for this prospect");
assert.equal(olympiaSkin.prospect, true);
assert.equal(olympiaSkin.assets, undefined, "Primitive game must not request any art or service");
const items = olympiaMenu.flatMap(group => group.items);
assert.equal(items.length, 8);
assert.equal(new Set(items.map(item => item.name)).size, 8);
assert(items.every(item => Object.keys(item).join() === "name"), "Provisional items must not imply prices, ingredients or availability");
assert(olympiaSkin.items.some(item => item.kind === "good") && olympiaSkin.items.some(item => item.kind === "bad"));
console.log("PASS Olympia: provisional menu, standard rounds, asset-free skin.");
