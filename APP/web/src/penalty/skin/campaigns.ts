// Penalty Shootout Campaign Pack registry (V2 productization, Step 1).
//
// The Stadium Shell is fixed; a Campaign is the small per-client surface on top
// of it — one behind-goal ad zone + player/keeper shirt (kit) recolor. Resolved
// by id with a default fallback, mirroring getPenaltySkin() in ./skins. Campaign
// ids intentionally match the skin/brand ids (e.g. "stadium"), so a skin resolves
// its campaign by the same id without any extra wiring.
//
// Step 1 is PLUMBING ONLY: these objects are threaded through the scene and the
// renderer but do NOT yet change any drawing. An empty campaign reproduces the
// current look (no ad image, default kits), so nothing renders differently. The
// ad-zone renderer and the tintable kit land in later steps.
//
// Governance: PRODUCT_MODULES/GAME_CUSTOMIZATION_PROTOCOL.md (Campaign Pack);
// specs ASSET_SPECS/PENALTY_AD_ZONE_SPEC.md, ASSET_SPECS/PENALTY_KIT_SPEC.md.

import type { PenaltyCampaign } from "../types";

// Neutral fallback campaign: no ad image, no kit overrides → the shell renders
// with its default backdrop and default kits (the current look). Used when a
// skin has no registered campaign.
export const DEFAULT_CAMPAIGN: PenaltyCampaign = {
  id: "default",
  client: "Fina Calle (house)",
};

// The Stadium Shell's default campaign. Values are intentionally empty for now
// so it reproduces the CURRENT Stadium look exactly (photo backdrop comes from
// the skin; no ad-zone overlay; default kits). Real campaigns (ad image + kit
// colors) are added in later steps once the ad-zone renderer and tintable kit
// exist.
export const STADIUM_CAMPAIGN: PenaltyCampaign = {
  id: "stadium",
  client: "Fina Calle (house)",
};

export const COLATTAO_CAMPAIGN: PenaltyCampaign = {
  id: "colattao",
  client: "Colattao",
  adZone: {
    // Inner board creative: warm brand panel (cream logo + product card) authored
    // for the engine-drawn stadium signage board, so the cream logo reads and the
    // panel complements the daylight stadium. The raw coffee/pastry photo remains
    // in the repo as the product source.
    image: "/assets/colattao/penalty/adzone-colattao-board-v1.webp",
    fit: { scale: 1, offsetXPct: 0, offsetYPct: 0 },
    label: "Colattao logo and product behind-goal signage board",
  },
  // Colattao keeper kit (Campaign Pack Step 3a) — owner-approved green keeper
  // jersey (primary) + deep-green lower body (secondary). Recolors the primitive
  // keeper mascot; wins over the per-level keeper tint (Decision A).
  kit: {
    keeper: { primary: 0x2e8b6b, secondary: 0x14332a },
  },
};

const CAMPAIGNS: PenaltyCampaign[] = [STADIUM_CAMPAIGN, COLATTAO_CAMPAIGN];

const CAMPAIGNS_BY_ID: Record<string, PenaltyCampaign> = Object.fromEntries(
  CAMPAIGNS.map((campaign) => [campaign.id, campaign]),
);

/** Look up a campaign by id, falling back to the neutral default campaign
 *  (same shape/contract as getPenaltySkin). */
export function getCampaign(id?: string): PenaltyCampaign {
  return (id ? CAMPAIGNS_BY_ID[id] : undefined) ?? DEFAULT_CAMPAIGN;
}
