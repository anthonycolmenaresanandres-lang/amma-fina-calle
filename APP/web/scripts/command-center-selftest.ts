import assert from "node:assert/strict";
import { sections } from "../src/app/(internal)/command-center/links";
import { places, destinationCount } from "../src/app/(internal)/command-center/campus";

const original = sections.flatMap(section => section.links);
const campus = places.flatMap(place => place.links);
const key = (link: { href: string; label: string }) => link.href + "\0" + link.label;
assert.deepEqual(places.map(place => place.id), ["sales", "clients", "studio", "product", "infrastructure"]);
assert.equal(new Set(campus.map(key)).size, campus.length, "No duplicate destinations");
for (const link of original) {
  assert.equal(campus.filter(item => key(item) === key(link)).length, 1, "Preserve " + link.label);
}
assert.equal(destinationCount, original.length + 1, "Only the existing client ledger is added");
assert.equal(places.find(place => place.id === "clients")?.links.find(link => link.href === "/customers")?.note?.includes("sign-in required"), true);
assert.equal(campus.find(link => link.href === "/lead-arcade")?.note?.includes("Fictional"), true);
console.log("PASS: five departments; all " + original.length + " original destinations preserved once; authenticated ledger and fictional data labeled.");
