/**
 * Route-local original courtyard game. Mass-tier lookup, arena clamping and the
 * committed sink/grow sequence are adapted from owned DEMOS/pocket-cafe/gameplay.ts
 * and Game.tsx. No shared engine or unrelated client is imported or changed.
 */
export const WORLD_WIDTH = 420;
export const WORLD_HEIGHT = 560;
export const ROUND_MS = 55_000;
export type HoleMode = "ready" | "running" | "paused" | "result";
export type HoleKind = "lime" | "chili" | "cup" | "taco" | "planter" | "chair" | "table";
export type HoleItem = {
  id: number; kind: HoleKind; x: number; y: number; radius: number;
  points: number; mass: number; collected: boolean; sink: number;
  sinkX: number; sinkY: number; rotation: number;
};
export type HoleState = {
  mode: HoleMode; elapsed: number; remaining: number; score: number; mass: number;
  tier: number; radius: number; x: number; y: number; items: HoleItem[];
  collected: number; total: number; lastCollectAt: number; feedback: string; cleared: boolean;
};
export type HoleInput = { x: number; y: number };
export const GROWTH = [
  { tier: 1, mass: 0, radius: 16, speed: 135, name: "Little appetite", eats: "Limes & chiles" },
  { tier: 2, mass: 24, radius: 24, speed: 145, name: "Snack time", eats: "Cups & tacos" },
  { tier: 3, mass: 75, radius: 34, speed: 155, name: "Getting hungry", eats: "Planters" },
  { tier: 4, mass: 170, radius: 46, speed: 165, name: "Big appetite", eats: "Chairs" },
  { tier: 5, mass: 300, radius: 60, speed: 175, name: "Whole courtyard", eats: "Umbrella tables" },
] as const;
const PROPS: Record<HoleKind, { radius: number; points: number; mass: number; label: string }> = {
  lime: { radius: 7, points: 10, mass: 2, label: "lime" },
  chili: { radius: 8, points: 15, mass: 3, label: "chile" },
  cup: { radius: 14, points: 40, mass: 8, label: "cup" },
  taco: { radius: 17, points: 55, mass: 10, label: "taco" },
  planter: { radius: 23, points: 100, mass: 18, label: "planter" },
  chair: { radius: 31, points: 160, mass: 30, label: "chair" },
  table: { radius: 43, points: 300, mass: 60, label: "umbrella table" },
};

/** Same descending threshold lookup as the owned Pocket Cafe collector. */
export function growthForMass(mass: number) {
  for (let index = GROWTH.length - 1; index >= 0; index--) {
    if (mass >= GROWTH[index].mass) return GROWTH[index];
  }
  return GROWTH[0];
}

export function canSwallow(item: HoleItem, radius: number): boolean {
  return !item.collected && item.sink === 0 && item.radius <= radius * 0.82;
}

function createItems(): HoleItem[] {
  const items: HoleItem[] = [];
  const place = (kind: HoleKind, x: number, y: number) => {
    items.push({ id: items.length, kind, x, y, ...PROPS[kind], collected: false, sink: 0, sinkX: x, sinkY: y, rotation: (items.length * 2.39996) % (Math.PI * 2) });
  };
  // Fixed placement keeps replay fair; the small trail begins beside the player.
  const small = [[186,493],[234,493],[163,468],[257,468],[190,440],[230,440],[55,485],[365,485],[55,425],[365,425],[210,390],[210,350],[184,323],[236,323],[210,280],[210,245],[187,205],[233,205],[210,170],[210,135],[184,105],[236,105],[210,75],[210,35]];
  small.forEach(([x,y], index) => place(index % 2 ? "chili" : "lime", x, y));
  const snacks = [[125,460],[295,460],[85,520],[335,520],[150,405],[270,405],[155,330],[265,330],[145,250],[275,250],[155,170],[265,170]];
  snacks.forEach(([x,y], index) => place(index % 2 ? "taco" : "cup", x, y));
  [[40,55],[380,55],[44,150],[376,150],[44,305],[376,305],[155,375],[265,375]].forEach(([x,y]) => place("planter", x, y));
  [[90,205],[330,205],[86,395],[334,395],[150,55],[270,55]].forEach(([x,y]) => place("chair", x, y));
  [[105,115],[315,115],[105,285],[315,285]].forEach(([x,y]) => place("table", x, y));
  return items;
}

