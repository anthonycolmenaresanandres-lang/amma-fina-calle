import type { VenueMenuItem } from "@/venue-menu/VenueMenuSection";

// Third-party listing names supplied in the prospect brief; provisional, not owner-approved.
// Deliberately no prices, descriptions, availability, allergen or venue-wide halal claims.
export const olympiaMenu: { id: string; name: string; items: VenueMenuItem[] }[] = [
  { id: "deli", name: "Deli classics", items: [
    { name: "NY Chopped Cheese" }, { name: "Olympia Chopped Cheese" },
    { name: "Reuben" }, { name: "Caesar Wrap" }, { name: "Russian Panini" },
  ] },
  { id: "rice", name: "Rice & gyros", items: [
    { name: "Lamb Over Rice" }, { name: "Halal Chicken Over Rice" }, { name: "Lamb Gyro" },
  ] },
];
export const olympiaSections = [
  { id: "deli", label: "Deli" }, { id: "rice", label: "Rice & gyros" },
  { id: "juice", label: "Juice" }, { id: "visit", label: "Visit" },
];
