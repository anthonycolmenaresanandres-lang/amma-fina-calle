import type { MenuSnapshot } from "./import";
export const DEMO_ACCOUNT = { tenant: "example-cafe", businessName: "Example Café", location: "100 Example Lane · Test City", ownerEmail: "owner@example.test" };
export const DEMO_MENU: MenuSnapshot = {
  tenant: "example-cafe", source: "manual-json-v1", version: "sample-1", currency: "USD",
  categories: [{ sourceId: "coffee", name: "Coffee" }],
  items: [
    { sourceId: "coffee-001-12oz", categoryId: "coffee", name: "House coffee · 12 oz", description: "Freshly brewed", priceCents: 350, available: true, order: 0 },
    { sourceId: "coffee-002-12oz", categoryId: "coffee", name: "Iced latte · 12 oz", description: "Espresso over ice", priceCents: 525, available: true, order: 1 },
  ],
};
