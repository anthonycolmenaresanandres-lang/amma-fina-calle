import { CAFERUSH_LEVELS } from "../caferush/config";
import type { CafeRushCatch, CafeRushLevel, CafeRushSpawn } from "../caferush/types";

export const BODEGA_ROUND_VERSION = 5;
export const BODEGA_ITEM_SCALE = 1.75;
export const BODEGA_ITEM_RADIUS = 0.075 * BODEGA_ITEM_SCALE;
export const BODEGA_POINTS: Record<string, number> = {
  spanish: 10, green: 10, bites: 15, vinyl: 20, muffin: 25, "bad-vibes": 0,
};
export const MUFFIN_TERMS = "One free muffin per person for this promotion. Redeem in store only. Expires after one use or at the end of the day earned (Virginia Beach time), whichever comes first.";

export const BODEGA_CHAPTERS = [
  { id: "cafecito", title: "Cafecito", keepsake: "Spanish latte", required: "spanish", durationSec: 10, targetScore: 60, spawnEveryMs: 650, spawnMinMs: 610, fallSpeed: [1.02, 1.26] as [number, number], hazardPeriod: 0, pool: ["spanish", "green"] },
  { id: "morning-rush", title: "Morning Rush", keepsake: "Green café drink", required: "green", durationSec: 10, targetScore: 80, spawnEveryMs: 560, spawnMinMs: 520, fallSpeed: [1.2, 1.44] as [number, number], hazardPeriod: 12, pool: ["spanish", "green", "bites"] },
  { id: "bakery-break", title: "Bakery Break", keepsake: "Cereal bites", required: "bites", durationSec: 10, targetScore: 100, spawnEveryMs: 480, spawnMinMs: 440, fallSpeed: [1.38, 1.68] as [number, number], hazardPeriod: 9, pool: ["spanish", "green", "bites"] },
  { id: "vinyl-sessions", title: "Vinyl Sessions", keepsake: "Vinyl record", required: "vinyl", durationSec: 10, targetScore: 120, spawnEveryMs: 420, spawnMinMs: 380, fallSpeed: [1.56, 1.92] as [number, number], hazardPeriod: 7, pool: ["spanish", "green", "bites", "vinyl"] },
  { id: "last-order", title: "The Last Order", keepsake: "Golden muffin", required: "muffin", durationSec: 10, targetScore: 150, spawnEveryMs: 360, spawnMinMs: 320, fallSpeed: [1.74, 2.16] as [number, number], hazardPeriod: 5, pool: ["spanish", "green", "bites", "vinyl", "muffin"] },
] as const;

export const BODEGA_CAMPAIGN_MS = BODEGA_CHAPTERS.reduce((sum, chapter) => sum + chapter.durationSec * 1000, 0);
export const BODEGA_SESSION_MAX_MS = 10 * 60 * 1000;
export type BodegaRun = { chapterIndex: number; events: CafeRushCatch[] };

export const BODEGA_LEVELS: CafeRushLevel[] = BODEGA_CHAPTERS.map((chapter, chapterIndex) => ({
  ...CAFERUSH_LEVELS[0],
  id: `bodega-${chapter.id}`, levelNumber: chapterIndex + 1, levelName: chapter.title,
  rules: {
    ...CAFERUSH_LEVELS[0].rules,
    durationSec: chapter.durationSec, targetScore: chapter.targetScore,
    spawnEveryMs: chapter.spawnEveryMs, spawnMinMs: chapter.spawnMinMs,
    spawnRampMs: 1, fallSpeed: chapter.fallSpeed,
    finishAtTarget: false, badChance: chapter.hazardPeriod ? 1 / chapter.hazardPeriod : 0,
    dropPenalty: 0, failOnBadCatch: true,
  },
}));

