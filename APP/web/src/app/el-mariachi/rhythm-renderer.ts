import Phaser from "phaser";
import { ROUND_MS, type RoundView } from "./rhythm-engine";

/** Optional Phaser 4 presentation only. DOM/SVG retains every gameplay cue and control. */
export function mountRhythmScene(
  parent: HTMLDivElement,
  read: () => { view: RoundView; reducedMotion: boolean },
): () => void {
  let disposed = false;
  class RosetteScene extends Phaser.Scene {
    private ink?: Phaser.GameObjects.Graphics;
    private previous = "";

    constructor() { super("mariachi-rosette"); }

    create() {
      if (disposed) return;
      this.ink = this.add.graphics();
      this.draw();
    }

    update() { this.draw(); }

    private draw() {
      if (disposed || !this.ink) return;
      const { view, reducedMotion } = read();
      const signature = `${view.mode}:${view.elapsed}:${view.feedbackAt}`;
      if (signature === this.previous) return;
      this.previous = signature;
      const g = this.ink;
      g.clear();
      // A quiet outer progress arc is secondary to the always-present SVG beat cue.
      g.lineStyle(2, 0xf2ba45, 0.22);
      g.strokeCircle(200, 200, 184);
      if (view.elapsed > 0) {
        g.lineStyle(3, 0xf2ba45, 0.85);
        g.beginPath();
        g.arc(200, 200, 184, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * view.elapsed / ROUND_MS, false);
        g.strokePath();
      }
      const age = view.elapsed - view.feedbackAt;
      if (!reducedMotion && view.mode === "running" && age >= 0 && age < 280 && (view.feedback === "Perfect!" || view.feedback === "On beat!")) {
        const fade = 1 - age / 280;
        g.lineStyle(3, 0xf2ba45, fade);
        for (let index = 0; index < 12; index++) {
          const angle = index * Math.PI / 6;
          const inner = 113 + age / 28;
          const outer = inner + 12 * fade;
          g.lineBetween(200 + Math.cos(angle) * inner, 200 + Math.sin(angle) * inner, 200 + Math.cos(angle) * outer, 200 + Math.sin(angle) * outer);
        }
      }
    }
  }

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 400,
    height: 400,
    transparent: true,
    banner: false,
    audio: { noAudio: true },
    input: { keyboard: false, mouse: false, touch: false, gamepad: false },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, expandParent: false },
    fps: { target: 30 },
    scene: RosetteScene,
  });

  return () => {
    disposed = true;
    // Phaser destroys on the following step; wake it if the tab was backgrounded.
    game.destroy(true);
    if (game.loop) game.loop.wake();
  };
}
