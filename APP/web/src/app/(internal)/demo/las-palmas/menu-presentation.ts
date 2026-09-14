import type { MaracaiboMenuItem } from "@/table-os/menu/maracaibo";

export const OFFICIAL_MENU_URL = "https://irp.cdn-website.com/1508c02f/files/uploaded/Las_Palmas_2-_3_-_4_Menu_2025.pdf";

// Visually checked against the PDF linked by the Lynnhaven official site on
// 2026-09-13. Presentation-only qualifiers: never overwrite owner-connected data.
const PREVIEW_OPTIONS: Record<string, { price: string; options: string }> = {
  "Arroz con Pollo": { price: "Lunch $15.99", options: "Lunch $15.99 · Dinner $20.75. Lunch is listed 11 am–3 pm; the lunch page lists $3 extra after 3 pm." },
  "Cheese Dip": { price: "From $9.99", options: "Small $9.99 · Large $13.99." },
  "Fajitas": { price: "From $24.25", options: "Chicken: one $24.25 / two $38.75. Steak: one $25.25 / two $39.75. Mixed: one $29.25 / two $41.75." },
  "Texas Fajitas": { price: "From $30.25", options: "For one $30.25 · For two $42.75." },
  "Shrimp Fajitas": { price: "From $26.25", options: "For one $26.25 · For two $41.75." },
  "Molcajete": { price: "From $29.99", options: "For one $29.99 · For two $43.25." },
  "Carne Asada Fries": { price: "From $21.99", options: "Grilled chicken $21.99 · Steak $22.99 · Mixed $25.99. Add shrimp $9.99." },
  "Tacos de Birria": { price: "$7.99 each", options: "One taco $7.99 · Three tacos $19.99." },
  "Tacos de Carne Asada": { price: "$6.99 each", options: "One taco $6.99 · Three tacos $16.99." },
  "Tacos de Tripa": { price: "$7.25 each", options: "One taco $7.25 · Three tacos $17.99." },
  "Ceviche Las Palmas": { price: "From $17.50", options: "Fish $17.50 · Shrimp $19.50 · Mixed $22.50." },
  "Lunch Fajitas": { price: "$18.25", options: "Lunch portion $18.25. Mixed add $2.99. Lunch hours and after-hours surcharge apply." },
  "Lunch Burrito Texano": { price: "$15.99", options: "Lunch portion $15.99. Add shrimp $4.99. Lunch hours and after-hours surcharge apply." },
};

export function previewItemDetails(item: MaracaiboMenuItem, isPreview: boolean) {
  const option = isPreview ? PREVIEW_OPTIONS[item.name] : undefined;
  return {
    price: option?.price ?? item.priceDisplay,
    options: option?.options,
    photo: isPreview ? item.photo?.replace("/menu-enhanced/", "/menu/") : item.photo,
  };
}

export function previewSectionLabel(name: string) {
  const labels: Record<string, { short: string; full: string }> = {
    "Most ordered": { short: "Highlights", full: "Menu highlights" },
    "Made at the table": { short: "To start", full: "A delicious start" },
    "Fajitas & grill": { short: "Fajitas", full: "From the grill" },
    "Seafood & chicken": { short: "Seafood & chicken", full: "Seafood & chicken" },
    "Burritos & enchiladas": { short: "Burritos", full: "Burritos & enchiladas" },
    "Lunch": { short: "Lunch & more", full: "Lunch, tacos & more" },
  };
  return labels[name] ?? { short: name, full: name };
}
