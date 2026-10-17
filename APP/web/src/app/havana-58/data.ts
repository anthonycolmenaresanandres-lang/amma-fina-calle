export interface Venue{slug:string;name:string;short:string;tag:string;eyebrow:string;game:string;address:string;city:string;phone:string;tel:string;site:string;siteLabel:string;hero:string;groups:readonly {id:string;name:string;art:string;items:readonly string[]}[];foods:readonly string[];pickupNames:readonly string[];levels:readonly string[];ink:string;bg:string;accent:string;light:string}
export const venues:readonly Venue[]=[
  {
    "slug": "havana-58",
    "name": "Havana 58 Cafe",
    "short": "Havana",
    "tag": "Cafecito. A little good company.",
    "eyebrow": "CUBAN COFFEE · JACKSONVILLE",
    "game": "Cafecito Counter",
    "address": "1010 Henderson Drive · Unit 400",
    "city": "Jacksonville, North Carolina",
    "phone": "910-968-0002",
    "tel": "9109680002",
    "site": "https://www.havana58cafe.com/",
    "siteLabel": "Visit Havana 58’s website",
    "hero": "cafecito",
    "groups": [
      {
        "id": "cuban-drinks",
        "name": "Cuban Drinks",
        "art": "cafecito",
        "items": [
          "Cafecito Cubano",
          "Cortadito Cubano",
          "Good Morning Havana",
          "Colada",
          "Cafecito Con Leche",
          "Cafe Bombon"
        ]
      },
      {
        "id": "italian-drinks",
        "name": "Italian Drinks",
        "art": "cappuccino",
        "items": [
          "Cappuccino",
          "Cafe Latte",
          "Affogato al Caffe"
        ]
      },
      {
        "id": "sandwiches",
        "name": "Sandwiches",
        "art": "sandwich",
        "items": [
          "Cuban Sandwich",
          "Havana Club",
          "Caprese Sandwich"
        ]
      },
      {
        "id": "breakfast",
        "name": "Breakfast",
        "art": "croissant",
        "items": [
          "Breakfast Croissant"
        ]
      },
      {
        "id": "empanadas",
        "name": "Empanadas",
        "art": "empanada",
        "items": [
          "Empanadas"
        ]
      },
      {
        "id": "pastries",
        "name": "Pastries",
        "art": "cake",
        "items": [
          "Havana Cake",
          "Tres Leches Cake",
          "Strawberry Guava Cake",
          "Pastelitos"
        ]
      }
    ],
    "foods": [
      "cafecito",
      "pastelito",
      "empanada",
      "croissant",
      "sandwich",
      "cake"
    ],
    "pickupNames": [
      "Cafecito Cubano",
      "Pastelitos",
      "Empanadas",
      "Breakfast Croissant",
      "Cuban Sandwich",
      "Havana Cake"
    ],
    "levels": [
      "Café welcome",
      "The pastry counter",
      "Cafecito circuit"
    ],
    "ink": "#f3ecd6",
    "bg": "#171b1c",
    "accent": "#f8ca3e",
    "light": "#b6885f"
  }
];
export function venueFor(slug:string):Venue{const v=venues.find(v=>v.slug===slug);if(!v)throw new Error('Unknown demo');return v;}
