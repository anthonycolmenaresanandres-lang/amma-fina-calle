import type { CafeRushSkin } from "@/caferush/types";

export const BODEGA_CATCH_SKIN: CafeRushSkin = {
  id: "bodega", displayName: "Bodega", brandName: "Bodega Cafe",
  skinName: "Fall Rush", catcherName: "tray", prospect: true,
  colors: {
    bg: 0xf4e7d1, counter: 0x183d31, counterEdge: 0xe1b953,
    catcher: 0x22251f, catcherRim: 0xffedc3, accent: 0xf0c34f,
    scoreText: "#183d31", goodText: "#214d35", badText: "#8c2537", text: "#183d31",
  },
  items: [
    { id: "spill", kind: "bad", points: -25, shape: "spill", fill: 0x8c2537, accent: 0xfff2d8, label: "Cat spill" },
    { id: "spanish", kind: "good", points: 10, shape: "cup", fill: 0xc48854, accent: 0xfff2d8, label: "Spanish Latte", weight: 1.2, asset: "/assets/bodega/fall/spanish-latte.webp" },
    { id: "green", kind: "good", points: 10, shape: "iced", fill: 0x6d882a, accent: 0xf4edcd, label: "Drink", asset: "/assets/bodega/menu/green-drink.webp" },
    { id: "bites", kind: "good", points: 15, shape: "pastry", fill: 0xd89b4f, accent: 0xffefcf, label: "Cereal Bites", asset: "/assets/bodega/fall/cereal-bites.webp" },
    { id: "vinyl", kind: "good", points: 20, shape: "disc", fill: 0x18231f, accent: 0xf0c34f, label: "Vinyl record" },
    { id: "muffin", kind: "good", points: 25, shape: "muffin", fill: 0xd89b4f, accent: 0x6b3822, label: "Golden muffin" },
  ],
  assets: {
    background: "/assets/bodega/fall/cafe-interior.webp",
  },
  chrome: { pageBg: "#fff2d8", panelBg: "#183d31", text: "#fff2d8", subtext: "#d8ddcc", accent: "#f0c34f", accentDeep: "#c48854", border: "#f0c34f", onAccent: "#201d24" },
};
