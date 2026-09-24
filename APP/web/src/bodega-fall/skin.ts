import type { CafeRushSkin } from "@/caferush/types";

export const BODEGA_CATCH_SKIN: CafeRushSkin = {
  id: "bodega", displayName: "Bodega", brandName: "Bodega Cafe",
  skinName: "Fall Rush", catcherName: "tray", prospect: true,
  colors: {
    bg: 0x5b202c, counter: 0x381820, counterEdge: 0xf0c34f,
    catcher: 0xfff2d8, catcherRim: 0xf0c34f, accent: 0xf0c34f,
    scoreText: "#fff2d8", goodText: "#bce7b5", badText: "#ffba9d", text: "#fff2d8",
  },
  items: [
    { id: "spanish", kind: "good", points: 10, shape: "cup", fill: 0xc48854, accent: 0xfff2d8, label: "Spanish Latte", weight: 1.2 },
    { id: "canela", kind: "good", points: 10, shape: "iced", fill: 0xd37a45, accent: 0xf0c34f, label: "Canela Love" },
    { id: "muffin", kind: "good", points: 15, shape: "muffin", fill: 0xe4aa65, accent: 0x825137, label: "Coffee Cinnamon Muffin" },
    { id: "spill", kind: "bad", points: -15, shape: "spill", fill: 0x201d24, accent: 0xffba9d, label: "Coffee spill" },
  ],
  chrome: { pageBg: "#fff2d8", panelBg: "#5b202c", text: "#fff2d8", subtext: "#e9c8be", accent: "#f0c34f", accentDeep: "#c48854", border: "#f0c34f", onAccent: "#201d24" },
};
