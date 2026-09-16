import catalog from "./catalog.json";
import manifest from "./manifest.json";

export type MenuGroup = "Food" | "Lunch" | "Dinner" | "Drinks";
export type GranPatronItem = { id: string; name: string; description: string; prices: string[]; sharedPrice: string; photo?: string };
export type GranPatronSection = { id: string; group: string; sourceGroup: string; name: string; note: string; items: GranPatronItem[] };
export const GRAN_PATRON_MENU: GranPatronSection[] = catalog;
export const GRAN_PATRON_MANIFEST = manifest;
export const GRAN_PATRON_LINKS = {
  menu: "/demo/gran-patron", game: "/play/gran-patron",
  order: "https://granpatron.hrpos.heartland.us/menu",
  foodSource: "https://granpatronvb.com/food-menu", drinksSource: "https://granpatronvb.com/drink-menu",
} as const;
export const normalizeSearch = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
export function searchMenu(query: string, group: MenuGroup) {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  return GRAN_PATRON_MENU.filter(section => terms.length || section.group === group).map(section => ({
    ...section,
    items: terms.length ? section.items.filter(item => {
      const content = normalizeSearch(`${section.group} ${section.name} ${item.name} ${item.description}`);
      return terms.every(term => content.includes(term));
    }) : section.items,
  })).filter(section => section.items.length);
}
export function itemPrice(item: GranPatronItem) {
  if (item.prices.length > 1) return "View sizes";
  if (item.prices.length === 1) return item.prices[0];
  if (item.sharedPrice) return item.sharedPrice;
  return /\$\d/.test(item.description) ? "View options" : "Ask for price";
}
