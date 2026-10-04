import Phaser from "phaser";
import type { TableFootballState, TeamId } from "./types";

export const MARACAIBO_FOOTBALL_TEXTURES = {
  stadium: "maracaibo-football-stadium",
  home: "maracaibo-football-lago",
  away: "maracaibo-football-rayo",
  logo: "maracaibo-football-shirt-logo",
} as const;

type Teams = Readonly<Record<TeamId, { label: string; primary: number; secondary: number }>>;
type PlayerView = {
  image: Phaser.GameObjects.Image;
  logo: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
};

/** Maracaibo art only: no input, collision, timing, camera or match-state changes. */
export class StadiumTableFootballRenderer {
  private readonly stadium: Phaser.GameObjects.Image;
  private readonly pitch: Phaser.GameObjects.Graphics;
  private readonly shadows: Phaser.GameObjects.Graphics;
  private readonly ball: Phaser.GameObjects.Graphics;
  private readonly players = new Map<string, PlayerView>();
  private previousWidth = -1;
  private previousHeight = -1;

  constructor(private readonly scene: Phaser.Scene, private readonly teams: Teams, private readonly hideHud: boolean) {
    this.stadium = scene.add.image(0, 0, MARACAIBO_FOOTBALL_TEXTURES.stadium).setDepth(0);
    this.pitch = scene.add.graphics().setDepth(1);
    this.shadows = scene.add.graphics().setDepth(2);
    this.ball = scene.add.graphics().setDepth(30);
  }

  draw(state: TableFootballState, localPlayerId: string | undefined, goalFlash: boolean): void {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    const inset = Math.max(14, Math.min(width, height) * 0.055);
    const contentTop = this.hideHud ? 0 : inset + 42;
    const contentBottom = this.hideHud ? height : height - inset - 24;
    const contentHeight = Math.max(1, contentBottom - contentTop);
    // The art reserves a central grass area; keep lines and goals inside it.
    // 105 m / 68 m is presentation geometry, independent of engine units.
    const fieldWidth = Math.min(width * 0.70, contentHeight * 0.70 * (105 / 68));
    const fieldHeight = fieldWidth * (68 / 105);
    const left = (width - fieldWidth) / 2;
    const top = contentTop + (contentHeight - fieldHeight) / 2;
    const x = (unit: number) => left + unit * fieldWidth / 100;
    const y = (unit: number) => top + unit * fieldHeight / 100;

    if (width !== this.previousWidth || height !== this.previousHeight) {
      this.previousWidth = width;
      this.previousHeight = height;
      // Stretch the unmarked overhead shell into the same football proportion.
      // Grass occupies ~76% of the source, leaving a buffer before the stands.
      this.stadium.setPosition(width / 2, contentTop + contentHeight / 2).setDisplaySize(fieldWidth / 0.70, fieldHeight / 0.70);
      this.drawPitch(left, top, fieldWidth, fieldHeight);
    }

    const g = this.shadows;
    g.clear();
    const playerWidth = Math.max(30, Math.min(64, fieldWidth * 0.14));
    const labelSize = Math.round(Math.max(9, Math.min(11, width * 0.024)));
    const present = new Set<string>();
    for (const player of state.players) {
      present.add(player.id);
      const away = player.team === "away";
      let view = this.players.get(player.id);
      if (!view) {
        const image = this.scene.add.image(0, 0, MARACAIBO_FOOTBALL_TEXTURES[player.team]).setFlipX(away).setOrigin(0.5, 0.52).setDepth(10);
        const logo = this.scene.add.image(0, 0, MARACAIBO_FOOTBALL_TEXTURES.logo).setDepth(11).setAngle(away ? -90 : 90);
        const label = this.scene.add.text(0, 0, "", { fontFamily: "system-ui, sans-serif", fontSize: labelSize, color: "#fff7e6", stroke: "#132819", strokeThickness: 3 }).setOrigin(0.5, 0).setDepth(20);
        view = { image, logo, label };
        this.players.set(player.id, view);
      }
      const px = x(player.x);
      const py = y(player.y);
      const playerHeight = playerWidth * view.image.height / view.image.width;
      g.fillStyle(0x071709, 0.34).fillEllipse(px + 2, py + 3, playerWidth * 0.70, playerHeight * 0.78);
      if (player.id === localPlayerId) {
        g.fillStyle(this.teams[player.team].primary, 0.22).fillCircle(px, py, playerWidth * 0.36);
        g.lineStyle(2, 0xffe4a6, 1).strokeCircle(px, py, playerWidth * 0.36);
      }
      view.image.setPosition(px, py).setDisplaySize(playerWidth, playerHeight);
      const patchSize = Math.max(5, Math.min(10, playerWidth * 0.19));
      view.logo.setPosition(px + (away ? -1 : 1) * playerWidth * 0.03, py + playerHeight * 0.01).setDisplaySize(patchSize, patchSize);
      const label = `${player.id === localPlayerId ? "YOU · " : ""}${player.role === "goalkeeper" ? "GK" : "FW"}`;
      if (view.label.text !== label) view.label.setText(label);
      if (view.label.style.fontSize !== `${labelSize}px`) view.label.setFontSize(labelSize);
      view.label.setPosition(px, py + playerHeight * 0.48 + 3);
    }
    for (const [id, view] of this.players) {
      if (!present.has(id)) {
        view.image.destroy();
        view.logo.destroy();
        view.label.destroy();
        this.players.delete(id);
      }
    }
    if (goalFlash) g.lineStyle(3, 0xf5d99b, 0.9).strokeRoundedRect(left - 5, top - 5, fieldWidth + 10, fieldHeight + 10, 4);
    this.drawBall(x(state.ball.x), y(state.ball.y), Math.max(4, fieldHeight * 0.023));
  }