export function createHoleState(): HoleState {
  const items = createItems();
  return { mode: "ready", elapsed: 0, remaining: 55, score: 0, mass: 0, tier: 1, radius: 16, x: 210, y: 500, items, collected: 0, total: items.length, lastCollectAt: -1000, feedback: "Start with limes and chiles", cleared: false };
}

export class CourtyardRound {
  readonly state: HoleState;
  private anchor = 0;
  private elapsedBase = 0;
  private lastTick = 0;
  private feedbackUntil = 0;

  constructor() { this.state = createHoleState(); }

  start(now: number): void {
    Object.assign(this.state, createHoleState(), { mode: "running" });
    this.anchor = now;
    this.elapsedBase = 0;
    this.lastTick = now;
    this.feedbackUntil = 0;
  }

  pause(now: number): void {
    if (this.state.mode !== "running") return;
    this.step(now, { x: 0, y: 0 });
    if (this.state.mode !== "running") return;
    this.elapsedBase = this.state.elapsed;
    this.state.mode = "paused";
  }

  resume(now: number): void {
    if (this.state.mode !== "paused") return;
    this.anchor = now;
    this.lastTick = now;
    this.state.mode = "running";
  }

  step(now: number, input: HoleInput): void {
    const state = this.state;
    if (state.mode !== "running") return;
    state.elapsed = Math.min(ROUND_MS, this.elapsedBase + Math.max(0, now - this.anchor));
    state.remaining = Math.max(0, (ROUND_MS - state.elapsed) / 1000);
    // Bounded substeps prevent a fast drag from skipping a small collectible.
    let delta = Math.min(0.12, Math.max(0, now - this.lastTick) / 1000);
    this.lastTick = now;
    if (state.elapsed >= ROUND_MS) { this.finish(false); return; }
    while (delta > 0) {
      const step = Math.min(delta, 1 / 90);
      this.moveAndCollect(step, input);
      delta -= step;
      if (state.mode !== "running") break;
    }
  }

  private moveAndCollect(dt: number, input: HoleInput): void {
    const state = this.state;
    const growth = growthForMass(state.mass);
    const length = Math.hypot(input.x, input.y);
    const speed = growth.speed / Math.max(1, length);
    const margin = state.radius + 8;
    // Arena clamp adapted from Pocket Cafe; there are no hidden collision walls.
    state.x = Math.max(margin, Math.min(WORLD_WIDTH - margin, state.x + input.x * speed * dt));
    state.y = Math.max(margin, Math.min(WORLD_HEIGHT - margin, state.y + input.y * speed * dt));
    for (const item of state.items) {
      if (item.collected) continue;
      if (item.sink > 0) {
        item.sink = Math.min(1, item.sink + dt * 4.5);
        item.sinkX = state.x;
        item.sinkY = state.y;
        if (item.sink >= 1) item.collected = true;
        continue;
      }
      const distance = Math.hypot(item.x - state.x, item.y - state.y);
      // Both size eligibility and full footprint containment must hold.
      if (canSwallow(item, state.radius) && distance + item.radius <= state.radius) {
        item.sink = 0.01;
        item.sinkX = state.x;
        item.sinkY = state.y;
        this.capture(item);
      } else if (item.radius > state.radius * 0.82 && distance < item.radius && state.elapsed > this.feedbackUntil) {
        state.feedback = `Grow first: this ${PROPS[item.kind].label} is too big`;
        this.feedbackUntil = state.elapsed + 900;
      }
    }
    if (state.collected === state.total) this.finish(true);
  }

  private capture(item: HoleItem): void {
    const state = this.state;
    const previousTier = state.tier;
    state.score += item.points;
    state.mass += item.mass;
    state.collected += 1;
    state.lastCollectAt = state.elapsed;
    const growth = growthForMass(state.mass);
    state.tier = growth.tier;
    state.radius = growth.radius;
    state.feedback = growth.tier > previousTier ? `Grown! Now swallow ${growth.eats.toLowerCase()}` : `+${item.points} ${PROPS[item.kind].label}`;
    this.feedbackUntil = state.elapsed + (growth.tier > previousTier ? 1600 : 650);
  }

  private finish(cleared: boolean): void {
    this.state.mode = "result";
    this.state.cleared = cleared;
    this.state.items.forEach(item => { if (item.sink > 0) { item.sink = 1; item.collected = true; } });
    this.state.feedback = cleared ? "The whole courtyard is yours!" : "That was a hungry little hole.";
  }
}
