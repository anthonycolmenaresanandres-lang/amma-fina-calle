import type { CafeRushLevel, CafeRushSkin } from "@/caferush/types";

export const seedRounds: CafeRushLevel[] = [
  { id: "first-pour", levelNumber: 1, levelName: "First Pour", selectText: "Catch the coffee and pandan. Let the aswang pass.", rules: { durationSec: 20, targetScore: 80, spawnEveryMs: 1150, spawnMinMs: 1000, spawnRampMs: 3, fallSpeed: [0.48, 0.62], badChance: 0.1, dropPenalty: 0, failOnBadCatch: true } },
  { id: "color-rush", levelNumber: 2, levelName: "Color Rush", selectText: "Follow the purple and green drinks.", rules: { durationSec: 25, targetScore: 110, spawnEveryMs: 1050, spawnMinMs: 900, spawnRampMs: 3, fallSpeed: [0.53, 0.7], badChance: 0.15, dropPenalty: 0, failOnBadCatch: true } },
  { id: "sweet-finish", levelNumber: 3, levelName: "Sweet Finish", selectText: "Catch the pastries for one last rush.", rules: { durationSec: 30, targetScore: 140, spawnEveryMs: 950, spawnMinMs: 800, spawnRampMs: 3, fallSpeed: [0.6, 0.78], badChance: 0.18, dropPenalty: 0, failOnBadCatch: true } },
];

const artBase = "/assets/project-seed/seed-rush";

// Product labels describe the art only. Four exact menu names remain unverified.
export const seedSkin: CafeRushSkin = {
  id: "project-seed-concept",
  displayName: "Project Seed",
  brandName: "Project Seed concept",
  skinName: "Seed Rush",
  catcherName: "cup",
  prospect: true,
  colors: {
    bg: 0xf4e8d6, counter: 0xe6d0b2, counterEdge: 0xa92732, catcher: 0xfff9ed,
    catcherRim: 0xa92732, accent: 0xa92732, scoreText: "#2b2320", goodText: "#235b36",
    badText: "#8d2530", text: "#2b2320",
  },
  items: [
    { id: "buko-pandan", kind: "good", points: 10, shape: "cup", fill: 0x5d8664, accent: 0xc7dfbb, label: "Buko Pandan Latte", asset: `${artBase}/buko-pandan-latte-v1.webp` },
    { id: "dark-iced-coffee", kind: "good", points: 10, shape: "iced", fill: 0x593b29, accent: 0xd6a06a, label: "Iced coffee", asset: `${artBase}/dark-iced-coffee-v1.webp` },
    { id: "borahae-latte", kind: "good", points: 10, shape: "iced", fill: 0x614078, accent: 0xcbb2df, label: "Borahae Latte", asset: `${artBase}/borahae-latte-v1.webp` },
    { id: "iced-green-latte", kind: "good", points: 10, shape: "iced", fill: 0x7f9c66, accent: 0xd9e8ce, label: "Green latte", asset: `${artBase}/iced-green-latte-v1.webp` },
    { id: "sugar-custard-swirl-pastry", kind: "good", points: 10, shape: "pastry", fill: 0xc99042, accent: 0xf4d99d, label: "Custard pastry", asset: `${artBase}/sugar-custard-swirl-pastry-v1.webp` },
    { id: "purple-rolled-pastry", kind: "good", points: 10, shape: "pastry", fill: 0x69428c, accent: 0xc9addd, label: "Purple pastry", asset: `${artBase}/purple-rolled-pastry-v1.webp` },
    { id: "aswang", kind: "bad", points: -15, shape: "bad-vibes", fill: 0x2d2528, accent: 0xa92732, label: "Aswang", asset: `${artBase}/aswang-v1.webp` },
  ],
  chrome: { pageBg: "#fbf6ed", panelBg: "#f3e8dc", text: "#2b2320", subtext: "#665c54", accent: "#a92732", accentDeep: "#7d1c28", border: "#d9cfc1", onAccent: "#fff" },
};

export const seedRoundShowcase = [
  { title: "Coffee & pandan", itemIds: ["buko-pandan", "dark-iced-coffee"] },
  { title: "Purple & green", itemIds: ["borahae-latte", "iced-green-latte"] },
  { title: "Sweet finish", itemIds: ["sugar-custard-swirl-pastry", "purple-rolled-pastry"] },
] as const;

export function seedSkinForRound(index: number): CafeRushSkin {
  const featured = seedRoundShowcase[index] ?? seedRoundShowcase[0];
  return { ...seedSkin, items: seedSkin.items.filter((item) => featured.itemIds.some((id) => id === item.id) || item.kind === "bad") };
}
