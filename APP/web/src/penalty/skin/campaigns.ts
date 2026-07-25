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
  // Behind-goal branding now lives in the background crowd (fan signs), so the
  // signage-board ad zone is intentionally OFF for Colattao (no image → the board
  // is not drawn, leaving the crowd + signs visible behind the goal). The board
  // renderer remains available for other clients via campaign adZone.image.
  adZone: {
    label: "Behind-goal branding via background crowd signs (no board)",
  },
  // Colattao keeper kit (Campaign Pack Step 3a) — owner-approved green keeper
  // jersey (primary) + deep-green lower body (secondary). Recolors the primitive
  // keeper mascot; wins over the per-level keeper tint (Decision A).
  kit: {
    keeper: { primary: 0x2e8b6b, secondary: 0x14332a },
  },
};

// Las Palmas prospect campaign (PENDING CLIENT APPROVAL — demo only, not
// production-published). Uses all three Campaign Pack slots:
// - behind-goal ad zone: code-drawn palm/wordmark board (plain type, no logo —
//   logos are approved overlays only and none is on file yet);
// - player kit: red shirt / white sleeves (generic color scheme, no club marks) —
//   carried visually by the skin's mascot kicker sprite;
// - keeper kit: royal blue over navy on the primitive Sentinel Keeper.
export const LASPALMAS_CAMPAIGN: PenaltyCampaign = {
  id: "laspalmas",
  client: "Las Palmas (prospect)",
  // Behind-goal branding now lives in the owner-approved fiesta backdrop
  // (crowd/palms/papel picado), so the signage board is OFF — same decision
  // as Colattao. The board asset stays in the folder for campaigns that want
  // it back (e.g. seasonal promos).
  adZone: {
    label: "Behind-goal branding via fiesta backdrop (no board)",
  },
  kit: {
    player: { primary: 0xd5322d, secondary: 0xffffff },
    keeper: { primary: 0x1e4fd8, secondary: 0x0c1e4a },
  },
};

const CAMPAIGNS: PenaltyCampaign[] = [
  STADIUM_CAMPAIGN,
  COLATTAO_CAMPAIGN,
  LASPALMAS_CAMPAIGN,
];

const CAMPAIGNS_BY_ID: Record<string, PenaltyCampaign> = Object.fromEntries(
  CAMPAIGNS.map((campaign) => [campaign.id, campaign]),
);

/** Look up a campaign by id, falling back to the neutral default campaign
 *  (same shape/contract as getPenaltySkin). */
export function getCampaign(id?: string): PenaltyCampaign {
  return (id ? CAMPAIGNS_BY_ID[id] : undefined) ?? DEFAULT_CAMPAIGN;
}