  private drawPitch(left: number, top: number, width: number, height: number): void {
    const g = this.pitch;
    const x = (unit: number) => left + unit * width / 100;
    const y = (unit: number) => top + unit * height / 100;
    g.clear();
    // Preserve the generated grass texture, adding quiet, consistent mow stripes.
    g.fillStyle(0x0f391a, 0.15).fillRect(left, top, width, height);
    for (let stripe = 0; stripe < 12; stripe += 1) {
      g.fillStyle(stripe % 2 ? 0x163c1c : 0xb3ce76, stripe % 2 ? 0.07 : 0.035).fillRect(left + stripe * width / 12, top, width / 12, height);
    }
    g.lineStyle(2, 0xc2a571, 0.65).strokeRoundedRect(left - 5, top - 5, width + 10, height + 10, 4);
    // Fixed lanes keep the table-football movement model apparent.
    for (const lane of [10, 30, 70, 90]) {
      g.lineStyle(1, 0x14261a, 0.22).lineBetween(x(lane), top - 3, x(lane), top + height + 3);
    }
    g.lineStyle(Math.max(1.2, width / 300), 0xf7f5dc, 0.88).strokeRect(left, top, width, height);
    g.lineBetween(x(50), top, x(50), top + height).strokeCircle(x(50), y(50), height * 0.134);
    g.fillStyle(0xf7f5dc, 0.9).fillCircle(x(50), y(50), 1.7);
    for (const side of [0, 1]) {
      const end = side ? left + width : left;
      const direction = side ? -1 : 1;
      const penaltyLeft = side ? x(84) : left;
      const goalAreaLeft = side ? x(94.5) : left;
      g.lineStyle(Math.max(1.2, width / 300), 0xf7f5dc, 0.88).strokeRect(penaltyLeft, y(21), width * 0.16, height * 0.58).strokeRect(goalAreaLeft, y(36), width * 0.055, height * 0.28);
      g.fillStyle(0xf7f5dc, 0.9).fillCircle(end + direction * width * 0.11, y(50), 1.6);
      g.beginPath().arc(end + direction * width * 0.11, y(50), height * 0.134, side ? Math.PI - 0.67 : -0.67, side ? Math.PI + 0.67 : 0.67).strokePath();
      const netWidth = width * 0.035;
      const netLeft = side ? end : end - netWidth;
      const netTop = y(39);
      const netHeight = height * 0.22;
      g.fillStyle(0xecede2, 0.16).fillRect(netLeft, netTop, netWidth, netHeight);
      g.lineStyle(0.7, 0xffffff, 0.48);
      for (let row = 1; row < 6; row += 1) g.lineBetween(netLeft, netTop + row * netHeight / 6, netLeft + netWidth, netTop + row * netHeight / 6);
      for (let column = 1; column < 3; column += 1) g.lineBetween(netLeft + column * netWidth / 3, netTop, netLeft + column * netWidth / 3, netTop + netHeight);
      g.lineStyle(2, 0xfff9e7, 0.95).strokeRect(netLeft, netTop, netWidth, netHeight);
    }
  }

  private drawBall(x: number, y: number, radius: number): void {
    const g = this.ball;
    g.clear();
    g.fillStyle(0x031507, 0.42).fillEllipse(x + 1.4, y + radius * 0.65, radius * 2.2, radius * 1.4);
    g.fillStyle(0xfffdf1, 1).fillCircle(x, y, radius);
    g.lineStyle(0.8, 0x152319, 0.95).strokeCircle(x, y, radius);
    g.fillStyle(0x1d2722, 1).beginPath();
    for (let point = 0; point < 5; point += 1) {
      const angle = -Math.PI / 2 + point * Math.PI * 2 / 5;
      const px = x + Math.cos(angle) * radius * 0.43;
      const py = y + Math.sin(angle) * radius * 0.43;
      if (point === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath().fillPath();
    g.lineStyle(0.65, 0x1d2722, 0.85);
    for (let panel = 0; panel < 5; panel += 1) {
      const angle = -Math.PI / 2 + panel * Math.PI * 2 / 5;
      g.lineBetween(x + Math.cos(angle) * radius * 0.43, y + Math.sin(angle) * radius * 0.43, x + Math.cos(angle) * radius * 0.90, y + Math.sin(angle) * radius * 0.90);
    }
    g.fillStyle(0xffffff, 0.75).fillCircle(x - radius * 0.25, y - radius * 0.32, radius * 0.16);
  }

  destroy(): void {
    this.stadium.destroy();
    this.pitch.destroy();
    this.shadows.destroy();
    this.ball.destroy();
    for (const view of this.players.values()) {
      view.image.destroy();
      view.logo.destroy();
      view.label.destroy();
    }
    this.players.clear();
  }
}
