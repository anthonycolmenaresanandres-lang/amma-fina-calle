import Phaser from "phaser";
import type { TableFootballPlayer, TableFootballState, TeamId } from "./types";
import { characterHeight, pitchToScreen, sidelineProjection, type PitchPoint, type SidelineProjection } from "./sideline-projection";

type Teams = Readonly<Record<TeamId, { label: string; primary: number; secondary: number }>>;
type Pose = "idle" | "stride-a" | "stride-b" | "kick";
type PlayerView = { body: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics; label: Phaser.GameObjects.Text; logo?: Phaser.GameObjects.Image; pose?: Pose };
const POSES: readonly Pose[] = ["idle", "stride-a", "stride-b", "kick"];
const FOOT = 140;
const TEXTURE_HEIGHT = 144;
export const SIDELINE_LOGO_TEXTURE = "maracaibo-sideline-approved-logo";
const motionReduced = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

/** Original code-native toy football figure. No bitmap, likeness or licensed kit. */
function drawCharacter(g: Phaser.GameObjects.Graphics, primary: number, secondary: number, pose: Pose): void {
  const dark = 0x192a34;
  const moving = pose === "stride-a" ? -5 : pose === "stride-b" ? 5 : 0;
  const kick = pose === "kick";
  g.clear();
  // Far arm and leg sit behind the shirt; a strong profile faces the opposing goal.
  g.lineStyle(12, dark, 1).lineBetween(43, 92, 39 - moving, 125);
  g.lineStyle(7, secondary, 1).lineBetween(39 - moving, 116, 39 - moving, 131);
  g.fillStyle(dark).fillRoundedRect(29 - moving, 129, 26, 11, 4);
  g.fillStyle(secondary).fillRect(30 - moving, 136, 24, 3);
  g.lineStyle(10, dark, 1).lineBetween(40, 65, 30, 85);
  g.fillStyle(secondary).fillCircle(30, 86, 6);
  // Near leg: planted boots or a short shot follow-through, never a physics jump.
  g.lineStyle(13, dark, 1).lineBetween(56, 93, kick ? 77 : 57 + moving, kick ? 115 : 127);
  g.lineStyle(7, secondary, 1).lineBetween(kick ? 71 : 57 + moving, kick ? 109 : 118, kick ? 79 : 57 + moving, kick ? 119 : 133);
  g.fillStyle(dark).fillRoundedRect(kick ? 73 : 48 + moving, kick ? 117 : 130, 29, 10, 4);
  g.fillStyle(secondary).fillRect(kick ? 75 : 49 + moving, kick ? 124 : 137, 25, 3);
  g.fillStyle(dark).fillRoundedRect(33, 82, 32, 21, 5);
  g.fillStyle(secondary).fillRect(35, 94, 28, 3);
  // Gold-edged, asymmetrical shirt with a shoulder highlight.
  g.fillStyle(dark).fillRoundedRect(30, 51, 38, 42, 10);
  g.fillStyle(primary).fillRoundedRect(32, 53, 34, 37, 8);
  g.fillStyle(secondary).fillRect(33, 56, 30, 4).fillRect(33, 85, 30, 3);
  g.fillStyle(0xffffff, 0.12).fillRoundedRect(34, 62, 7, 20, 3);
  g.lineStyle(12, primary, 1).lineBetween(61, 61, kick ? 69 : 72, kick ? 71 : 78);
  g.lineStyle(3, secondary, 1).lineBetween(kick ? 64 : 67, kick ? 70 : 77, kick ? 73 : 77, kick ? 71 : 78);
  g.fillStyle(secondary).fillCircle(kick ? 74 : 75, kick ? 74 : 83, 6);
  // Faceless rounded helmet, cream visor, a vinotinto/gold kit stripe.
  g.fillStyle(dark).fillRoundedRect(43, 43, 13, 12, 4).fillCircle(47, 29, 22);
  g.fillStyle(primary).fillCircle(46, 27, 20);
  g.fillStyle(0xffffff, 0.15).fillEllipse(41, 17, 20, 9);
  g.lineStyle(3, secondary, 1).lineBetween(57, 11, 65, 25);
  g.fillStyle(dark).fillRoundedRect(50, 27, 24, 13, 6);
  g.fillStyle(0xf1e7cd).fillRoundedRect(54, 30, 16, 6, 3);
  g.fillStyle(0xffffff, 0.9).fillRect(55, 30, 11, 2);
}

