import type { PenaltyColors, PenaltyLevel, ZoneConfig } from "./types";

// Six aim targets: three columns across the goal, two height bands.
// Top corners are the high-reward zones; the keeper struggles to reach them,
// but they also carry the only meaningful miss risk.
export const PENALTY_ZONES: ZoneConfig[] = [
  { id: "tl", column: 0, row: 0, xPct: 0.16, yPct: 0.3, label: "Top Left" },
  { id: "tc", column: 1, row: 0, xPct: 0.5, yPct: 0.26, label: "Top Center" },
  { id: "tr", column: 2, row: 0, xPct: 0.84, yPct: 0.3, label: "Top Right" },
  { id: "bl", column: 0, row: 1, xPct: 0.16, yPct: 0.72, label: "Bottom Left" },
  { id: "bc", column: 1, row: 1, xPct: 0.5, yPct: 0.74, label: "Bottom Center" },
  { id: "br", column: 2, row: 1, xPct: 0.84, yPct: 0.72, label: "Bottom Right" },
];

// Default Fina Calle palette. The base for the default skin; per-level tweaks
// (see PENALTY_LEVELS colorOverrides) and other skins layer on top of this.
export const baseColors: PenaltyColors = {
  bg: 0x04130a,
  sky: 0x123b2a,
  grass: 0x123d18,
  grassLine: 0x18491f,
  goalFrame: 0xf4f6f7,
  net: 0xbfd6c6,
  ball: 0xfdfdfd,
  ballSpot: 0x0a2a14,
  keeper: 0xd8b36d,
  keeperAccent: 0x7a4f1c,
  accent: 0xd8b36d,
  goalText: "#7CFFB0",
  saveText: "#ff8a6b",
  missText: "#f4d35e",
  text: "#f4f6f7",
};

const baseRules: PenaltyLevel["rules"] = {
  totalShots: 5,
  keeperReadColumn: 0.5,
  keeperReadRow: 0.5,
  colMatchSave: 0.78,
  rowSaveFactor: [0.42, 1],
  sameRowBonus: 1.25,
  maxSaveProbability: 0.94,
  missChance: [0.12, 0.02],
  ballFlightMs: 460,
  keeperDiveMs: 420,
  resultHoldMs: 1150,
};

// Difficulty definitions. Levels carry rules + an optional palette tweak; brand
// identity and the base palette live on the active skin (see skin/skins.ts).
export const PENALTY_LEVELS: PenaltyLevel[] = [
  {
    id: "street-keeper",
    levelNumber: 1,
    levelName: "Street Keeper",
    selectText: "Warm-up keeper. Slow to read the shot — pick a corner and bury it.",
    rules: {
      ...baseRules,
      keeperReadColumn: 0.34,
      keeperReadRow: 0.4,
      colMatchSave: 0.62,
      missChance: [0.08, 0.015],
      keeperDiveMs: 470,
    },
  },
  {
    id: "club-keeper",
    levelNumber: 2,
    levelName: "Club Keeper",
    selectText: "Reads your run-up. Mix your placement or the easy side gets eaten.",
    rules: {
      ...baseRules,
    },
  },
  {
    id: "pro-keeper",
    levelNumber: 3,
    levelName: "Pro Keeper",
    selectText: "Fast hands, guesses well. Only top corners beat him consistently.",
    // The toughest keeper is tinted red over whatever skin is active.
    colorOverrides: {
      keeper: 0xe46a4f,
      keeperAccent: 0x7a1f12,
    },
    rules: {
      ...baseRules,
      keeperReadColumn: 0.66,
      keeperReadRow: 0.58,
      colMatchSave: 0.86,
      rowSaveFactor: [0.5, 1],
      maxSaveProbability: 0.95,
      missChance: [0.15, 0.03],
      keeperDiveMs: 360,
      ballFlightMs: 430,
    },
  },
];

export const DEFAULT_PENALTY_LEVEL = PENALTY_LEVELS[0];
