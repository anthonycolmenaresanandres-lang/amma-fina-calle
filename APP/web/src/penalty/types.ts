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
  brandName: string;
  skinName: string;
  selectText: string;
  colors: PenaltyColors;
  rules: PenaltyRules;
};

export type ShotOutcome = "goal" | "save" | "miss";
