import Phaser from "phaser";
import { TABLE_FOOTBALL_PROTOCOL, type TableFootballInputMessage } from "./types";

export type LocalInputOptions = Readonly<{
  roomId: string;
  playerId: string | (() => string);
  getTick: () => number;
  publish: (message: TableFootballInputMessage) => void;
  /** Opt in to mobile position steering. Other venues retain press-to-kick. */
  pointerTarget?: () => Readonly<{ playerY: number; pitchTop: number; pitchHeight: number }>;
  /** A new round clears retained targets before the next input or gesture. */
  getEpoch?: () => number;
}>;

/** Browser-only input adapter. It emits normalized messages and never mutates match state. */
export class LocalTableFootballInput {
  private sequence = 0;
  private move: -1 | 0 | 1 = 0;
  private lastPublishedMove: -1 | 0 | 1 = 0;
  private kickQueued = false;
  private pointerActive = false;
  private pointerId?: number;
  private pointerStart = { x: 0, y: 0, at: 0 };
  private pointerDragged = false;
  private pointerGesture = 0;
  private pointerAnchor = { playerY: 50, pitchTop: 0, pitchHeight: 1 };
  private targetY?: number;
  private lastPublishedTarget?: number;
  private epoch?: number;
  private lastPublishedAt = 0;
  private readonly keys: Record<string, Phaser.Input.Keyboard.Key>;
  private readonly onPointerDown: (pointer: Phaser.Input.Pointer) => void;
  private readonly onPointerMove: (pointer: Phaser.Input.Pointer) => void;
  private readonly onPointerUp: (pointer: Phaser.Input.Pointer) => void;
  private readonly onPointerUpOutside: (pointer: Phaser.Input.Pointer) => void;
  private readonly onBlur: () => void;
  private readonly onVisibilityChange: () => void;

  constructor(private readonly scene: Phaser.Scene, private readonly options: LocalInputOptions) {
    this.epoch = this.options.getEpoch?.();
    const keyboard = scene.input.keyboard;
    this.keys = keyboard && !this.options.pointerTarget ? keyboard.addKeys("W,S,UP,DOWN,SPACE,ENTER") as Record<string, Phaser.Input.Keyboard.Key> : {};
    this.onPointerDown = (pointer) => {
      this.refreshEpoch();
      if (this.options.pointerTarget && this.pointerActive) return;
      this.pointerActive = true;
      if (this.options.pointerTarget) {
        this.pointerGesture++;
        this.pointerId = pointer.id;
        this.pointerStart = { x: pointer.x, y: pointer.y, at: performance.now() };
        this.pointerDragged = false;
        const geometry = this.options.pointerTarget();
        this.pointerAnchor = {
          playerY: this.clampTarget(geometry.playerY),
          pitchTop: Number.isFinite(geometry.pitchTop) ? geometry.pitchTop : 0,
          pitchHeight: Number.isFinite(geometry.pitchHeight) && geometry.pitchHeight > 0 ? geometry.pitchHeight : Math.max(1, this.scene.scale.height),
        };
        this.targetY = this.clampTarget(this.pointerAnchor.playerY);
      } else {
        this.pointerMove(pointer);
        this.kickQueued = true;
      }
    };
    this.onPointerMove = (pointer) => {
      if (!this.pointerActive || (this.options.pointerTarget && pointer.id !== this.pointerId)) return;
      if (this.options.pointerTarget) {
        this.trackDrag(pointer);
        if (this.pointerDragged) this.targetY = this.relativeTarget(pointer);
      } else this.pointerMove(pointer);
    };
    this.onPointerUp = (pointer) => this.releasePointer(pointer, true);
    this.onPointerUpOutside = (pointer) => this.releasePointer(pointer, false);
    this.onBlur = () => this.release();
    this.onVisibilityChange = () => { if (document.hidden) this.release(); };
    scene.input.on("pointerdown", this.onPointerDown);
    scene.input.on("pointermove", this.onPointerMove);
    scene.input.on("pointerup", this.onPointerUp);
    scene.input.on("pointerupoutside", this.onPointerUpOutside);
    if (this.options.pointerTarget) {
      window.addEventListener("blur", this.onBlur);
      document.addEventListener("visibilitychange", this.onVisibilityChange);
    }
  }

  /** Local interaction identity; retained target heartbeats keep the same gesture. */
  get gesture(): number { return this.pointerGesture; }

