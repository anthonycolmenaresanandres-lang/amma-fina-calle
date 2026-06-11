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

export const DEFAULT_BANDSTAND_SKIN = FINA_CALLE_BAND;
