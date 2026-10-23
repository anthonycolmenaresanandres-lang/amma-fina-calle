// Exact user-approved generated assets, optimized for this route.
// Original Library identities and derivative hashes are recorded in VISUAL_GAME_REVISION.md.
type VisualAsset = { src: string; width: number; height: number };
type GrillAsset = VisualAsset & { alt: string; transparent: boolean; generated: boolean };

export const visualAssets: { courtyard: VisualAsset | null; grill: GrillAsset } = {
  courtyard: {
    src: "/assets/el-mariachi/courtyard-atmosphere-v2.webp",
    width: 1536,
    height: 864,
  },
  grill: {
    src: "/assets/el-mariachi/grill-cutout-v2.webp",
    width: 1536,
    height: 1024,
    alt: "AI-styled view of El Mariachi's grilled meat skillet with cactus, onion and a fried egg, based on the original restaurant photograph",
    transparent: true,
    generated: true,
  },
};
