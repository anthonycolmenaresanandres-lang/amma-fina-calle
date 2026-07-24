export type DraftMenuItem = {
  name: string;
  sourceLabel: "Current public listing - owner confirm";
};

export type DraftMenuSection = {
  id: string;
  side: string;
  title: string;
  note: string;
  items: DraftMenuItem[];
};

const currentPublicCandidate = (name: string): DraftMenuItem => ({
  name,
  sourceLabel: "Current public listing - owner confirm",
});

export const draftMenuSections: DraftMenuSection[] = [
  {
    id: "signature-cafecito",
    side: "Side A",
    title: "Signature cafecito",
    note: "Candidate item names from a current third-party listing. Recipes, availability, sizes, and prices are not verified.",
    items: [
      currentPublicCandidate("Coco Loco"),
      currentPublicCandidate("Iced Bodega Cat"),
      currentPublicCandidate("Canela Love"),
    ],
  },
  {
    id: "morning-bites",
    side: "Side B",
    title: "Morning bites",
    note: "Proposed grouping only. The owners must confirm the official category name and current lineup.",
    items: [
      currentPublicCandidate("Croissant Sandwich"),
      currentPublicCandidate("Breakfast Sandwich"),
      currentPublicCandidate("Ham and Cheese"),
      currentPublicCandidate("Bagel"),
    ],
  },
  {
    id: "bakery-case",
    side: "Fresh press",
    title: "Bakery case",
    note: "Publicly mentioned candidates; daily availability and dietary or allergen details remain unknown.",
    items: [
      currentPublicCandidate("Sourdough Croissant"),
      currentPublicCandidate("Pain au Chocolat"),
      currentPublicCandidate("Coffee Cinnamon Muffin"),
      currentPublicCandidate("Orange / Cranberry Muffin"),
      currentPublicCandidate("Coffee Cake"),
    ],
  },
];

export const publishedBusinessDetails = {
  lead: "Authentically made cafecito",
  address: "3574 Holland Rd, Virginia Beach, VA 23452",
  instagramUrl: "https://www.instagram.com/bodegacafe.757/",
  hours: [
    { days: "Monday - Friday", time: "7 AM - 4 PM" },
    { days: "Saturday", time: "8 AM - 4 PM" },
    { days: "Sunday", time: "8 AM - 2 PM" },
  ],
};
