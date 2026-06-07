// Assisted swipe input for Penalty Shootout (V2 Step 4). A drag from the lower
// play area is mapped to an aim zone: horizontal direction -> column, upward
// reach -> height band, then magnetized to the single matching zone. Extreme
// drags are clamped so a wild flick still lands on-goal. A short press falls
// back to a tap (nearest zone). The input only SELECTS a zone — it never
// changes scoring or keeper logic; the resolved zone flows through the same
// takeShot/resolveShot path as a tap.

import Phaser from "phaser";
import type { Column, RowBand, ZoneConfig } from "../types";
import type { MatchPhase } from "../engine/match";
import { zoneCenter, type AimPreview, type Layout } from "../geometry";

// Tunables, all as a fraction of the current canvas size (resolution-independent).
const TAP_FALLBACK_FRACTION = 0.05; // drag shorter than this (×width) is treated as a tap
const PREVIEW_MIN_FRACTION = 0.03; // show the aim preview only past this drag (×width)
const SIDE_AIM_FRACTION = 0.28; // horizontal drag (×width) for full side aim
const HEIGHT_REACH_FRACTION = 0.18; // upward drag (×height) for full height
const POWER_FRACTION = 0.22; // total drag (×height) for a full power meter

const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));

export type SwipeInputHandlers = {
  getPhase: () => MatchPhase;
  getLayout: () => Layout;
  /** Tap fallback: nearest zone to a point. */
  pickZone: (x: number, y: number) => ZoneConfig;
  /** The zone for a discretized column + height band. */
  zoneFor: (column: Column, row: RowBand) => ZoneConfig;
  /** Live aim feedback while dragging (null clears it). */
  onPreview: (preview: AimPreview | null) => void;
  onShoot: (zone: ZoneConfig) => void;
  onReset: () => void;
};

type DragResult = { column: Column; row: RowBand; power: number };

function mapDrag(layout: Layout, dx: number, dy: number): DragResult {
  const aimX = clamp(dx / (layout.w * SIDE_AIM_FRACTION), -1, 1);
  const up = Math.max(0, -dy); // upward distance (dy is negative going up)
  const reach = clamp(up / (layout.h * HEIGHT_REACH_FRACTION), 0, 1);
  const power = clamp(Math.hypot(dx, dy) / (layout.h * POWER_FRACTION), 0, 1);
  const column: Column = aimX < -0.33 ? 0 : aimX > 0.33 ? 2 : 1;
  const row: RowBand = reach >= 0.5 ? 0 : 1; // a higher flick aims at the top band
  return { column, row, power };
}

export class SwipeInput {
  constructor(scene: Phaser.Scene, handlers: SwipeInputHandlers) {
    let aiming = false;
    let startX = 0;
    let startY = 0;

    scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const phase = handlers.getPhase();
      if (phase === "gameover") {
        handlers.onReset();
        return;
      }
      if (phase !== "aim") {
        return;
      }
      aiming = true;
      startX = pointer.x;
      startY = pointer.y;
      handlers.onPreview(null);
    });

    scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!aiming || handlers.getPhase() !== "aim") {
        return;
      }
      const layout = handlers.getLayout();
      const dx = pointer.x - startX;
      const dy = pointer.y - startY;
      if (Math.hypot(dx, dy) < layout.w * PREVIEW_MIN_FRACTION) {
        handlers.onPreview(null);
        return;
      }
      const { column, row, power } = mapDrag(layout, dx, dy);
      const zone = handlers.zoneFor(column, row);
      handlers.onPreview({
        zoneId: zone.id,
        from: { x: layout.spotX, y: layout.spotY },
        to: zoneCenter(zone, layout),
        power,
      });
    });

    const release = (pointer: Phaser.Input.Pointer) => {
      if (!aiming) {
        return;
      }
      aiming = false;
      handlers.onPreview(null);
      if (handlers.getPhase() !== "aim") {
        return;
      }
      const layout = handlers.getLayout();
      const dx = pointer.x - startX;
      const dy = pointer.y - startY;
      if (Math.hypot(dx, dy) < layout.w * TAP_FALLBACK_FRACTION) {
        // Treated as a tap: shoot the nearest zone to the release point.
        handlers.onShoot(handlers.pickZone(pointer.x, pointer.y));
        return;
      }
      const { column, row } = mapDrag(layout, dx, dy);
      handlers.onShoot(handlers.zoneFor(column, row));
    };

    scene.input.on("pointerup", release);
    scene.input.on("pointerupoutside", release);
  }
}
