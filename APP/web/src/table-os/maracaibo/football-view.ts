"use client";

import type { FootballSession } from "./football-session";
import type { TableFootballVenueSkin, CountryColorTeam } from "../game/types";

type Move = -1 | 0 | 1;
export type FootballMoveSource = "pointer" | "keyboard";
type ControlInput = Readonly<{ sequence: number; move: Move; kick: boolean; targetY?: number }>;

/** Resolves independent controls so releasing one source cannot stop another held source. */
export class FootballControls {
  private sequence = 0;
  private fieldMove: Move = 0;
  private fieldTarget?: number;
  private fieldGesture = 0;
  private blockedFieldGesture?: number;
  private pointerMove: Move = 0;
  private keyboardMove: Move = 0;
  private lastPublishedMove: Move = 0;
  private lastPublishedTarget?: number;
  private lastPublishedAt = 0;

  constructor(private readonly publish: (input: ControlInput) => void, private readonly now: () => number = () => performance.now()) {}

  fieldInput(input: Readonly<{ move: Move; kick: boolean; targetY?: number }>, gesture = 0): void {
    this.fieldMove = input.move;
    this.fieldGesture = gesture;
    if (gesture !== this.blockedFieldGesture) {
      this.blockedFieldGesture = undefined;
      this.fieldTarget = input.targetY;
    }
    this.emit(input.kick);
  }

  move(value: Move, source: FootballMoveSource = "pointer"): void {
    if (value) { this.fieldTarget = undefined; this.blockedFieldGesture = this.fieldGesture; }
    if (source === "pointer") this.pointerMove = value;
    else this.keyboardMove = value;
    this.emit(false);
  }

  kick(): void { this.emit(true); }

  poll(): void { this.emit(false); }

  clear(): void {
    this.fieldMove = this.pointerMove = this.keyboardMove = 0;
    this.fieldTarget = undefined;
    this.blockedFieldGesture = this.fieldGesture;
    this.emit(false);
  }

  /** Rematch reset is silent: a heartbeat must not start the next round. */
  reset(): void {
    this.fieldMove = this.pointerMove = this.keyboardMove = 0;
    this.fieldTarget = undefined;
    this.blockedFieldGesture = this.fieldGesture;
    this.lastPublishedMove = 0;
    this.lastPublishedTarget = undefined;
    this.lastPublishedAt = this.now();
  }

  private emit(kick: boolean): void {
    const move = this.pointerMove || this.keyboardMove || this.fieldMove;
    const targetY = this.pointerMove || this.keyboardMove ? undefined : this.fieldTarget;
    const now = this.now();
    if (!kick && move === this.lastPublishedMove && targetY === this.lastPublishedTarget && ((!move && targetY === undefined) || now - this.lastPublishedAt < 250)) return;
    this.publish({ sequence: ++this.sequence, move, kick, ...(targetY === undefined ? {} : { targetY }) });
    this.lastPublishedMove = move;
    this.lastPublishedTarget = targetY;
    this.lastPublishedAt = now;
  }
}

/** One silent canvas per mount; all simulation and authority live outside React/Phaser. */
export async function mountFootballView(parent: HTMLElement, session: FootballSession, skin: TableFootballVenueSkin, home: CountryColorTeam, away: CountryColorTeam): Promise<{ destroy: () => void; move: (value: Move, source?: FootballMoveSource) => void; kick: () => void }> {
  const [{ default: Phaser }, { TableFootballScene }] = await Promise.all([import("phaser"), import("../game/TableFootballScene")]);
  const controls = new FootballControls((input) => session.input(input));
  let round = session.round;
  const syncRound = () => {
    if (session.round !== round) { round = session.round; controls.reset(); }
  };
  const scene = new TableFootballScene({
    skin, teams: { home, away }, hideHud: true, mobileMovement: true,
    inputEpoch: () => session.round,
    getState: () => session.state, localPlayerId: () => session.seat ?? "",
    onInput: (message) => { syncRound(); controls.fieldInput(message, scene.inputGesture); },
    onFrame: (delta) => {
      syncRound();
      controls.poll();
      session.frame(delta);
    },
  });
  const game = new Phaser.Game({ type: Phaser.AUTO, parent, width: parent.clientWidth || 390, height: parent.clientHeight || 420, backgroundColor: "#101112", scene: [scene], audio: { noAudio: true }, scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH } });
  const release = () => controls.clear();
  const releaseOnHide = () => { if (document.hidden) release(); };
  window.addEventListener("blur", release);
  document.addEventListener("visibilitychange", releaseOnHide);
  return {
    move: (value, source) => controls.move(value, source),
    kick: () => controls.kick(),
    destroy: () => { window.removeEventListener("blur", release); document.removeEventListener("visibilitychange", releaseOnHide); game.destroy(true); },
  };
}
