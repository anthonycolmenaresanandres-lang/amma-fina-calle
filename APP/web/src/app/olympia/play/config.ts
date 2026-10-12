import type { CafeRushSkin } from "@/caferush/types";
import { CAFERUSH_LEVELS } from "@/caferush/config";

// Standard engine and rounds, with presentation-only Olympia colors and primitive art.
export const olympiaRounds = CAFERUSH_LEVELS;
export const olympiaSkin: CafeRushSkin = {
  id: "olympia-local-review", displayName: "Olympia", brandName: "Olympia Deli & Juice Bar",
  skinName: "Juice Rush", catcherName: "tray", prospect: true,
  colors: { bg: 0xe3efd9, counter: 0x215b38, counterEdge: 0xf36c21, catcher: 0xf9fbf8, catcherRim: 0xf36c21,
    accent: 0x215b38, scoreText: "#14241b", goodText: "#215b38", badText: "#9b241b", text: "#14241b" },
  items: [
    { id: "juice", kind: "good", points: 10, shape: "iced", fill: 0xf36c21, accent: 0xffd78a, label: "Juice" },
    { id: "smoothie", kind: "good", points: 10, shape: "iced", fill: 0x608739, accent: 0xcde5aa, label: "Smoothie" },
    { id: "citrus", kind: "good", points: 15, shape: "disc", fill: 0xf36c21, accent: 0xffd78a, label: "Citrus" },
    { id: "spill", kind: "bad", points: -15, shape: "spill", fill: 0x853a27, accent: 0x471c11, label: "Spill" },
  ],
  chrome: { pageBg: "#f9fbf8", panelBg: "#e3efd9", text: "#14241b", subtext: "#536057",
    accent: "#215b38", accentDeep: "#163f27", border: "#cdd6cf", onAccent: "#ffffff" },
};
