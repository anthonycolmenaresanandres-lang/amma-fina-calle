// Business-hours helper. The connectors call this so the bot only ever offers slots
// when the shop is actually open — closed days return no slots, and the orchestrator
// then offers another day or takes a message. Pure + deterministic (no live calendar).

import { config } from "./config";
import type { Slot } from "./types";

/** Is the business open on this yyyy-mm-dd? (Checks the weekday against openDays.) */
export function isOpenOn(date: string): boolean {
  const d = new Date(`${date}T12:00:00`); // noon avoids any tz/DST edge at midnight
  if (Number.isNaN(d.getTime())) return false;
  return config.business.openDays.includes(d.getDay());
}

/** Hourly slots within the open window on an open day; empty array when closed. */
export function slotsForDate(date: string, stepHours = 1): Slot[] {
  if (!isOpenOn(date)) return [];
  const { openHour, closeHour } = config.business;
  const slots: Slot[] = [];
  for (let h = openHour; h + 1 <= closeHour; h += stepHours) {
    const start = new Date(`${date}T${String(h).padStart(2, "0")}:00:00`);
    slots.push({ startIso: start.toISOString(), endIso: new Date(start.getTime() + 60 * 60000).toISOString() });
  }
  return slots;
}
