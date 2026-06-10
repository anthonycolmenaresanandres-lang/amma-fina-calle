// Starter lead packs shipped in code so the owner can load a real prospect list with
// one tap (no copy-paste). These are PUBLIC business names compiled from public "best
// of" listings — not PII, no private data — so they're safe to ship. Edit freely.
// Loaded into whatever territory is active; Survey afterward enriches each from public
// data. (The fictional demo world still lives in seed.ts; this is an explicit opt-in.)

import type { Fit, LeadEvent, LeadMeta } from "./types";
import { DEFAULT_TERRITORY } from "./territories";

export interface StarterBiz { name: string; businessType: string; fit: Fit }

// Wider Hampton Roads — independent coffee shops + local restaurants (chains excluded).
export const HAMPTON_ROADS_STARTER: StarterBiz[] = [
  // Coffee / cafes (closest fit to the Colattao flagship)
  { name: "Three Ships Coffee", businessType: "coffee", fit: "HOT" },
  { name: "Rich Port Coffee", businessType: "coffee", fit: "HOT" },
  { name: "Coaster Coffee", businessType: "coffee", fit: "HOT" },
  { name: "Fair Grounds", businessType: "coffee", fit: "HOT" },
  { name: "Sawdust Road", businessType: "coffee", fit: "HOT" },
  { name: "Mosaic Cafe & Eatery", businessType: "cafe", fit: "HOT" },
  { name: "Java Surf Cafe & Espresso Bar", businessType: "coffee", fit: "HOT" },
  { name: "Pale Horse Coffee", businessType: "coffee", fit: "HOT" },
  { name: "Taxus Street Coffee", businessType: "coffee", fit: "HOT" },
  { name: "RoJo Coffee", businessType: "coffee", fit: "HOT" },
  { name: "Gather Cafe", businessType: "cafe", fit: "HOT" },
  { name: "Pourfavor", businessType: "coffee", fit: "HOT" },
  { name: "Knott's Coffee Company", businessType: "coffee", fit: "HOT" },
  { name: "Sweet Beans Coffee Bar", businessType: "coffee", fit: "HOT" },
  { name: "Buckroe Coffee Co.", businessType: "coffee", fit: "HOT" },
  // Local restaurants
  { name: "LeGrand Kitchen", businessType: "restaurant", fit: "WARM" },
  { name: "Luce", businessType: "restaurant", fit: "WARM" },
  { name: "Press 626 Wine Bar", businessType: "restaurant", fit: "WARM" },
  { name: "Ilo Bistro", businessType: "restaurant", fit: "WARM" },
  { name: "Freemason Abbey Restaurant", businessType: "restaurant", fit: "WARM" },
  { name: "Toast", businessType: "restaurant", fit: "WARM" },
  { name: "Mizuno Japanese Restaurant", businessType: "restaurant", fit: "WARM" },
  { name: "The Veranda Trattoria", businessType: "restaurant", fit: "WARM" },
  { name: "Vang Go Bistro", businessType: "restaurant", fit: "WARM" },
  { name: "Stony's Dockside Bar and Grill", businessType: "restaurant", fit: "WARM" },
  { name: "The Fishin' Pig", businessType: "restaurant", fit: "WARM" },
  // Pet groomers — appointment-driven, the booking-bot sweet spot
  { name: "Blue Ribbon Pet Salon", businessType: "pet grooming", fit: "HOT" },
  { name: "Muddy Buddy", businessType: "pet grooming", fit: "HOT" },
  { name: "Blue Haven Pet Salon", businessType: "pet grooming", fit: "HOT" },
  { name: "Jazz Pawz Bowtique", businessType: "pet grooming", fit: "HOT" },
  { name: "Canine Cloud 9", businessType: "pet grooming", fit: "HOT" },
  { name: "Great Neck Pet Grooming", businessType: "pet grooming", fit: "HOT" },
  // Salons / barbers / spas — also appointment-driven
  { name: "Fringe Salon", businessType: "salon", fit: "WARM" },
  { name: "Dupré's Salon & Day Spa", businessType: "spa", fit: "WARM" },
  { name: "AOC Salon", businessType: "salon", fit: "WARM" },
  { name: "Cali Hair Studio", businessType: "salon", fit: "WARM" },
  { name: "Sage Hair Studio", businessType: "salon", fit: "WARM" },
  { name: "Mint Salon", businessType: "salon", fit: "WARM" },
  { name: "Ava Marie Salon of Creatives", businessType: "salon", fit: "WARM" },
  { name: "Salt Hair Collective", businessType: "salon", fit: "WARM" },
  { name: "Get Faded", businessType: "barber", fit: "WARM" },
  { name: "Dapper St. Barbershop", businessType: "barber", fit: "WARM" },
  { name: "The Parlor Barbershop", businessType: "barber", fit: "WARM" },
];

/** Build a starter pack into SCOUTED events (stable ids + positions) for use as the
 *  board's default opening world. Deterministic so it stays consistent across loads. */
export function buildStarterEvents(pack: StarterBiz[], territoryId: string = DEFAULT_TERRITORY): LeadEvent[] {
  const t0 = Date.UTC(2026, 5, 1);
  const cols = Math.max(1, Math.ceil(Math.sqrt(pack.length)));
  const rows = Math.max(1, Math.ceil(pack.length / cols));
  return pack.map((b, i) => {
    const c = i % cols, r = Math.floor(i / cols);
    const x = 0.14 + (cols > 1 ? c / (cols - 1) : 0.5) * 0.72;
    const y = 0.14 + (rows > 1 ? r / (rows - 1) : 0.5) * 0.72;
    const id = b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const meta: LeadMeta = {
      id, name: b.name, businessType: b.businessType,
      position: { x: Math.min(0.9, x), y: Math.min(0.9, y) },
      dossier: { rating: 4.0, signature: "Signature Item", fit: b.fit },
    };
    return { leadId: id, action: "SCOUTED" as const, at: t0 + i * 1000, meta, territoryId };
  });
}

/** The default opening world: the Hampton Roads starter as an event log. */
export const STARTER_EVENTS: LeadEvent[] = buildStarterEvents(HAMPTON_ROADS_STARTER);
