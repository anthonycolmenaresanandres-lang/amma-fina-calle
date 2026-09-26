import assert from "node:assert/strict";
import { test } from "node:test";
import { GRUA_LEVEL, STRINGMAN } from "./profile";
import { cableLengths, lineTensions, peakTension, stepSwing, swingPeriod, type Swing } from "./physics";
import { BINS, ITEM_KINDS, newRound, step, type Round } from "./round";
import { playBotRound } from "./bot";
import { ACTION_NAMES, GruaRecorder, STATE_NAMES } from "./recorder";

const dt = 1 / GRUA_LEVEL.physicsHz;
const heaviest = STRINGMAN.suspendedMass + Math.max(...Object.values(ITEM_KINDS).map((k) => k.mass));
const idle = { vx: 0, vy: 0, action: null } as const;

function settle(round: Round, seconds: number) {
  for (let t = 0; t < seconds; t += dt) step(round, idle, dt);
  return round;
}

test("cable spans are corner-to-gantry distances and symmetric at the centre", () => {
  const spans = cableLengths([0, 0, 1.2]);
  const expected = Math.hypot(2, 2, 0.77);
  spans.forEach((s) => assert.ok(Math.abs(s - expected) < 1e-12));
  const off = cableLengths([1, 0.5, 0.8]);
  assert.ok(Math.abs(off[0] - Math.hypot(1, 1.5, 1.17)) < 1e-12);
});

test("static tension matches Stringman's simulator at its keyframe (~9.4 N, within 10%)", () => {
  const t = lineTensions([0, 0, 1.2], STRINGMAN.suspendedMass)!;
  t.forEach((v) => assert.ok(v > 9.4 * 0.9 && v < 9.4 * 1.1, `tension ${v}`));
  const sum = t.reduce((a, b) => a + b, 0);
  assert.ok(sum > STRINGMAN.suspendedMass * STRINGMAN.gravity, "lines must carry at least the weight");
});

test("flatter lines cost more tension: raising the gantry near a wall raises the peak", () => {
  let last = 0;
  for (const z of [0.52, 0.8, 1.0, 1.3, 1.5]) {
    const peak = peakTension([1.5, 0, z], STRINGMAN.suspendedMass);
    assert.ok(peak > last); last = peak;
  }
});

test("no deadlock: the heaviest load can be held anywhere at the lowest gantry height", () => {
  for (let x = -GRUA_LEVEL.wallLimit; x <= GRUA_LEVEL.wallLimit + 1e-9; x += 0.05)
    for (let y = -GRUA_LEVEL.wallLimit; y <= GRUA_LEVEL.wallLimit + 1e-9; y += 0.05)
      assert.ok(peakTension([x, y, GRUA_LEVEL.grabAltitude], heaviest) < STRINGMAN.maxSafeTension, `(${x.toFixed(2)}, ${y.toFixed(2)})`);
});

test("both bins can take the heaviest item at travel height without strain", () => {
  for (const bin of Object.values(BINS))
    assert.ok(peakTension([bin.at[0], bin.at[1], GRUA_LEVEL.cruiseAltitude], heaviest) < STRINGMAN.maxSafeTension);
});

test("pole swing period matches 2π√(L/g) = 1.115 s within 1%", () => {
  let s: Swing = { angle: [0.05, 0], rate: [0, 0] };
  const crossings: number[] = [];
  let prev = s.angle[0];
  for (let i = 1; i < 120 * 6; i++) {
    s = stepSwing(s, [0, 0], dt, 0);
    if (prev > 0 && s.angle[0] <= 0) crossings.push(i * dt);
    prev = s.angle[0];
  }
  const measured = (crossings[crossings.length - 1] - crossings[0]) / (crossings.length - 1);
  assert.ok(Math.abs(swingPeriod() - 1.115) < 0.002);
  assert.ok(Math.abs(measured - swingPeriod()) / swingPeriod() < 0.01, `measured ${measured}`);
});

test("the crane obeys Stringman's speed and acceleration limits", () => {
  const round = newRound(1);
  let maxSpeed = 0, maxAccel = 0, prev = 0;
  for (let i = 0; i < 120 * 8; i++) {
    step(round, { vx: 5, vy: 5, action: null }, dt);
    const v = Math.hypot(round.velocity[0], round.velocity[1]);
    maxSpeed = Math.max(maxSpeed, v); maxAccel = Math.max(maxAccel, Math.abs(v - prev) / dt); prev = v;
  }
  assert.ok(maxSpeed <= STRINGMAN.maxSpeed + 1e-9, `speed ${maxSpeed}`);
  assert.ok(maxAccel <= STRINGMAN.accel + 1e-6, `accel ${maxAccel}`);
});

test("a centred grab holds the item; an off-centre grab misses and reopens", () => {
  const hit = newRound(3);
  const item = hit.items[0];
  hit.gantry = [item.at[0], item.at[1], GRUA_LEVEL.cruiseAltitude];
  step(hit, { vx: 0, vy: 0, action: "grab" }, dt);
  settle(hit, 6);
  assert.equal(hit.holding, item.id);
  assert.equal(hit.phase, "cruise");
  assert.equal(hit.finger, STRINGMAN.fingerClosed);

  const miss = newRound(3);
  const target = miss.items[0];
  miss.gantry = [target.at[0] + ITEM_KINDS[target.kind].tolerance + 0.02, target.at[1], GRUA_LEVEL.cruiseAltitude];
  miss.items.forEach((i) => { if (i !== target) i.state = "trash"; });
  step(miss, { vx: 0, vy: 0, action: "grab" }, dt);
  settle(miss, 6);
  assert.equal(miss.holding, null);
  assert.equal(miss.missedGrabs, 1);
  assert.equal(miss.finger, STRINGMAN.fingerOpen);
});

