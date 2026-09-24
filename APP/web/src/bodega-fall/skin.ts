import type { CafeRushSkin } from "@/caferush/types";

export const BODEGA_CATCH_SKIN: CafeRushSkin = {
  id: "bodega", displayName: "Bodega", brandName: "Bodega Cafe",
  skinName: "Fall Rush", catcherName: "tray", prospect: true,
  colors: {
    bg: 0xf4e7d1, counter: 0x183d31, counterEdge: 0xe1b953,
    catcher: 0xfff2d8, catcherRim: 0xf0c34f, accent: 0xf0c34f,
    scoreText: "#183d31", goodText: "#214d35", badText: "#8c2537", text: "#183d31",
  },
  items: [
    { id: "spanish", kind: "good", points: 10, shape: "cup", fill: 0xc48854, accent: 0xfff2d8, label: "Spanish Latte", weight: 1.2, asset: "/assets/bodega/fall/spanish-latte.webp" },
    { id: "canela", kind: "good", points: 10, shape: "iced", fill: 0xd37a45, accent: 0xf0c34f, label: "Canela Love", asset: "/assets/bodega/fall/canela-love.webp" },
    { id: "muffin", kind: "good", points: 15, shape: "muffin", fill: 0xe4aa65, accent: 0x825137, label: "Coffee Cinnamon Muffin", asset: "/assets/bodega/fall/cinnamon-muffin.webp" },
    { id: "spill", kind: "bad", points: -15, shape: "spill", fill: 0x201d24, accent: 0xffba9d, label: "Coffee spill" },
  ],
  assets: {
    background: "/assets/bodega/fall/cafe-interior.webp",
    catcher: "/assets/bodega/fall/bodega-cat.webp",
    catcherMouth: { x: 0.61, y: 0.393, width: 0.71 },
  },
  chrome: { pageBg: "#fff2d8", panelBg: "#183d31", text: "#fff2d8", subtext: "#d8ddcc", accent: "#f0c34f", accentDeep: "#c48854", border: "#f0c34f", onAccent: "#201d24" },
};
