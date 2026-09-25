import { GRUA_LEVEL, STRINGMAN, type Vec3 } from "./profile";
import { cableLengths, gripperPosition, lineTensions, peakTension, stepSwing, swingAmplitude, type Swing } from "./physics";

// The frozen Grúa rules: a café floor after close, one cable crane, two bins.
// Pure and deterministic: the same seed and the same inputs give the same round.

export type BinId = "tub" | "trash";
export type ItemKind = "mug" | "plate" | "cup" | "napkin" | "pitcher";

export const ITEM_KINDS: Record<ItemKind, { label: string; mass: number; tolerance: number; size: number; bin: BinId; points: number }> = {
  mug: { label: "mug", mass: 0.35, tolerance: 0.045, size: 0.09, bin: "tub", points: 10 },
  plate: { label: "plate", mass: 0.45, tolerance: 0.06, size: 0.24, bin: "tub", points: 10 },
  cup: { label: "paper cup", mass: 0.03, tolerance: 0.04, size: 0.08, bin: "trash", points: 10 },
  napkin: { label: "napkin", mass: 0.01, tolerance: 0.05, size: 0.12, bin: "trash", points: 10 },
  pitcher: { label: "milk pitcher", mass: 0.7, tolerance: 0.05, size: 0.12, bin: "tub", points: 20 },
};

export const BINS: Record<BinId, { label: string; at: [number, number]; radius: number }> = {
  tub: { label: "dish tub", at: [-0.7, -1.05], radius: 0.22 },
  trash: { label: "trash can", at: [0.7, -1.05], radius: 0.18 },
};

const ROUND_KINDS: ItemKind[] = ["mug", "mug", "plate", "cup", "cup", "napkin", "napkin", "pitcher"];

export type Item = { id: string; kind: ItemKind; at: [number, number]; state: "floor" | "held" | BinId };

export type Phase = "cruise" | "descend" | "close" | "open" | "ascend" | "sag";

export type GruaEvent =
  | { type: "grab"; itemId: string | null; steady: boolean; at: Vec3 }
  | { type: "drop"; itemId: string; into: BinId | "floor"; correct: boolean; points: number; at: Vec3 }
  | { type: "strain"; tension: number }
  | { type: "clear"; bonus: number }
  | { type: "over" };

export type Command = { vx: number; vy: number; action: "grab" | null };

export type Round = {
  seed: number;
  time: number; // robot seconds since start
  limit: number; // robot seconds in the round
  gantry: [number, number, number];
  velocity: [number, number, number];
  commanded: [number, number, number]; // what the controls asked for, after limits
  swing: Swing;
  finger: number;
  fingerSpeed: number;
  phase: Phase;
  sagTime: number;
  holding: string | null;
  items: Item[];
  score: number;
  steadyGrabs: number;
  missedGrabs: number;
  strainEvents: number;
  straining: boolean;
  tensions: number[];
  over: boolean;
  events: GruaEvent[]; // drained by the caller after each step
};

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function layoutItems(seed: number): Item[] {
  const random = mulberry32(seed);
  const placed: Item[] = [];
  const clearOf = (x: number, y: number) =>
    Object.values(BINS).every((b) => Math.hypot(x - b.at[0], y - b.at[1]) > b.radius + 0.3) &&
    placed.every((p) => Math.hypot(x - p.at[0], y - p.at[1]) > 0.28) &&
    Math.hypot(x, y) > 0.3; // keep the start position clear
  ROUND_KINDS.forEach((kind, i) => {
    let x = 0, y = 0;
    for (let tries = 0; tries < 400; tries++) {
      x = -1.55 + random() * 3.1;
      y = -1.55 + random() * 3.1;
      if (clearOf(x, y)) break;
    }
    placed.push({ id: `${kind}-${i}`, kind, at: [round3(x), round3(y)], state: "floor" });
  });
  return placed;
}

function round3(v: number) { return Math.round(v * 1000) / 1000; }

