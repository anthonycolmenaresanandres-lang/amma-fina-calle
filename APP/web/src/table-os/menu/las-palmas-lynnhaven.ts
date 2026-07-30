/**
 * Public-source prospect preview only. Do not use this dataset for live ordering
 * until the owner confirms the current menu, prices, modifiers, availability,
 * alcohol rules, and tax treatment in writing.
 */

import type { MaracaiboMenuItem, MaracaiboMenuSection } from "./maracaibo";
import mediaJson from "./las-palmas-lynnhaven-media.json";

// Per-item description + photo harvested from the same public DoorDash page as
// the prices (tools/laspalmas-menu-scrape.mjs writes this file; photos land in
// /public/assets/laspalmas/menu/). Restaurant's own marketing content — demo
// use only, PENDING CLIENT APPROVAL. Empty file → menu renders exactly as
// before (names + prices only).
const MEDIA = mediaJson as Record<string, { description?: string; photo?: string }>;

type LasPalmasMenuSource = Readonly<{
  url: string;
  retrievedDate: "2026-07-23";
  role: "primary-public-ordering" | "official-menu-cross-check";
}>;

export const lasPalmasLynnhavenMenuSourcePreview = {
  status: "PENDING_OWNER_CONFIRMATION" as const,
  customerFacingUse: "blocked" as const,
  prominentNotice:
    "PROSPECT PREVIEW ONLY — PUBLIC PRICES MAY DIFFER IN-STORE. OWNER CONFIRMATION IS REQUIRED BEFORE GUEST ACTIVATION.",
  ownerConfirmationRequired: true,
  sources: [
    {
      url: "https://order.online/store/las-palmas-mexican-restaurant-%26-cantina-virginia-beach-285708/?hideModal=true&pickup=true",
      retrievedDate: "2026-07-23",
      role: "primary-public-ordering",
    },
    {
      url: "https://irp.cdn-website.com/1508c02f/files/uploaded/Las_Palmas_2-_3_-_4_Menu_2025.pdf",
      retrievedDate: "2026-07-23",
      role: "official-menu-cross-check",
    },
  ] satisfies readonly LasPalmasMenuSource[],
  evidenceGaps: [
    "Public pages do not identify the in-house POS or confirm dine-in table ordering.",
    "DoorDash prices may include channel-specific pricing and do not verify in-store availability.",
    "The official PDF covers multiple Las Palmas locations, so location-specific modifiers require owner confirmation.",
  ],
} as const;

const item = (name: string, priceCents: number, priceDisplay: string): MaracaiboMenuItem => ({
  name,
  priceCents,
  priceDisplay,
  ...MEDIA[name],
});

/**
 * Curated from the Lynnhaven DoorDash Commerce Platform page on 2026-07-23.
 * This intentionally stays smaller than the full public catalog for a fast,
 * honest sales preview.
 */
export const lasPalmasLynnhavenMenuSections = [
  {
    name: "Most ordered",
    items: [
      item("Burrito California", 1999, "$19.99"),
      item("Quesabirria", 2150, "$21.50"),
      item("Enchiladas al Queso", 1799, "$17.99"),
      item("Pollo Yucatan", 2375, "$23.75"),
      item("Carne Asada", 2575, "$25.75"),
      item("Carnitas Michoacan", 2225, "$22.25"),
      item("Arroz con Pollo", 1599, "$15.99"),
      item("Fajitas Nachos", 2199, "$21.99"),
    ],
  },
  {
    name: "Made at the table",
    items: [
      item("Tableside Guacamole", 1399, "$13.99"),
      item("Queso Fundido", 1099, "$10.99"),
      item("Cheese Dip", 999, "$9.99"),
      item("Guacamole Dip", 850, "$8.50"),
    ],
  },
  {
    name: "Fajitas & grill",
    items: [
      item("Sizzling Steak & Shrimp", 2825, "$28.25"),
      item("Steak Vallarta", 2775, "$27.75"),
      item("Fajitas", 2425, "$24.25"),
      item("Texas Fajitas", 3025, "$30.25"),
      item("Javier Special", 2425, "$24.25"),
      item("Molcajete", 2999, "$29.99"),
      item("Carne Asada Fries", 2199, "$21.99"),
    ],
  },
  {
    name: "Seafood & chicken",
    items: [
      item("Special El Puerto", 2475, "$24.75"),
      item("Camarones Yucatan", 2450, "$24.50"),
      item("Arroz con Mariscos", 2350, "$23.50"),
      item("Camarones Sinaloa", 2299, "$22.99"),
      item("Shrimp Fajitas", 2625, "$26.25"),
      item("Pollo a la Crema", 2075, "$20.75"),
      item("Arroz con Camaron", 2150, "$21.50"),
    ],
  },
  {
    name: "Burritos & enchiladas",
    items: [
      item("Burrito Dos Manos", 1999, "$19.99"),
      item("Burrito Texano", 2299, "$22.99"),
      item("Burrito San Jose", 1699, "$16.99"),
      item("Enchiladas Supremas", 1799, "$17.99"),
      item("El Cazuelon", 2325, "$23.25"),
      item("Palms Ranchero", 2699, "$26.99"),
    ],
  },
  {
    name: "Lunch",
    items: [
      item("Lunch Special #2", 999, "$9.99"),
      item("Lunch Burrito Texano", 1599, "$15.99"),
      item("Lunch Fajitas", 1825, "$18.25"),
      item("Tacos de Birria", 799, "$7.99"),
      item("Tacos de Carne Asada", 699, "$6.99"),
      item("Tacos de Tripa", 725, "$7.25"),
      item("Ceviche Las Palmas", 1750, "$17.50"),
    ],
  },
] as const satisfies readonly MaracaiboMenuSection[];
