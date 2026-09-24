import assert from "node:assert/strict";
import { test } from "node:test";
import { isGolden, makeTicket, newShift, orderLimit, rushReducer, SHIFT_MS, type RushState } from "./rules";
const start = (practice = false) => rushReducer(newShift(), { type: "start", practice });
const tick = (s: RushState, delta: number) => rushReducer(s, { type: "tick", delta, random: 0.41 });
function serve(s: RushState) {
  for (const item of s.ticket.slice(s.filled)) s = rushReducer(s, { type: "pick", item, random: 0.42 });
  return s;
}
test("Spanish Latte leads the first ticket; correct sequence scores 120", () => {
  const s = serve(start());
  assert.equal(start().ticket[0], "spanish");
  assert.equal(s.score, 120); assert.equal(s.served, 1); assert.equal(s.streak, 1);
});
test("wrong item never advances the ticket or makes points negative", () => {
  const s = rushReducer(start(), { type: "pick", item: "canela", random: 0.3 });
  assert.equal(s.score, 0); assert.equal(s.filled, 0); assert.equal(s.perfect, false);
  assert.equal(serve(s).streak, 0);
});
test("four perfect orders unlock seven seconds of double points", () => {
  let s = start();
  for (let i = 0; i < 4; i++) s = serve(s);
  assert.equal(s.streak, 4); assert.equal(s.score, 520); assert.equal(isGolden(s), true);
  const boosted = serve(s);
  assert.equal(boosted.score - s.score, 320);
  assert.equal(isGolden(tick(s, 6999)), true);
  assert.equal(isGolden(tick(s, 7000)), false);
});
test("pause freezes clock, order, input and golden-hour time", () => {
  let s = start(); for (let i = 0; i < 4; i++) s = serve(s);
  s = rushReducer(s, { type: "pause" });
  assert.deepEqual(tick(s, 60000), s);
  assert.deepEqual(serve(s), s);
  const resumed = rushReducer(s, { type: "resume" });
  assert.equal(resumed.elapsed, s.elapsed); assert.equal(isGolden(resumed), true);
});
test("order deadline replaces stale ticket and clears combo", () => {
  let s = serve(start());
  s = rushReducer(s, { type: "pick", item: s.ticket[0], random: 0.4 });
  const expired = tick(s, orderLimit(s.served));
  assert.equal(expired.missed, 1); assert.equal(expired.filled, 0); assert.equal(expired.streak, 0);
  assert.equal(expired.score, s.score); assert.equal(expired.orderElapsed, 0);
});
test("45-second boundary ends shift and blocks all subsequent scoring", () => {
  const s = tick(start(), SHIFT_MS);
  assert.equal(s.phase, "done"); assert.deepEqual(serve(s), s);
  const replay = rushReducer(s, { type: "start", practice: false });
  assert.equal(replay.elapsed, 0); assert.equal(replay.score, 0); assert.equal(replay.phase, "playing");
});
test("practice remains untimed and ends only on request", () => {
  const s = tick(start(true), SHIFT_MS * 5);
  assert.equal(s.phase, "playing"); assert.equal(s.missed, 0);
  assert.equal(rushReducer(s, { type: "finish" }).phase, "done");
});
test("tickets increase difficulty, stay bounded, and never repeat adjacent items", () => {
  const seen = new Set<string>();
  for (let n = 0; n < 40; n++) {
    const ticket = makeTicket(n, n / 40);
    assert.equal(ticket.length, n < 3 ? 2 : n < 8 ? 3 : 4);
    ticket.forEach((item, i) => { seen.add(item); if (i) assert.notEqual(item, ticket[i - 1]); });
    if (n % 3 === 0) assert.equal(ticket[0], "spanish");
  }
  assert.equal(seen.size, 3);
});
test("invalid or negative clock deltas do not corrupt a shift", () => {
  for (const delta of [-1, NaN, Infinity]) assert.deepEqual(tick(start(), delta), start());
});