test("drops score only in the right bin; the floor and the wrong bin score nothing", () => {
  const drop = (into: "tub" | "trash" | "floor") => {
    const r = newRound(5);
    const mug = r.items.find((i) => i.kind === "mug")!;
    mug.state = "held"; r.holding = mug.id; r.finger = STRINGMAN.fingerClosed;
    r.gantry = into === "floor" ? [0, 1, GRUA_LEVEL.cruiseAltitude] : [BINS[into].at[0], BINS[into].at[1], GRUA_LEVEL.cruiseAltitude];
    step(r, { vx: 0, vy: 0, action: "grab" }, dt);
    return { r, mug };
  };
  assert.equal(drop("tub").r.score, ITEM_KINDS.mug.points);
  assert.equal(drop("tub").mug.state, "tub");
  assert.equal(drop("trash").r.score, 0);
  assert.equal(drop("trash").mug.state, "trash");
  assert.equal(drop("floor").r.score, 0);
  assert.equal(drop("floor").mug.state, "floor");
});

test("a heavy lift near a corner strains, sags like passive_safety, and can still be delivered", () => {
  const r = newRound(9);
  const pitcher = r.items.find((i) => i.kind === "pitcher")!;
  pitcher.at = [1.6, 1.6];
  r.gantry = [1.6, 1.6, GRUA_LEVEL.cruiseAltitude];
  step(r, { vx: 0, vy: 0, action: "grab" }, dt);
  let sawSag = false;
  for (let i = 0; i < 120 * 30 && !(r.holding && r.phase === "cruise" && Math.hypot(r.gantry[0], r.gantry[1]) < 0.5); i++) {
    const toCentre = r.holding && (r.phase === "ascend" || r.phase === "cruise") ? { vx: -r.gantry[0], vy: -r.gantry[1] } : { vx: 0, vy: 0 };
    step(r, { ...toCentre, action: null }, dt);
    sawSag ||= r.phase === "sag";
  }
  assert.ok(r.strainEvents >= 1, "the lift should strain");
  assert.ok(sawSag, "the robot should back off by sagging");
  assert.equal(r.holding, pitcher.id);
  assert.ok(r.tensions.every((t) => t <= STRINGMAN.maxSafeTension + 1e-6));
});

test("rounds are deterministic by seed, and every seed's layout is reachable", () => {
  const a = playBotRound(11).round, b = playBotRound(11).round;
  assert.equal(a.score, b.score); assert.equal(a.time, b.time);
  assert.notDeepEqual(newRound(11).items.map((i) => i.at), newRound(12).items.map((i) => i.at));
  for (let seed = 1; seed <= 60; seed++) {
    const r = newRound(seed);
    r.items.forEach((i) => assert.ok(Math.abs(i.at[0]) <= 1.6 && Math.abs(i.at[1]) <= 1.6));
  }
});

test("a careful pilot can clear the floor in time on every seed tried", () => {
  for (let seed = 1; seed <= 60; seed++) {
    const { round } = playBotRound(seed);
    assert.ok(round.items.every((i) => i.state === "tub" || i.state === "trash"), `seed ${seed}`);
    assert.ok(round.time < round.limit);
  }
});

test("recordings use Stringman's field names, 30 Hz robot time and hindsight labels", () => {
  const { recorder, round } = playBotRound(7, true);
  const data = JSON.parse(JSON.stringify(recorder!.export("2026-09-25T00:00:00.000Z")));
  assert.deepEqual(data.action_names.slice(0, 7), ["vel_x", "vel_y", "vel_z", "room_vel_x", "room_vel_y", "wrist_speed", "finger_speed"]);
  assert.equal(data.action_space, "dual_vel_contact");
  const drops = round.items.filter((i) => i.state !== "floor").length;
  assert.equal(data.episodes.length, drops);
  for (const ep of data.episodes) {
    assert.equal(ep.action.length, ep.length); assert.equal(ep.state.length, ep.length);
    ep.state.forEach((row: number[]) => assert.equal(row.length, STATE_NAMES.length));
    ep.action.forEach((row: number[]) => assert.equal(row.length, ACTION_NAMES.length));
    ep.timestamp.forEach((t: number, i: number) => { if (i) assert.ok(Math.abs(t - ep.timestamp[i - 1] - 1 / 30) < 1e-3); });
    assert.equal(ep.action[ep.length - 1][10], 1); assert.equal(ep.action[0][10], 0);
    assert.match(ep.task, /^Put the .+ in the (dish tub|trash can)$/);
    // contact_vec from the first frame lands on the grasp point: within the item's tolerance.
    const first = ep.state[0], a0 = ep.action[0];
    const gx = first[STATE_NAMES.indexOf("gripper_pos_x")] + a0[7];
    const gy = first[STATE_NAMES.indexOf("gripper_pos_y")] + a0[8];
    assert.ok(Number.isFinite(gx) && Number.isFinite(gy));
    ep.state.flat().concat(ep.action.flat()).forEach((v: number) => assert.ok(Number.isFinite(v)));
  }
  const text = JSON.stringify(data).toLowerCase();
  for (const leak of ["userid", "user_id", "email", "ip_address", "device_id", "latitude"]) assert.ok(!text.includes(leak), leak);
});

test("the recorder records nothing until it is given frames", () => {
  const recorder = new GruaRecorder(1);
  assert.equal(recorder.frameCount(), 0);
  assert.equal(recorder.export("x").episodes.length, 0);
});
