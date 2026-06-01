import type { EngineConfig } from "./types";

export const FINA_CALLE_CONQUEST_CONFIG: EngineConfig = {
  brandName: "Fina Calle Conquest Engine",
  skinName: "District Claimed",
  winText: "District Claimed",
  loseText: "District Lost",
  colors: {
    bg: 0x120905,
    grid: 0x5b3a17,
    player: 0xd4a24c,
    enemy: 0x8c2f2f,
    neutral: 0x7a6a52,
    text: "#f4e6cc",
  },
  rules: {
    matchDurationSec: 60,
    tickMs: 100,
    growthPerSec: 1.2,
    maxTowerValue: 99,
    sendPercent: 0.5,
    projectileSpeed: 420,
    aiThinkMinMs: 800,
    aiThinkMaxMs: 1200,
  },
  towers: [
    { id: "p1", xPct: 22, yPct: 68, owner: "player", value: 28 },
    { id: "p2", xPct: 34, yPct: 32, owner: "player", value: 18 },
    { id: "n1", xPct: 50, yPct: 50, owner: "neutral", value: 24 },
    { id: "e1", xPct: 66, yPct: 32, owner: "enemy", value: 18 },
    { id: "e2", xPct: 78, yPct: 68, owner: "enemy", value: 28 },
  ],
  links: [
    { a: "p1", b: "p2" },
    { a: "p1", b: "n1" },
    { a: "p2", b: "n1" },
    { a: "n1", b: "e1" },
    { a: "n1", b: "e2" },
    { a: "e1", b: "e2" },
  ],
};