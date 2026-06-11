import type { EngineConfig } from "./types";

const baseColors: EngineConfig["colors"] = {
  bg: 0x120905,
  grid: 0x5b3a17,
  player: 0xd4a24c,
  enemy: 0x8c2f2f,
  neutral: 0x8a6b3d,
  text: "#f4e6cc",
};

// Vision: visual + deliberate. Few nodes, slow growth, everyone starts at 10.
// Just nodes + units (no connecting lines). Send from any node to ANY node;
// opposing unit streams clash in transit and the bigger force punches through.
// (`links` is retained as optional data but no longer drawn.)
const baseRules: EngineConfig["rules"] = {
  matchDurationSec: 80,
  tickMs: 100,
  growthPerSec: 0.7,
  maxTowerValue: 99,
  sendPercent: 0.5,
  towerRadius: 34,
  unitRadius: 7,
  projectileSpeed: 230,
  sendCadenceBaseMs: 240,
  sendCadenceMinMs: 95,
  sendCadenceValueMultiplier: 2.2,
  stickerScale: 1,
  maxStickerCount: 4,
  visualDensity: "medium",
  aiThinkMinMs: 1300,
  aiThinkMaxMs: 1900,
};

// Future sticker skins should stay lightweight: prefer transparent WebP,
// 256-512px source art, optimized as small badges/stickers in-game.
// Avoid video, heavy backgrounds, and asset-heavy worlds in V1; keep each
// client skin roughly under 1-2 MB total.

export const CONQUEST_LEVELS: EngineConfig[] = [
  {
    id: "first-claim",
    levelNumber: 1,
    levelName: "First Claim",
    brandName: "Fina Calle Conquest Engine",
    skinName: "District Claimed",
    selectText: "Everyone starts with 10. Build up, then take the unclaimed nodes.",
    winText: "First Claim Secured",
    loseText: "First Claim Lost",
    colors: baseColors,
    rules: {
      ...baseRules,
      matchDurationSec: 70,
      growthPerSec: 0.6,
      aiThinkMinMs: 1800,
      aiThinkMaxMs: 2500,
    },
    // Sparse opening — you, the enemy, and two unclaimed nodes to fight over.
    towers: [
      { id: "p1", xPct: 18, yPct: 50, owner: "player", value: 10 },
      { id: "n1", xPct: 50, yPct: 28, owner: "neutral", value: 10 },
      { id: "n2", xPct: 50, yPct: 72, owner: "neutral", value: 10 },
      { id: "e1", xPct: 82, yPct: 50, owner: "enemy", value: 10 },
    ],
    links: [
      { a: "p1", b: "n1" },
      { a: "p1", b: "n2" },
      { a: "n1", b: "e1" },
      { a: "n2", b: "e1" },
    ],
  },
  {
    id: "flow-control",
    levelNumber: 2,
    levelName: "Flow Control",
    brandName: "Fina Calle Conquest Engine",
    skinName: "District Claimed",
    selectText: "A few more unclaimed nodes. Spread, then squeeze the enemy out.",
    winText: "District Claimed",
    loseText: "District Lost",
    colors: baseColors,
    rules: {
      ...baseRules,
      matchDurationSec: 78,
      growthPerSec: 0.7,
    },
    towers: [
      { id: "p1", xPct: 16, yPct: 50, owner: "player", value: 10 },
      { id: "n1", xPct: 40, yPct: 26, owner: "neutral", value: 10 },
      { id: "n2", xPct: 50, yPct: 50, owner: "neutral", value: 10 },
      { id: "n3", xPct: 40, yPct: 74, owner: "neutral", value: 10 },
      { id: "n4", xPct: 60, yPct: 50, owner: "neutral", value: 10 },
      { id: "e1", xPct: 84, yPct: 50, owner: "enemy", value: 10 },
    ],
    links: [
      { a: "p1", b: "n1" },
      { a: "p1", b: "n3" },
      { a: "n1", b: "n2" },
      { a: "n3", b: "n2" },
      { a: "n2", b: "n4" },
      { a: "n4", b: "e1" },
      { a: "n1", b: "n4" },
      { a: "n3", b: "n4" },
    ],
  },
  {
    id: "customer-rush",
    levelNumber: 3,
    levelName: "Customer Rush",
    brandName: "Fina Calle Conquest Engine",
    skinName: "District Claimed",
    selectText: "Peak rush — more nodes, a smarter enemy. Snowball before they do.",
    winText: "Customer Rush Claimed",
    loseText: "Customer Rush Lost",
    colors: {
      ...baseColors,
      neutral: 0x9b6f35,
    },
    rules: {
      ...baseRules,
      matchDurationSec: 82,
      growthPerSec: 0.9,
      stickerScale: 1.05,
      maxStickerCount: 6,
      visualDensity: "rich",
      aiThinkMinMs: 1000,
      aiThinkMaxMs: 1500,
    },
    towers: [
      { id: "p1", xPct: 16, yPct: 64, owner: "player", value: 10 },
      { id: "p2", xPct: 30, yPct: 30, owner: "player", value: 10 },
      { id: "n1", xPct: 50, yPct: 22, owner: "neutral", value: 10 },
      { id: "n2", xPct: 50, yPct: 50, owner: "neutral", value: 10 },
      { id: "n3", xPct: 50, yPct: 78, owner: "neutral", value: 10 },
      { id: "e1", xPct: 70, yPct: 30, owner: "enemy", value: 10 },
      { id: "e2", xPct: 84, yPct: 64, owner: "enemy", value: 10 },
    ],
    links: [
      { a: "p1", b: "p2" },
      { a: "p1", b: "n3" },
      { a: "p2", b: "n1" },
      { a: "p2", b: "n2" },
      { a: "n1", b: "n2" },
      { a: "n2", b: "n3" },
      { a: "n1", b: "e1" },
      { a: "n3", b: "e2" },
      { a: "e1", b: "e2" },
    ],
    stickers: [
      { id: "vip", towerId: "p2", label: "VIP", xOffsetPct: -10, yOffsetPct: -10 },
      { id: "rush", towerId: "n2", label: "Rush", xOffsetPct: 0, yOffsetPct: -15 },
      { id: "family", towerId: "p1", label: "Family", xOffsetPct: -8, yOffsetPct: 12 },
      { id: "lunch", towerId: "e1", label: "Lunch", xOffsetPct: 10, yOffsetPct: -10 },
    ],
  },
];

export const DEFAULT_CONQUEST_LEVEL = CONQUEST_LEVELS[0];
