import type { BandstandSkin } from "./types";

// Default skin — Fina Calle "Street Band". Non-human mascots only (guardrail):
// each is a little street-corner character that plays one part of the loop.
// A client skin = swap names/colors and keep the same six roles; the engine's
// music never changes, so every combination stays in tune.
export const FINA_CALLE_BAND: BandstandSkin = {
  id: "fina-calle-street-band",
  brandName: "Fina Calle Bandstand",
  skinName: "Street Band",
  tagline: "Tap a character to add its part. Build the loop. Mix your own street jam.",
  bpm: 100,
  colors: {
    bg: "#0e0a14",
    stage: "#191225",
    text: "#f1ecff",
    dim: "#8b80a8",
  },
  mascots: [
    { id: "boomer", name: "Boomer", role: "kick", color: "#e8584d", accent: "#ffb4ad" },
    { id: "tappa", name: "Tappa", role: "hat", color: "#56c2e8", accent: "#bdecff" },
    { id: "lowdo", name: "Lowdo", role: "bass", color: "#7b6cf0", accent: "#c5bdff" },
    { id: "hummer", name: "Hummer", role: "pad", color: "#46c98b", accent: "#b3f2d4" },
    { id: "pip", name: "Pip", role: "lead", color: "#f0b54a", accent: "#ffe2a8" },
    { id: "glim", name: "Glim", role: "arp", color: "#ef6fb6", accent: "#ffc4e6" },
  ],
};

// Colattao café skin — proves the productization model. Same six roles, same
// engine/music; only the mascots, names, and palette change. Non-human café
// characters (guardrail): each plays one part of the Colattao jam. A real
// client ships exactly like this — swap the skin, keep the engine frozen.
export const COLATTAO_BAND: BandstandSkin = {
  id: "colattao-cafe-band",
  brandName: "Colattao Bandstand",
  skinName: "Café Jam",
  tagline: "Tap a café friend to add its part. Build Colattao's loop and record a jam.",
  bpm: 96,
  colors: {
    bg: "#160d07",
    stage: "#241409",
    text: "#f4e6cc",
    dim: "#a8855a",
  },
  mascots: [
    { id: "bean", name: "Bean", role: "kick", color: "#6f4422", accent: "#c89460" },
    { id: "frothy", name: "Frothy", role: "hat", color: "#efe2cf", accent: "#fff7ea" },
    { id: "roast", name: "Roast", role: "bass", color: "#3f2614", accent: "#a87a4c" },
    { id: "steamer", name: "Steamer", role: "pad", color: "#b9a890", accent: "#ece0cf" },
    { id: "matcha", name: "Matcha", role: "lead", color: "#7faa53", accent: "#c8e6a0" },
    { id: "sugar", name: "Sugar", role: "arp", color: "#e8c66a", accent: "#fff0c0" },
  ],
};

// Colattanini — Colattao's playful "-ini" mascot cast. Same six roles/engine;
// brighter berry-mocha palette and a peppier tempo so they read as their own
// poppy crew. Original café-creature names (non-human, no real IP, no AI art).
export const COLATTANINI_BAND: BandstandSkin = {
  id: "colattanini-band",
  brandName: "Colattao presents",
  skinName: "Colattanini",
  tagline: "Tap a Colattanini to add its part. Build the jam and earn the whole crew.",
  bpm: 104,
  colors: {
    bg: "#1c0f14",
    stage: "#2c1822",
    text: "#ffe9d6",
    dim: "#c59a8a",
  },
  mascots: [
    { id: "bombeanini", name: "Bombeanini", role: "kick", color: "#5a3a26", accent: "#d79a5e" },
    { id: "frothalini", name: "Frothalini", role: "hat", color: "#f3e7d2", accent: "#fffaf0" },
    { id: "roastarino", name: "Roastarino", role: "bass", color: "#3a2316", accent: "#b07b48" },
    { id: "steamalini", name: "Steamalini", role: "pad", color: "#c3b2c9", accent: "#ece0ef" },
    { id: "matchalini", name: "Matchalini", role: "lead", color: "#6fbf4a", accent: "#c4f0a0" },
    { id: "sugarini", name: "Sugarini", role: "arp", color: "#f2a9c4", accent: "#ffd9e8" },
  ],
};

export const BANDSTAND_SKINS: BandstandSkin[] = [FINA_CALLE_BAND, COLATTAO_BAND, COLATTANINI_BAND];

export const DEFAULT_BANDSTAND_SKIN = FINA_CALLE_BAND;
