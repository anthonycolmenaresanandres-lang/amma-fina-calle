import type { CafeRushLevel, CafeRushSkin } from "@/caferush/types";
import { seedRounds, seedSkin } from "./config";

const artBase = "/assets/project-seed/october";
const pace = [
  { spawnEveryMs: 900, spawnMinMs: 790, fallSpeed: [1.28, 1.58] as [number, number], badChance: 0.30, selectText: "Catch Dwende and Kapre. Let the aswang pass." },
  { spawnEveryMs: 800, spawnMinMs: 700, fallSpeed: [1.50, 1.80] as [number, number], badChance: 0.38, selectText: "Catch Mumu and Manang. Let the aswang pass." },
  { spawnEveryMs: 700, spawnMinMs: 600, fallSpeed: [1.73, 2.10] as [number, number], badChance: 0.45, selectText: "Catch PMS and BBL Refresher. Let the aswang pass." },
];

export const octoberRounds: CafeRushLevel[] = seedRounds.map((round, index) => ({
  ...round,
  selectText: pace[index].selectText,
  rules: { ...round.rules, spawnEveryMs: pace[index].spawnEveryMs, spawnMinMs: pace[index].spawnMinMs, fallSpeed: pace[index].fallSpeed, badChance: pace[index].badChance },
}));

export const octoberSkin: CafeRushSkin = {
  ...seedSkin,
  id: "project-seed-october-concept",
  skinName: "Seed Rush · October edition",
  assets: { background: `${artBase}/cafe-backdrop-v1.webp` },
  colors: { ...seedSkin.colors, bg: 0xfff5e6, counter: 0xc4926a, counterEdge: 0x8b1d2b, accent: 0x9f1c2b, scoreText: "#2e2225", text: "#2e2225" },
  chrome: { ...seedSkin.chrome, pageBg: "#fffaf2", panelBg: "#f7e6d7", accent: "#9f1c2b", accentDeep: "#741421", border: "#dfc9b8" },
  items: [
    { id: "dwende-latte", kind: "good", points: 10, shape: "iced", fill: 0x674031, accent: 0xdfa72b, label: "Dwende Latte", asset: `${artBase}/dwende-latte-v1.webp` },
    { id: "kapre-latte", kind: "good", points: 10, shape: "iced", fill: 0xae5a25, accent: 0xb63133, label: "Kapre Latte", asset: `${artBase}/kapre-latte-v1.webp` },
    { id: "mumu-latte", kind: "good", points: 10, shape: "iced", fill: 0xb0a774, accent: 0x63834a, label: "Mumu Latte", asset: `${artBase}/mumu-latte-v1.webp` },
    { id: "manang-latte", kind: "good", points: 10, shape: "iced", fill: 0x482534, accent: 0xc42e56, label: "Manang Latte", asset: `${artBase}/manang-latte-v1.webp` },
    { id: "pms-latte", kind: "good", points: 10, shape: "iced", fill: 0xa75327, accent: 0xe4a342, label: "PMS Latte", asset: `${artBase}/pms-latte-v1.webp` },
    { id: "bbl-refresher", kind: "good", points: 10, shape: "iced", fill: 0x5a2d65, accent: 0xba4f83, label: "BBL Refresher", asset: `${artBase}/bbl-refresher-v1.webp` },
    seedSkin.items.find((item) => item.id === "aswang")!,
  ],
};

export const octoberRoundShowcase = [
  { title: "Marshmallow & apple", itemIds: ["dwende-latte", "kapre-latte"] },
  { title: "Pistachio & raspberry", itemIds: ["mumu-latte", "manang-latte"] },
  { title: "Pumpkin & berry", itemIds: ["pms-latte", "bbl-refresher"] },
] as const;

export const octoberDrinkNotes: Record<string, string> = {
  "dwende-latte": "Toasted marshmallow, chocolate, honey, graham crackers, vanilla foam.",
  "kapre-latte": "Spiced caramel apple cider.",
  "mumu-latte": "White chocolate and pistachio.",
  "manang-latte": "Raspberry and dark chocolate.",
  "pms-latte": "Pumpkin maple spice. Also available in cold brew.",
  "bbl-refresher": "Blackberry lychee.",
};

export function octoberSkinForRound(index: number): CafeRushSkin {
  const featured = octoberRoundShowcase[index] ?? octoberRoundShowcase[0];
  return { ...octoberSkin, items: octoberSkin.items.filter((item) => featured.itemIds.some((id) => id === item.id) || item.kind === "bad") };
}
