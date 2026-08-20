// Café Rush — type contracts for the reusable "catch the falling items" game.
//
// Mirrors the Penalty Shootout architecture (src/penalty): a FROZEN engine +
// LAYERED skin. Gameplay never changes per client — only the look (palette,
// falling-item art, catcher art, brand copy) changes via a CafeRushSkin.
// Every visual is optional and primitive-drawn by default, so a skin can never
// 404 or break play (per PRODUCT_MODULES/GAME_CUSTOMIZATION_PROTOCOL.md).

/** Canvas palette (Phaser hex ints) + a few CSS strings for on-canvas text. */
export type CafeRushColors = {
  /** Scene background (top of the café). */
  bg: number;
  /** Counter / floor band the catcher slides along. */
  counter: number;
  counterEdge: number;
  /** Catcher body + rim. */
  catcher: number;
  catcherRim: number;
  /** Primary brand accent (HUD rules, catch flashes). */
  accent: number;
  /** CSS colors for floating feedback + status text. */
  scoreText: string;
  goodText: string;
  badText: string;
  text: string;
};

/** How a falling item is drawn as a primitive when it has no image asset. */
export type ItemShape = "cup" | "iced" | "pastry" | "disc" | "wedge" | "spill";

/**
 * One kind of falling item. `good` items score when caught; `bad` items (a
 * spill / too-hot cup) cost points when caught and are safe to let fall.
 * `emoji` is a last-resort primitive glyph; `shape` is the preferred vector
 * look. `asset` is an optional image path (primitive fallback if missing).
 */
export type CafeRushItem = {
  id: string;
  kind: "good" | "bad";
  /** Score delta when this item is CAUGHT (good > 0, bad < 0). */
  points: number;
  /** Primitive vector look. */
  shape: ItemShape;
  /** Fill + accent for the primitive draw. */
  fill: number;
  accent: number;
  /** Short label shown under the item / in the legend (e.g. "Latte"). */
  label: string;
  /** Optional glyph fallback if a skin prefers emoji over vector. */
  emoji?: string;
  /** Optional bitmap art; missing/blocked file falls back to the primitive. */
  asset?: string;
  /** Relative spawn weight (default 1). */
  weight?: number;
};

/** Optional bitmap assets for a skin. All optional → primitive fallback. */
export type CafeRushAssets = {
  /** Corner brand mark (real approved logo file only — never AI-generated). */
  logo?: string;
  /** Full-bleed café backdrop behind the play area. */
  background?: string;
  /** Catcher (tray / cup / basket) art. */
  catcher?: string;
};

/**
 * A client skin: brand identity + palette + the falling-item set + optional
 * art. `chrome` carries CSS strings for the React wrapper so the start screen
 * and HUD render in the same design language as the Colattao standard.
 */
export type CafeRushSkin = {
  id: string;
  displayName: string;
  brandName: string;
  skinName: string;
  /** What the catcher is called in copy ("cup", "tray", "basket"). */
  catcherName: string;
  colors: CafeRushColors;
  items: CafeRushItem[];
  assets?: CafeRushAssets;
  /** CSS tokens for the React chrome (start screen + HUD), Colattao-derived. */
  chrome: CafeRushChrome;
  /** Prospect demos render a "pending client approval" banner. */
  prospect?: boolean;
};

/** CSS color tokens for the React wrapper — the Colattao editorial look. */
export type CafeRushChrome = {
  pageBg: string;
  panelBg: string;
  text: string;
  subtext: string;
  accent: string;
  accentDeep: string;
  border: string;
  onAccent: string;
};

/** Frozen round rules — the stable engine layer. Never edited per client. */
export type CafeRushRules = {
  /** Round length in seconds. */
  durationSec: number;
  /** Score needed to win the round. */
  targetScore: number;
  /** Milliseconds between spawns at the start of the round. */
  spawnEveryMs: number;
  /** Spawn cadence floor as the round heats up. */
  spawnMinMs: number;
  /** How quickly the cadence tightens (ms shaved per spawn). */
  spawnRampMs: number;
  /** Item fall speed in canvas-heights per second (min/max). */
  fallSpeed: [number, number];
  /** Probability a spawned item is a `bad` item. */
  badChance: number;
  /** Missing a good item costs this many points (0 = only bad-catches hurt). */
  dropPenalty: number;
};

export type CafeRushLevel = {
  id: string;
  levelNumber: number;
  levelName: string;
  selectText: string;
  rules: CafeRushRules;
};
