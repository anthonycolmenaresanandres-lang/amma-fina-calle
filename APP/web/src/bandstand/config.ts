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

// Colattanini — Colattao's official "Strikers" sticker cast. These are the real
// three characters (Churro Latte #10, Cappuccino #11, Matcha Lemonade #12), each
// mapped to a musical part so the trio grooves together. "Collect all three" is
// the progression: start with two, earn Matcha Lemonade by keeping the jam going.
// Non-human, original Colattao IP, art TBD (placeholder colors until the cut
// sticker PNGs are wired into the renderer).
export const COLATTANINI_BAND: BandstandSkin = {
  id: "colattanini-strikers",
  brandName: "Colattanini · The Strikers",
  skinName: "Colattanini",
  tagline: "The Colattao striker squad. Tap a striker to add its part — collect all three.",
  bpm: 102,
  colors: {
    bg: "#1c130a",
    stage: "#2a1c0e",
    text: "#ffeccb",
    dim: "#c2a070",
  },
  mascots: [
    {
      id: "churro-latte",
      name: "Churro Latte",
      role: "kick",
      color: "#c98a4e",
      accent: "#f4d6a3",
      image: "/bandstand/colattanini/churro-latte.webp",
    },
    {
      id: "cappuccino",
      name: "Cappuccino",
      role: "bass",
      color: "#b79a76",
      accent: "#ead8bd",
      image: "/bandstand/colattanini/cappuccino.webp",
    },
    {
      id: "matcha-lemonade",
      name: "Matcha Lemonade",
      role: "lead",
      color: "#86c23f",
      accent: "#cdee93",
      image: "/bandstand/colattanini/matcha-lemonade.webp",
    },
  ],
};

export const BANDSTAND_SKINS: BandstandSkin[] = [FINA_CALLE_BAND, COLATTAO_BAND, COLATTANINI_BAND];

export const DEFAULT_BANDSTAND_SKIN = FINA_CALLE_BAND;
