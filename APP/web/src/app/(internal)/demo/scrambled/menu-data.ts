export type ScrambledMenuItem = {
  name: string;
  description?: string;
  price?: string | null;
  variants?: string;
};

export type ScrambledMenuSection = {
  id: string;
  title: string;
  note?: string;
  items: ScrambledMenuItem[];
};

export type ScrambledMenuGroup = {
  id: "breakfast" | "mediterranean" | "diner" | "drinks";
  eyebrow: string;
  title: string;
  intro: string;
  sections: ScrambledMenuSection[];
};

const item = (
  name: string,
  description?: string,
  price: string | null = null,
  variants?: string,
): ScrambledMenuItem => ({ name, description, price, variants });

export const scrambledMenuGroups: ScrambledMenuGroup[] = [
  {
    id: "breakfast",
    eyebrow: "Breakfast & brunch",
    title: "Breakfast all day",
    intro: "Egg breakfasts, house specialties, omelets, griddle favorites and lighter starts from the supplied Scrambled menu.",
    sections: [
      {
        id: "specialties",
        title: "Specialties",
        items: [
          item("Shakshuka", "Two eggs with sautéed peppers, onions and stewed tomatoes, served with chopped salad and toast."),
          item("Scrambled Skillet", "Two scrambled eggs with sausage, tomatoes, onions, peppers, hash browns and toast."),
          item("Biscuits & Gravy", "Buttermilk biscuits covered in house sausage gravy.", null, "Andouille sausage option shown on the photographed menu."),
          item("The Flip", "Thick-cut challah French toast with two eggs and your choice of bacon or sausage."),
          item("The Flop", "Two house pancakes with two eggs and your choice of bacon or sausage."),
          item("Avocado Toast", "Sourdough with avocado, red onion, tomato and an egg prepared your way.", "$10.95"),
        ],
      },
      {
        id: "omelets",
        title: "Omelets",
        note: "The photographed menu lists toast and a choice of hash browns or home-style potatoes. Egg-white and ingredient substitutions may cost extra.",
        items: [
          item("Haim’s Omelet", "A pastry-style omelet with grilled spinach, mushrooms, red onion and Havarti, topped with mushroom gravy."),
          item("Mediterranean Omelet", "Feta, artichoke, spinach, mushrooms and onion; the final printed cheese detail requires confirmation."),
          item("Western Omelet", "Ham, peppers, onions, tomatoes and pepper-jack cheese.", "$8.95"),
          item("Scrambled Omelet", "Avocado, mushrooms, tomatoes and Swiss cheese; one printed ingredient requires confirmation."),
          item("Cheese Omelet", "Choose Pepper Jack, Cheddar, American, Goat, Swiss or Havarti.", "$8.95"),
          item("Avocado & Andouille Omelet", "Avocado, peppers, onions, tomatoes, Andouille sausage and cheddar.", null, "Printed name requires confirmation."),
          item("Omelet Florentine", "Spinach, ham, tomato and Swiss with house hollandaise.", "$9.95"),
          item("Build Your Own Omelet", "Choose from the printed vegetables, cheeses and breakfast meats."),
          item("Meat Lovers", "Ham, sausage, bacon and cheese."),
        ],
      },
      {
        id: "egg-breakfast",
        title: "Egg breakfast",
        note: "Served all day. Potato and toast choices are shown on the photographed menu.",
        items: [
          item("Rise & Shine", "One egg, hash browns or home-style potatoes and toast.", "$5.95"),
          item("Beach Break", "Eggs with bacon, sausage or ham, breakfast potatoes and toast."),
          item("Scrambled Beach Burrito", "Two scrambled eggs with sausage, tomatoes, onions, peppers and pepper-jack in a flour tortilla, with salsa, sour cream and a potato choice.", "$10.95"),
          item("Scrambled Deluxe", "Eggs prepared your way, two bacon strips, two sausage links, toast and your choice of breakfast potatoes.", "$8.95"),
        ],
      },
      {
        id: "french-toast-pancakes",
        title: "French toast & pancakes",
        note: "Full and half portions, toppings and substitutions appear on the source menu; ask staff for current choices and prices.",
        items: [
          item("Challah French Toast", "Thick-cut challah prepared golden brown."),
          item("House Pancakes", "Home-style pancakes with topping options shown on the photographed menu."),
          item("Sweet Potato Pancakes", "Scrambled’s sweet-potato griddle specialty."),
        ],
      },
      {
        id: "benedicts",
        title: "Benedicts",
        note: "The photographed menu serves Benedicts with hash browns or home-style potatoes.",
        items: [
          item("Classic Benedict", "Two poached eggs with Canadian bacon on a toasted English muffin, topped with house hollandaise.", null, "Printed title requires confirmation."),
          item("Crab Benedict", "Poached eggs with Canadian bacon and tomato on a toasted English muffin, topped with crab cake and hollandaise."),
          item("Florentine Benedict", "Poached eggs with sautéed spinach and tomato on a toasted English muffin, topped with hollandaise.", "$8.95"),
        ],
      },
      {
        id: "light-options",
        title: "Light options",
        items: [
          item("Toasted Sesame Bagel", "Served with cream cheese on the side.", "$3.95"),
          item("Nova Lox", "Cream cheese, smoked salmon, diced tomato, red onion and capers.", "$12.95"),
          item("Steel-Cut Oatmeal", "Finished with brown sugar, dried cranberries and raisins.", "$7.95"),
        ],
      },
      {
        id: "breakfast-sides",
        title: "Breakfast sides",
        items: [
          item("Home-Style Potatoes", undefined, "$3.00"),
          item("Hash Browns", undefined, "$2.00"),
          item("Grits", undefined, "$2.00"),
          item("Bacon", undefined, "$2.50"),
          item("Sausage Links", undefined, "$2.50"),
          item("Turkey Sausage Patties", undefined, "$3.95"),
          item("Vegi Soy Links", "Printed spelling shown on the source menu; ingredients require confirmation.", "$3.50"),
          item("Fresh Fruit", undefined, "$3.95"),
          item("Avocado", undefined, "$3.50"),
          item("Sliced Tomato", undefined, "$1.50"),
          item("Bagel", undefined, "$2.00"),
          item("English Muffin", undefined, "$1.00"),
          item("Toast", "One slice.", "$0.50"),
          item("Biscuit", undefined, "$1.00"),
        ],
      },
    ],
  },
  {
    id: "mediterranean",
    eyebrow: "American · Mediterranean",
    title: "Mediterranean picks",
    intro: "Falafel, gyros, kabobs, couscous and the house combinations that give Scrambled its own lane on Atlantic Avenue.",
    sections: [
      {
        id: "mediterranean-picks",
        title: "Mediterranean picks",
        items: [
          item("Falafel Platter", "Seasoned chickpea falafel with hummus, tahini, lettuce, French fries, chopped salad and pita."),
          item("Simply Kebab Platter", "Three skewers with hummus, sides and chopped salad; confirm the photographed protein choices and base price.", null, "Additional kebab shown as $4.00."),
          item("Gyro", "Seasoned lamb gyro with vegetables and tzatziki."),
          item("Gyro Platter", "Gyro with salad, French fries and tzatziki."),
          item("Moroccan Salmon", "Salmon with a seasoned vegetable preparation; printed name and complete description require confirmation."),
          item("Vegetarian Couscous", "Steamed couscous topped with seasoned stewed vegetables."),
          item("Mediterranean Burger Wrap", "Seasoned beef, chipotle cream, French fries and chopped salad wrapped in a tortilla with a regular side."),
          item("Schnitzel & Rice", "Seasoned chicken cutlets with rice and salad.", "$9.95"),
        ],
      },
    ],
  },
  {
    id: "diner",
    eyebrow: "Diner & bar",
    title: "Lunch, dinner & beach favorites",
    intro: "Starters, fresh salads, sandwiches, children’s meals and sides from the supplied Diner & Bar menu.",
    sections: [
      {
        id: "starters",
        title: "Starters",
        items: [
          item("Nachos", "Chicken or beef with cheese, tomatoes, lettuce, salsa and sour cream.", null, "The full printed title and add-on prices require confirmation."),
          item("Cheese Quesadilla", "Flour tortilla with cheese, sautéed onions, tomatoes and peppers."),
          item("Scrambled Grilled Seasoned Wings", "Grilled wings with a choice of sauce."),
          item("Hummus & Pita", "House hummus made with ground chickpeas, tahini, lemon and garlic, served with pita."),
          item("9th Street Crab Dip", "Lump crab, cheeses and herbs with pita wedges or tortilla chips."),
          item("Cucumber, Tomato & Feta Platter", "Sliced cucumbers, tomatoes and feta with olive oil and seasoning."),
          item("Breaded Calamari", "Crisp calamari with marinara."),
          item("Scrambled Grilled Shrimp", "Grilled shrimp with house sauce."),
        ],
      },
      {
        id: "salads",
        title: "Salads",
        note: "The menu lists house ranch, Caesar, balsamic, bleu cheese, Thousand Island and house dressing.",
        items: [
          item("House Chopped Salad", "A Mediterranean-style mix of chopped vegetables."),
          item("Apple Walnut Salad", "Grilled chicken on greens with sliced apples, walnuts and goat cheese."),
          item("Chicken Caesar Salad", "Grilled chicken over a classic Caesar salad."),
          item("Greek Salad", "Crisp vegetables, olives and feta."),
          item("Cobb Salad", "Chicken, avocado, bacon, egg and garden vegetables."),
          item("Cilantro Lime Shrimp Salad", "Seasoned grilled shrimp on field greens with avocado, red onion and tomato."),
        ],
      },
      {
        id: "sandwiches",
        title: "Sandwiches",
        note: "Choice of one regular side. Premium side +$1.00.",
        items: [
          item("Harissa Egg Pita", "Seasoned egg, mayo and harissa in pita.", "$6.99", "Printed item name requires confirmation."),
          item("Schnitzel in Baguette", "Chicken cutlets, mayo, harissa and chopped salad.", "$8.99"),
          item("Scrambled Burger", "Seasoned beef, Swiss and grilled onion on a bun."),
          item("Falafel Pita", "Falafel, hummus, tahini, harissa and chopped salad in a pita pocket."),
          item("Grilled Tuna Wrap", "Fresh grilled tuna with lettuce, tomato and house salsa in a flour tortilla.", "$8.99"),
          item("Smoked Turkey Panini", "Turkey breast, bacon and Havarti on sourdough.", "$8.99"),
          item("Mediterranean Turkey Burger", "Seasoned turkey burger on a sesame bun.", "$7.99"),
          item("Patty Melt", "Seasoned beef, portabella mushrooms, onions and Swiss on rye."),
          item("BLT", "Bacon, lettuce, tomato and mayo on your choice of bread."),
          item("Turkey Club", "Turkey, American cheese, bacon, tomato and lettuce on your choice of bread."),
          item("Tuna Panini Melt", "House tuna salad with melted Swiss on toasted sourdough."),
          item("Fish or Shrimp Tacos", "Two flour tortillas with black-bean salsa, house slaw and chipotle cream sauce.", "$9.95"),
          item("Philly Steak or Chicken", "Steak or chicken with grilled onions, peppers and Havarti on a fresh baguette."),
          item("Chicken Sandwich", "Grilled or fried chicken with lettuce, tomato and mayo on a sesame bun.", "$7.95"),
        ],
      },
      {
        id: "beach-boxes",
        title: "Beach Boxes",
        note: "To-go and takeout bundles from the photographed menu. Prices require confirmation.",
        items: [
          item("Cape Henry", "Two turkey-or-ham-and-cheese sandwiches or wraps, two chips and two drinks."),
          item("Chesapeake Bay", "Three turkey-or-ham-and-cheese sandwiches or wraps, three chips and three drinks."),
          item("King Neptune", "Four turkey-or-ham-and-cheese sandwiches or wraps, four chips and four drinks."),
        ],
      },
      {
        id: "sides",
        title: "Sides",
        items: [
          item("Potato Salad", undefined, "$2.25", "Regular side"),
          item("Pasta Salad", undefined, "$2.25", "Regular side"),
          item("House Rice", undefined, "$2.25", "Regular side"),
          item("French Fries", undefined, "$2.25", "Regular side"),
          item("Veggies", "Ask staff about today’s vegetable.", "$2.25", "Regular side"),
          item("Fresh Fruit", undefined, "$3.25", "Premium side"),
          item("Grilled Parmesan Tomatoes", undefined, "$3.25", "Premium side"),
        ],
      },
    ],
  },
  {
    id: "drinks",
    eyebrow: "Cold · Hot · Fresh",
    title: "Beverages",
    intro: "Fountain drinks, juices, milk, coffee and espresso drinks listed on the supplied Diner & Bar menu.",
    sections: [
      {
        id: "beverages",
        title: "Beverages",
        note: "Sizes, grouped prices and seasonal flavors require close confirmation from the original menu.",
        items: [
          item("Coke", undefined, "$2.25"),
          item("Diet Coke", undefined, "$2.25"),
          item("Orange", "Printed brand name requires confirmation.", "$2.25"),
          item("Sprite", undefined, "$2.25"),
          item("Mr. Pibb", "Printed brand styling requires confirmation.", "$2.25"),
          item("Pink Lemonade", undefined, "$2.25"),
          item("Sweet Tea", undefined, "$2.25"),
          item("Unsweet Tea", undefined, "$2.25"),
          item("Milk", undefined, "$1.60"),
          item("Chocolate Milk", undefined, "$1.60"),
          item("Orange Juice", undefined, "$1.60"),
          item("Apple Juice", undefined, "$1.60"),
          item("Cranberry Juice", undefined, "$1.60"),
          item("Coffee"),
          item("Hot Tea", undefined, "$2.00"),
          item("Espresso Shot"),
          item("Cappuccino", "The photographed menu lists chocolate, French vanilla, hazelnut and caramel flavors for an additional charge."),
          item("Daily Dessert", "Fresh baked — ask your server for today’s selection."),
          item("Daily Drink Specials", "Ask your server about today’s drinks."),
        ],
      },
    ],
  },
];

export const scrambledBusiness = {
  name: "Scrambled",
  descriptor: "Breakfast all day · Mediterranean favorites",
  address: "910 Atlantic Ave, Virginia Beach, VA 23451",
  phoneDisplay: "757-644-6670",
  phoneHref: "tel:+17576446670",
  directionsUrl: "https://www.google.com/maps/search/?api=1&query=910%20Atlantic%20Ave%2C%20Virginia%20Beach%2C%20VA%2023451",
  hoursLabel: "Open daily · Call to confirm current hours",
  sourceChecked: "September 29, 2026",
} as const;

export function menuPriceLabel(price: string | null | undefined): string {
  return price ?? "Ask staff";
}
