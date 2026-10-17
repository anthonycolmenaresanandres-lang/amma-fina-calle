export const venues = [
  {
    "slug": "aji-ichiban",
    "name": "Aji Ichiban",
    "short": "Aji",
    "tag": "Okinawan roots. Jacksonville soul.",
    "eyebrow": "OKINAWAN · JAPANESE",
    "game": "Ichiban Counter",
    "address": "343 Western Blvd · Suite I",
    "city": "Jacksonville, NC 28546",
    "phone": "910-353-8880",
    "tel": "9103538880",
    "site": "https://www.facebook.com/Aji-Ichiban-Jacksonville-NC-172572856114808/",
    "siteLabel": "Find Aji on Facebook",
    "hero": "soba",
    "groups": [
      {
        "id": "appetizers",
        "name": "Appetizers",
        "art": "gyoza",
        "items": [
          "Harumaki (Lumpia)",
          "Gyoza",
          "Shrimp Tempura",
          "Vegetable Tempura",
          "Chicken Yakitori",
          "Ichiban Sampler"
        ]
      },
      {
        "id": "soups",
        "name": "Soups",
        "art": "soba",
        "items": [
          "Okinawa Soba Soup",
          "Udon Soup"
        ]
      },
      {
        "id": "mains",
        "name": "Mains",
        "art": "katsu",
        "items": [
          "Curry Chicken Katsu",
          "Hibachi Bowl Chicken"
        ]
      },
      {
        "id": "rice-noodles",
        "name": "Rice & Noodles",
        "art": "noodles",
        "items": [
          "Yakisoba",
          "Fried Rice"
        ]
      }
    ],
    "foods": [
      "gyoza",
      "lumpia",
      "soba",
      "katsu",
      "yakitori",
      "noodles"
    ],
    "pickupNames": [
      "Gyoza",
      "Harumaki (Lumpia)",
      "Okinawa Soba Soup",
      "Curry Chicken Katsu",
      "Chicken Yakitori",
      "Yakisoba"
    ],
    "levels": [
      "Lantern lane",
      "The serving counter",
      "Evening market"
    ],
    "ink": "#f6ecd5",
    "bg": "#122736",
    "accent": "#f66a49",
    "light": "#ecd9af"
  },
  {
    "slug": "elsas-place",
    "name": "Elsa’s Place",
    "short": "Elsa",
    "tag": "A little island. A lot of heart.",
    "eyebrow": "CARIBBEAN & AMERICAN CUISINE",
    "game": "Court Street Kitchen",
    "address": "610 Court Street",
    "city": "Jacksonville, NC 28540",
    "phone": "910-346-1652",
    "tel": "9103461652",
    "site": "https://elsasplacejaxnc.wordpress.com/",
    "siteLabel": "Visit Elsa’s website",
    "hero": "jerk",
    "groups": [
      {
        "id": "plate-meals",
        "name": "Plate Meals",
        "art": "jerk",
        "items": [
          "Curry Chicken",
          "Jerk Chicken",
          "Stew Chicken",
          "Smothered Pork Chops",
          "Oxtail",
          "Goat",
          "Fried Fish",
          "Curry Shrimp"
        ]
      },
      {
        "id": "combo",
        "name": "Combo",
        "art": "patty",
        "items": [
          "2 Jamaican Beef Patty Combo"
        ]
      },
      {
        "id": "roti-other",
        "name": "Roti & Other",
        "art": "roti",
        "items": [
          "Chicken Roti",
          "Shrimp Roti",
          "Goat Roti"
        ]
      }
    ],
    "foods": [
      "patty",
      "roti",
      "jerk",
      "curry",
      "fish",
      "shrimp"
    ],
    "pickupNames": [
      "2 Jamaican Beef Patty Combo",
      "Chicken Roti",
      "Jerk Chicken",
      "Curry Chicken",
      "Fried Fish",
      "Curry Shrimp"
    ],
    "levels": [
      "Court Street welcome",
      "The lunch counter",
      "Kitchen rhythm"
    ],
    "ink": "#2d2722",
    "bg": "#f6e6c6",
    "accent": "#a32e29",
    "light": "#345e42"
  }
] as const;
export type Venue = typeof venues[number];
export function venueFor(slug:string):Venue { const venue=venues.find(v=>v.slug===slug);if(!venue)throw new Error('Unknown demo');return venue;}
