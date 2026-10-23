import { createHash } from "node:crypto";
import menu from "./data/el-mariachi-jacksonville.json";
import type { Tenant } from "./tenant";

const CATALOG = "el-mariachi-jacksonville";
const PAGE_SIZE = 8;
const aliases: Record<string, string[]> = {
  cat_201: ["starters", "entradas", "aperitivos"],
  cat_83: ["soups and salads", "sopas", "ensaladas"],
  cat_69: ["grilled tacos", "tacos a la parrilla"],
  cat_68: ["house specialties", "especialidades", "especialidades de la casa"],
  cat_75: ["fajita", "fajitas"],
  cat_77: ["enchiladas"],
  cat_78: ["steak", "bistec", "bisteces"],
  cat_79: ["quesadillas"],
  cat_80: ["pollo"],
  cat_81: ["mariscos", "pescados"],
  cat_82: ["nachos"],
  cat_76: ["tortas", "sandwiches"],
  cat_73: ["burrito", "burritos"],
  cat_85: ["vegetarian menu", "menu vegetariano", "vegetales"],
  cat_204: ["combos", "combinaciones", "crea tu combo"],
  cat_203: ["a la carta"],
  cat_84: ["side dishes", "acompanamientos", "guarniciones"],
  cat_74: ["children", "kids menu", "ninos", "menu infantil"],
  cat_66: ["drinks", "bebidas", "refrescos"],
  cat_72: ["dessert", "postres"],
};

function normalize(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}
const displayCategory = (name: string) => name === "Spups & Salads" ? "Soups & Salads" : name;
const categoryIndex = menu.categories.map((category) => ({
  id: category.id, name: displayCategory(category.name), sourceName: category.sourceName,
  itemCount: category.items.length, aliases: aliases[category.id] ?? [],
}));
const indexedItems = menu.categories.flatMap((category) => category.items.map((item) => ({
  record: { ...item, categoryId: category.id, category: displayCategory(category.name) },
  search: normalize([item.name, item.description, displayCategory(category.name),
    ...(aliases[category.id] ?? [])].join(" ")),
})));
const metadata = {
  catalog: CATALOG, itemCount: indexedItems.length, categoryCount: categoryIndex.length,
  sourceUrl: menu.sourceUrl, capturedAt: menu.retrievedAt,
  datasetSHA256: createHash("sha256").update(JSON.stringify(menu)).digest("hex"),
};
const context = {
  location: menu.location, address: menu.address, currency: menu.currency,
  priceNote: menu.priceNote, descriptionNote: menu.descriptionNote,
  optionsNote: "No structured modifiers or modifier prices were captured. Repeat only choices explicitly present in the supplied descriptions; do not infer missing options or resolve conflicting source text.",
  availabilityNote: "Dated menu snapshot, not live stock or guaranteed prices. This lookup does not place orders.",
};

export const menuLookupTool = {
  type: "function",
  name: "lookup_menu",
  description: "Read the captured Jacksonville menu. With only location, list categories. Use categoryId to browse, itemId for an exact record, or query for literal normalized search, including English/Spanish category aliases. Follow nextOffset for more results; no ordering action is performed.",
  parameters: {
    type: "object",
    properties: {
      location: { type: "string", enum: ["Jacksonville"] },
      query: { type: "string", maxLength: 100, description: "Dish name, description words, or category name." },
      categoryId: { type: "string", minLength: 1, maxLength: 32, description: "Exact category id returned by this tool, for example cat_83." },
      itemId: { type: "string", minLength: 1, maxLength: 32, description: "Exact item id returned by this tool; names can be duplicated." },
      offset: { type: "integer", minimum: 0, maximum: indexedItems.length },
    },
    required: ["location"],
    additionalProperties: false,
  },
} as const;

export function menuLookupMetadata(tenant: Tenant) {
  if (tenant.id !== "el-mariachi-demo" || tenant.menuCatalog !== CATALOG ||
      !Array.isArray(tenant.tools) || !tenant.tools.includes("lookup_menu")) return undefined;
  return { ...metadata };
}

export function lookupMenu(tenant: Tenant, args: unknown): string {
  const authorized = menuLookupMetadata(tenant);
  const error = (code: string, message: string) => JSON.stringify({
    ok: false, error: { code, message }, ...(authorized ? { metadata: authorized, context } : {}),
  });
  if (!authorized) return error("not_authorized", "This tenant has no explicitly enabled menu catalog.");
  if (!args || typeof args !== "object" || Array.isArray(args)) {
    return error("invalid_arguments", "Expected an object with location: Jacksonville.");
  }
  const input = args as Record<string, unknown>;
  const allowed = new Set(["location", "query", "categoryId", "itemId", "offset"]);
  if (Object.keys(input).some((key) => !allowed.has(key))) {
    return error("invalid_arguments", "Only location, query, categoryId, itemId, and offset are accepted.");
  }
  if (typeof input.location !== "string" || input.location.trim().toLowerCase() !== "jacksonville") {
    return error("unsupported_location", "This catalog contains only Jacksonville, North Carolina. Supply location: Jacksonville.");
  }
  for (const field of ["query", "categoryId", "itemId"] as const) {
    if (input[field] === undefined) continue;
    const value = input[field];
    const limit = field === "query" ? 100 : 32;
    if (typeof value !== "string" || value.length > limit || (field !== "query" && !value.trim())) {
      return error("invalid_arguments", `${field} must be a string of at most ${limit} characters${field === "query" ? "." : " and cannot be blank."}`);
    }
  }
  const query = typeof input.query === "string" ? normalize(input.query) : "";
  const categoryId = typeof input.categoryId === "string" ? input.categoryId.trim() : "";
  const itemId = typeof input.itemId === "string" ? input.itemId.trim() : "";
  const offset = input.offset === undefined ? 0 : input.offset;
  if (typeof offset !== "number" || !Number.isSafeInteger(offset) || offset < 0 || offset > indexedItems.length) {
    return error("invalid_offset", `offset must be an integer between 0 and ${indexedItems.length}.`);
  }
  if (typeof input.query === "string" && input.query.trim() && !query) {
    return error("invalid_query", "query must contain letters or numbers.");
  }
  if (categoryId && !categoryIndex.some((category) => category.id === categoryId)) {
    return error("invalid_category", "Unknown categoryId. Request the category index first.");
  }
  if (itemId && !indexedItems.some(({ record }) => record.id === itemId)) {
    return error("item_not_found", "Unknown itemId. Search by dish name or browse its category.");
  }
  if (!query && !categoryId && !itemId) {
    if (offset !== 0) return error("invalid_offset", "Category index requests use offset 0. Choose a category to page through items.");
    return JSON.stringify({ ok: true, metadata: authorized, context, categories: categoryIndex });
  }
  const words = query.split(" ").filter(Boolean);
  const matches = indexedItems.filter(({ record, search }) =>
    (!categoryId || record.categoryId === categoryId) && (!itemId || record.id === itemId) &&
    words.every((word) => search.includes(word)));
  if (offset > matches.length) return error("invalid_offset", `offset exceeds the ${matches.length} matching items. Start at 0.`);
  const items = matches.slice(offset, offset + PAGE_SIZE).map(({ record }) => record);
  return JSON.stringify({
    ok: true, metadata: authorized, context, totalMatches: matches.length,
    offset, pageSize: PAGE_SIZE, nextOffset: offset + items.length < matches.length ? offset + items.length : null,
    items,
  });
}
