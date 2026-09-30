export type SeedMenuItem = {
  id: string;
  name: string;
  description?: string;
  options?: string;
  price: null;
  source: string;
};

export type SeedMenuGroup = {
  id: string;
  name: string;
  note: string;
  items: SeedMenuItem[];
};

export const OFFICIAL_MENU_URL = "https://www.projectseedcoffee.com/menu";
export const OFFICIAL_ORDER_URL = "https://www.projectseedcoffee.com/pre-order";
export const MENU_CHECKED = "September 29, 2026";
export const OCTOBER_MENU_DATE = "October 1, 2026";
export const OCTOBER_FLYER_URL = "/assets/project-seed/brand/october-menu-reference.png";
export const OCTOBER_SOURCE = "Project Seed October menu flyer supplied September 30, 2026";
export const OCTOBER_LAUNCH_AT = Date.parse("2026-10-01T00:00:00-04:00");

export function octoberMenuIsLive(now = Date.now()): boolean { return now >= OCTOBER_LAUNCH_AT; }

const item = (id: string, name: string, description?: string, options?: string): SeedMenuItem => ({
  id, name, description, options, price: null, source: OFFICIAL_MENU_URL,
});

export const seedMenuGroups: SeedMenuGroup[] = [
  {
    id: "signature",
    name: "Signature lattes",
    note: "The official menu lists two espresso shots and a hot or iced option for these drinks.",
    items: [
      item("ube-velvet", "Ube Velvet", "Ube purple yam, a red-velvet-inspired profile, and a hint of dark chocolate.", "Hot or iced"),
      item("buko-pandan", "Buko Pandan", "Coconut and pandan's grassy-vanilla flavor.", "Hot or iced"),
      item("salted-egg-latte", "Salted Egg", "A custard-like flavor; the official menu specifies no eggs.", "Hot or iced"),
      item("honey-lavender", "Honey Lavender", "Floral, house-made lavender syrup.", "Hot or iced"),
      item("turon-latte", "Turon Latte", "Banana-plantain flavor with hints of caramel and cinnamon.", "Hot or iced"),
    ],
  },
  {
    id: "cold-brew",
    name: "Cold brew",
    note: "The official menu calls these daily options. Ask the team what is available today.",
    items: [
      item("original-cold-brew", "Original"),
      item("vanilla-bean-cold-brew", "Vanilla Bean"),
      item("salted-egg-cold-brew", "Salted Egg"),
      item("pandan-milk-tea-cold-brew", "Pandan Milk Tea"),
      item("ube-cold-brew", "Ube"),
    ],
  },
  {
    id: "coffee",
    name: "Coffee",
    note: "Traditional latte flavors are choices, not separately priced drinks in this preview.",
    items: [
      item("americano", "Americano"),
      item("mocha", "Mocha"),
      item("cappuccino", "Cappuccino"),
      item("espresso", "Espresso"),
      item("traditional-latte", "Traditional Latte", undefined, "Flavor choices: Vanilla Bean, Bourbon Caramel, Salted Caramel, Toffee Hazelnut, Pistachio, SF Vanilla, SF Hazelnut"),
    ],
  },
  {
    id: "tea-more",
    name: "Tea & more",
    note: "Ask staff about preparation, sizes, ingredients, and caffeine before ordering.",
    items: [
      item("matcha", "Matcha"),
      item("roasted-matcha", "Roasted Matcha"),
      item("hojicha", "Hojicha"),
      item("chai", "Chai"),
      item("black-tea", "Black Tea"),
      item("barley-tea", "Barley Tea"),
      item("hot-cocoa", "Hot Cocoa"),
      item("faux-latte", "Faux Latte"),
      item("mockaccino", "Mockaccino"),
      item("calamansi-juice", "Calamansi Juice"),
    ],
  },
];

const octoberItem = (id: string, name: string, description?: string, options?: string): SeedMenuItem => ({
  id, name, description, options, price: null, source: OCTOBER_SOURCE,
});

export const octoberMenuGroups: SeedMenuGroup[] = [
  {
    id: "october-lattes", name: "October lattes",
    note: "Seasonal lineup from Project Seed's October flyer. Ask staff about prices and availability.",
    items: [
      octoberItem("dwende-latte", "Dwende Latte", "Toasted marshmallow, chocolate, honey, and graham crackers with vanilla foam.", "Also available in cold brew"),
      octoberItem("kapre-latte", "Kapre Latte", "Spiced caramel apple cider."),
      octoberItem("mumu-latte", "Mumu Latte", "White chocolate and pistachio."),
      octoberItem("manang-latte", "Manang Latte", "Raspberry and dark chocolate."),
      octoberItem("pms-latte", "PMS Latte", "Pumpkin maple spice.", "Also available in cold brew"),
    ],
  },
  {
    id: "october-non-coffee", name: "October non-coffee",
    note: "The flyer lists these together. Ask staff how the two foams are served.",
    items: [
      octoberItem("bbl-refresher", "BBL Refresher", "Blackberry lychee."),
      octoberItem("salted-maple-foam", "Salted Maple Foam"),
      octoberItem("pumpkin-cheesecake-foam", "Pumpkin Cheesecake Foam"),
    ],
  },
];

export const gameFeatures = [
  { id: "ube-cold-brew", name: "Ube Cold Brew", group: "Cold brew", note: "A cold-brew favorite with ube flavor." },
  { id: "buko-pandan", name: "Buko Pandan", group: "Signature latte", note: "Coconut meets pandan's grassy vanilla." },
  { id: "turon-latte", name: "Turon Latte", group: "Signature latte", note: "Banana-plantain, caramel, and cinnamon notes." },
] as const;

export function seedMenuItemHref(id: string): string {
  return `/project-seed/menu#${id}`;
}
