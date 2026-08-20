// Café Rush — frozen engine config: difficulty rounds + pure helpers.
// This is the "stable engine" layer. Rules, scoring, and rating never change
// per client (mirrors src/penalty/config.ts). Only skins (skins.ts) vary.

import type { CafeRushLevel, CafeRushRules } from "./types";

const baseRules: CafeRushRules = {
  durationSec: 45,
  targetScore: 120,
  spawnEveryMs: 900,
  spawnMinMs: 380,
  spawnRampMs: 6,
  fallSpeed: [0.28, 0.42],
  badChance: 0.16,
  dropPenalty: 0,
};

// Three rounds mirror the penalty engine's Street / Club / Pro ladder, so a
// venue's collectible/reward loop can map 1:1 to a round the way the Colattanini
// campaign maps to keeper levels.
export const CAFERUSH_LEVELS: CafeRushLevel[] = [
  {
    id: "warmup",
    levelNumber: 1,
    levelName: "Morning Rush",
    selectText: "Easy pour. Catch the drinks and pastries — spills are rare.",
    rules: {
      ...baseRules,
      durationSec: 45,
      targetScore: 100,
      spawnEveryMs: 950,
      spawnMinMs: 460,
      badChance: 0.12,
      fallSpeed: [0.24, 0.36],
    },
  },
  {
    id: "midday",
    levelNumber: 2,
    levelName: "Midday Rush",
    selectText: "The line builds. Faster pours and more spills to dodge.",
    rules: {
      ...baseRules,
      targetScore: 130,
      spawnEveryMs: 820,
      spawnMinMs: 360,
      badChance: 0.18,
      fallSpeed: [0.3, 0.46],
    },
  },
  {
    id: "closing",
    levelNumber: 3,
    levelName: "Closing Rush",
    selectText: "Full house. Everything falls fast — keep the good orders, ditch the spills.",
    rules: {
      ...baseRules,
      durationSec: 50,
      targetScore: 170,
      spawnEveryMs: 700,
      spawnMinMs: 300,
      spawnRampMs: 8,
      badChance: 0.24,
      fallSpeed: [0.36, 0.54],
      dropPenalty: 2,
    },
  },
];

export const DEFAULT_CAFERUSH_LEVEL = CAFERUSH_LEVELS[0];

/** Pure: current spawn interval given how many items have already spawned. */
export function spawnIntervalMs(rules: CafeRushRules, spawnedCount: number): number {
  return Math.max(rules.spawnMinMs, rules.spawnEveryMs - spawnedCount * rules.spawnRampMs);
}

/** Pure: end-of-round rating from score vs. target. */
export function ratingFor(score: number, target: number): string {
  if (score >= target) return "Barista of the day!";
  if (score >= target * 0.75) return "Great shift";
  if (score >= target * 0.5) return "Getting the hang of it";
  return "Keep practicing";
}
