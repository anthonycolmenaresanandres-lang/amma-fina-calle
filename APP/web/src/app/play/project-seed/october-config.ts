import type { CafeRushLevel, CafeRushSkin } from "@/caferush/types";
import { seedRounds, seedRoundShowcase, seedSkin } from "./config";

const artBase = "/assets/project-seed/october";
const pace = [
  { spawnEveryMs: 900, spawnMinMs: 790, fallSpeed: [1.28, 1.58] as [number, number], badChance: 0.30 },
  { spawnEveryMs: 800, spawnMinMs: 700, fallSpeed: [1.50, 1.80] as [number, number], badChance: 0.38 },
  { spawnEveryMs: 700, spawnMinMs: 600, fallSpeed: [1.73, 2.10] as [number, number], badChance: 0.45 },
];

export const octoberRounds: CafeRushLevel[] = seedRounds.map((round, index) => ({
  ...round,
  rules: { ...round.rules, spawnEveryMs: pace[index].spawnEveryMs, spawnMinMs: pace[index].spawnMinMs, fallSpeed: pace[index].fallSpeed, badChance: pace[index].badChance },
}));

export const octoberSkin: CafeRushSkin = {
  ...seedSkin,
  id: "project-seed-october-concept",
  skinName: "Seed Rush",
  assets: { background: `${artBase}/cafe-roof-map-portrait-v2.webp` },
  colors: { ...seedSkin.colors, bg: 0xfff5e6, counter: 0xc4926a, counterEdge: 0x8b1d2b, accent: 0x9f1c2b, scoreText: "#2e2225", text: "#2e2225" },
  chrome: { ...seedSkin.chrome, pageBg: "#fffaf2", panelBg: "#f7e6d7", accent: "#9f1c2b", accentDeep: "#741421", border: "#dfc9b8" },
};

export const octoberRoundShowcase = seedRoundShowcase;

export const octoberDrinkNotes: Record<string, string> = {
  "buko-pandan": "Coconut, pandan, and espresso.",
  "dark-iced-coffee": "Explore the coffee menu for your next pour.",
  "borahae-latte": "Explore Project Seed’s drinks and seasonal specials.",
  "iced-green-latte": "Explore the tea and latte menu.",
  "sugar-custard-swirl-pastry": "Ask about today’s pastries at the café.",
  "purple-rolled-pastry": "Ask about today’s pastries at the café.",
};

export function octoberSkinForRound(index: number, landscape = false): CafeRushSkin {
  const featured = octoberRoundShowcase[index] ?? octoberRoundShowcase[0];
  return { ...octoberSkin, assets: { background: `${artBase}/cafe-roof-map-${landscape ? "landscape" : "portrait"}-v2.webp` }, items: octoberSkin.items.filter((item) => featured.itemIds.some((id) => id === item.id) || item.kind === "bad") };
}
