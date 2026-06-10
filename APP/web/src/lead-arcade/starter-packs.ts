// Starter lead packs shipped in code so the owner can load a real prospect list with
// one tap (no copy-paste). These are PUBLIC business names compiled from public "best
// of" listings — not PII, no private data — so they're safe to ship. Edit freely.
// Loaded into whatever territory is active; Survey afterward enriches each from public
// data. (The fictional demo world still lives in seed.ts; this is an explicit opt-in.)

import type { Fit } from "./types";

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
];
