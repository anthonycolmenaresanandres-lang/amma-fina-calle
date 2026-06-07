export type Column = 0 | 1 | 2; // left, center, right
export type RowBand = 0 | 1; // 0 = top, 1 = bottom

export type ZoneId = "tl" | "tc" | "tr" | "bl" | "bc" | "br";

export type ZoneConfig = {
  id: ZoneId;
  column: Column;
  row: RowBand;
  // Center of the target, expressed as a fraction (0..1) inside the goal frame.
  xPct: number;
  yPct: number;
  label: string;
};

export type PenaltyColors = {
  bg: number;
  sky: number;
  grass: number;
  grassLine: number;
  goalFrame: number;
  net: number;
  ball: number;
  ballSpot: number;
  keeper: number;
  keeperAccent: number;
  accent: number;
  goalText: string;
  saveText: string;
  missText: string;
  text: string;
};

export type PenaltyRules = {
  totalShots: number;

  // Keeper read: probability the keeper commits to the shot's column / row.
  keeperReadColumn: number;
  keeperReadRow: number;

  // Save model (only relevant when the keeper guessed the right column).
  colMatchSave: number; // base save probability on a column match
  rowSaveFactor: [number, number]; // multiplier by row band [top, bottom]
  sameRowBonus: number; // extra multiplier when the keeper also matched the row band
  maxSaveProbability: number; // hard cap so a corner is never a guaranteed save

  // Risk: probability a shot at a given row band flies wide / over.
  missChance: [number, number];

  // Animation timing (ms).
  ballFlightMs: number;
  keeperDiveMs: number;
  resultHoldMs: number;
};

export type PenaltyLevel = {
  id: string;
  levelNumber: number;
  levelName: string;
  selectText: string;
  // Optional per-level palette tweaks layered over the active skin (e.g. a
  // tougher keeper tinted red). Omitted = use the skin's colors unchanged.
  colorOverrides?: Partial<PenaltyColors>;
  rules: PenaltyRules;
};

// A color-only client skin (V2 Step 2): brand identity + the base canvas
// palette. Asset-backed skins extend this in a later step. Resolved by id
// through a registry, mirroring src/lib/brand.ts.
export type PenaltySkin = {
  id: string;
  displayName: string;
  brandName: string;
  skinName: string;
  colors: PenaltyColors;
};

export type ShotOutcome = "goal" | "save" | "miss";