/** Five deterministic schedules from one server seed. Every chapter offers its required item repeatedly. */
export function makeBodegaRound(seed: number, chapterIndex: number): CafeRushSpawn[] {
  const chapter = BODEGA_CHAPTERS[chapterIndex];
  if (!chapter || !Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new Error("Invalid chapter seed");
  let state = (seed ^ Math.imul(chapterIndex + 1, 0x9e3779b9)) >>> 0;
  const random = () => { state = (Math.imul(1664525, state) + 1013904223) >>> 0; return state / 4294967296; };
  const rules = BODEGA_LEVELS[chapterIndex].rules;
  const result: CafeRushSpawn[] = [];
  const hazardOffset = chapter.hazardPeriod ? Math.floor(random() * chapter.hazardPeriod) : -1;
  let atMs = 250;
  const finalFlightMs = Math.ceil((1 + BODEGA_ITEM_RADIUS) / rules.fallSpeed[0] * 1000);
  for (let id = 0; ; id += 1) {
    if (id > 0) atMs += Math.max(rules.spawnMinMs, rules.spawnEveryMs - id * rules.spawnRampMs);
    if (atMs > chapter.durationSec * 1000 - finalFlightMs) break;
    const required = id % 7 === 2;
    const hazard = !required && chapter.hazardPeriod > 0 && atMs >= 1400 && id % chapter.hazardPeriod === hazardOffset;
    const itemId = required ? chapter.required : hazard ? "bad-vibes" : chapter.pool[Math.floor(random() * chapter.pool.length)];
    const margin = BODEGA_ITEM_RADIUS * 1.3;
    let xFrac = margin + random() * (1 - 2 * margin);
    const previous = result.at(-1);
    if (previous && Math.abs(previous.xFrac - xFrac) < margin * 2) xFrac = previous.xFrac < 0.5 ? 1 - margin : margin;
    const progress = atMs / (chapter.durationSec * 1000);
    const speed = rules.fallSpeed[0] + (rules.fallSpeed[1] - rules.fallSpeed[0]) * (progress * 0.7 + random() * 0.3);
    result.push({ id, atMs, itemId, speed, xFrac });
  }
  return result;
}

function verifyChapter(seed: number, chapterIndex: number, input: unknown): { score: number; requiredCaught: boolean } | null {
  const chapter = BODEGA_CHAPTERS[chapterIndex];
  if (!chapter || !Array.isArray(input)) return null;
  const plan = makeBodegaRound(seed, chapterIndex);
  if (input.length > plan.length) return null;
  const seen = new Set<number>();
  let previousTime = -1;
  let score = 0;
  let requiredCaught = false;
  for (const candidate of input) {
    if (!candidate || typeof candidate !== "object") return null;
    const event = candidate as CafeRushCatch;
    if (!Number.isInteger(event.id) || !Number.isInteger(event.atMs) || seen.has(event.id)) return null;
    const spawn = plan[event.id];
    if (!spawn || event.atMs < previousTime || event.atMs < 0 || event.atMs >= chapter.durationSec * 1000) return null;
    if (spawn.itemId === "bad-vibes") return null;
    const y = -BODEGA_ITEM_RADIUS + spawn.speed * (event.atMs - spawn.atMs) / 1000;
    if (y < -0.002 || y > 1.002) return null;
    seen.add(event.id);
    previousTime = event.atMs;
    score += BODEGA_POINTS[spawn.itemId];
    if (spawn.itemId === chapter.required) requiredCaught = true;
  }
  return { score, requiredCaught };
}

/** All five chapters must be completed, in order, before a muffin claim can issue. */
export function verifyBodegaCampaign(seed: number, input: unknown, wallElapsedMs: number): { total: number; chapterScores: number[] } | null {
  if (!Number.isFinite(wallElapsedMs) || wallElapsedMs < BODEGA_CAMPAIGN_MS || wallElapsedMs > BODEGA_SESSION_MAX_MS || !Array.isArray(input) || input.length !== BODEGA_CHAPTERS.length) return null;
  const chapterScores: number[] = [];
  for (let chapterIndex = 0; chapterIndex < BODEGA_CHAPTERS.length; chapterIndex += 1) {
    const run = input[chapterIndex] as BodegaRun | undefined;
    if (!run || run.chapterIndex !== chapterIndex) return null;
    const result = verifyChapter(seed, chapterIndex, run.events);
    if (!result || result.score < BODEGA_CHAPTERS[chapterIndex].targetScore || !result.requiredCaught) return null;
    chapterScores.push(result.score);
  }
  return { total: chapterScores.reduce((sum, score) => sum + score, 0), chapterScores };
}
