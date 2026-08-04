export type MenuItem = {
  name: string;
  price: string;
  description?: string;
  note?: string;
};

export type MenuSection = {
  id: string;
  title: string;
  note?: string;
  items: MenuItem[];
};

export const menuSections: MenuSection[] = [
  {
    id: "appetizers",
    title: "Appetizers",
    items: [
      {
        name: "Chicken Quesadilla",
        price: "$13.96 · small $9.96",
        description: "Chicken, sautéed onions, mushrooms, cheddar jack, lettuce, tomato, salsa and sour cream.",
      },
      { name: "Chicken Bites", price: "$12.96", description: "Grilled or blackened chicken with wing sauce or dressing." },
      { name: "Chicken Tenders", price: "$12.96", description: "Seasoned, fried tenders with honey mustard; wing sauce optional." },
      { name: "Buffalo Chicken Dip", price: "$12.96", description: "Creamy sriracha chicken dip with chips or bread." },
      {
        name: "Spud Mountain",
        price: "$10.96 · small $7.96",
        description: "Fries loaded with cheese and bacon.",
        note: "Chili add-on shown on printed menu.",
      },
      { name: "Classic Potato Skins", price: "$10.96 · small $7.96", description: "Cheddar, Monterey jack, bacon and sour cream." },
      { name: "Fried Pickles", price: "$10.96", description: "Fried pickle chips with ranch." },
      { name: "A.J.'s Gator Tail", price: "$13.96", description: "Fried farm-raised alligator with tiger sauce." },
      { name: "Filet Mignon Steak Bites", price: "$15.96", description: "Grilled filet pieces with tiger sauce." },
      { name: "Tuna Bites", price: "$14.96", description: "Grilled or blackened tuna with tiger or cocktail sauce." },
      { name: "Fried Shrimp", price: "$13.96", description: "Lightly breaded shrimp, plain or Buffalo style." },
      { name: "Steamed Shrimp", price: "$17.96 · half $11.96", description: "Peel-and-eat shrimp with butter and cocktail sauce." },
      { name: "Crab Dip", price: "$14.96", description: "Warm crab-and-cheese dip with chips or bread." },
      { name: "Fried Mozzarella Sticks", price: "$9.96", description: "Served with warm marinara." },
      {
        name: "Southwest Egg Rolls",
        price: "$11.96",
        description: "Chicken, black beans, corn and jalapeño jack with ranch.",
        note: "Select locations; Holland Road confirmation required.",
      },
      { name: "A.J.'s Tacos", price: "$11.96", description: "Two soft tacos with slaw, tomato and taco sauce; fish, shrimp or chicken." },
      { name: "BBQ Pork Ribs", price: "$12.96", description: "Slow-cooked ribs with smoky BBQ sauce." },
    ],
  },
  {
    id: "favorites",
    title: "Gator's Favorites",
    note: "Add a small garden salad for $2.96. Platter substitutions shown at $2.96.",
    items: [
      { name: "A.J.'s Combo Platter", price: "$19.96", description: "Wings, tenders, potato skins, mozzarella sticks and onion rings with four sauces." },
      { name: "Chicken Tender Platter", price: "$17.96", description: "Fresh-breaded chicken tenders with fries and choice of wing sauce." },
      { name: "Traditional or Boneless Wing Platter", price: "$19.96", description: "Twelve wings with fries." },
      { name: "A.J.'s Extreme Nachos", price: "$14.96 · small $9.96", description: "Chili, two cheeses, lettuce, tomato, jalapeño and sour cream." },
      { name: "BBQ Pork Ribs", price: "$18.96", description: "Slow-cooked ribs with fries and coleslaw." },
    ],
  },
  {
    id: "main-events",
    title: "Main Events",
    note: "Add a small garden salad for $2.96.",
    items: [
      { name: "Fried Seafood Platter", price: "$29.96", description: "White fish, shrimp and lump crab cake with fries and coleslaw." },
      { name: "Fish & Chips", price: "$18.96", description: "Battered white fish with fries and coleslaw." },
      { name: "Steamed Shrimp", price: "$18.96", description: "One pound with fries and coleslaw." },
      { name: "Crab Cake", price: "$21.99", description: "Lump crab cake, sautéed or fried, with fries and coleslaw." },
      { name: "Chicken & Shrimp Alfredo", price: "$19.96", description: "Blackened chicken and shrimp over fettuccine." },
      { name: "Chicken & Broccoli Alfredo", price: "$18.96", description: "Grilled chicken and steamed broccoli over fettuccine." },
      { name: "Fried Shrimp", price: "$19.96", description: "Ten breaded shrimp with fries and coleslaw." },
    ],
  },
  {
    id: "wings",
    title: "Wings",
    note: "Traditional or boneless. Sauce list and add-ons require final location confirmation.",
    items: [
      {
        name: "A.J.'s Wings",
        price: "6 / $10.96 · 10 / $16.96 · 20 / $31.96",
        description: "Mild, medium, hot, Gates of Hell, General Tso's, Honey BBQ, Buffalo Honey BBQ, habanero mango, teriyaki, lemon pepper, Old Bay or garlic parmesan.",
      },
    ],
  },
  {
    id: "sandwiches",
    title: "Sandwiches & Wraps",
    note: "Includes potato salad or coleslaw. Printed substitutions: fries, tots, chips or sweet potato fries +$0.96; onion rings +$1.96; side salad +$2.96.",
    items: [
      { name: "Filet Mignon Steak Wrap", price: "$16.96", description: "Filet, cheese, lettuce, tomato and spicy ranch in a spinach tortilla." },
      { name: "Philly Steak or Chicken", price: "$12.96", description: "Sirloin or chicken with grilled onions and white American cheese." },
      { name: "Hot Honey BBQ Chicken Sandwich", price: "$14.96", description: "Grilled or fried chicken, spicy pickles, lettuce, tomato, red onion and special sauce." },
      { name: "Crispy Chicken Sandwich", price: "$14.96", description: "Crispy chicken with lettuce, tomato and red onion; plain or Buffalo style." },
      { name: "Chicken Sandwich", price: "$13.96", description: "Grilled or blackened chicken with lettuce, tomato, red onion and pickle." },
      { name: "Buffalo Chicken Wrap", price: "$13.96", description: "Spicy fried chicken, cheese, lettuce, tomato and spicy ranch." },
      { name: "Chicken Caesar Wrap", price: "$12.96", description: "Romaine, parmesan, Caesar dressing and grilled or blackened chicken." },
      { name: "Tuna Wrap", price: "$14.96", description: "Grilled or blackened tuna, slaw and cucumber wasabi." },
      { name: "Reuben", price: "$14.96", description: "Corned beef or smoked turkey, sauerkraut, Swiss and Thousand Island on rye." },
      { name: "Cuban Reuben", price: "$13.96", description: "Ham, corned beef, Swiss, pickle and Dijon on rye." },
      { name: "Gator's Ham & Turkey Club", price: "$13.96", description: "Triple-decker ham, turkey, bacon, American and Swiss with lettuce and tomato." },
      { name: "Turkey Melt", price: "$11.96", description: "Turkey, American cheese and bacon on Texas toast." },
      { name: "Crab Cake Sandwich", price: "$18.96", description: "Lump crab cake on brioche with lettuce, tomato, red onion and sauce." },
    ],
  },
  {
    id: "soups-salads",
    title: "Soups & Salads",
    note: "Garden or Caesar add-ons shown as chicken or shrimp +$5.96; hard-boiled egg +$0.96.",
    items: [
      { name: "She Crab Soup", price: "$10.96", description: "Rich creamy crab bisque." },
      { name: "Chili", price: "$7.96", description: "Meat-and-bean chili topped with shredded cheese." },
      { name: "Garden Salad", price: "large $10.96 · small $5.96", description: "Greens, tomato, red onion and shredded cheese." },
      { name: "Caesar Salad", price: "large $10.96 · small $5.96", description: "Romaine, Caesar dressing, parmesan and croutons." },
      { name: "Crispy Chicken Salad", price: "$14.96", description: "Garden salad with fried tenders, plain or Buffalo style." },
      { name: "Chef Salad", price: "$13.96", description: "Greens, cheese, bacon, tomato, red onion, egg, ham and turkey." },
      { name: "Wedge Salad", price: "$10.96", description: "Iceberg, tomato, bacon, blue cheese and balsamic reduction or dressing." },
    ],
  },
  {
    id: "burgers",
    title: "Burgers",
    note: "Brioche roll with lettuce, tomato, red onion and pickle; potato salad or coleslaw included. Other side substitutions shown on the printed menu.",
    items: [
      { name: "Gator Burger", price: "$16.96", description: "Bacon, sautéed mushrooms, onion and American cheese." },
      { name: "One Eyed Jack Burger", price: "$17.46", description: "Cheddar, bacon and a fried egg." },
      { name: "Mac and Cheese Burger", price: "$16.46", description: "House mac and cheese with cheddar." },
      { name: "Mushroom & Swiss Burger", price: "$16.46", description: "Sautéed mushrooms and Swiss." },
      { name: "Bacon Cheddar Melt Burger", price: "$16.96", description: "Texas toast, cheese and bacon." },
      { name: "Diablo Burger", price: "$15.96", description: "Fried jalapeño caps, mushrooms, onions, BBQ sauce and cheddar." },
      { name: "Bacon Cheese Burger", price: "$15.96", description: "Bacon and American cheese." },
      { name: "Bacon Blue Cheese Burger", price: "$15.96", description: "Blue cheese, bacon jam and grilled onions." },
      { name: "A.J.'s Basic Cheeseburger", price: "$14.46", description: "American cheese; grilled to order." },
    ],
  },
  {
    id: "kids",
    title: "Kids' Menu",
    note: "For guests 12 and under. Printed menu shows applesauce or fruit cup plus beverage for $7.96; fries +$0.96.",
    items: [
      { name: "Peanut Butter & Jelly", price: "$7.96" },
      { name: "Crispy Chicken Bites", price: "$7.96" },
      { name: "Cheese Quesadilla", price: "$7.96" },
      { name: "Grilled Cheese", price: "$7.96" },
      { name: "Mac and Cheese", price: "$7.96" },
    ],
  },
  {
    id: "sides",
    title: "Sides",
    items: [
      { name: "Coleslaw", price: "$2.96" },
      { name: "Potato Salad", price: "$2.96" },
      { name: "Broccoli", price: "$3.96" },
      { name: "French Fries", price: "$3.96" },
      { name: "Green Beans", price: "$3.96" },
      { name: "House Chips", price: "$3.96" },
      { name: "Mac & Cheese", price: "$3.96" },
      { name: "Onion Rings", price: "$4.96" },
      { name: "Sweet Potato Fries", price: "$4.96" },
      { name: "Tater Tots", price: "$4.96" },
    ],
  },
  {
    id: "desserts",
    title: "Desserts",
    items: [
      { name: "Nightingale Gourmet Ice Cream Sandwich", price: "$6.96", description: "Large enough for two; flavors vary." },
      { name: "Chocolate Lava Cake", price: "$7.96", description: "Served with vanilla ice cream." },
      { name: "Sundae", price: "$4.96" },
    ],
  },
  {
    id: "beverages",
    title: "Non-alcoholic Beverages",
    note: "Availability may vary by location.",
    items: [
      { name: "Fresh Brewed Iced Tea", price: "$2.96", description: "Sweet or unsweet; free refills shown on official menu." },
      { name: "Coca-Cola", price: "$2.96" },
      { name: "Diet Coke", price: "$2.96" },
      { name: "Coke Zero", price: "$2.96" },
      { name: "Dr. Pepper", price: "$2.96" },
      { name: "Sprite", price: "$2.96" },
      { name: "Ginger Ale", price: "$2.96" },
      { name: "Hi-C Pink Lemonade", price: "$2.96" },
      { name: "Red Bull", price: "$5.96" },
      { name: "Bottled Water", price: "$1.96" },
    ],
  },
];