  poll(): void {
    this.refreshEpoch();
    const keyboardMove = this.keys.W?.isDown || this.keys.UP?.isDown ? -1 : this.keys.S?.isDown || this.keys.DOWN?.isDown ? 1 : 0;
    if (!this.pointerActive) this.move = keyboardMove;
    if ((this.keys.SPACE && Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) || (this.keys.ENTER && Phaser.Input.Keyboard.JustDown(this.keys.ENTER))) this.kickQueued = true;
    const now = performance.now();
    // Mobile steering stays below the session's packet limit, with an immediate first target.
    const interval = this.options.pointerTarget ? 40 : 50;
    if (now - this.lastPublishedAt < interval && (!this.options.pointerTarget || this.targetY === this.lastPublishedTarget)) return;
    if (this.options.pointerTarget && now - this.lastPublishedAt < interval && this.lastPublishedTarget !== undefined && this.targetY !== undefined) return;
    if (this.move === this.lastPublishedMove && this.targetY === this.lastPublishedTarget && !this.kickQueued && ((!this.move && this.targetY === undefined) || now - this.lastPublishedAt < 250)) return;
    this.options.publish({
      protocol: TABLE_FOOTBALL_PROTOCOL,
      type: "input",
      roomId: this.options.roomId,
      playerId: typeof this.options.playerId === "function" ? this.options.playerId() : this.options.playerId,
      sequence: ++this.sequence,
      clientTick: this.options.getTick(),
      move: this.move,
      kick: this.kickQueued,
      ...(this.targetY === undefined ? {} : { targetY: this.targetY }),
    });
    this.lastPublishedMove = this.move;
    this.lastPublishedAt = now;
    this.lastPublishedTarget = this.targetY;
    this.kickQueued = false;
  }

  destroy(): void {
    this.scene.input.off("pointerdown", this.onPointerDown);
    this.scene.input.off("pointermove", this.onPointerMove);
    this.scene.input.off("pointerup", this.onPointerUp);
    this.scene.input.off("pointerupoutside", this.onPointerUpOutside);
    if (this.options.pointerTarget) {
      window.removeEventListener("blur", this.onBlur);
      document.removeEventListener("visibilitychange", this.onVisibilityChange);
    }
  }

  private release(): void {
    this.pointerActive = false;
    this.pointerId = undefined;
    this.move = 0;
    this.kickQueued = false;
    this.targetY = undefined;
    for (const key of Object.values(this.keys)) key.reset();
  }

  private refreshEpoch(): void {
    const epoch = this.options.getEpoch?.();
    if (epoch === this.epoch) return;
    this.epoch = epoch;
    this.release();
    this.lastPublishedMove = 0;
    this.lastPublishedTarget = undefined;
    this.lastPublishedAt = performance.now();
  }

  private trackDrag(pointer: Phaser.Input.Pointer): void {
    if (Math.hypot(pointer.x - this.pointerStart.x, pointer.y - this.pointerStart.y) >= 5) this.pointerDragged = true;
  }

  private releasePointer(pointer: Phaser.Input.Pointer, canTap: boolean): void {
    if (this.options.pointerTarget) {
      if (!this.pointerActive || pointer.id !== this.pointerId) return;
      this.trackDrag(pointer);
      if (canTap && !pointer.wasCanceled) {
        if (this.pointerDragged) this.targetY = this.relativeTarget(pointer);
        else if (performance.now() - this.pointerStart.at <= 350) this.targetY = this.clampTarget((pointer.y - this.pointerAnchor.pitchTop) * 100 / this.pointerAnchor.pitchHeight);
      } else this.targetY = undefined;
    }
    this.pointerActive = false;
    this.pointerId = undefined;
  }

  private relativeTarget(pointer: Phaser.Input.Pointer): number {
    return this.clampTarget(this.pointerAnchor.playerY + (pointer.y - this.pointerStart.y) * 100 / this.pointerAnchor.pitchHeight);
  }

  private clampTarget(value: number): number {
    if (!Number.isFinite(value)) return 50;
    return Math.round(Math.max(4, Math.min(96, value)) * 100) / 100;
  }

  private pointerMove(pointer: Phaser.Input.Pointer): void {
    const half = this.scene.scale.height / 2;
    this.move = pointer.y < half - 16 ? -1 : pointer.y > half + 16 ? 1 : 0;
  }
}
