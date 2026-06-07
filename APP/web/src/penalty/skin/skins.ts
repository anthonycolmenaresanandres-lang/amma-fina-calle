// Color-only Penalty Shootout skins (V2 Step 2). A skin is brand identity + a
// canvas palette — no image assets yet. Resolved by id with a default fallback,
// mirroring getBrandAssets() in src/lib/brand.ts. Skin ids intentionally match
// the brand registry keys (e.g. "colattao"), so a later asset-backed skin can
// pull logo/photo art from getBrandAssets(skin.id) without renaming anything.

import type { PenaltyColors, PenaltyLevel, PenaltySkin } from "../types";
import { baseColors } from "../config";

// Default skin = the Fina Calle palette the game shipped with. Selecting this
// reproduces V1 colors exactly.
export const DEFAULT_PENALTY_SKIN: PenaltySkin = {
  id: "fina-calle",
  displayName: "Fina Calle",
  brandName: "Fina Calle Penalty Engine",
  skinName: "Street Shootout",
  colors: baseColors,
};

// Warm café palette for Colattao. Color-only — no assets in this step.
const colattaoColors: PenaltyColors = {
  bg: 0x1b0f07,
  sky: 0x3a2616,
  grass: 0x14331a,
  grassLine: 0x1b401f,
  goalFrame: 0xf4e6cc,
  net: 0xd8c3a3,
  ball: 0xfdfdfd,
  ballSpot: 0x2a1a0e,
  keeper: 0xc98a3c,
  keeperAccent: 0x6b3f17,
  accent: 0xd8a24c,
  goalText: "#8fe6a8",
  saveText: "#ff8a6b",
  missText: "#f4d35e",
  text: "#f4e6cc",
};

export const COLATTAO_PENALTY_SKIN: PenaltySkin = {
  id: "colattao",
  displayName: "Colattao",
  brandName: "Colattao Penalty Shootout",
  skinName: "Café Shootout",
  colors: colattaoColors,
};

export const PENALTY_SKINS: PenaltySkin[] = [DEFAULT_PENALTY_SKIN, COLATTAO_PENALTY_SKIN];

const PENALTY_SKINS_BY_ID: Record<string, PenaltySkin> = Object.fromEntries(
  PENALTY_SKINS.map((skin) => [skin.id, skin]),
);

/** Look up a skin by id, falling back to the default (same shape as getBrandAssets). */
export function getPenaltySkin(id?: string): PenaltySkin {
  return (id ? PENALTY_SKINS_BY_ID[id] : undefined) ?? DEFAULT_PENALTY_SKIN;
}

/** Effective canvas palette = the skin's colors with the level's optional tweaks on top. */
export function resolveColors(skin: PenaltySkin, level: PenaltyLevel): PenaltyColors {
  return { ...skin.colors, ...(level.colorOverrides ?? {}) };
}
