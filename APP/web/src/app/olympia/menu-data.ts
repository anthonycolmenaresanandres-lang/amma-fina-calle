import type { VenueMenuItem } from "@/venue-menu/VenueMenuSection";
import source from "./doordash-menu.json";

// Directly observed DoorDash groups. Do not infer food categories for featured items.
// Keep source spellings, descriptions and delivery prices; append verified records to the JSON.
export const olympiaMenuSource = source;
export const olympiaMenuDate = new Intl.DateTimeFormat("en-US", {
  month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
}).format(new Date(source.observedDate + "T00:00:00Z"));

const groups = [
  { id: "deli", name: "Signature sandwiches", sourceCategory: "SIGNATURE ON THE GIRL SANDWICHES" },
  { id: "special", name: "Special sandwiches", sourceCategory: "Special Sandwiches" },
  { id: "rice", name: "Featured items", sourceCategory: "Featured Items" },
  { id: "popular", name: "Most ordered", sourceCategory: "Most Ordered" },
  { id: "drinks", name: "Drinks", sourceCategory: "Drinks And Buverges" },
];

export const olympiaMenu: {
  id: string; name: string; sourceCategory: string; note: string; items: VenueMenuItem[];
}[] = groups.map(group => ({
  ...group,
  note: "Selected items · DoorDash delivery prices",
  items: source.items.flatMap((item, index) => item.observedCategory === group.sourceCategory ? [{
    id: "olympia-item-" + (index + 1),
    name: item.name.replace(/\s+/g, " ").trim(),
    description: item.description?.replace(/\s+/g, " ").trim(),
    priceLabel: item.price + " · DoorDash",
  }] : []),
})).filter(group => group.items.length > 0);

export const olympiaSections = [
  { id: "deli", label: "Menu" }, { id: "drinks", label: "Drinks" },
  { id: "juice", label: "Play" }, { id: "visit", label: "Visit" },
];
