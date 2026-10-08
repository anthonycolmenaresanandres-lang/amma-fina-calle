import assert from "node:assert/strict";
import { advanceClaim, CURRENT_TERMS_VERSION, disclosureFor, INITIAL_STATE, normalizeCity, parseState, placeIdFromHash, places, stages, type DemoState } from "../src/app/discover/data";

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
assert.deepEqual(INITIAL_STATE, { termsVersion: CURRENT_TERMS_VERSION, saved: [], destinations: [], claims: {} }, "initial state remains untouched");
assert.equal(places.filter(p => state.claims[p.id] === "redeemed").length * 50, 50);
assert.equal(parseState("broken"), INITIAL_STATE, "corrupt saves recover safely");
assert.deepEqual(parseState(JSON.stringify({ saved: ["tideline", "unknown", "tideline", 1], destinations: ["Richmond, VA", "Richmond, VA", 2], claims: { tideline: "redeemed", thread: "invalid", unknown: "redeemed" } })), { termsVersion: CURRENT_TERMS_VERSION, saved: ["tideline"], destinations: ["Richmond, VA"], claims: { tideline: "redeemed" } });
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

// Old saves cannot establish acceptance of the revised post/deadline/disclosure.
// Keep destinations, bookmarks and earned historical stamps when restarting them.
for (const place of places) {
  for (const legacyStage of ["claimed", "visited", "proof"] as const) {
    for (const version of [undefined, CURRENT_TERMS_VERSION - 1]) {
      const legacy = { termsVersion: version, saved: ["thread"], destinations: ["Richmond, VA"], claims: { [place.id]: legacyStage } };
      const migrated = parseState(JSON.stringify(legacy));
      assert.deepEqual(migrated, { termsVersion: CURRENT_TERMS_VERSION, saved: ["thread"], destinations: ["Richmond, VA"], claims: {} }, `${place.id} legacy ${legacyStage} restarts without losing saves`);
      assert.equal(advanceClaim(migrated, place.id, legacyStage, true, true), migrated, "stale legacy buttons cannot advance a restarted claim");
      assert.equal(advanceClaim(migrated, place.id, undefined, false, false), migrated, "restarted claim requires new terms acceptance");
      assert.deepEqual(parseState(JSON.stringify(migrated)), migrated, "migration is idempotent");
    }
  }
}
const historical = parseState(JSON.stringify({ saved: ["thread"], destinations: ["Richmond, VA"], claims: { tideline: "redeemed", thread: "proof", little: "visited", salt: "claimed" } }));
assert.deepEqual(historical, { termsVersion: CURRENT_TERMS_VERSION, saved: ["thread"], destinations: ["Richmond, VA"], claims: { tideline: "redeemed" } }, "mixed legacy saves retain historical stamps only");
assert.equal(advanceClaim(historical, "tideline", "redeemed", true, true), historical, "historical stamps cannot be redeemed twice");
const unparsedLegacy = { ...INITIAL_STATE, termsVersion: CURRENT_TERMS_VERSION - 1, claims: { thread: "proof" as const } };
assert.equal(advanceClaim(unparsedLegacy, "thread", "proof", true, true), unparsedLegacy, "outdated states cannot bypass migration");
let reloaded: DemoState = { ...INITIAL_STATE, saved: ["thread"], destinations: ["Richmond, VA"] };
reloaded = advanceClaim(reloaded, "thread", undefined, true, false);
for (const stage of stages) {
  reloaded = parseState(JSON.stringify(reloaded));
  assert.equal(reloaded.claims.thread, stage, `current ${stage} survives reload`);
  assert.deepEqual(reloaded.saved, ["thread"]);
  assert.deepEqual(reloaded.destinations, ["Richmond, VA"]);
  if (stage === "visited") assert.equal(advanceClaim(reloaded, "thread", stage, false, false), reloaded, "reload does not bypass the disclosed-proof gate");
  const advanced = advanceClaim(reloaded, "thread", stage, false, stage === "visited");
  if (stage === "redeemed") assert.equal(advanced, reloaded, "current-version redemption remains idempotent");
  reloaded = advanced;
}

console.log("Discover demo: versioned legacy migration, current reload, prerequisite gates, stale/repeated actions, honest post terms, idempotent stamps, storage and navigation passed.");
