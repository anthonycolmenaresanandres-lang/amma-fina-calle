import type { EngineConfig } from "./types";

const baseColors: EngineConfig["colors"] = {
  bg: 0x120905,
  grid: 0x5b3a17,
  player: 0xd4a24c,
  enemy: 0x8c2f2f,
  neutral: 0x8a6b3d,
  text: "#f4e6cc",
};

// Tuned for FUN: fast growth, snappy unit streams, short punchy matches. You can
// send from any of your nodes to ANY node (the scene no longer gates on links —
// links render as faint "roads" for read, not as a restriction).
const baseRules: EngineConfig["rules"] = {
  matchDurationSec: 55,
  tickMs: 100,
  growthPerSec: 1.6,
  maxTowerValue: 99,
  sendPercent: 0.5,
  towerRadius: 32,
  unitRadius: 6,
  projectileSpeed: 360,
  sendCadenceBaseMs: 130,
  sendCadenceMinMs: 40,
  sendCadenceValueMultiplier: 2.5,
  stickerScale: 1,
  maxStickerCount: 4,
  visualDensity: "medium",
  aiThinkMinMs: 900,
  aiThinkMaxMs: 1400,
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
    selectText: "Drag from your node to grab the neutral ones — own more than the enemy.",
    winText: "First Claim Secured",
    loseText: "First Claim Lost",
    colors: baseColors,
    rules: {
      ...baseRules,
      matchDurationSec: 50,
      growthPerSec: 1.4,
      aiThinkMinMs: 1300,
      aiThinkMaxMs: 1900,
    },
    towers: [
      { id: "p1", xPct: 18, yPct: 56, owner: "player", value: 30 },
      { id: "n1", xPct: 40, yPct: 30, owner: "neutral", value: 12 },
      { id: "n2", xPct: 50, yPct: 70, owner: "neutral", value: 16 },
      { id: "n3", xPct: 60, yPct: 30, owner: "neutral", value: 12 },
      { id: "e1", xPct: 82, yPct: 56, owner: "enemy", value: 24 },
    ],
    links: [
      { a: "p1", b: "n1" },
      { a: "p1", b: "n2" },
      { a: "n1", b: "n3" },
      { a: "n2", b: "e1" },
      { a: "n3", b: "e1" },
    ],
  },
  {
    id: "flow-control",
    levelNumber: 2,
    levelName: "Flow Control",
    brandName: "Fina Calle Conquest Engine",
    skinName: "District Claimed",
    selectText: "More nodes, faster growth. Fan out, then overwhelm the enemy core.",
    winText: "District Claimed",
    loseText: "District Lost",
    colors: baseColors,
    rules: {
      ...baseRules,
      matchDurationSec: 60,
      growthPerSec: 1.7,
    },
    towers: [
      { id: "p1", xPct: 16, yPct: 70, owner: "player", value: 26 },
      { id: "p2", xPct: 28, yPct: 34, owner: "player", value: 16 },
      { id: "n1", xPct: 50, yPct: 22, owner: "neutral", value: 14 },
      { id: "n2", xPct: 50, yPct: 50, owner: "neutral", value: 22 },
      { id: "n3", xPct: 50, yPct: 78, owner: "neutral", value: 14 },
      { id: "e1", xPct: 72, yPct: 34, owner: "enemy", value: 16 },
      { id: "e2", xPct: 84, yPct: 70, owner: "enemy", value: 26 },
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
  },
  {
    id: "customer-rush",
    levelNumber: 3,
    levelName: "Customer Rush",
    brandName: "Fina Calle Conquest Engine",
    skinName: "District Claimed",
    selectText: "Peak rush — fastest growth, smartest enemy. Snowball before they do.",
    winText: "Customer Rush Claimed",
    loseText: "Customer Rush Lost",
    colors: {
      ...baseColors,
      neutral: 0x9b6f35,
    },
    rules: {
      ...baseRules,
      matchDurationSec: 65,
      growthPerSec: 1.9,
      projectileSpeed: 380,
      stickerScale: 1.05,
      maxStickerCount: 6,
      visualDensity: "rich",
      aiThinkMinMs: 750,
      aiThinkMaxMs: 1150,
    },
    towers: [
      { id: "p1", xPct: 16, yPct: 64, owner: "player", value: 30 },
      { id: "p2", xPct: 30, yPct: 30, owner: "player", value: 18 },
      { id: "n1", xPct: 50, yPct: 20, owner: "neutral", value: 16 },
      { id: "n2", xPct: 50, yPct: 50, owner: "neutral", value: 26 },
      { id: "n3", xPct: 50, yPct: 80, owner: "neutral", value: 16 },
      { id: "e1", xPct: 70, yPct: 30, owner: "enemy", value: 20 },
      { id: "e2", xPct: 84, yPct: 64, owner: "enemy", value: 30 },
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
