import Phaser from "phaser";
import { LocalTableFootballInput } from "./input";
import { SIDELINE_LOGO_TEXTURE, SIDELINE_TURF_TEXTURE, SidelineTableFootballRenderer } from "./SidelineTableFootballRenderer";
import { sidelineProjection } from "./sideline-projection";
import type { TableFootballInputMessage, TableFootballState, TableFootballVenueSkin, TeamId } from "./types";

export type TableFootballSceneOptions = Readonly<{
  skin: TableFootballVenueSkin;
  teams: Readonly<Record<TeamId, { label: string; primary: number; secondary: number }>>;
  getState: () => TableFootballState;
  onFrame: (deltaMs: number) => void;
  onInput: (message: TableFootballInputMessage) => void;
  localPlayerId?: string | (() => string);
  /** Leave the scoreboard and instructions to an accessible parent presentation. */
  hideHud?: boolean;
  /** Maracaibo mobile steering. Defaults retain existing venue controls. */
  mobileMovement?: boolean;
  inputEpoch?: () => number;
}>;

const toHex = (color: number): string => `#${color.toString(16).padStart(6, "0")}`;
const reducedMotion = (): boolean => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

/** Presentation-only Phaser view: immediate primitives, optional Maracaibo art. */
export class TableFootballScene extends Phaser.Scene {
  private readonly options: TableFootballSceneOptions;
  private board?: Phaser.GameObjects.Graphics;
  private hud?: Phaser.GameObjects.Text;
  private status?: Phaser.GameObjects.Text;
  private localInput?: LocalTableFootballInput;
  private lastGoalTick = -1;
  private sideline?: SidelineTableFootballRenderer;
  private cancelAssetLoad?: () => void;
  private resizeObserver?: ResizeObserver;

  constructor(options: TableFootballSceneOptions) {
    super("TableFootballScene");
    this.options = options;
  }

  get inputGesture(): number { return this.localInput?.gesture ?? 0; }

