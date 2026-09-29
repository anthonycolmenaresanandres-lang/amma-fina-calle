import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { scrambledMenuGroups } from "../src/app/(internal)/demo/scrambled/menu-data";
import { guestMenuAbsoluteUrl, guestMenuPath } from "../src/lib/guest-menu";

let passed = 0;
function test(label: string, fn: () => void) {
  fn();
  passed += 1;
  console.log(`PASS ${label}`);
}

const pageSource = readFileSync("src/app/(internal)/demo/scrambled/page.tsx", "utf8");
const stableRouteSource = readFileSync("src/app/scrambled/menu/page.tsx", "utf8");
const allSections = scrambledMenuGroups.flatMap((group) => group.sections);
const allItems = allSections.flatMap((section) => section.items);

test("stable Scrambled path", () => assert.equal(guestMenuPath("scrambled"), "/scrambled/menu"));
test("stable Scrambled absolute URL", () => assert.equal(guestMenuAbsoluteUrl("scrambled"), "https://finacalleos.com/scrambled/menu"));
test("stable route redirects to the designed preview", () => assert.match(stableRouteSource, /permanentRedirect\("\/demo\/scrambled"\)/));
test("all photographed menu groups are represented", () => assert.deepEqual(scrambledMenuGroups.map((group) => group.id), ["breakfast", "mediterranean", "diner", "drinks"]));
test("inventory is substantial", () => assert.ok(allItems.length >= 95, `expected at least 95 items, found ${allItems.length}`));
test("Beach Boxes are not represented as a children menu", () => {
  assert.ok(allSections.some((section) => section.id === "beach-boxes"));
  assert.ok(!allSections.some((section) => /kids|children|beach-dogs/.test(section.id)));
});
test("unknown prices are never represented as zero or free", () => {
  for (const menuItem of allItems) {
    assert.notEqual(menuItem.price, "$0.00");
    assert.notEqual(menuItem.price, "Free");
  }
});
test("guest intake is excluded", () => {
  assert.doesNotMatch(pageSource, /<form|GuestNote|guest-note|textarea|type=["']email/i);
});
test("owner portal is not linked or implemented from the guest page", () => {
  assert.doesNotMatch(pageSource, /\/owner\/scrambled|owner portal|owner login/i);
});

console.log(`${passed} Scrambled menu checks passed.`);
