import Phaser from "phaser";
import { WORLD_WIDTH, WORLD_HEIGHT, type HoleState } from "./hole-engine";
import { drawCourtyard } from "./hole-drawing";

/** Optional Phaser 4 presentation. The DOM owns all input and the fallback keeps running. */
export function mountCourtyard(
  parent: HTMLDivElement,
  read: () => { state: HoleState; reducedMotion: boolean },
  onReady: () => void,
  onFailure: () => void,
): () => void {
  let disposed = false;
  let failed = false;
  let rendered = false;
  let destroyRequested = false;
  let game: Phaser.Game | undefined;
  let canvas: HTMLCanvasElement | undefined;
  let timeout: number | undefined;

  const clearTimeoutHandle = () => {
    if (timeout !== undefined) window.clearTimeout(timeout);
    timeout = undefined;
  };
  const destroy = () => {
    clearTimeoutHandle();
    if (canvas) canvas.removeEventListener("webglcontextlost", fail);
    if (!game || destroyRequested) return;
    destroyRequested = true;
    game.destroy(true);
    // Do not wake an instance that has not booted. A started background loop needs
    // one final step to process Phaser's deferred destruction.
    if (game.isBooted && game.loop.started && !game.loop.running) game.loop.wake();
  };
  function fail() {
    if (disposed || failed) return;
    failed = true;
    destroy();
    onFailure();
  }

  class CourtyardScene extends Phaser.Scene {
    private texture?: Phaser.Textures.CanvasTexture;
    private previous = "";

    constructor() { super("el-mariachi-courtyard"); }

    create() {
      if (disposed || failed) return;
      try {
        const surface = document.createElement("canvas");
        surface.width = WORLD_WIDTH;
        surface.height = WORLD_HEIGHT;
        const ink = surface.getContext("2d");
        if (!ink) { fail(); return; }
        const initial = read();
        drawCourtyard(ink, initial.state, initial.reducedMotion);
        const texture = this.textures.addCanvas("courtyard-art", surface);
        if (!texture) { fail(); return; }
        this.texture = texture;
        this.add.image(0, 0, texture.key).setOrigin(0);
        canvas = this.game.canvas;
        canvas.setAttribute("aria-hidden", "true");
        canvas.setAttribute("tabindex", "-1");
        canvas.style.pointerEvents = "none";
        canvas.addEventListener("webglcontextlost", fail);
        this.paint();
        // A successful create() is not proof that a frame was displayed.
        this.game.events.once(Phaser.Core.Events.POST_RENDER, () => {
          if (disposed || failed) return;
          rendered = true;
          clearTimeoutHandle();
          onReady();
        });
      } catch { fail(); }
    }

    update() {
      if (disposed || failed) return;
      try { this.paint(); } catch { fail(); }
    }

    private paint() {
      if (!this.texture) return;
      const { state, reducedMotion } = read();
      const signature = `${state.mode}:${state.elapsed}:${state.x}:${state.y}:${state.radius}:${state.collected}:${reducedMotion}`;
      if (signature === this.previous) return;
      this.previous = signature;
      drawCourtyard(this.texture.context, state, reducedMotion);
      this.texture.refresh();
    }
  }

  try {
    game = new Phaser.Game({
      type: Phaser.AUTO,
      parent,
      width: WORLD_WIDTH,
      height: WORLD_HEIGHT,
      backgroundColor: "#e6bc8c",
      banner: false,
      audio: { noAudio: true },
      input: { keyboard: false, mouse: false, touch: false, gamepad: false },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        expandParent: false,
      },
      fps: { target: 30 },
      scene: CourtyardScene,
    });
    if (failed || disposed) destroy();
    else if (!rendered) timeout = window.setTimeout(fail, 8000);
  } catch { fail(); }

  return () => {
    disposed = true;
    destroy();
  };
}
