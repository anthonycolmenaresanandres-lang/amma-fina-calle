// Café Rush skins — the LAYERED look. Colattao is the reference standard; Las
// Palmas and A.J. Gator's are customized to MATCH the Colattao design language
// (parchment/gold editorial chrome, warm café palette, primitive food-item art),
// tinted to each venue's own approved palette. All items are primitive-drawn
// (non-human, no client logos generated), so a skin can never 404 or break play.
//
// Bitmap art is intentionally left unwired in this first pass: the primitive
// look IS the default per GAME_CUSTOMIZATION_PROTOCOL.md. Approved logos/photos
// can be layered on later via CafeRushSkin.assets with the same fallback.

import type { CafeRushSkin } from "./types";

// ---------------------------------------------------------------------------
// Default — Fina Calle (neutral). Reproduces the engine's baseline look.
// ---------------------------------------------------------------------------
export const DEFAULT_CAFERUSH_SKIN: CafeRushSkin = {
  id: "fina-calle",
  displayName: "Fina Calle",
  brandName: "Fina Calle Catch Engine",
  skinName: "Café Rush",
  catcherName: "tray",
  colors: {
    bg: 0x0a1c12,
    counter: 0x123d28,
    counterEdge: 0xd8b36d,
    catcher: 0xf4f6f7,
    catcherRim: 0xd8b36d,
    accent: 0xd8b36d,
    scoreText: "#f4f6f7",
    goodText: "#7cffb0",
    badText: "#ff8a6b",
    text: "#f4f6f7",
  },
  items: [
    { id: "coffee", kind: "good", points: 10, shape: "cup", fill: 0xc9a06a, accent: 0xf4e6cc, label: "Coffee" },
    { id: "iced", kind: "good", points: 10, shape: "iced", fill: 0x8fbf6a, accent: 0xcdeab0, label: "Iced" },
    { id: "pastry", kind: "good", points: 15, shape: "pastry", fill: 0xd8a24c, accent: 0x7a4f1c, label: "Pastry" },
    { id: "spill", kind: "bad", points: -15, shape: "spill", fill: 0x6b3f17, accent: 0x2a1a0e, label: "Spill" },
  ],
  chrome: {
    pageBg: "#04130a",
    panelBg: "#0a2314",
    text: "#f4f6f7",
    subtext: "#c8d0c6",
    accent: "#d8b36d",
    accentDeep: "#a9843f",
    border: "#d8b36d",
    onAccent: "#04130a",
  },
};

// ---------------------------------------------------------------------------
// Colattao — THE STANDARD. Warm espresso + gold + parchment, from the verified
// Colattao menu design (bg #1B0E08, gold #d4a24c, parchment #f4e6cc, cool blue
// accent #92aecd). Falling items are the café's own signature drinks/pastry.
// ---------------------------------------------------------------------------
export const COLATTAO_CAFERUSH_SKIN: CafeRushSkin = {
  id: "colattao",
  displayName: "Colattao",
  brandName: "Colattao Café Rush",
  skinName: "Café Rush",
  catcherName: "cup",
  colors: {
    bg: 0x2a1206,
    counter: 0x3a2616,
    counterEdge: 0xd8a24c,
    catcher: 0xf4e6cc,
    catcherRim: 0xd4a24c,
    accent: 0xd8a24c,
    scoreText: "#fff3d6",
    goodText: "#8fe6a8",
    badText: "#ff8a6b",
    text: "#f4e6cc",
  },
  items: [
    { id: "latte", kind: "good", points: 10, shape: "cup", fill: 0xc99a5e, accent: 0xf4e6cc, label: "Churro Latte", weight: 1.2 },
    { id: "matcha", kind: "good", points: 10, shape: "iced", fill: 0x8fbf6a, accent: 0xcdeab0, label: "Iced Matcha" },
    { id: "croissant", kind: "good", points: 15, shape: "pastry", fill: 0xd8a24c, accent: 0x7a4f1c, label: "Croissant" },
    { id: "spill", kind: "bad", points: -15, shape: "spill", fill: 0x6b3f17, accent: 0x2a1a0e, label: "Hot spill" },
  ],
  chrome: {
    pageBg: "#1B0E08",
    panelBg: "#241811",
    text: "#f4e6cc",
    subtext: "#d9c19a",
    accent: "#d4a24c",
    accentDeep: "#b9832f",
    border: "#d2b27a",
    onAccent: "#1B0E08",
  },
};