// `deal` is the poster call-out, quoted directly from the transcribed detail —
// never a claim that isn't already in `detail`.
export const weeklySpecials = [
  { day: "Monday", title: "Burger Day", deal: "$3 off", detail: "$3 off burgers · all day", status: "Official Holland Road listing · pending owner approval" },
  { day: "Tuesday", title: "Two's Day", deal: "2 for $22.22", detail: "Two burgers or sandwiches with sides and non-alcoholic beverages for $22.22", status: "Official Holland Road listing · pending owner approval" },
  { day: "Wednesday", title: "Apps + Trivia", deal: "7–9 PM", detail: "Discounted appetizers · trivia from 7–9 PM", status: "Official Holland Road listing · pending owner approval" },
  { day: "Thursday", title: "Wing It", deal: "6 for $6", detail: "Six traditional wings for $6", status: "Official Holland Road listing · pending owner approval" },
] as const;

export const weeklySpecialsStatus = "Official Holland Road listings · every promotion pending owner approval.";

export const seasonalSpecials = [
  {
    title: "Summer Brisket Special",
    price: "$12.96",
    detail: "Chopped brisket sandwich with pickles, red onion and coleslaw, or a chopped brisket quesadilla with cheddar jack and BBQ sauce.",
  },
  {
    title: "Weekend Crushes",
    price: "$6.96",
    detail: "Photo-observed Waterman Spirits crush promotion. Times, flavors and availability require confirmation.",
  },
  {
    title: "30th Anniversary Wing Day",
    price: "$0.30 each",
    detail: "Photo states every 30th in 2026, 2–6 PM, dine-in only, orders of 6 or 10, one order per person.",
  },
] as const;

export const cocktailFeatures = [
  "Tastes Like Vacation",
  "Strawberry Martini",
  "Chocolate Covered Strawberry Martini",
  "Waterman Sunset",
  "Island Blush Crush",
  "Elderflower Lemonade Crush",
] as const;

export const menuEvidenceNote =
  "Owner-review transcription from the Holland Road printed menu and in-store promotional cards photographed August 1, 2026, cross-checked against the official menu and location page. Current online specials take priority where the photographed weekly card conflicts. Every item, price, schedule and availability remains pending location approval.";
