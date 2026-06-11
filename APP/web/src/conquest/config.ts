import type { EngineConfig } from "./types";

// Colattao skin — café palette. You are Colattao (gold); the chains are
// "Chain Co" (steel-blue); unclaimed corners are latte-tan storefronts.
// Theming only: colors + text + node stickers. Engine logic, geometry,
// towers, links, and rules are unchanged. No logos / no AI art (guardrails).
const colattaoColors: EngineConfig["colors"] = {
  bg: 0x160d07,
  grid: 0x4a3017,
  player: 0xd8a24c,
  enemy: 0x4f6b8a,
  neutral: 0xa8855a,
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
// Sticker badge width is ~54px * scale, so labels must stay short.

export const CONQUEST_LEVELS: EngineConfig[] = [
  {
    id: "first-pour",
    levelNumber: 1,
    levelName: "First Pour",
    brandName: "Colattao Conquest",
    skinName: "Colattao",
    selectText: "Everyone starts with 10. Pour into your café, then claim the open corners.",
    winText: "Corner is Colattao",
    loseText: "Chain Co Took the Corner",
    colors: colattaoColors,
    rules: {
      ...baseRules,
      matchDurationSec: 70,
      growthPerSec: 0.6,
      aiThinkMinMs: 1800,
      aiThinkMaxMs: 2500,
    },
    // Sparse opening — your café, Chain Co, and two empty storefronts to claim.
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
    stickers: [
      { id: "home", towerId: "p1", label: "Colattao", xOffsetPct: 0, yOffsetPct: -16 },
      { id: "latte", towerId: "n1", label: "Latte", xOffsetPct: 0, yOffsetPct: -15 },
      { id: "mocha", towerId: "n2", label: "Mocha", xOffsetPct: 0, yOffsetPct: 15 },
      { id: "chain", towerId: "e1", label: "Chain Co", xOffsetPct: 0, yOffsetPct: -16 },
    ],
  },
  {
    id: "neighborhood-rush",
    levelNumber: 2,
    levelName: "Neighborhood Rush",
    brandName: "Colattao Conquest",
    skinName: "Colattao",
    selectText: "More open storefronts. Spread the brand, then squeeze Chain Co out.",
    winText: "Neighborhood is Colattao",
    loseText: "Chain Co Owns the Block",
    colors: colattaoColors,
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
    stickers: [
      { id: "home", towerId: "p1", label: "Colattao", xOffsetPct: 0, yOffsetPct: -16 },
      { id: "matcha", towerId: "n1", label: "Matcha", xOffsetPct: 0, yOffsetPct: -15 },
      { id: "cortado", towerId: "n2", label: "Cortado", xOffsetPct: 0, yOffsetPct: -15 },
      { id: "chain", towerId: "e1", label: "Chain Co", xOffsetPct: 0, yOffsetPct: -16 },
    ],
  },
  {
    id: "beat-the-chains",
    levelNumber: 3,
    levelName: "Beat the Chains",
    brandName: "Colattao Conquest",
    skinName: "Colattao",
    selectText: "Peak rush — more cafés, smarter chains. Snowball the block before they do.",
    winText: "District is Colattao",
    loseText: "Chain Co Runs the District",
    colors: {
      ...colattaoColors,
      neutral: 0xb8924f,
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
      { id: "home", towerId: "p1", label: "Colattao", xOffsetPct: -8, yOffsetPct: 12 },
      { id: "roastery", towerId: "p2", label: "Roastery", xOffsetPct: -10, yOffsetPct: -10 },
      { id: "rush", towerId: "n2", label: "Rush", xOffsetPct: 0, yOffsetPct: -15 },
      { id: "latte", towerId: "n1", label: "Latte", xOffsetPct: 0, yOffsetPct: -15 },
      { id: "chain1", towerId: "e1", label: "Chain Co", xOffsetPct: 10, yOffsetPct: -10 },
      { id: "chain2", towerId: "e2", label: "Chain Co", xOffsetPct: 10, yOffsetPct: -10 },
    ],
  },
];

export const DEFAULT_CONQUEST_LEVEL = CONQUEST_LEVELS[0];