/** Presentation only. All floor objects share one projection; engine hitboxes stay frozen. */
export class SidelineTableFootballRenderer {
  private readonly pitch: Phaser.GameObjects.Graphics;
  private readonly shadows: Phaser.GameObjects.Graphics;
  private readonly ball: Phaser.GameObjects.Graphics;
  private readonly stadiumTitle: Phaser.GameObjects.Text;
  private readonly sideLabels: Record<TeamId, Phaser.GameObjects.Text>;
  private readonly players = new Map<string, PlayerView>();
  private readonly ownedTextures: string[] = [];
  private previousWidth = -1;
  private previousHeight = -1;
  private readonly textured: boolean;

  constructor(private readonly scene: Phaser.Scene, private readonly teams: Teams, private readonly hideHud: boolean, texturedPlayers = true) {
    this.pitch = scene.add.graphics().setDepth(0);
    this.shadows = scene.add.graphics().setDepth(20);
    this.ball = scene.add.graphics();
    this.stadiumTitle = scene.add.text(0, 0, "MARACAIBO", { fontFamily: "Arial, sans-serif", fontStyle: "bold", color: "#efe2bb", letterSpacing: 4 }).setOrigin(0.5, 1).setDepth(5);
    this.sideLabels = {
      home: scene.add.text(0, 0, teams.home.label.toUpperCase(), { fontFamily: "Arial, sans-serif", color: "#efe2bb", fontStyle: "bold", letterSpacing: 2 }).setOrigin(0, 0.5).setDepth(5),
      away: scene.add.text(0, 0, teams.away.label.toUpperCase(), { fontFamily: "Arial, sans-serif", color: "#efe2bb", fontStyle: "bold", letterSpacing: 2 }).setOrigin(1, 0.5).setDepth(5),
    };
    this.textured = texturedPlayers && this.createTextures();
  }

  private textureKey(team: TeamId, pose: Pose): string { return `maracaibo-sideline-${team}-${pose}`; }

  private createTextures(): boolean {
    const g = this.scene.add.graphics().setVisible(false);
    try {
      for (const team of ["home", "away"] as const) for (const pose of POSES) {
        const key = this.textureKey(team, pose);
        if (!this.scene.textures.exists(key)) {
          drawCharacter(g, this.teams[team].primary, this.teams[team].secondary, pose);
          g.generateTexture(key, 104, TEXTURE_HEIGHT);
          this.ownedTextures.push(key);
        }
      }
      return this.ownedTextures.length > 0 || this.scene.textures.exists(this.textureKey("home", "idle"));
    } catch {
      return false;
    } finally { g.destroy(); }
  }

