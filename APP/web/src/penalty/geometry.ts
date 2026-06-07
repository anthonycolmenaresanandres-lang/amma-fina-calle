// Pure geometry/layout for Penalty Shootout. No Phaser, no DOM — just math over
// the current canvas size. Shared by the scene (positions), input (zone picking),
// and the renderer (drawing). Extracted verbatim from the V1 scene; behavior identical.

import type { Column, RowBand, ZoneConfig, ZoneId } from "./types";

export type Vec2 = { x: number; y: number };

// Live aim feedback for the swipe input: where the shot is currently pointed
// (magnetized to a zone) and how hard, for the aim arrow + power meter.
export type AimPreview = {
  zoneId: ZoneId;
  from: Vec2;
  to: Vec2;
  power: number; // 0..1
};

export type Layout = {
  w: number;
  h: number;
  goalLeft: number;
  goalRight: number;
  goalTop: number;
  goalBottom: number;
  goalWidth: number;
  goalHeight: number;
  spotX: number;
  spotY: number;
  ballRadius: number;
  zoneRadius: number;
  keeperWidth: number;
  keeperHeight: number;
  keeperLineY: number;
};

export function computeLayout(w: number, h: number): Layout {
  const goalLeft = w * 0.13;
  const goalRight = w * 0.87;
  const goalTop = h * 0.14;
  const goalBottom = h * 0.42;

  return {
    w,
    h,
    goalLeft,
    goalRight,
    goalTop,
    goalBottom,
    goalWidth: goalRight - goalLeft,
    goalHeight: goalBottom - goalTop,
    spotX: w * 0.5,
    spotY: h * 0.82,
    ballRadius: Math.max(7, w * 0.026),
    // Height-aware so the six targets never overlap when the goal is short
    // (landscape / very small viewports). Portrait is unaffected.
    zoneRadius: Math.max(16, Math.min(w * 0.075, h * 0.05)),
    keeperWidth: Math.max(34, w * 0.13),
    keeperHeight: Math.max(60, h * 0.13),
    keeperLineY: goalBottom,
  };
}

export function zoneCenter(zone: ZoneConfig, layout: Layout): Vec2 {
  return {
    x: layout.goalLeft + zone.xPct * layout.goalWidth,
    y: layout.goalTop + zone.yPct * layout.goalHeight,
  };
}

export function zoneNearest(
  zones: ZoneConfig[],
  layout: Layout,
  px: number,
  py: number,
): ZoneConfig {
  let best = zones[0];
  let bestDist = Number.POSITIVE_INFINITY;
  for (const zone of zones) {
    const c = zoneCenter(zone, layout);
    const d = (c.x - px) ** 2 + (c.y - py) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = zone;
    }
  }
  return best;
}

// The single zone at a given column + height band (used by swipe to magnetize a
// discretized aim onto an actual target zone).
export function zoneByColRow(zones: ZoneConfig[], column: Column, row: RowBand): ZoneConfig {
  return zones.find((zone) => zone.column === column && zone.row === row) ?? zones[0];
}
