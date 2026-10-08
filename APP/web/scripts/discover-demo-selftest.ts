import assert from "node:assert/strict";
import { advanceClaim, disclosureFor, INITIAL_STATE, normalizeCity, parseState, placeIdFromHash, places, stages } from "../src/app/discover/data";

assert.equal(advanceClaim(INITIAL_STATE, "tideline", undefined), INITIAL_STATE, "claim requires sample terms acknowledgement");
const visitState = { ...INITIAL_STATE, claims: { tideline: "visited" as const } };
assert.equal(advanceClaim(visitState, "tideline", "visited", true, false), visitState, "proof requires the disclosed-post acknowledgement");
for (const place of places) {
  assert.ok(place.requirement.includes("honest social story"), `${place.name} requires honest social content`);
  assert.ok(place.postDeadline.includes("48 hours"));
  assert.ok(disclosureFor(place).includes(place.name));
  assert.ok(disclosureFor(place).includes("in exchange"));
}
let state = INITIAL_STATE;
for (const stage of stages) {
  const previous = state;
  const expected = state.claims.tideline;
  state = advanceClaim(state, "tideline", expected, true, true);
  assert.equal(advanceClaim(state, "tideline", expected, true, true), state, "a repeated stale action cannot skip a step");
  assert.notEqual(state, previous);
  assert.equal(state.claims.tideline, stage);
}
assert.deepEqual(advanceClaim(state, "tideline", "redeemed", true, true), state, "redemption must not create another stamp");
assert.equal(advanceClaim(state, "unknown", undefined, true, true), state, "unknown merchants cannot be claimed");
assert.deepEqual(INITIAL_STATE, { saved: [], destinations: [], claims: {} }, "initial state remains untouched");
assert.equal(places.filter(p => state.claims[p.id] === "redeemed").length * 50, 50);
assert.equal(parseState("broken"), INITIAL_STATE, "corrupt saves recover safely");
assert.deepEqual(parseState(JSON.stringify({ saved: ["tideline", "unknown", "tideline", 1], destinations: ["Richmond, VA", "Richmond, VA", 2], claims: { tideline: "redeemed", thread: "invalid", unknown: "redeemed" } })), { saved: ["tideline"], destinations: ["Richmond, VA"], claims: { tideline: "redeemed" } });
assert.equal(normalizeCity(" Virginia Beach, va "), "Virginia Beach, VA");
assert.equal(normalizeCity("VB"), "Virginia Beach, VA");
assert.equal(normalizeCity(" Richmond,   VA "), "Richmond, VA", "unsupported cities stay distinct");
assert.equal(normalizeCity(" "), "");
assert.equal(places.filter(p => p.trail).length, 3);
assert.equal(new Set(places.map(p => p.category)).size, 5);
assert.equal(placeIdFromHash("#offer-tideline"), "tideline");
assert.equal(placeIdFromHash("#offer-thread"), "thread");
assert.equal(placeIdFromHash("#offer-unknown"), null);
assert.equal(placeIdFromHash("#other"), null);
assert.equal(placeIdFromHash(""), null);
console.log("Discover demo: prerequisite gates, stale/repeated actions, honest post terms, idempotent stamps, storage and navigation passed.");
