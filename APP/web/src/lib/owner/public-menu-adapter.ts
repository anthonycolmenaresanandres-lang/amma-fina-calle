import type { MaracaiboMenuSection } from "@/table-os/menu/maracaibo";

type PublicItem = { id: string; name: string; description?: string | null; price: number | string; photo_url?: string | null; is_available?: boolean; sizes?: { label: string; price: number | string }[] };
type PublicData = { restaurant: { id: string }; categories: { id: string; name: string; items: PublicItem[] }[] };
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function cents(value: number | string): number {
  if ((typeof value !== "number" && typeof value !== "string") || String(value).trim() === "") throw new Error("Missing price");
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0 || amount > 99999999.99) throw new Error("Invalid price");
  return Math.round(amount * 100);
}
function price(value: number | string): string {
  const amount = cents(value);
  return amount === 0 ? "Ask staff" : currency.format(amount / 100);
}

/** Fail closed for wrong-tenant/malformed data; never silently reuse stale prices. */
export function publicMenuSections(input: unknown, expectedRestaurantId: string): MaracaiboMenuSection[] {
  const data = input as PublicData | null;
  if (!data || data.restaurant?.id !== expectedRestaurantId || !Array.isArray(data.categories)) throw new Error("Menu is not connected to this location");
  return data.categories.map(category => {
    if (!category.id || typeof category.name !== "string" || !category.name.trim() || !Array.isArray(category.items)) throw new Error("Invalid category");
    return { name: category.name, items: category.items.filter(item => item.is_available !== false).map(item => {
      if (!item.id || typeof item.name !== "string" || !item.name.trim()) throw new Error("Invalid item");
      if (item.sizes != null && !Array.isArray(item.sizes)) throw new Error("Invalid sizes");
      const sizes = item.sizes ?? [];
      if (sizes.some(size => typeof size.label !== "string" || !size.label.trim())) throw new Error("Invalid size label");
      const photo = typeof item.photo_url === "string" && (/^https:\/\//.test(item.photo_url) || item.photo_url.startsWith("/assets/")) ? item.photo_url : undefined;
      return { name: item.name, description: typeof item.description === "string" ? item.description : undefined, photo,
        priceCents: cents(item.price), priceDisplay: sizes.length ? sizes.map(size => `${size.label} ${price(size.price)}`).join(" · ") : price(item.price) };
    }) };
  }).filter(category => category.items.length > 0);
}
