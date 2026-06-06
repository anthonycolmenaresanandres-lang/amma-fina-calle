// Per-restaurant brand chrome (logo, menu hero). Keeps /m/[id] and /owner/[id]
// generic: the route looks up assets by id and renders them only when present,
// so a new restaurant is added by dropping files in /public/assets/{id}/ and
// adding a key here — no per-route Colattao hardcoding.

export type BrandAssets = {
  /** Transparent logo, light/cream for dark backgrounds. */
  logo?: string;
  /** 4:5 hero image for the public menu. */
  menuHero?: string;
};

const BRANDS: Record<string, BrandAssets> = {
  colattao: {
    logo: "/assets/colattao/colattao-logo-cream-1600.png",
    menuHero: "/assets/colattao/colattao-menu-hero-4x5-v1.webp",
  },
};

export function getBrandAssets(restaurantId: string): BrandAssets {
  return BRANDS[restaurantId] ?? {};
}
