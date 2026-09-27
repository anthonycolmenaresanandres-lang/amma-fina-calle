import type { SquareLocation } from "./oauth";

/** Only an unambiguous active store can be selected without owner input. */
export function onlyActiveSquareLocation(locations: SquareLocation[]): string | undefined {
  const active = locations.filter((location) => location.status === "ACTIVE");
  return active.length === 1 ? active[0].id : undefined;
}
