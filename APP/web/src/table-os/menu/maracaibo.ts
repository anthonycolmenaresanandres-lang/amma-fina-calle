/**
 * Public-source preview only. Do not publish or transact from this dataset until
 * Maracaibo Bistro's owner has confirmed the current menu, prices, modifiers,
 * availability, and tax treatment in writing.
 */

export type MaracaiboMenuItem = Readonly<{
  name: string;
  priceCents: number;
  priceDisplay: string;
}>;

export type MaracaiboMenuSection = Readonly<{
  name: string;
  items: readonly MaracaiboMenuItem[];
}>;

export type MaracaiboMenuSource = Readonly<{
  url: string;
  retrievedDate: "2026-07-23";
  role: "primary-public-menu" | "cross-check";
}>;

export const maracaiboMenuSourcePreview = {
  status: "PENDING_OWNER_CONFIRMATION" as const,
  customerFacingUse: "blocked" as const,
  prominentNotice:
    "SOURCE PREVIEW ONLY — OWNER CONFIRMATION REQUIRED before publishing, ordering, or representing prices or availability.",
  ownerConfirmationRequired: true,
  sources: [
    {
      url: "https://maracaibobistrovab.com/virginia-beach-maracaibo-bistro-food-menu",
      retrievedDate: "2026-07-23",
      role: "primary-public-menu",
    },
    {
      url: "https://www.toasttab.com/local/order/maracaibo-bistro",
      retrievedDate: "2026-07-23",
      role: "cross-check",
    },
  ] satisfies readonly MaracaiboMenuSource[],
  evidenceGaps: [
    "The official website and Toast list differing prices and item sets for shared menu sections.",
    "Public pages do not verify current availability, modifiers, taxes, or ordering eligibility.",
    "Owner-written approval is required before this data can become a live menu.",
  ],
} as const;

const item = (name: string, priceCents: number, priceDisplay: string): MaracaiboMenuItem => ({
  name,
  priceCents,
  priceDisplay,
});

/**
 * Transcribed from Maracaibo Bistro's public Food Menu on 2026-07-23.
 * Prices are structured as source-preview facts, not availability assertions.
 */
export const maracaiboMenuSections = [
  {
    name: "Appetizers",
    items: [
      item("Tequenos", 1099, "$10.99 / 5 Pieces"), item("Mini Tequenos", 999, "$9.99 / 5 Pieces"),
      item("Empanadas", 499, "$4.99"), item("Mini Empanadas", 1099, "$10.99 / 5 Pieces"),
      item("Sampler Maracaibo", 1999, "$19.99"), item("Pataconsitos", 1099, "$10.99"),
      item("Avocado with Shrimp", 1699, "$16.99"), item("Fresh Guacamole", 1299, "$12.99"),
      item("Pork Belly", 1099, "$10.99"),
    ],
  },
  {
    name: "Soups",
    items: [item("Sopa De Pollo", 1699, "$16.99"), item("Sopa De Carne", 1899, "$18.99"), item("Sopa De Mariscos", 2299, "$22.99"), item("Media Sopa", 1099, "$10.99")],
  },
  {
    name: "Salads",
    items: [item("Chicken Salad", 1499, "$14.99"), item("Steak Salad", 1799, "$17.99"), item("Shrimp Salad", 1999, "$19.99")],
  },
  {
    name: "Pa' Maracaibo",
    items: [
      item("Arepas Rellenas", 999, "$9.99"), item("Cachapas", 1399, "$13.99"), item("Patacon Relleno", 1499, "$14.99"),
      item("Arepas Cabimera", 1499, "$14.99"), item("Perro Caliente", 899, "$8.99"), item("Hamburguesa Sencilla", 1299, "$12.99 / 6 oz"),
      item("Hamburguesa Full", 1699, "$16.99"), item("Pepito", 1699, "$16.99 / 11 inches"),
      item("Pabellon Criollo", 1999, "$19.99"), item("Asado Negro", 2099, "$20.99"),
    ],
  },
  {
    name: "Grill",
    items: [
      item("Grilled Pork", 1699, "$16.99"), item("Grilled Chicken", 1699, "$16.99"), item("New York Steak", 1899, "$18.99"),
      item("Churrasco", 2699, "$26.99 / 12 oz"), item("Steak & Fries", 1899, "$18.99"), item("Bistec Encebollado", 1999, "$19.99"),
      item("Parrilla Individual", 2299, "$22.99"), item("Picada Mar Y Tierra", 2499, "$24.99"), item("Parrilla Maracaibo", 3449, "$34.49 / 2 Pieces"),
      item("Bandeja Paisa", 2299, "$22.99"), item("Steak & Shrimps", 2499, "$24.99"),
    ],
  },
  {
    name: "Seafood",
    items: [item("Pargo Frito", 4299, "$42.99"), item("Mojarra Frita", 2399, "$23.99"), item("Cazuela De Camarones", 2399, "$23.99"), item("Filete De Pescado", 1799, "$17.99")],
  },
  {
    name: "Chicken",
    items: [
      item("Pollo Santa Barbara", 1799, "$17.99"), item("Pollo Perija", 1799, "$17.99"), item("Pollo En Salsa De Champinones", 1799, "$17.99"),
      item("Pollo Guisado", 1799, "$17.99"), item("Chicken Chorizo", 1799, "$17.99"), item("Chicharron de Pollo", 1799, "$17.99"),
      item("Pollo Neptuno", 2499, "$24.99"), item("Pollo Maracaibo", 1999, "$19.99"), item("Chicken & Shrimps", 2199, "$21.99"),
    ],
  },
  {
    name: "Tacos",
    items: [
      item("Tacos De Carne Asada", 1699, "$16.99 / 3 Pieces"), item("Tacos De Pollo", 1599, "$15.99 / 3 Pieces"),
      item("Tacos De Chicharron", 1599, "$15.99 / 3 Pieces"), item("Tacos Maracaibo", 1699, "$16.99 / 3 Pieces"),
      item("Tacos De Camaron", 1799, "$17.99 / 3 Pieces"),
    ],
  },
  {
    name: "Chef Signatures",
    items: [item("Cazuela De Mariscos", 2399, "$23.99"), item("Lomito Neptuno", 2799, "$27.99"), item("Lomito Maracaibo", 2099, "$20.99")],
  },
  {
    name: "Sides",
    items: [
      item("Beans", 299, "$2.99"), item("Rice", 299, "$2.99"), item("Tortillas", 299, "$2.99"), item("Rice & Beans", 499, "$4.99"),
      item("Tostones", 499, "$4.99"), item("Salad", 499, "$4.99"), item("Sweet Plantains", 499, "$4.99"), item("Arepitas", 499, "$4.99"),
      item("Yuca Frita", 499, "$4.99"), item("1/2 Queso de Mano", 499, "$4.99"), item("Fries", 499, "$4.99"),
    ],
  },
  {
    name: "Desserts",
    items: [item("Alfajor", 399, "$3.99"), item("Quesillo", 899, "$8.99"), item("Tres Leches", 899, "$8.99"), item("Chocolate Cake", 899, "$8.99"), item("Passion Fruit Pie", 899, "$8.99")],
  },
  {
    name: "Drinks",
    items: [item("Soda", 299, "$2.99"), item("Frescolita", 399, "$3.99"), item("Maltin Polar", 399, "$3.99"), item("Papelon", 399, "$3.99"), item("Jugos", 599, "$5.99"), item("San Pellegrino", 599, "$5.99")],
  },
] as const satisfies readonly MaracaiboMenuSection[];
