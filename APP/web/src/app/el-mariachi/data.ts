import menuSource from "./jacksonville-menu.json";
import locationSource from "./locations.json";

export const BRAND_URL = "https://www.elmariachimexandgrillnc.com/";
export const MENU_RETRIEVED = "October 23, 2026";
export const LOGO_PATH = "/assets/el-mariachi/official-logo.png";
export const DEFAULT_LOCATION = "jacksonville";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  priceDisplay: string;
  orderUrl: string;
};

export type MenuCategory = {
  id: string;
  name: string;
  items: MenuItem[];
};

export const categories: MenuCategory[] = menuSource.categories.map((category) => ({
  id: category.id,
  name: category.name === "Spups & Salads" ? "Soups & Salads" : category.name,
  items: category.items.map(({ id, name, description, price, priceDisplay, orderUrl }) => ({
    id, name, description, price, priceDisplay, orderUrl,
  })),
}));

export const locations = locationSource.locations;
export type Location = (typeof locations)[number];
export const jacksonville = locations.find((location) => location.slug === DEFAULT_LOCATION)!;
export const totalItems = categories.reduce((total, category) => total + category.items.length, 0);

export function getLocation(slug: string | null | undefined): Location {
  return locations.find((location) => location.slug === slug) ?? jacksonville;
}

export function getCategory(id: string | null | undefined): string {
  return categories.some((category) => category.id === id) ? id! : "all";
}

export function normalizeSearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim();
}
