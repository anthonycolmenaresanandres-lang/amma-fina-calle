import type { CafeRushLevel, CafeRushSkin } from "@/caferush/types";

export const seedRounds: CafeRushLevel[] = [
  { id: "cold-brew-beginnings", levelNumber: 1, levelName: "Cold Brew Beginnings", selectText: "Find the ube cold brew. Let the aswang pass.", rules: { durationSec: 20, targetScore: 120, spawnEveryMs: 610, spawnMinMs: 480, spawnRampMs: 3, fallSpeed: [0.34, 0.44], badChance: 0.1, dropPenalty: 0, failOnBadCatch: true } },
  { id: "flavor-market", levelNumber: 2, levelName: "Flavor Market", selectText: "A little quicker. Follow the pandan color.", rules: { durationSec: 25, targetScore: 180, spawnEveryMs: 560, spawnMinMs: 420, spawnRampMs: 3, fallSpeed: [0.38, 0.5], badChance: 0.15, dropPenalty: 0, failOnBadCatch: true } },
  { id: "neighborhood-rush", levelNumber: 3, levelName: "Neighborhood Rush", selectText: "One last rush for Turon Latte.", rules: { durationSec: 30, targetScore: 300, spawnEveryMs: 490, spawnMinMs: 340, spawnRampMs: 3, fallSpeed: [0.43, 0.56], badChance: 0.18, dropPenalty: 0, failOnBadCatch: true } },
];

// Fina Calle concept colors with a matched Buko Pandan sprite and primitive fallbacks. Project Seed approval remains pending.
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
    { id: "ube", kind: "good", points: 10, shape: "iced", fill: 0x8e72a2, accent: 0xd7c8e0, label: "Ube" },
    { id: "pandan", kind: "good", points: 10, shape: "cup", fill: 0x5d8664, accent: 0xc7dfbb, label: "Pandan", asset: "/assets/project-seed/seed-rush/buko-pandan-latte-v1.webp" },
    { id: "turon", kind: "good", points: 10, shape: "cup", fill: 0xb7774d, accent: 0xf5d6ac, label: "Turon" },
    { id: "aswang", kind: "bad", points: -15, shape: "bad-vibes", fill: 0x2d2528, accent: 0xa92732, label: "Aswang", asset: "/assets/project-seed/seed-rush/aswang-v1.webp" },
  ],
  chrome: { pageBg: "#fbf6ed", panelBg: "#f3e8dc", text: "#2b2320", subtext: "#665c54", accent: "#a92732", accentDeep: "#7d1c28", border: "#d9cfc1", onAccent: "#fff" },
};

const featuredItemIds = ["ube", "pandan", "turon"] as const;

export function seedSkinForRound(index: number): CafeRushSkin {
  const featured = featuredItemIds[index] ?? featuredItemIds[0];
  return { ...seedSkin, items: seedSkin.items.filter((item) => item.id === featured || item.kind === "bad") };
}