  draw(state: TableFootballState, localPlayerId: string | undefined, goalFlash: boolean): void {
    const p = sidelineProjection(this.scene.scale.width, this.scene.scale.height, this.hideHud);
    if (p.width !== this.previousWidth || p.height !== this.previousHeight) {
      this.previousWidth = p.width; this.previousHeight = p.height;
      this.drawPitch(p);
    }
    const shadow = this.shadows.clear();
    const present = new Set<string>();
    const reduced = motionReduced();
    for (const player of state.players) {
      present.add(player.id);
      let view = this.players.get(player.id);
      if (!view) {
        const body = this.textured
          ? this.scene.add.image(0, 0, this.textureKey(player.team, "idle")).setOrigin(48 / 104, FOOT / TEXTURE_HEIGHT)
          : this.scene.add.graphics();
        const label = this.scene.add.text(0, 0, "", { fontFamily: "Arial, sans-serif", fontStyle: "bold", color: "#fff7e6", backgroundColor: "#182e30", padding: { x: 4, y: 2 } }).setOrigin(0.5, 0).setDepth(1000);
        view = { body, label }; this.players.set(player.id, view);
      }
      const point = pitchToScreen(p, player.x, player.y);
      const h = characterHeight(p, player.y);
      const isLocal = player.id === localPlayerId;
      shadow.fillStyle(0x0d2423, 0.35).fillEllipse(point.x + h * 0.06, point.y + 2, h * 0.48, h * 0.12);
      if (isLocal) {
        shadow.fillStyle(0xf7df9a, 0.15).fillEllipse(point.x, point.y, h * 0.57, h * 0.20);
        shadow.lineStyle(Math.max(1.2, p.nearWidth / 210), 0xffe4a6, 1).strokeEllipse(point.x, point.y, h * 0.57, h * 0.20);
        shadow.lineStyle(1, 0xffe4a6, 0.45);
        const near = pitchToScreen(p, player.x, 100);
        shadow.lineBetween(point.x, point.y + h * 0.11, near.x, near.y);
      }
      const pose: Pose = state.phase === "playing" && player.kickCooldownTicks >= 8 ? "kick" : !reduced && player.move ? (Math.floor(state.tick / 7) % 2 ? "stride-a" : "stride-b") : "idle";
      this.drawPlayer(view, player, point, h, pose);
      const label = `${isLocal ? "YOU · " : ""}${player.role === "goalkeeper" ? "GK" : "FW"}`;
      if (view.label.text !== label) view.label.setText(label);
      const labelSize = Math.round(Math.max(9, Math.min(12, p.nearWidth * 0.031)));
      if (view.label.style.fontSize !== `${labelSize}px`) view.label.setFontSize(labelSize);
      const labelColor = isLocal ? "#ffe4a6" : "#fff7e6";
      if (view.label.style.color !== labelColor) view.label.setColor(labelColor);
      view.label.setPosition(point.x, point.y + h * 0.14);
      if (this.scene.textures.exists(SIDELINE_LOGO_TEXTURE)) {
        if (!view.logo) view.logo = this.scene.add.image(0, 0, SIDELINE_LOGO_TEXTURE);
        const direction = player.team === "away" ? -1 : 1;
        view.logo.setPosition(point.x + direction * h * 0.015, point.y - h * 0.48).setDisplaySize(h * 0.125, h * 0.125).setDepth(view.body.depth + 0.1);
      }
    }
    for (const [id, view] of this.players) if (!present.has(id)) {
      view.body.destroy(); view.label.destroy(); view.logo?.destroy(); this.players.delete(id);
    }
    const point = pitchToScreen(p, state.ball.x, state.ball.y);
    const r = characterHeight(p, state.ball.y) * 0.077;
    shadow.fillStyle(0x0b2422, 0.5).fillEllipse(point.x + r * 0.3, point.y + 2, r * 2.6, r * 0.9);
    this.drawBall(point.x, point.y, r);
    // Foot-depth order also applies to the ball; it never floats over every character.
    this.ball.setDepth(100 + point.y * 2 + 0.5);
    if (goalFlash) {
      const goalX = state.lastGoal === "home" ? 100 : 0;
      const a = pitchToScreen(p, goalX, 39); const b = pitchToScreen(p, goalX, 61);
      shadow.lineStyle(3, 0xffe4a6, 0.8).lineBetween(a.x, a.y, b.x, b.y);
    }
  }

  private drawPlayer(view: PlayerView, player: TableFootballPlayer, point: PitchPoint, height: number, pose: Pose): void {
    const scale = height / TEXTURE_HEIGHT;
    if (view.body instanceof Phaser.GameObjects.Image) {
      view.body.setPosition(point.x, point.y).setScale(player.team === "away" ? -scale : scale, scale);
      if (view.pose !== pose) view.body.setTexture(this.textureKey(player.team, pose));
    } else {
      if (view.pose !== pose) drawCharacter(view.body, this.teams[player.team].primary, this.teams[player.team].secondary, pose);
      const away = player.team === "away";
      view.body.setScale(away ? -scale : scale, scale).setPosition(point.x + (away ? 48 : -48) * scale, point.y - FOOT * scale);
    }
    view.pose = pose;
    view.body.setDepth(100 + point.y * 2);
  }

  private polygon(g: Phaser.GameObjects.Graphics, points: readonly PitchPoint[], color: number, alpha = 1): void {
    g.fillStyle(color, alpha).beginPath();
    points.forEach((point, index) => index ? g.lineTo(point.x, point.y) : g.moveTo(point.x, point.y));
    g.closePath().fillPath();
  }

