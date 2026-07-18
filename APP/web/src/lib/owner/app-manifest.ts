import type { MetadataRoute } from "next";

const SAFE_RESTAURANT_ID = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;
const APP_BACKGROUND = "#07131d";
const APP_THEME = "#4f9dff";

export function isSafeRestaurantId(value: string): boolean {
  return SAFE_RESTAURANT_ID.test(value);
}

export function ownerAppPath(restaurantId: string): string {
  if (!isSafeRestaurantId(restaurantId)) {
    throw new Error("Invalid restaurant id for owner app manifest.");
  }
  return `/owner/${restaurantId}`;
}

function displayName(restaurantId: string): string {
  return restaurantId
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildOwnerAppManifest(
  restaurantId: string,
): MetadataRoute.Manifest {
  const startUrl = ownerAppPath(restaurantId);
  const iconBase = `${startUrl}/app-icon`;

  return {
    id: startUrl,
    name: `Fina Calle Owner — ${displayName(restaurantId)}`,
    short_name: "Fina Owner",
    description:
      "Secure restaurant-owner access for menu updates, requests, and billing status.",
    start_url: startUrl,
    scope: startUrl,
    display: "standalone",
    background_color: APP_BACKGROUND,
    theme_color: APP_THEME,
    orientation: "portrait-primary",
    categories: ["business", "productivity"],
    icons: [
      {
        src: `${iconBase}/192`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${iconBase}/192`,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: `${iconBase}/512`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${iconBase}/512`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
