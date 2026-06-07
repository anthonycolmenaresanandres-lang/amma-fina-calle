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
  // ⚠️ QA-ONLY (Step 2) — TEMPORARY stand-in to prove the behind-goal ad-zone
  // renderer in preview. Reuses an already-committed image; this is NOT final
  // client art and does NOT represent a real campaign. With this set, the
  // drawn-goal skins (Fina Calle, Colattao) show the ad behind the goal frame/
  // net for QA. REMOVE this `adZone` line before merge so the default campaign
  // is image-free again (then no skin renders an ad until a real one is wired).
  adZone: { image: "/assets/colattao/penalty/background-cafe-stadium-winner-v1.webp" },
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

const CAMPAIGNS: PenaltyCampaign[] = [STADIUM_CAMPAIGN];

const CAMPAIGNS_BY_ID: Record<string, PenaltyCampaign> = Object.fromEntries(
  CAMPAIGNS.map((campaign) => [campaign.id, campaign]),
);

/** Look up a campaign by id, falling back to the neutral default campaign
 *  (same shape/contract as getPenaltySkin). */
export function getCampaign(id?: string): PenaltyCampaign {
  return (id ? CAMPAIGNS_BY_ID[id] : undefined) ?? DEFAULT_CAMPAIGN;
}
