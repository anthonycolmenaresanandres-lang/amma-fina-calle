import type { EngineConfig } from "./types";

const baseColors: EngineConfig["colors"] = {
  bg: 0x120905,
  grid: 0x5b3a17,
  player: 0xd4a24c,
  enemy: 0x8c2f2f,
  neutral: 0x8a6b3d,
  text: "#f4e6cc",
};

const baseRules: EngineConfig["rules"] = {
  matchDurationSec: 60,
  tickMs: 100,
  growthPerSec: 1.2,
  maxTowerValue: 99,
  sendPercent: 0.5,
  projectileSpeed: 420,
  aiThinkMinMs: 800,
  aiThinkMaxMs: 1200,
};

export const CONQUEST_LEVELS: EngineConfig[] = [
  {
    id: "first-claim",
    levelNumber: 1,
    levelName: "First Claim",
    brandName: "Fina Calle Conquest Engine",
    skinName: "District Claimed",
    selectText: "Learn the claim: take the neutral node before the enemy wakes up.",
    winText: "First Claim Secured",
    loseText: "First Claim Lost",
    colors: baseColors,
    rules: {
      ...baseRules,
      matchDurationSec: 45,
      growthPerSec: 1,
      aiThinkMinMs: 1800,
      aiThinkMaxMs: 2600,
    },
    towers: [
      { id: "p1", xPct: 22, yPct: 56, owner: "player", value: 30 },
      { id: "n1", xPct: 50, yPct: 44, owner: "neutral", value: 18 },
      { id: "e1", xPct: 78, yPct: 56, owner: "enemy", value: 24 },
    ],
    links: [
      { a: "p1", b: "n1" },
      { a: "n1", b: "e1" },
    ],
  },
  {
    id: "flow-control",
    levelNumber: 2,
    levelName: "Flow Control",
    brandName: "Fina Calle Conquest Engine",
    skinName: "District Claimed",
    selectText: "Control the center and manage unit flow across the diamond.",
    winText: "District Claimed",
    loseText: "District Lost",
    colors: baseColors,
    rules: baseRules,
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
  },
  {
    id: "customer-rush",
    levelNumber: 3,
    levelName: "Customer Rush",
    brandName: "Fina Calle Conquest Engine",
    skinName: "District Claimed",
    selectText: "Route customer energy through the district without losing the rush.",
    winText: "Customer Rush Claimed",
    loseText: "Customer Rush Lost",
    colors: {
      ...baseColors,
      neutral: 0x9b6f35,
    },
    rules: {
      ...baseRules,
      growthPerSec: 1.35,
      aiThinkMinMs: 700,
      aiThinkMaxMs: 1100,
    },
    towers: [
      { id: "p1", xPct: 20, yPct: 62, owner: "player", value: 32 },
      { id: "p2", xPct: 35, yPct: 32, owner: "player", value: 20 },
      { id: "n1", xPct: 50, yPct: 50, owner: "neutral", value: 28 },
      { id: "e1", xPct: 65, yPct: 32, owner: "enemy", value: 22 },
      { id: "e2", xPct: 80, yPct: 62, owner: "enemy", value: 32 },
    ],
    links: [
      { a: "p1", b: "p2" },
      { a: "p1", b: "n1" },
      { a: "p2", b: "n1" },
      { a: "n1", b: "e1" },
      { a: "n1", b: "e2" },
      { a: "e1", b: "e2" },
    ],
    stickers: [
      { id: "vip", towerId: "p2", label: "VIP", xOffsetPct: -10, yOffsetPct: -10 },
      { id: "rush", towerId: "n1", label: "Rush", xOffsetPct: 0, yOffsetPct: -15 },
      { id: "family", towerId: "p1", label: "Family", xOffsetPct: -8, yOffsetPct: 12 },
      { id: "lunch", towerId: "e1", label: "Lunch", xOffsetPct: 10, yOffsetPct: -10 },
    ],
  },
];

export const DEFAULT_CONQUEST_LEVEL = CONQUEST_LEVELS[0];