  private outline(g: Phaser.GameObjects.Graphics, points: readonly PitchPoint[], close = true): void {
    g.beginPath(); points.forEach((point, index) => index ? g.lineTo(point.x, point.y) : g.moveTo(point.x, point.y));
    if (close) g.closePath(); g.strokePath();
  }

  private drawPitch(p: SidelineProjection): void {
    const g = this.pitch.clear();
    const floor = (x: number, y: number) => pitchToScreen(p, x, y);
    const farLeft = floor(0, 0); const farRight = floor(100, 0);
    const nearLeft = floor(0, 100); const nearRight = floor(100, 100);
    const lake = p.pitchTop - p.playerHeight * 0.23;
    // Quiet dusk lake and an original bridge silhouette, grounded in Maracaibo.
    g.fillStyle(0x162b37).fillRect(0, 0, p.width, p.height);
    for (let band = 0; band < 12; band++) {
      g.fillStyle(((24 + band * 4) << 16) | ((43 + band * 5) << 8) | (56 + band * 4)).fillRect(0, band * lake / 12, p.width, lake / 12 + 1);
    }
    g.fillStyle(0x305f6b).fillRect(0, lake - p.playerHeight * 0.34, p.width, p.playerHeight * 0.34);
    g.lineStyle(1, 0x8cabac, 0.17);
    for (let row = 0; row < 3; row++) g.lineBetween(p.width * (0.08 + row * 0.17), lake - row * 4 - 3, p.width * (0.29 + row * 0.17), lake - row * 4 - 3);
    const deck = lake - p.playerHeight * 0.43;
    g.lineStyle(2, 0x213d48, 0.8).lineBetween(p.width * 0.04, deck, p.width * 0.96, deck);
    for (let tower = 1; tower <= 5; tower++) {
      const tx = p.width * (0.12 + tower * 0.125); const peak = deck - p.playerHeight * 0.32;
      g.lineStyle(2, 0x24424e, 0.85).lineBetween(tx, peak, tx, lake - 2);
      g.lineStyle(0.8, 0x526f74, 0.65).lineBetween(tx, peak, tx - p.width * 0.06, deck).lineBetween(tx, peak, tx + p.width * 0.06, deck);
    }
    // Far boards carry restrained tricolor detailing, with no event or club marks.
    g.fillStyle(0x182b30).fillRect(farLeft.x - 15, lake, farRight.x - farLeft.x + 30, p.pitchTop - lake);
    const ribbonY = lake + 2;
    const ribbonWidth = (farRight.x - farLeft.x) / 3;
    for (const [index, color] of [0xd5af73, 0x314f70, 0x7c1d32].entries()) g.fillStyle(color).fillRect(farLeft.x + index * ribbonWidth, ribbonY, ribbonWidth, 2);
    this.stadiumTitle.setFontSize(Math.max(10, p.nearWidth * 0.038)).setPosition(p.centerX, p.pitchTop - 4);
    this.sideLabels.home.setFontSize(Math.max(9, p.nearWidth * 0.03)).setPosition(nearLeft.x, nearLeft.y + p.nearWidth * 0.052);
    this.sideLabels.away.setFontSize(Math.max(9, p.nearWidth * 0.03)).setPosition(nearRight.x, nearRight.y + p.nearWidth * 0.052);
    this.polygon(g, [farLeft, farRight, nearRight, nearLeft], 0x2b6250);
    for (let stripe = 0; stripe < 10; stripe++) this.polygon(g, [floor(stripe * 10, 0), floor((stripe + 1) * 10, 0), floor((stripe + 1) * 10, 100), floor(stripe * 10, 100)], stripe % 2 ? 0x225745 : 0x397560, 0.40);
    g.lineStyle(Math.max(1.2, p.nearWidth / 260), 0xf4efd9, 0.86);
    this.outline(g, [farLeft, farRight, nearRight, nearLeft]);
    this.outline(g, [floor(50, 0), floor(50, 100)], false);
    const circle = Array.from({ length: 49 }, (_, i) => floor(50 + Math.cos(i * Math.PI / 24) * 9, 50 + Math.sin(i * Math.PI / 24) * 14));
    this.outline(g, circle);
    const center = floor(50, 50); g.fillStyle(0xf4efd9, 0.9).fillCircle(center.x, center.y, 1.6);
    for (const side of [0, 100]) {
      const direction = side ? -1 : 1;
      g.lineStyle(Math.max(1.2, p.nearWidth / 260), 0xf4efd9, 0.86);
      for (const [depth, edge] of [[16, 21], [5.5, 36]]) this.outline(g, [floor(side, edge), floor(side + direction * depth, edge), floor(side + direction * depth, 100 - edge), floor(side, 100 - edge)], false);
      const spot = floor(side + direction * 11, 50); g.fillStyle(0xf4efd9, 0.9).fillCircle(spot.x, spot.y, 1.5);
      this.drawGoal(p, side);
    }
    // These are the four actual table-football lanes, rather than free-running football.
    for (const lane of [10, 30, 70, 90]) {
      g.lineStyle(0.9, 0xdde5ce, 0.22);
      for (let depth = 0; depth < 100; depth += 8) this.outline(g, [floor(lane, depth), floor(lane, depth + 3)], false);
    }
    this.polygon(g, [nearLeft, nearRight, { x: nearRight.x + 4, y: nearRight.y + 7 }, { x: nearLeft.x - 4, y: nearLeft.y + 7 }], 0x173a33);
    g.lineStyle(1.5, 0xd5af73, 0.7).lineBetween(nearLeft.x, nearLeft.y + 7, nearRight.x, nearRight.y + 7);
  }

