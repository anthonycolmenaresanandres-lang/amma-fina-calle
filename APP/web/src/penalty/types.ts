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

// Optional image assets for an asset-backed skin (V2 Step 3). Every field is
// optional and falls back to the primitive renderer when absent or if the file
// fails to load — so a skin is never broken by a missing asset (no 404 break).
export type PenaltySkinAssets = {
  /** Image drawn behind the goal (cover-fit, with a contrast scrim). */
  background?: string;
  /** Brand logo drawn as a small corner watermark. */
  logo?: string;
  /** Product-themed ball image, replacing the primitive ball. */
  ball?: string;
};

// A client skin (V2): brand identity + the base canvas palette, plus optional
// image assets. Resolved by id through a registry, mirroring src/lib/brand.ts.
export type PenaltySkin = {
  id: string;
  displayName: string;
  brandName: string;
  skinName: string;
  colors: PenaltyColors;
  assets?: PenaltySkinAssets;
};

export type ShotOutcome = "goal" | "save" | "miss";

// How the player aims/shoots. "tap" is the V1 default; "swipe"/"auto" use the
// assisted swipe gesture (with a tap fallback). The input layer only selects an
// aim zone — it never changes scoring or keeper logic.
export type InputMode = "tap" | "swipe" | "auto";
