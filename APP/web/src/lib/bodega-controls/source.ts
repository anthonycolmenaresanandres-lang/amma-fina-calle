import { classicDrinks, classicExtras, espressoDrinks, draftMenuSections, seasonalDrinks, seasonalNote, publishedBusinessDetails } from "../../app/(internal)/demo/bodega/menu-draft";

/** Published menu data only. Never include pendingOwnerConfirmation or owner records. */
export type PublishedItem = { name: string; description?: string; source?: string; prices?: readonly { label: string; cents: number | null }[]; cents?: number; id?: string };
export type PublishedGroup = { scope: string; items: readonly PublishedItem[] };
export function publishedGroups(): PublishedGroup[] {
  return [
    { scope: "seasonal", items: seasonalDrinks },
    { scope: "espresso", items: espressoDrinks },
    { scope: "classics", items: classicDrinks },
    { scope: "extras", items: classicExtras },
    ...draftMenuSections.map(s => ({ scope: s.id, items: s.items })),
  ];
}
export function publishedContent() {
  return {
    schema: "bodega-controls-v1", tenant: "bodega", path: "/demo/bodega",
    groups: publishedGroups(),
    sections: draftMenuSections.map(section => ({ id: section.id, title: section.title, ...(section.art ? { art: section.art } : {}), note: section.note })),
    seasonalNote, business: publishedBusinessDetails,
  };
}

// Reviewed permanent IDs. Names/positions here pin the initial source association;
// they are not a runtime identity algorithm. Changes require a new reviewed manifest.
export const SOURCE_BINDINGS: Record<string, readonly (readonly [string, string])[]> = {
  seasonal: [["fall-maple-morning","Maple Morning"],["fall-autumn-brew","Autumn Brew"],["fall-haystack","Haystack"],["fall-sugar-n-spice","Sugar N Spice"],["fall-spiced-apple-chai","Spiced Apple Chai"]],
  espresso: [["espresso-double-quad","Espresso"],["cortado","Cortado"]],
  classics: [["classic-americano","Americano"],["classic-cappuccino","Cappuccino"],["classic-latte","Latte"],["classic-mocha","Mocha"],["classic-drip","Drip coffee"],["classic-hot-cocoa","Hot cocoa"],["classic-chai","Chai tea"],["classic-tea","Tea"]],
  extras: [["extra-oat-milk","Oat milk"],["extra-almond-milk","Almond milk"],["extra-syrup","Syrup flavors"]],
  "signature-cafecito": [["cafecito-bodega-cat","Bodega Cat"],["cafecito-spanish-latte","Spanish Latte"],["cafecito-coco-loco","Coco Loco"],["cafecito-la-isla","La Isla"],["cafecito-canela-love","Canela Love"]],
  matcha: [["matcha-latte","Matcha Latte"],["matcha-banana-cloud","Banana Cloud Matcha"],["matcha-creme-brulee","Crème Brûlée Matcha"],["matcha-ube-coconut","Ube Coconut Matcha"]],
  "non-coffee": [["noncoffee-lemonade","Lemonade"],["noncoffee-morir-sonando","Morir Soñando"],["noncoffee-strawberry-dragonfruit","Strawberry Dragonfruit Refresher"],["noncoffee-smoothies","Fruit smoothies"]],
  "morning-bites": [["bites-ham-swiss","Ham & Swiss"],["bites-turkey-cheddar","Turkey & cheddar"],["bites-chicken-colby","Chicken & Colby"],["bites-bacon-egg-cheese","Bacon, egg & cheese"],["bites-sausage-egg-cheese","Sausage, egg & cheese"],["bites-avocado-toast","Avocado toast"],["bites-chicken-wraps","Chicken lettuce wraps"],["bites-strawberry-parfaits","Strawberry parfaits"],["bites-mini-pancakes","Mini pancakes"]],
  "bakery-case": [["bakery-guava","Guava"],["bakery-mixed-berry","Mixed Berry Strudel"],["bakery-maple-pecan","Maple Pecan"],["bakery-chocolate-twist","Chocolate Twist"],["bakery-quesito","Cheese Stick (Quesito)"],["bakery-pumpkin","Pumpkin"],["bakery-cinnamon-coffee","Cinnamon Coffee"],["bakery-chocolate-chip","Chocolate Chip"],["bakery-orange-cranberry","Orange Cranberry"],["bakery-bagels","Bagels"]],
};
