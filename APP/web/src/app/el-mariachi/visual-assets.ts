// Exact user-approved generated assets, optimized for this route.
// Original Library identities and derivative hashes are recorded in VISUAL_GAME_REVISION.md and FOOD_TEXTURE_ASSETS.json.
type VisualAsset = { src: string; width: number; height: number };
type GrillAsset = VisualAsset & { alt: string; transparent: boolean; generated: boolean };
type FeaturedDishAsset = GrillAsset & { label: string; fallback: VisualAsset & { alt: string } };

export const visualAssets: { courtyard: VisualAsset | null; grill: GrillAsset; food: FeaturedDishAsset[] } = {
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
  food: [
    {
      src: "/assets/el-mariachi/fajitas-cutout-v1.webp", width: 1536, height: 1024,
      label: "Fajitas fundida",
      alt: "AI-styled cutout of the pineapple fajitas skillet, based on El Mariachi's original Fajitas fundida photograph",
      transparent: true, generated: true,
      fallback: { src: "/assets/el-mariachi/official-fajitas.jpg", width: 922, height: 692, alt: "El Mariachi's official photograph labeled Fajitas fundida, served in a pineapple" },
    },
    {
      src: "/assets/el-mariachi/pizza-birria-cutout-v1.webp", width: 1536, height: 1024,
      label: "Pizza Birria",
      alt: "AI-styled cutout of Pizza Birria with its original accompaniments, based on El Mariachi's restaurant photograph",
      transparent: true, generated: true,
      fallback: { src: "/assets/el-mariachi/official-birria.jpg", width: 922, height: 692, alt: "El Mariachi's official photograph labeled Pizza Birria, with salsa and consommé" },
    },
  ],
};
