// Business-hours helper. The connectors call this so the bot only ever offers slots
// when the shop is actually open — closed days return no slots, and the orchestrator
// then offers another day or takes a message. Pure + deterministic (no live calendar).
// Per-tenant: takes the tenant's Knowledge Pack so each business keeps its own hours.

import type { BusinessPack, Slot } from "./types";

/** Is the business open on this yyyy-mm-dd? (Checks the weekday against openDays.) */
export function isOpenOn(business: BusinessPack, date: string): boolean {
  const d = new Date(`${date}T12:00:00`); // noon avoids any tz/DST edge at midnight
  if (Number.isNaN(d.getTime())) return false;
  return business.openDays.includes(d.getDay());
}

/** Hourly slots within the open window on an open day; empty array when closed. */
export function slotsForDate(business: BusinessPack, date: string, stepHours = 1): Slot[] {
  if (!isOpenOn(business, date)) return [];
  const slots: Slot[] = [];
  for (let h = business.openHour; h + 1 <= business.closeHour; h += stepHours) {
    const start = new Date(`${date}T${String(h).padStart(2, "0")}:00:00`);
    slots.push({ startIso: start.toISOString(), endIso: new Date(start.getTime() + 60 * 60000).toISOString() });
  }
  return slots;
}
