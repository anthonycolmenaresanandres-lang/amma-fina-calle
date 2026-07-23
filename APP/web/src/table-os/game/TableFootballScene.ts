import Phaser from "phaser";
import { LocalTableFootballInput } from "./input";
import type { TableFootballInputMessage, TableFootballState, TableFootballVenueSkin, TeamId } from "./types";

export type TableFootballSceneOptions = Readonly<{
  skin: TableFootballVenueSkin;
  teams: Readonly<Record<TeamId, { label: string; primary: number; secondary: number }>>;
  getState: () => TableFootballState;
  onFrame: (deltaMs: number) => void;
  onInput: (message: TableFootballInputMessage) => void;
  localPlayerId?: string;
}>;

const toHex = (color: number): string => `#${color.toString(16).padStart(6, "0")}`;
const reducedMotion = (): boolean => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

/** Primitive Phaser view. It has no camera, assets, network client, or gameplay rules. */
export class TableFootballScene extends Phaser.Scene {
  private readonly options: TableFootballSceneOptions;
  private board?: Phaser.GameObjects.Graphics;
  private hud?: Phaser.GameObjects.Text;
  private status?: Phaser.GameObjects.Text;
  private localInput?: LocalTableFootballInput;
  private lastGoalTick = -1;

  constructor(options: TableFootballSceneOptions) {
    super("TableFootballScene");
    this.options = options;
  }

  create(): void {
    this.board = this.add.graphics();
    this.hud = this.add.text(0, 0, "", { fontFamily: "system-ui, sans-serif", fontSize: 14, color: toHex(this.options.skin.text), fontStyle: "bold" }).setOrigin(0.5, 0);
    this.status = this.add.text(0, 0, "", { fontFamily: "system-ui, sans-serif", fontSize: 12, color: toHex(this.options.skin.mutedText) }).setOrigin(0.5, 0);
    if (this.options.localPlayerId) {
      this.localInput = new LocalTableFootballInput(this, {
        roomId: this.options.getState().roomId,
        playerId: this.options.localPlayerId,
        getTick: () => this.options.getState().tick,
        publish: this.options.onInput,
      });
    }
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.localInput?.destroy());
    this.scale.on("resize", () => this.draw());
    this.draw();
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
    const top = inset + 42;
    const fieldHeight = Math.max(120, height - top - inset - 24);
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
    }
    g.fillStyle(skin.ball, 1).fillCircle(x(state.ball.x), y(state.ball.y), Math.max(4, Math.min(fieldWidth, fieldHeight) * 0.018));
    g.lineStyle(1, skin.goal, 0.65).strokeCircle(x(state.ball.x), y(state.ball.y), Math.max(4, Math.min(fieldWidth, fieldHeight) * 0.018));

    const seconds = Math.ceil(state.timeRemainingMs / 1000).toString().padStart(2, "0");
    this.hud.setText(`${teams.home.label}  ${state.score.home}  :  ${state.score.away}  ${teams.away.label}     ${seconds}s`).setPosition(width / 2, inset);
    const phaseLabel = state.phase === "goal" ? `${state.lastGoal === "home" ? teams.home.label : teams.away.label} scores` : state.phase === "finished" ? "Full time — use the parent Reset control" : state.phase === "ready" ? "Move to start · tap/click or Space to kick" : "Move: W/S or arrows · Kick: Space, Enter, or tap";
    this.status.setText(phaseLabel).setPosition(width / 2, height - inset - 12);
    if (state.phase === "goal" && this.lastGoalTick !== state.tick && !reducedMotion()) {
      this.lastGoalTick = state.tick;
      g.lineStyle(3, state.lastGoal ? teams[state.lastGoal].primary : skin.pitchLine, 0.8).strokeRect(inset - 11, top - 11, fieldWidth + 22, fieldHeight + 22);
    }
  }
}
