/** Shared, deterministic menu controls. No AI/API provider or browser authority. */
export const LAS_PALMAS_RESTAURANT_ID = "las-palmas-lynnhaven";

export function ownerGuestMenuPath(restaurantId: string): string {
  if (restaurantId === "colattao") return "https://colattao-cafe-rush.vercel.app/menu";
  if (restaurantId === LAS_PALMAS_RESTAURANT_ID) return "/demo/las-palmas";
  return `/m/${encodeURIComponent(restaurantId)}`;
}

export const MENU_EDIT_FIELDS = ["name", "description", "price", "is_available", "size_price"] as const;
export type MenuEditField = typeof MENU_EDIT_FIELDS[number];
export type MenuEdit = {
  restaurantId: string;
  itemId: string;
  field: MenuEditField;
  value: string;
  expectedValue: string;
  sizeLabel?: string;
};

export function normalizedMenuValue(field: MenuEditField, value: unknown): string {
  if (field === "price" || field === "size_price") {
    const text = String(value ?? "").trim();
    if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(text)) throw new Error("Enter a price from 0 to 99,999,999.99 with up to 2 decimal places.");
    return Number(text).toFixed(2);
  }
  if (field === "is_available") {
    if (value !== true && value !== false && value !== "true" && value !== "false") throw new Error("Choose Available or Sold out.");
    return String(value);
  }
  const text = String(value ?? "").trim();
  if (field === "name" && (!text || text.length > 120)) throw new Error("Enter an item name of 1–120 characters.");
  if (field === "description" && text.length > 1500) throw new Error("Keep the description to 1,500 characters or fewer.");
  return text;
}

export function validateMenuEdit(input: MenuEdit): MenuEdit {
  if (!input || typeof input !== "object" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.restaurantId) || input.restaurantId.length > 80 ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.itemId) ||
      !MENU_EDIT_FIELDS.includes(input.field)) throw new Error("Choose a valid menu item and field.");
  if (input.field === "size_price" && (typeof input.sizeLabel !== "string" || !input.sizeLabel.trim() || input.sizeLabel.length > 80)) {
    throw new Error("Choose a valid size.");
  }
  return { ...input, value: normalizedMenuValue(input.field, input.value), expectedValue: normalizedMenuValue(input.field, input.expectedValue) };
}

export function displayMenuValue(field: MenuEditField, value: string): string {
  if (field === "is_available") return value === "true" ? "Available" : "Sold out";
  if (field === "price" || field === "size_price") return Number(value) === 0 ? "Ask staff" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
  return value || "No description";
}
