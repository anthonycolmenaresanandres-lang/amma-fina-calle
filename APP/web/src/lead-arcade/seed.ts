// Fictional seed data — NO real businesses or PII. Real lead lists are kept in a
// private/owner store and pasted in; the repo ships only this example world.

import type { LeadEvent, LeadMeta } from "./types";

const SAMPLE_MOCKUP = "/lead-arcade/sample-mockup.png";

const META: LeadMeta[] = [
  { id: "aurora", name: "Cafe Aurora", businessType: "cafe", position: { x: 0.24, y: 0.32 },
    dossier: { rating: 4.6, signature: "Lavender Latte", fit: "HOT" }, mockupPath: SAMPLE_MOCKUP },
  { id: "elsol", name: "Tacos El Sol", businessType: "restaurant", position: { x: 0.58, y: 0.26 },
    dossier: { rating: 4.3, signature: "Al Pastor Taco", fit: "WARM" }, mockupPath: SAMPLE_MOCKUP },
  { id: "baybagels", name: "Bay Bagels", businessType: "bakery", position: { x: 0.78, y: 0.44 },
    dossier: { rating: 4.8, signature: "Everything Bagel", fit: "HOT" } },
  { id: "marea", name: "Marea Coffee", businessType: "cafe", position: { x: 0.4, y: 0.58 },
    dossier: { rating: 4.1, signature: "Cold Brew Tonic", fit: "WARM" }, mockupPath: SAMPLE_MOCKUP },
  { id: "pier17", name: "Pier 17 Grill", businessType: "restaurant", position: { x: 0.68, y: 0.7 },
    dossier: { rating: 3.9, signature: "Fish & Chips", fit: "COLD" } },
  { id: "luna", name: "Luna Juice Bar", businessType: "juice", position: { x: 0.18, y: 0.74 },
    dossier: { rating: 4.5, signature: "Green Goddess", fit: "HOT" }, mockupPath: SAMPLE_MOCKUP },
];

const t0 = Date.UTC(2026, 5, 1);
const day = 86400000;

/** Initial event log so the board opens with a lived-in pipeline. */
export const SEED_EVENTS: LeadEvent[] = (() => {
  const ev: LeadEvent[] = [];
  META.forEach((m, i) => ev.push({ leadId: m.id, action: "SCOUTED", at: t0 + i * day, meta: m }));
  // advance a few along the funnel
  ev.push({ leadId: "aurora", action: "SURVEYED", at: t0 + 7 * day });
  ev.push({ leadId: "aurora", action: "PITCHED", at: t0 + 8 * day });
  ev.push({ leadId: "aurora", action: "CLOSED", at: t0 + 10 * day, amount: 99 });
  ev.push({ leadId: "aurora", action: "COLLECTED", at: t0 + 11 * day, amount: 99 });
  ev.push({ leadId: "luna", action: "SURVEYED", at: t0 + 9 * day });
  ev.push({ leadId: "luna", action: "PITCHED", at: t0 + 12 * day });
  ev.push({ leadId: "marea", action: "SURVEYED", at: t0 + 12 * day });
  ev.push({ leadId: "elsol", action: "SURVEYED", at: t0 + 13 * day });
  return ev;
})();

export const TERRITORY_NAME = "Hampton Roads";