// ---------------------------------------------------------------------------
// Las Palmas (prospect demo — PENDING CLIENT APPROVAL). Cantina night palette
// (from the Las Palmas penalty skin: deep green bg, gold accent) in the SAME
// Colattao editorial chrome. Falling items are cantina signatures.
// ---------------------------------------------------------------------------
export const LASPALMAS_CAFERUSH_SKIN: CafeRushSkin = {
  id: "laspalmas",
  displayName: "Las Palmas",
  brandName: "Las Palmas Café Rush",
  skinName: "Cantina Rush",
  catcherName: "basket",
  prospect: true,
  colors: {
    bg: 0x0b1f17,
    counter: 0x123a28,
    counterEdge: 0xe8b45a,
    catcher: 0xf7f1e0,
    catcherRim: 0xe8b45a,
    accent: 0xe8b45a,
    scoreText: "#f7f1e0",
    goodText: "#8fe6a8",
    badText: "#ff8a6b",
    text: "#f7f1e0",
  },
  items: [
    { id: "taco", kind: "good", points: 10, shape: "wedge", fill: 0xe0a34b, accent: 0xf2d6a0, label: "Taco", weight: 1.2 },
    { id: "lime", kind: "good", points: 10, shape: "disc", fill: 0x7bc043, accent: 0xd7f0b0, label: "Lime" },
    { id: "churro", kind: "good", points: 15, shape: "pastry", fill: 0xc9822f, accent: 0xf0c98a, label: "Churro" },
    { id: "salsa", kind: "bad", points: -15, shape: "spill", fill: 0xa02417, accent: 0x5e0f0f, label: "Hot salsa" },
  ],
  chrome: {
    pageBg: "#061410",
    panelBg: "#0f2a1e",
    text: "#f7f1e0",
    subtext: "#cdd8b8",
    accent: "#e8b45a",
    accentDeep: "#b07d2c",
    border: "#caa46a",
    onAccent: "#061410",
  },
};

// ---------------------------------------------------------------------------
// A.J. Gator's (prospect demo — PENDING CLIENT APPROVAL). Sports-bar palette
// (ink green, cream, gold — from the AJ Gator's penalty skin) in the Colattao
// editorial chrome. Falling items are bar-food signatures.
// ---------------------------------------------------------------------------
export const AJGATORS_CAFERUSH_SKIN: CafeRushSkin = {
  id: "ajgators",
  displayName: "A.J. Gator's",
  brandName: "A.J. Gator's Café Rush",
  skinName: "Sports Bar Rush",
  catcherName: "tray",
  prospect: true,
  colors: {
    bg: 0x04241a,
    counter: 0x08432c,
    counterEdge: 0xe1b52d,
    catcher: 0xf7f3e6,
    catcherRim: 0xe1b52d,
    accent: 0xe1b52d,
    scoreText: "#f7f3e6",
    goodText: "#8fe6a8",
    badText: "#ff8a6b",
    text: "#f7f3e6",
  },
  items: [
    { id: "wings", kind: "good", points: 10, shape: "wedge", fill: 0xd1662a, accent: 0xf2b06a, label: "Wings", weight: 1.2 },
    { id: "burger", kind: "good", points: 10, shape: "disc", fill: 0xb5732f, accent: 0xe9c58a, label: "Burger" },
    { id: "pretzel", kind: "good", points: 15, shape: "pastry", fill: 0xc98a3c, accent: 0xf0d29a, label: "Pretzel" },
    { id: "hotsauce", kind: "bad", points: -15, shape: "spill", fill: 0xc82037, accent: 0x5e0f1a, label: "Hot sauce" },
  ],
  chrome: {
    pageBg: "#001c14",
    panelBg: "#08301f",
    text: "#f7f3e6",
    subtext: "#cdd8c8",
    accent: "#e1b52d",
    accentDeep: "#b08e1f",
    border: "#caa44a",
    onAccent: "#001c14",
  },
};

export const CAFERUSH_SKINS: CafeRushSkin[] = [
  DEFAULT_CAFERUSH_SKIN,
  COLATTAO_CAFERUSH_SKIN,
  LASPALMAS_CAFERUSH_SKIN,
  AJGATORS_CAFERUSH_SKIN,
];

const CAFERUSH_SKINS_BY_ID: Record<string, CafeRushSkin> = Object.fromEntries(
  CAFERUSH_SKINS.map((skin) => [skin.id, skin]),
);

/** Look up a skin by id, falling back to the default (mirrors getPenaltySkin). */
export function getCafeRushSkin(id?: string): CafeRushSkin {
  return (id ? CAFERUSH_SKINS_BY_ID[id] : undefined) ?? DEFAULT_CAFERUSH_SKIN;
}