  private drawGoal(p: SidelineProjection, end: number): void {
    const g = this.pitch;
    const floor = (x: number, y: number) => pitchToScreen(p, x, y);
    const a = floor(end, 39); const b = floor(end, 61);
    const backA = floor(end + (end ? 5 : -5), 39); const backB = floor(end + (end ? 5 : -5), 61);
    const h = p.playerHeight * 0.57;
    const lift = (point: PitchPoint) => ({ x: point.x, y: point.y - h });
    this.polygon(g, [backA, backB, lift(backB), lift(backA)], 0xe9ece0, 0.10);
    this.polygon(g, [a, backA, lift(backA), lift(a)], 0xe9ece0, 0.09);
    g.lineStyle(0.6, 0xe9ece0, 0.45);
    for (let row = 1; row < 5; row++) g.lineBetween(backA.x, backA.y - h * row / 5, backB.x, backB.y - h * row / 5);
    for (let column = 0; column <= 4; column++) {
      const point = floor(end + (end ? 5 : -5), 39 + column * 22 / 4);
      g.lineBetween(point.x, point.y, point.x, point.y - h);
    }
    this.outline(g, [backA, lift(backA), lift(backB), backB], false);
    g.lineStyle(2, 0xfff8df, 0.95);
    this.outline(g, [a, lift(a), lift(b), b], false);
    this.outline(g, [lift(a), lift(backA), lift(backB), lift(b)], false);
    g.lineStyle(2, 0xd5af73, 1).lineBetween(a.x, a.y, b.x, b.y);
  }

  private drawBall(x: number, floorY: number, radius: number): void {
    const g = this.ball.clear(); const y = floorY - radius * 0.75;
    g.fillStyle(0xfffbee, 1).fillCircle(x, y, radius);
    g.lineStyle(0.8, 0x192a34, 1).strokeCircle(x, y, radius);
    g.fillStyle(0x263840).fillCircle(x + radius * 0.12, y, radius * 0.36);
    g.lineStyle(0.7, 0x263840, 1);
    for (let seam = 0; seam < 5; seam++) {
      const angle = seam * Math.PI * 2 / 5;
      g.lineBetween(x + Math.cos(angle) * radius * 0.3, y + Math.sin(angle) * radius * 0.3, x + Math.cos(angle) * radius * 0.87, y + Math.sin(angle) * radius * 0.87);
    }
    g.fillStyle(0xffffff, 0.9).fillCircle(x - radius * 0.3, y - radius * 0.3, radius * 0.18);
  }

  destroy(): void {
    this.pitch.destroy(); this.shadows.destroy(); this.ball.destroy(); this.stadiumTitle.destroy();
    for (const label of Object.values(this.sideLabels)) label.destroy();
    for (const view of this.players.values()) { view.body.destroy(); view.label.destroy(); view.logo?.destroy(); }
    this.players.clear();
    for (const key of this.ownedTextures) this.scene.textures.remove(key);
  }
}