export function newRound(seed: number): Round {
  const gantry: [number, number, number] = [0, 0, GRUA_LEVEL.cruiseAltitude];
  return {
    seed, time: 0, limit: GRUA_LEVEL.roundScreenSeconds * GRUA_LEVEL.timeScale,
    gantry, velocity: [0, 0, 0], commanded: [0, 0, 0],
    swing: { angle: [0, 0], rate: [0, 0] },
    finger: STRINGMAN.fingerOpen, fingerSpeed: 0, phase: "cruise", sagTime: 0, holding: null,
    items: layoutItems(seed), score: 0, steadyGrabs: 0, missedGrabs: 0, strainEvents: 0, straining: false,
    tensions: lineTensions(gantry, STRINGMAN.suspendedMass) ?? [0, 0, 0, 0],
    over: false, events: [],
  };
}

export function suspendedMass(round: Round) {
  const held = round.items.find((i) => i.id === round.holding);
  return STRINGMAN.suspendedMass + (held ? ITEM_KINDS[held.kind].mass : 0);
}

export function gripper(round: Round) {
  return gripperPosition(round.gantry, round.swing);
}

function clampVector(x: number, y: number, max: number): [number, number] {
  const m = Math.hypot(x, y);
  return m > max && m > 0 ? [(x / m) * max, (y / m) * max] : [x, y];
}

/** Advance the round by dt robot seconds under one command. */
export function step(round: Round, command: Command, dt: number): Round {
  if (round.over) return round;
  const L = GRUA_LEVEL;

  if (command.action === "grab" && round.phase === "cruise") {
    if (round.holding) release(round);
    else round.phase = "descend";
  }

  // Lateral: velocity command, limited like the robot (speed, then acceleration).
  const lateralCap = round.phase === "cruise" ? STRINGMAN.maxSpeed : STRINGMAN.nudgeSpeed;
  const [cx, cy] = clampVector(command.vx, command.vy, lateralCap);
  const [dvx, dvy] = clampVector(cx - round.velocity[0], cy - round.velocity[1], STRINGMAN.accel * dt);
  let vx = round.velocity[0] + dvx;
  let vy = round.velocity[1] + dvy;

  // Vertical and fingers follow the grab sequence.
  let vz = 0;
  round.fingerSpeed = 0;
  if (round.phase === "descend") vz = -L.verticalSpeed;
  else if (round.phase === "ascend") vz = L.verticalSpeed;
  else if (round.phase === "close") round.fingerSpeed = L.fingerSpeedDegPerSec;
  else if (round.phase === "open") round.fingerSpeed = -L.fingerSpeedDegPerSec;
  round.commanded = [cx, cy, vz];

  // Over the limit, Stringman's passive_safety() cancels the running move and damps its
  // motors for a second, so the gantry sags and sheds tension. Players keep steering, but
  // the robot ignores them until it recovers.
  if (round.phase === "sag") {
    vx = 0; vy = 0; vz = -L.sagSpeed;
    round.commanded = [cx, cy, 0];
    round.sagTime += dt;
  }

  let next: [number, number, number] = [
    clamp(round.gantry[0] + vx * dt, -L.wallLimit, L.wallLimit),
    clamp(round.gantry[1] + vy * dt, -L.wallLimit, L.wallLimit),
    clamp(round.gantry[2] + vz * dt, L.grabAltitude, L.cruiseAltitude),
  ];

  // The robot refuses any move that would push a line past its safe tension. If the climb
  // is the problem the sideways part may still go ahead; otherwise the robot sags.
  const mass = suspendedMass(round);
  const now = peakTension(round.gantry, mass);
  const overloads = (p: readonly number[]) => {
    const t = peakTension([p[0], p[1], p[2]], mass);
    return t > STRINGMAN.maxSafeTension && t > now ? t : 0;
  };
  const strain = round.phase === "sag" ? 0 : overloads(next);
  if (strain) {
    const sideways: [number, number, number] = [next[0], next[1], round.gantry[2]];
    if (vz !== 0 && !overloads(sideways)) { next = sideways; vz = 0; }
    else {
      next = [...round.gantry]; vx = 0; vy = 0; vz = 0;
      if (round.phase !== "close" && round.phase !== "open") { round.phase = "sag"; round.sagTime = 0; }
    }
    if (!round.straining) { round.strainEvents += 1; round.events.push({ type: "strain", tension: strain }); }
  }
  round.straining = Boolean(strain) || round.phase === "sag";

  // A strain stop halts the gantry within one step; the spools cannot really brake that
  // hard, so the swing only feels up to 1 m/s^2 (0.4 m/s shed over observer.py's 0.4 s ramp).
  const accel: [number, number] = [clamp((vx - round.velocity[0]) / dt, -1, 1), clamp((vy - round.velocity[1]) / dt, -1, 1)];
  round.swing = stepSwing(round.swing, accel, dt, L.swingDampingRatio);
  round.velocity = [vx, vy, (next[2] - round.gantry[2]) / dt];
  round.gantry = next;
  round.tensions = lineTensions(next, mass) ?? round.tensions;
  round.finger = clamp(round.finger + round.fingerSpeed * dt, STRINGMAN.fingerOpen, STRINGMAN.fingerClosed);

  advancePhase(round);
  const held = round.items.find((i) => i.id === round.holding);
  if (held) { const g = gripper(round); held.at = [g[0], g[1]]; }

  round.time += dt;
  if (round.time >= round.limit) finish(round);
  return round;
}

