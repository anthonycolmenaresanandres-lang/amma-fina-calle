export type MenuPrice = { label: string; cents: number | null };
export type DraftMenuItem = {
  name: string;
  description?: string;
  source: string;
  prices?: MenuPrice[];
};

export type DraftMenuSection = {
  id: string;
  title: string;
  note: string;
  art?: "cafecito" | "bites" | "bakery";
  items: DraftMenuItem[];
};

// Anthony's supplied photos, 2026-09-25. Null means unlisted, not free or unavailable.
const classic = (name: string, small: number, large: number | null): DraftMenuItem => ({
  name, source: "37587.jpg",
  prices: [{ label: "12 oz", cents: small }, { label: "16 oz", cents: large }],
});
export const classicDrinks = [
  classic("Americano", 500, null),
  classic("Cappuccino", 525, 575),
  classic("Latte", 550, 575),
  classic("Mocha", 575, 650),
  classic("Drip coffee", 300, 350),
  classic("Hot cocoa", 400, 450),
  classic("Chai tea", 525, 575),
  classic("Tea", 325, null),
];
export const espressoDrinks: DraftMenuItem[] = [
  { name: "Espresso", source: "37587.jpg", prices: [{ label: "Double", cents: 400 }, { label: "Quad", cents: 600 }] },
  { name: "Cortado", source: "37587.jpg", prices: [{ label: "", cents: 525 }] },
];
export const classicExtras = [
  { name: "Oat milk", cents: 50 },
  { name: "Almond milk", cents: 50 },
  { name: "Syrup flavors", cents: 50 },
] as const;
const photoItem = (source: string, name: string, description?: string): DraftMenuItem => ({ name, description, source });

export const draftMenuSections: DraftMenuSection[] = [
  {
    id: "signature-cafecito",
    title: "Signature cafecito",
    art: "cafecito",
    note: "Ask us for prices and the full signature lineup.",
    items: [
      photoItem("37590.jpg", "Spanish Latte", "Espresso & condensed milk"),
      photoItem("37590.jpg", "La Isla", "Espresso, mocha & coconut"),
    ],
  },
  {
    id: "non-coffee", title: "Non-coffee", note: "Ask us for sizes and prices.",
    items: [
      photoItem("37592.jpg", "Lemonade", "Regular or frozen. Syrup flavors: strawberry, cherry, raspberry, blueberry, coconut, mint & lavender."),
      photoItem("37592.jpg", "Morir Soñando", "Orange juice, evaporated milk, vanilla & sugar"),
      photoItem("37592.jpg", "Strawberry Dragonfruit Refresher", "With or without lemonade"),
      photoItem("37592.jpg", "Fruit smoothies", "Mango, strawberry or blueberry"),
    ],
  },
  {
    id: "morning-bites",
    title: "Bodega Bites",
    art: "bites",
    note: "Breakfast sandwiches on a croissant or bagel. Ask us for prices.",
    items: [
      photoItem("37595.jpg", "Ham & Swiss"),
      photoItem("37595.jpg", "Turkey & cheddar"),
      photoItem("37595.jpg", "Chicken & Colby"),
      photoItem("37595.jpg", "Bacon, egg & cheese"),
      photoItem("37595.jpg", "Sausage, egg & cheese"),
      photoItem("37595.jpg", "Avocado toast", "Multigrain toast, avocado & everything-bagel seasoning. Add eggs or bacon; ask for add-on prices."),
      photoItem("37595.jpg", "Chicken lettuce wraps", "With croutons & ranch"),
      photoItem("37595.jpg", "Strawberry parfaits", "Vanilla yogurt & protein granola"),
      photoItem("37595.jpg", "Mini pancakes", "Options may vary"),
    ],
  },
  {
    id: "bakery-case",
    title: "Bakery",
    art: "bakery",
    note: "From the bakery case. Ask us for today's selection, varieties and prices.",
    items: [
      photoItem("37598.jpg", "Guava"),
      photoItem("37598.jpg", "Mixed Berry Strudel"),
      photoItem("37598.jpg", "Maple Pecan"),
      photoItem("37598.jpg", "Chocolate Twist"),
      photoItem("37598.jpg", "Cheese Stick (Quesito)"),
      photoItem("37598.jpg", "Pumpkin"),
      photoItem("37598.jpg", "Cinnamon Coffee"),
      photoItem("37598.jpg", "Chocolate Chip"),
      photoItem("37598.jpg", "Orange Cranberry"),
      photoItem("37598.jpg", "Bagels", "Ask for varieties"),
    ],
  },
];

// Internal reconciliation only; absence from a photo does not mean discontinued.
export const pendingOwnerConfirmation = [
  "Coco Loco", "Iced Bodega Cat", "Canela Love", "Croissant Sandwich",
  "Breakfast Sandwich", "Ham and Cheese", "Sourdough Croissant",
  "Pain au Chocolat", "Coffee Cinnamon Muffin", "Orange / Cranberry Muffin", "Coffee Cake",
] as const;

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

/** Transcribed from Anthony's fall-board photos (37497.png and 37590.jpg).
 * No price is visible; the Spiced Apple Chai recipe is cropped out.
 * The green drink is intentionally unnamed and is not a named menu entry.
 */
export const seasonalDrinks = [
  { id: "maple-morning", name: "Maple Morning", description: "Maple, brown sugar, cinnamon" },
  { id: "autumn-brew", name: "Autumn Brew", description: "White mocha cold brew & pumpkin pie cold foam" },
  { id: "haystack", name: "Haystack", description: "White mocha & butter pecan" },
  { id: "sugar-n-spice", name: "Sugar N Spice", description: "Sweetened condensed milk, spiced brown sugar" },
  { id: "spiced-apple-chai", name: "Spiced Apple Chai", description: "" },
] as const;

export const seasonalNote = "Add any flavor cold foam. Ask us for drink sizes, prices and cold-foam pricing.";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
export function formatMenuPrice(cents: number | null): string {
  return cents === null ? "Ask us" : usd.format(cents / 100);
}
