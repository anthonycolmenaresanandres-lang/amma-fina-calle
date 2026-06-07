// Tap input for Penalty Shootout. The only input mode in V1: a pointer-down
// picks the nearest aim zone and shoots; a pointer-down on the game-over screen
// resets. This wires Phaser pointer events to semantic callbacks — it never
// resolves outcomes. Logic (phase gating, zone picking) is identical to V1.

import Phaser from "phaser";
import type { ZoneConfig } from "../types";
import type { MatchPhase } from "../engine/match";

export type TapInputHandlers = {
  /** Map a pointer position to the aim zone it selects. */
  pickZone: (x: number, y: number) => ZoneConfig;
  /** Current match phase (gates which events do anything). */
  getPhase: () => MatchPhase;
  /** Hover preview while aiming. */
  onHover: (zone: ZoneConfig) => void;
  /** Commit a shot at the given zone. */
  onShoot: (zone: ZoneConfig) => void;
  /** Tap on the game-over screen: restart. */
  onReset: () => void;
};

export class TapInput {
  constructor(scene: Phaser.Scene, handlers: TapInputHandlers) {
    scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (handlers.getPhase() !== "aim") {
        return;
      }
      handlers.onHover(handlers.pickZone(pointer.x, pointer.y));
    });

    scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const phase = handlers.getPhase();
      if (phase === "gameover") {
        handlers.onReset();
        return;
      }
      if (phase !== "aim") {
        return;
      }
      handlers.onShoot(handlers.pickZone(pointer.x, pointer.y));
    });
  }
}
