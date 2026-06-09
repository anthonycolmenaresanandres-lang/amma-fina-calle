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
  /** Foreground kicker character (mascot); leans into a kick on the shot. */
  kicker?: string;
  /** In-goal keeper character (die-cut mascot sticker); replaces the primitive
   *  keeper. Slides + tilts on the dive. Falls back to the primitive keeper
   *  (and its kit recolor) when absent or if the file fails to load. */
  keeper?: string;
  /** Optional tintable keeper SHIRT layer (neutral white, shading via luminance),
   *  aligned to the keeper base. When present it's drawn over the keeper and
   *  tinted to the campaign's keeper kit color — so one keeper recolors per brand.
   *  Omitted = no tint layer (keeper image shows its own baked colors). */
  keeperKit?: string;
};

// Optional fit controls for a skin's background image, so a photo (e.g. a
// stadium) can be nudged to line up with the fixed goal layout and use a
// lighter overlay. All optional; defaults reproduce the original look
// (scrim 0.45, no extra scale, no offset) so existing skins are unchanged.
export type BackgroundFit = {
  /** Dark overlay alpha over the photo, 0..1 (default 0.45). Lower = brighter. */
  scrim?: number;
  /** Extra zoom on top of cover-fit (default 1). >1 enlarges the photo. */
  scale?: number;
  /** Horizontal shift as a fraction of canvas width (default 0). */
  offsetXPct?: number;
  /** Vertical shift as a fraction of canvas height (default 0; negative = up). */
  offsetYPct?: number;
};

// Optional positioning for a foreground sprite (the kicker), tuned per skin
// once the art lands. Defaults keep it centered at the bottom foreground.
export type SpriteFit = {
  /** Height multiplier relative to the default kicker size (default 1). */
  scale?: number;
  /** Horizontal shift as a fraction of canvas width (default 0). */
  offsetXPct?: number;
  /** Vertical shift as a fraction of canvas height (default 0; negative = up). */
  offsetYPct?: number;
};

export type PenaltyChrome = {
  /** Skip the drawn goal frame, net, penalty-box line, and center spot. */
  hideGoalArt?: boolean;
  /** Hide the top skin-name title while keeping score and hint visible. */
  hideTitle?: boolean;
  /** Draw a reserved black sponsor/ad strip. */
  adBanner?: boolean;
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
  /** Optional per-level kicker override (levelId → image path). Falls back to
   *  assets.kicker for levels not listed — lets one skin field a different
   *  striker per level (e.g. a product mascot per difficulty). */
  levelKickers?: Record<string, string>;
  /** Optional positioning/scrim tuning for the background image. */
  backgroundFit?: BackgroundFit;
  /** Optional positioning for the kicker sprite. */
  kickerFit?: SpriteFit;
  /** Optional positioning for the keeper sprite (when a keeper image is used). */
  keeperFit?: SpriteFit;
  /** Optional size for the ball (only `scale` is honored; position stays on the
   *  penalty spot so gameplay is unaffected). Default 1 = current size. */
  ballFit?: SpriteFit;
  /** Optional per-skin presentation chrome controls. */
  chrome?: PenaltyChrome;
};

export type ShotOutcome = "goal" | "save" | "miss";

// How the player aims/shoots. "tap" is the V1 default; "swipe"/"auto" use the
// assisted swipe gesture (with a tap fallback). The input layer only selects an
// aim zone — it never changes scoring or keeper logic.
export type InputMode = "tap" | "swipe" | "auto";

// --- Campaign Pack (V2 productization) -----------------------------------
// The Stadium Shell is fixed; a Campaign is the small, per-client surface that
// rides on top of it: one behind-goal ad zone + player/keeper shirt (kit)
// recolor. Governance: PRODUCT_MODULES/GAME_CUSTOMIZATION_PROTOCOL.md
// (Campaign Pack); specs ASSET_SPECS/PENALTY_AD_ZONE_SPEC.md and
// ASSET_SPECS/PENALTY_KIT_SPEC.md.
//
// Step 1 introduces these types + plumbing ONLY — nothing here changes
// rendering yet. Every field is optional and an empty campaign reproduces the
// current look (no ad image, default kit), so a campaign is never a 404/broken
// look. The ad-zone renderer and the tintable kit arrive in later steps.

/** Fit controls for the behind-goal ad-zone image within its reserved panel. */
export type AdZoneFit = {
  /** Extra zoom on top of cover-fit (default 1). */
  scale?: number;
  /** Horizontal shift as a fraction of the panel width (default 0). */
  offsetXPct?: number;
  /** Vertical shift as a fraction of the panel height (default 0). */
  offsetYPct?: number;
};

/** A shirt (kit) recolor for one mascot. Applied to the mascot's tintable kit
 *  layer; omitted colors fall back to the skin's default kit. */
export type KitSpec = {
  /** Primary jersey color. */
  primary?: number;
  /** Optional trim/accent color. */
  secondary?: number;
};

/** A Campaign Pack: the per-client surface on the fixed Stadium Shell. The only
 *  customizable slots are the behind-goal ad zone and the two mascot kits; the
 *  top strip carries a fixed menu label/link only (not campaign creative). */
export type PenaltyCampaign = {
  id: string;
  /** Client/brand the campaign runs for (e.g. "Colattao"). */
  client: string;
  /** The one large behind-goal ad zone — the single dynamic placement. */
  adZone?: {
    /** Campaign image for the behind-goal panel. Omitted = default backdrop. */
    image?: string;
    /** Optional alignment of the image within the reserved panel. */
    fit?: AdZoneFit;
    /** Optional text-free caption/label for accessibility/fallback. */
    label?: string;
  };
  /** Player + keeper shirt (kit) recolors. Omitted = default kits. */
  kit?: {
    player?: KitSpec;
    keeper?: KitSpec;
  };
  /** Fixed top-strip menu button (label/link only — not a creative zone). */
  menu?: {
    label?: string;
    url?: string;
  };
};
