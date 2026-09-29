export const FINA_CALLE_PUBLIC_ORIGIN = "https://finacalleos.com";

const STABLE_GUEST_MENU_PATHS: Readonly<Record<string, string>> = {
  bodega: "/demo/bodega",
  colattao: "/m/colattao",
  "las-palmas-lynnhaven": "/demo/las-palmas",
};

// Keep printed Fina Calle URLs stable while a client's approved menu is hosted
// elsewhere. Use a temporary redirect so the destination can return to the
// shared publisher after migration without being pinned by browser caches.
const CURRENT_PUBLISHED_MENU_REDIRECTS: Readonly<Record<string, string>> = {
  colattao: "https://colattao-cafe-rush.vercel.app/menu",
};

export function guestMenuPath(restaurantId: string): string {
  return STABLE_GUEST_MENU_PATHS[restaurantId] ?? `/m/${encodeURIComponent(restaurantId)}`;
}

export function guestMenuAbsoluteUrl(restaurantId: string): string {
  return new URL(guestMenuPath(restaurantId), FINA_CALLE_PUBLIC_ORIGIN).toString();
}

export function guestMenuRedirectUrl(restaurantId: string): string | null {
  return CURRENT_PUBLISHED_MENU_REDIRECTS[restaurantId] ?? null;
}