  create(): void {
    this.board = this.add.graphics();
    this.hud = this.add.text(0, 0, "", { fontFamily: "system-ui, sans-serif", fontSize: 14, color: toHex(this.options.skin.text), fontStyle: "bold" }).setOrigin(0.5, 0).setDepth(40);
    this.status = this.add.text(0, 0, "", { fontFamily: "system-ui, sans-serif", fontSize: 12, color: toHex(this.options.skin.mutedText) }).setOrigin(0.5, 0).setDepth(40);
    this.hud.setVisible(!this.options.hideHud);
    this.status.setVisible(!this.options.hideHud);
    if (this.options.skin.id === "maracaibo-kitchen-cocktails") this.sideline = new SidelineTableFootballRenderer(this, this.options.teams, !!this.options.hideHud);
    if (this.options.localPlayerId) {
      this.localInput = new LocalTableFootballInput(this, {
        roomId: this.options.getState().roomId,
        playerId: this.options.localPlayerId,
        getTick: () => this.options.getState().tick,
        publish: this.options.onInput,
        pointerTarget: this.options.mobileMovement ? () => this.pointerTarget() : undefined,
        getEpoch: this.options.inputEpoch,
      });
    }
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.localInput?.destroy();
      this.cancelAssetLoad?.();
      this.resizeObserver?.disconnect();
      this.sideline?.destroy();
      this.scale.off("resize", this.handleResize, this);
    });
    this.scale.on("resize", this.handleResize, this);
    this.observeSidelineSize();
    this.draw();
    this.loadSidelineAssets();
  }

  private pointerTarget(): Readonly<{ playerY: number; pitchTop: number; pitchHeight: number }> {
    const width = this.scale.width;
    const height = this.scale.height;
    const inset = Math.max(14, Math.min(width, height) * 0.055);
    const localId = typeof this.options.localPlayerId === "function" ? this.options.localPlayerId() : this.options.localPlayerId;
    const playerY = this.options.getState().players.find((player) => player.id === localId)?.y ?? 50;
    if (this.sideline) {
      const projection = sidelineProjection(width, height, !!this.options.hideHud);
      return { playerY, pitchTop: projection.pitchTop, pitchHeight: projection.pitchHeight };
    }
    const pitchTop = inset + (this.options.hideHud ? 0 : 42);
    return { playerY, pitchTop, pitchHeight: Math.max(120, height - pitchTop - inset - (this.options.hideHud ? 0 : 24)) };
  }

  update(_time: number, delta: number): void {
    this.localInput?.poll();
    this.options.onFrame(delta);
    this.draw();
  }

  private draw(): void {
    if (!this.board || !this.hud || !this.status) return;
    const state = this.options.getState();
    const { skin, teams } = this.options;
    const width = this.scale.width;
    const height = this.scale.height;
    const inset = Math.max(14, Math.min(width, height) * 0.055);
    const localId = typeof this.options.localPlayerId === "function" ? this.options.localPlayerId() : this.options.localPlayerId;
    const goalFlash = state.phase === "goal" && this.lastGoalTick !== state.tick && !reducedMotion();
    if (this.sideline) {
      this.board.clear();
      this.sideline.draw(state, localId, goalFlash);
      this.drawHud(state, width, height, inset);
      if (goalFlash) this.lastGoalTick = state.tick;
      return;
    }
    const top = inset + (this.options.hideHud ? 0 : 42);
    const fieldHeight = Math.max(120, height - top - inset - (this.options.hideHud ? 0 : 24));
    const fieldWidth = Math.max(160, width - inset * 2);
    const x = (unit: number) => inset + (unit / 100) * fieldWidth;
    const y = (unit: number) => top + (unit / 100) * fieldHeight;
    const g = this.board;
    g.clear();
    g.fillStyle(skin.table, 1).fillRect(0, 0, width, height);
    g.fillStyle(skin.rail, 1).fillRoundedRect(inset - 7, top - 7, fieldWidth + 14, fieldHeight + 14, 8);
    g.fillStyle(skin.pitch, 1).fillRect(inset, top, fieldWidth, fieldHeight);
    g.lineStyle(2, skin.pitchLine, 0.78).strokeRect(inset, top, fieldWidth, fieldHeight);
    g.lineStyle(1, skin.pitchLine, 0.6).lineBetween(x(50), top, x(50), top + fieldHeight).strokeCircle(x(50), y(50), Math.min(fieldWidth, fieldHeight) * 0.12);
    const goalWidth = fieldWidth * 0.034;
    const goalHeight = fieldHeight * 0.22;
    g.fillStyle(skin.goal, 0.85).fillRect(inset - goalWidth / 2, y(39), goalWidth, goalHeight).fillRect(inset + fieldWidth - goalWidth / 2, y(39), goalWidth, goalHeight);
    g.lineStyle(2, skin.pitchLine, 0.7).strokeRect(inset - goalWidth / 2, y(39), goalWidth, goalHeight).strokeRect(inset + fieldWidth - goalWidth / 2, y(39), goalWidth, goalHeight);

    for (const player of state.players) {
      const team = teams[player.team];
      const rodX = x(player.x);
      g.lineStyle(3, skin.rail, 0.9).lineBetween(rodX, top - 5, rodX, top + fieldHeight + 5);
      g.fillStyle(team.secondary, 1).fillCircle(rodX, y(player.y), 11);
      g.fillStyle(team.primary, 1).fillCircle(rodX, y(player.y), 8);
      g.lineStyle(1, skin.table, 0.75).strokeCircle(rodX, y(player.y), 8);
      if (player.id === localId) g.lineStyle(2, skin.text, 1).strokeCircle(rodX, y(player.y), 15);
    }
    g.fillStyle(skin.ball, 1).fillCircle(x(state.ball.x), y(state.ball.y), Math.max(4, Math.min(fieldWidth, fieldHeight) * 0.018));
    g.lineStyle(1, skin.goal, 0.65).strokeCircle(x(state.ball.x), y(state.ball.y), Math.max(4, Math.min(fieldWidth, fieldHeight) * 0.018));

    this.drawHud(state, width, height, inset);
    if (goalFlash) {
      this.lastGoalTick = state.tick;
      g.lineStyle(3, state.lastGoal ? teams[state.lastGoal].primary : skin.pitchLine, 0.8).strokeRect(inset - 11, top - 11, fieldWidth + 22, fieldHeight + 22);
    }
  }

  private drawHud(state: TableFootballState, width: number, height: number, inset: number): void {
    if (!this.hud || !this.status) return;
    const { teams } = this.options;
    const seconds = Math.ceil(state.timeRemainingMs / 1000).toString().padStart(2, "0");
    this.hud.setText(`${teams.home.label}  ${state.score.home}  :  ${state.score.away}  ${teams.away.label}     ${seconds}s`).setPosition(width / 2, inset);
    const phaseLabel = state.phase === "goal" ? `${state.lastGoal === "home" ? teams.home.label : teams.away.label} scores` : state.phase === "finished" ? "Full time — use the parent Reset control" : state.phase === "ready" ? "Move to start · tap/click or Space to kick" : "Move: W/S or arrows · Kick: Space, Enter, or tap";
    this.status.setText(phaseLabel).setPosition(width / 2, height - inset - 12);
  }

  private observeSidelineSize(): void {
    const parent = this.game.canvas.parentElement;
    if (!this.sideline || !parent || typeof ResizeObserver === "undefined") return;
    // Orientation events can refresh Phaser before its parent bounds are updated.
    // Observe the actual container so floor drawing and steering share its new size.
    this.resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry || entry.contentRect.width <= 0 || entry.contentRect.height <= 0) return;
      if (Math.abs(this.scale.width - entry.contentRect.width) < 1 && Math.abs(this.scale.height - entry.contentRect.height) < 1) return;
      this.scale.getParentBounds();
      this.scale.refresh();
    });
    this.resizeObserver.observe(parent);
  }

  private handleResize(): void {
    // A held gesture must not keep the previous projection after a rotation/resize.
    if (this.sideline) this.localInput?.cancelGesture();
    this.draw();
  }

  private loadSidelineAssets(): void {
    if (!this.sideline) return;
    const assets = [
      { key: SIDELINE_LOGO_TEXTURE, url: this.options.skin.assets?.shirtLogo },
      { key: SIDELINE_TURF_TEXTURE, url: "/assets/maracaibo/penalty/hyperrealistic-pitch-preview.png" },
    ].filter((asset) => asset.url?.startsWith("/") && !this.textures.exists(asset.key));
    if (!assets.length) return;
    // Optional existing local art never blocks the primitive pitch or controls.
    const cleanup = (): void => {
      clearTimeout(deadline);
      this.load.off(Phaser.Loader.Events.COMPLETE, cleanup);
      this.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, cleanup);
    };
    const deadline = setTimeout(cleanup, 3500);
    this.cancelAssetLoad = cleanup;
    this.load.once(Phaser.Loader.Events.COMPLETE, cleanup);
    this.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, cleanup);
    this.load.maxRetries = 0;
    for (const asset of assets) this.load.image(asset.key, asset.url!, { responseType: "blob", timeout: 3000 });
    this.load.start();
  }
}
