// Canonical Penalty Shootout background authoring template — the "Colattao Rush"
// 941×1672 mobile-background discipline, made machine-readable. Single source for
// the authoring canvas, the fixed-shell zones, the behind-goal ad zone, and the
// visual safe lanes a background must respect to fit the game on every phone.
//
// IMPORTANT: the RUNTIME goal/spot geometry lives in `../geometry.ts`
// (computeLayout). The GOAL/SPOT fractions here MIRROR those values for
// authoring + tooling and MUST be kept in sync if computeLayout ever changes.
// This file is presentation/authoring metadata — it does NOT drive gameplay,
// scoring, keeper logic, or input.
//
// Full spec + zone tables + derivations: ASSET_SPECS/PENALTY_BACKGROUND_TEMPLATE.md

/** Fixed authoring canvas every Penalty background is composed at (portrait). */
export const AUTHORING_CANVAS = { width: 941, height: 1672 } as const;

/** Goal mouth + penalty spot as fractions of the canvas (mirror geometry.ts). */
export const GOAL = { leftPct: 0.13, rightPct: 0.87, topPct: 0.14, bottomPct: 0.42 } as const;
export const SPOT = { xPct: 0.5, yPct: 0.82 } as const;

/**
 * Horizontal safe lane. Cover-fit center-crops the SIDES of a 941×1672 image on
 * tall phones (up to ~12% per side at the tallest supported portrait aspect).
 * Keep all critical content within this lane; the outer columns are croppable
 * "negative" space. (Vertical is height-driven for portrait phones → no vertical
 * crop, so vertical fractions map 1:1.)
 */
export const HORIZONTAL_SAFE = { innerLeftPct: 0.12, innerRightPct: 0.88 } as const;

/** A rectangular zone as canvas fractions (x optional = full width). */
export type TemplateZone = {
  topPct: number;
  bottomPct: number;
  leftPct?: number;
  rightPct?: number;
};

/**
 * Named composition zones (fractions of the canvas). See the spec doc for the
 * authoring rules per zone. "negative" zones must stay free of critical detail.
 */
export const ZONES: Record<string, TemplateZone> = {
  // Fixed scoreboard / menu strip — reserved shell chrome (negative for art).
  topStrip: { topPct: 0.0, bottomPct: 0.08 },
  // Above the crossbar — crowd / sky / atmosphere (and the ad-zone hero band).
  crowdHeader: { topPct: 0.08, bottomPct: 0.14 },
  // Reserved behind-goal ad backdrop (extends under the top strip chrome).
  behindGoalAd: { topPct: 0.05, bottomPct: 0.42, leftPct: 0.06, rightPct: 0.94 },
  // Drawn goal mouth / net.
  goalFrame: { topPct: 0.14, bottomPct: 0.42, leftPct: 0.13, rightPct: 0.87 },
  // Keeper rest/standing area (dives extend across the full goal width).
  keeperLane: { topPct: 0.29, bottomPct: 0.42, leftPct: 0.3, rightPct: 0.7 },
  // Ball flight corridor spot→goal (shots fan to the goal corners above 42%).
  ballPath: { topPct: 0.42, bottomPct: 0.82, leftPct: 0.35, rightPct: 0.65 },
  // Penalty spot, kicker, power meter, hint text, swipe area (foreground turf).
  lowerInteraction: { topPct: 0.82, bottomPct: 1.0 },
} as const;

/**
 * The behind-goal ad-zone PANEL the renderer draws (Campaign Pack Step 2).
 * Centralized here so the renderer and the authoring template share ONE
 * definition. Bottom anchors to the live goal line (layout.goalBottom).
 * Values are the Step 2 shipped values (this is a value-preserving centralization).
 */
export const AD_ZONE_PANEL = {
  leftPct: 0.06,
  rightPct: 0.94,
  // Stored explicitly (not rightPct − leftPct) so the panel width is bit-exact
  // to the Step 2 shipped value (0.88), avoiding floating-point drift.
  widthPct: 0.88,
  topPct: 0.05,
  scrimAlpha: 0.18,
  featherPct: 0.3, // fraction of panel height that feathers into the grass
  featherBands: 14,
  featherMaxAlpha: 0.9,
} as const;

/** Convert a canvas fraction to a pixel on the authoring canvas. */
export const pxAt = (pct: number, axis: "x" | "y"): number =>
  Math.round(pct * (axis === "x" ? AUTHORING_CANVAS.width : AUTHORING_CANVAS.height));

/**
 * Deterministic fit solver. Given where the goal sits in an authored PORTRAIT
 * background (top/bottom as fractions of the IMAGE height), return the
 * BackgroundFit { scale, offsetYPct } that lands that goal on the template goal
 * band (14–42%) under the game's height-driven cover-fit.
 *
 * Derivation (matches renderer/positionAssets): a point at image-fraction v maps
 * to canvas-fraction 0.5 + offsetYPct + (v − 0.5)·scale. Solving for the goal top
 * and bottom gives scale = 0.28 / imageGoalHeight and the offset below.
 *
 * Validated against the Stadium skin (photo goal ~0.11–0.33 → {scale 1.27,
 * offsetY 0.136} ≈ the shipped {1.3, 0.13}). Pure helper — not wired to existing
 * skins; a tool for authoring/retuning new backgrounds once the goal is measured.
 */
export function backgroundFitForMeasuredGoal(
  goalTopFracOfImage: number,
  goalBottomFracOfImage: number,
): { scale: number; offsetYPct: number } {
  const targetH = GOAL.bottomPct - GOAL.topPct; // 0.28
  const imageGoalH = Math.max(1e-6, goalBottomFracOfImage - goalTopFracOfImage);
  const scale = targetH / imageGoalH;
  const offsetYPct = GOAL.topPct - 0.5 - (goalTopFracOfImage - 0.5) * scale;
  return { scale: Number(scale.toFixed(4)), offsetYPct: Number(offsetYPct.toFixed(4)) };
}
