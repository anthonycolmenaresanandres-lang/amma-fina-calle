import { GRUA_LEVEL, STRINGMAN } from "./profile";
import { BINS, ITEM_KINDS, newRound, step, type Command, type GruaEvent, type Round } from "./round";
import { GruaRecorder } from "./recorder";

// A scripted pilot. Used by tests to prove a round can be cleared, and to produce
// reference episodes for the Stringman simulator replay check. Never shipped to players.

function target(round: Round): { at: [number, number]; drop: boolean } | null {
  const held = round.items.find((i) => i.id === round.holding);
  if (held) return { at: BINS[ITEM_KINDS[held.kind].bin].at, drop: true };
  const g = round.gantry;
  const floor = round.items.filter((i) => i.state === "floor");
  if (!floor.length) return null;
  floor.sort((a, b) => Math.hypot(a.at[0] - g[0], a.at[1] - g[1]) - Math.hypot(b.at[0] - g[0], b.at[1] - g[1]));
  return { at: floor[0].at, drop: false };
}

export function botCommand(round: Round): Command {
  const goal = target(round);
  if (!goal) return { vx: 0, vy: 0, action: null };
  // Under strain, head for the middle of the room where the lines are steepest.
  const aim = round.straining ? [0, 0] : goal.at;
  const dx = aim[0] - round.gantry[0], dy = aim[1] - round.gantry[1];
  const d = Math.hypot(dx, dy);
  const speed = round.phase === "cruise" ? Math.min(STRINGMAN.maxSpeed, 0.85 * Math.sqrt(2 * STRINGMAN.accel * d), 2 * d) : Math.min(STRINGMAN.nudgeSpeed, 2 * d);
  const vx = d > 1e-6 ? (dx / d) * speed : 0;
  const vy = d > 1e-6 ? (dy / d) * speed : 0;
  const still = Math.hypot(round.velocity[0], round.velocity[1]) < 0.01;
  const ready = round.phase === "cruise" && still && d < (goal.drop ? 0.05 : 0.008) && !round.straining;
  return { vx, vy, action: ready ? "grab" : null };
}

/** Play a full round with the bot, optionally recording it. */
export function playBotRound(seed: number, record = false) {
  const round = newRound(seed);
  const recorder = record ? new GruaRecorder(seed) : null;
  const dt = 1 / GRUA_LEVEL.physicsHz;
  const every = GRUA_LEVEL.physicsHz / GRUA_LEVEL.recordHz;
  let pending: GruaEvent[] = [];
  let n = 0;
  while (!round.over) {
    step(round, botCommand(round), dt);
    pending.push(...round.events);
    round.events = [];
    n += 1;
    if (recorder && (n % every === 0 || round.over)) { recorder.sample(round, pending); pending = []; }
  }
  return { round, recorder };
}