function advancePhase(round: Round) {
  const L = GRUA_LEVEL;
  if (round.phase === "descend" && round.gantry[2] <= L.grabAltitude + 1e-9) round.phase = "close";
  else if (round.phase === "close" && round.finger >= STRINGMAN.fingerClosed) {
    closeOn(round);
    round.phase = round.holding ? "ascend" : "open";
  } else if (round.phase === "open" && round.finger <= STRINGMAN.fingerOpen) {
    round.phase = round.gantry[2] < L.cruiseAltitude - 1e-9 ? "ascend" : "cruise";
  } else if (round.phase === "ascend" && round.gantry[2] >= L.cruiseAltitude - 1e-9) round.phase = "cruise";
  else if (round.phase === "sag") {
    const relieved = peakTension(round.gantry, suspendedMass(round)) <= 0.9 * STRINGMAN.maxSafeTension;
    if (round.sagTime >= L.sagSeconds || relieved) round.phase = "cruise";
  }
}

function closeOn(round: Round) {
  const g = gripper(round);
  const steady = swingAmplitude(round.swing) < GRUA_LEVEL.steadyGrabMeters;
  let best: Item | null = null;
  let bestDistance = Infinity;
  for (const item of round.items) {
    if (item.state !== "floor") continue;
    const d = Math.hypot(item.at[0] - g[0], item.at[1] - g[1]);
    if (d <= ITEM_KINDS[item.kind].tolerance && d < bestDistance) { best = item; bestDistance = d; }
  }
  if (best) {
    best.state = "held";
    round.holding = best.id;
    if (steady) { round.steadyGrabs += 1; round.score += 5; }
  } else round.missedGrabs += 1;
  round.events.push({ type: "grab", itemId: best?.id ?? null, steady: Boolean(best) && steady, at: g });
}

function release(round: Round) {
  const item = round.items.find((i) => i.id === round.holding);
  round.holding = null;
  round.phase = "open";
  if (!item) return;
  const g = gripper(round);
  item.at = [g[0], g[1]];
  const bin = (Object.keys(BINS) as BinId[]).find((id) => Math.hypot(g[0] - BINS[id].at[0], g[1] - BINS[id].at[1]) <= BINS[id].radius);
  const spec = ITEM_KINDS[item.kind];
  const correct = bin === spec.bin;
  const points = correct ? spec.points : 0;
  item.state = bin ?? "floor";
  round.score += points;
  round.events.push({ type: "drop", itemId: item.id, into: bin ?? "floor", correct, points, at: g });
  if (round.items.every((i) => i.state === "tub" || i.state === "trash")) {
    const bonus = 2 * Math.floor((round.limit - round.time) / GRUA_LEVEL.timeScale);
    round.score += bonus;
    round.events.push({ type: "clear", bonus });
    finish(round);
  }
}

function finish(round: Round) {
  if (round.over) return;
  round.over = true;
  round.commanded = [0, 0, 0];
  round.events.push({ type: "over" });
}

function clamp(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)); }

export function lengths(round: Round) { return cableLengths(round.gantry); }

export function bearingTo(round: Round, target: readonly [number, number]) {
  // Same convention as stringman.py get_observation(): angle from +y, relative to spin (0 here).
  const g = gripper(round);
  const dx = target[0] - g[0], dy = target[1] - g[1];
  return { bearing: Math.atan2(dx, dy), distance: Math.hypot(dx, dy) };
}
