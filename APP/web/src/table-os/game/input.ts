import Phaser from "phaser";
import { TABLE_FOOTBALL_PROTOCOL, type TableFootballInputMessage } from "./types";

export type LocalInputOptions = Readonly<{
  roomId: string;
  playerId: string;
  getTick: () => number;
  publish: (message: TableFootballInputMessage) => void;
}>;

/** Browser-only input adapter. It emits normalized messages and never mutates match state. */
export class LocalTableFootballInput {
  private sequence = 0;
  private move: -1 | 0 | 1 = 0;
  private lastPublishedMove: -1 | 0 | 1 = 0;
  private kickQueued = false;
  private pointerActive = false;
  private readonly keys: Record<string, Phaser.Input.Keyboard.Key>;
  private readonly onPointerDown: (pointer: Phaser.Input.Pointer) => void;
  private readonly onPointerMove: (pointer: Phaser.Input.Pointer) => void;
  private readonly onPointerUp: () => void;

  constructor(private readonly scene: Phaser.Scene, private readonly options: LocalInputOptions) {
    const keyboard = scene.input.keyboard;
    this.keys = keyboard ? keyboard.addKeys("W,S,UP,DOWN,SPACE,ENTER") as Record<string, Phaser.Input.Keyboard.Key> : {};
    this.onPointerDown = (pointer) => { this.pointerActive = true; this.pointerMove(pointer); this.kickQueued = true; };
    this.onPointerMove = (pointer) => { if (this.pointerActive) this.pointerMove(pointer); };
    this.onPointerUp = () => { this.pointerActive = false; };
    scene.input.on("pointerdown", this.onPointerDown);
    scene.input.on("pointermove", this.onPointerMove);
    scene.input.on("pointerup", this.onPointerUp);
  }

  poll(): void {
    const keyboardMove = this.keys.W?.isDown || this.keys.UP?.isDown ? -1 : this.keys.S?.isDown || this.keys.DOWN?.isDown ? 1 : 0;
    if (!this.pointerActive) this.move = keyboardMove;
    if ((this.keys.SPACE && Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) || (this.keys.ENTER && Phaser.Input.Keyboard.JustDown(this.keys.ENTER))) this.kickQueued = true;
    if (this.move === this.lastPublishedMove && !this.kickQueued) return;
    this.options.publish({
      protocol: TABLE_FOOTBALL_PROTOCOL,
      type: "input",
      roomId: this.options.roomId,
      playerId: this.options.playerId,
      sequence: ++this.sequence,
      clientTick: this.options.getTick(),
      move: this.move,
      kick: this.kickQueued,
    });
    this.lastPublishedMove = this.move;
    this.kickQueued = false;
  }

  destroy(): void {
    this.scene.input.off("pointerdown", this.onPointerDown);
    this.scene.input.off("pointermove", this.onPointerMove);
    this.scene.input.off("pointerup", this.onPointerUp);
  }

  private pointerMove(pointer: Phaser.Input.Pointer): void {
    const half = this.scene.scale.height / 2;
    this.move = pointer.y < half - 16 ? -1 : pointer.y > half + 16 ? 1 : 0;
  }
}
