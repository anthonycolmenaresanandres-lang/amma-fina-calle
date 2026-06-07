// Renderer for Penalty Shootout. Draws a frame from a pure RenderState snapshot
// using the active skin's PenaltyColors. Optional skin image assets (background,
// logo, ball) are drawn when present and fall back to the asset-free primitive
// look when absent or if a file fails to load — so a missing asset never breaks
// the scene (no 404 break). With no assets, output is pixel-identical to V1.

import Phaser from "phaser";
import { PENALTY_ZONES } from "../config";
import type { PenaltyColors } from "../types";
import { zoneCenter, type Layout, type Vec2 } from "../geometry";
import { currentShotNumber, type MatchState } from "../engine/match";

export type RenderState = {
  layout: Layout;
  match: MatchState;
  totalShots: number;
  hoverZoneId: string | null;
  ballPos: Vec2;
  keeperPos: Vec2;
  keeperRest: Vec2;
  statusText: string;
  statusColor: string;
};

// Texture keys for any skin assets that actually loaded (undefined = fall back).
export type RendererAssets = {
  backgroundKey?: string;
  logoKey?: string;
  ballKey?: string;
};

const TEXT_FONT = "Georgia, serif";

// Explicit depths so the layer order is deterministic regardless of object
// creation order, and identical to V1 in the no-asset case (field < actors < text).
const DEPTH = {
  background: -10,
  field: 0,
  actors: 10,
  ball: 11,
  text: 20,
  logo: 30,
} as const;

export class PenaltyRenderer {
  private readonly colors: PenaltyColors;
  private readonly fieldGraphics: Phaser.GameObjects.Graphics;
  private readonly actorGraphics: Phaser.GameObjects.Graphics;
  private readonly titleText: Phaser.GameObjects.Text;
  private readonly scoreText: Phaser.GameObjects.Text;
  private readonly statusText: Phaser.GameObjects.Text;
  private readonly hintText: Phaser.GameObjects.Text;

  private readonly bgImage: Phaser.GameObjects.Image | null = null;
  private readonly logoImage: Phaser.GameObjects.Image | null = null;
  private readonly ballImage: Phaser.GameObjects.Image | null = null;

  constructor(
    scene: Phaser.Scene,
    colors: PenaltyColors,
    skinName: string,
    assets: RendererAssets = {},
  ) {
    this.colors = colors;

    // Optional photographic backdrop (behind everything).
    if (assets.backgroundKey) {
      this.bgImage = scene.add
        .image(0, 0, assets.backgroundKey)
        .setOrigin(0.5, 0.5)
        .setDepth(DEPTH.background);
    }

    this.fieldGraphics = scene.add.graphics().setDepth(DEPTH.field);
    this.actorGraphics = scene.add.graphics().setDepth(DEPTH.actors);

    // Optional product-themed ball (drawn instead of the primitive ball).
    if (assets.ballKey) {
      this.ballImage = scene.add
        .image(0, 0, assets.ballKey)
        .setOrigin(0.5, 0.5)
        .setDepth(DEPTH.ball);
    }

    this.titleText = scene.add
      .text(0, 0, skinName.toUpperCase(), {
        fontFamily: TEXT_FONT,
        fontSize: "13px",
        color: "#d8b36d",
      })
      .setOrigin(0.5, 0)
      .setDepth(DEPTH.text);

    this.scoreText = scene.add
      .text(0, 0, "", {
        fontFamily: TEXT_FONT,
        fontSize: "20px",
        color: colors.text,
      })
      .setOrigin(0.5, 0)
      .setDepth(DEPTH.text);

    this.statusText = scene.add
      .text(0, 0, "", {
        fontFamily: TEXT_FONT,
        fontSize: "26px",
        fontStyle: "bold",
        color: colors.text,
        align: "center",
      })
      .setOrigin(0.5, 0.5)
      .setDepth(DEPTH.text);

    this.hintText = scene.add
      .text(0, 0, "", {
        fontFamily: TEXT_FONT,
        fontSize: "13px",
        color: colors.text,
        align: "center",
      })
      .setOrigin(0.5, 1)
      .setDepth(DEPTH.text);

    // Optional brand logo, drawn as a small top-right watermark.
    if (assets.logoKey) {
      this.logoImage = scene.add
        .image(0, 0, assets.logoKey)
        .setOrigin(1, 0)
        .setAlpha(0.72)
        .setDepth(DEPTH.logo);
    }
  }

  render(state: RenderState): void {
    this.positionAssets(state);

    this.drawField(state);

    const a = this.actorGraphics;
    a.clear();
    this.drawKeeper(a, state);
    this.drawBall(a, state);

    this.layoutTexts(state);
  }

  // Position/scale the optional image assets to the current layout.
  private positionAssets(state: RenderState): void {
    const { layout } = state;

    if (this.bgImage) {
      // Cover-fit the backdrop to the canvas.
      const iw = this.bgImage.width || 1;
      const ih = this.bgImage.height || 1;
      const scale = Math.max(layout.w / iw, layout.h / ih);
      this.bgImage.setPosition(layout.w / 2, layout.h / 2).setScale(scale);
    }

    if (this.logoImage) {
      const targetH = Math.max(18, layout.h * 0.05);
      const scale = targetH / (this.logoImage.height || 1);
      this.logoImage.setScale(scale).setPosition(layout.w - layout.w * 0.04, layout.h * 0.03);
    }
  }

  private drawField(state: RenderState): void {
    const { layout } = state;
    const colors = this.colors;
    const g = this.fieldGraphics;
    g.clear();

    if (this.bgImage) {
      // Photographic backdrop is its own object (behind); lay a dark scrim so
      // the goal, ball, and text stay legible over it.
      g.fillStyle(0x000000, 0.45);
      g.fillRect(0, 0, layout.w, layout.h);
    } else {
      // Primitive sky / stand backdrop and pitch (verbatim V1).
      g.fillStyle(colors.sky, 1);
      g.fillRect(0, 0, layout.w, layout.h * 0.55);
      g.fillStyle(colors.grass, 1);
      g.fillRect(0, layout.h * 0.5, layout.w, layout.h * 0.5);

      // Mowed pitch stripes converging toward the goal.
      g.lineStyle(Math.max(10, layout.h * 0.02), colors.grassLine, 0.5);
      for (let i = 1; i <= 4; i += 1) {
        const y = layout.h * (0.55 + i * 0.1);
        g.lineBetween(0, y, layout.w, y);
      }
    }

    // Penalty box arc hint + spot.
    g.lineStyle(2, colors.net, 0.4);
    g.lineBetween(layout.goalLeft - layout.w * 0.04, layout.goalBottom, layout.goalRight + layout.w * 0.04, layout.goalBottom);
    g.fillStyle(colors.goalFrame, 0.85);
    g.fillCircle(layout.spotX, layout.spotY, Math.max(3, layout.w * 0.008));

    // Net fill + mesh.
    g.fillStyle(colors.net, 0.06);
    g.fillRect(layout.goalLeft, layout.goalTop, layout.goalWidth, layout.goalHeight);
    g.lineStyle(1, colors.net, 0.22);
    const cols = 8;
    const rows = 5;
    for (let i = 1; i < cols; i += 1) {
      const x = layout.goalLeft + (layout.goalWidth * i) / cols;
      g.lineBetween(x, layout.goalTop, x, layout.goalBottom);
    }
    for (let j = 1; j < rows; j += 1) {
      const y = layout.goalTop + (layout.goalHeight * j) / rows;
      g.lineBetween(layout.goalLeft, y, layout.goalRight, y);
    }

    // Goal frame (posts + crossbar).
    const postW = Math.max(4, layout.w * 0.015);
    g.fillStyle(colors.goalFrame, 1);
    g.fillRect(layout.goalLeft - postW, layout.goalTop - postW, postW, layout.goalHeight + postW);
    g.fillRect(layout.goalRight, layout.goalTop - postW, postW, layout.goalHeight + postW);
    g.fillRect(layout.goalLeft - postW, layout.goalTop - postW, layout.goalWidth + postW * 2, postW);

    // Aim targets (only while choosing a shot).
    if (state.match.phase === "aim") {
      for (const zone of PENALTY_ZONES) {
        const c = zoneCenter(zone, layout);
        const hovered = state.hoverZoneId === zone.id;
        g.fillStyle(colors.accent, hovered ? 0.22 : 0.1);
        g.fillCircle(c.x, c.y, layout.zoneRadius);
        g.fillStyle(colors.accent, hovered ? 0.95 : 0.55);
        g.fillCircle(c.x, c.y, Math.max(5, layout.zoneRadius * (hovered ? 0.34 : 0.22)));
      }
    }
  }

  private drawKeeper(a: Phaser.GameObjects.Graphics, state: RenderState): void {
    const { layout } = state;
    const colors = this.colors;
    const kw = layout.keeperWidth;
    const kh = layout.keeperHeight;
    const x = state.keeperPos.x;
    const y = state.keeperPos.y;
    const diving = state.match.phase === "shooting" || state.match.phase === "result";
    const reach = diving ? Math.abs(state.keeperPos.x - state.keeperRest.x) : 0;
    const armSpan = kw * 0.6 + reach * 0.5;

    // Shadow.
    a.fillStyle(0x000000, 0.25);
    a.fillCircle(x, layout.keeperLineY + 4, kw * 0.55);

    // Outstretched arms when reaching.
    a.fillStyle(colors.keeper, 1);
    a.fillRect(x - armSpan, y - kh * 0.78, armSpan * 2, Math.max(6, kh * 0.16));

    // Body + head.
    a.fillStyle(colors.keeperAccent, 1);
    a.fillRect(x - kw * 0.32, y - kh, kw * 0.64, kh);
    a.fillStyle(colors.keeper, 1);
    a.fillRect(x - kw * 0.32, y - kh, kw * 0.64, kh * 0.42);
    a.fillStyle(colors.keeper, 1);
    a.fillCircle(x, y - kh - kw * 0.14, kw * 0.26);
  }

  private drawBall(a: Phaser.GameObjects.Graphics, state: RenderState): void {
    const { layout } = state;
    const colors = this.colors;
    const r = layout.ballRadius;
    const { x, y } = state.ballPos;

    // Ground shadow scales down as the ball rises (sky region). Drawn for both
    // the primitive and image ball.
    const groundFactor = Phaser.Math.Clamp((y - layout.goalTop) / (layout.spotY - layout.goalTop), 0.2, 1);
    a.fillStyle(0x000000, 0.22 * groundFactor);
    a.fillCircle(x, layout.spotY, r * groundFactor);

    if (this.ballImage) {
      const d = r * 2.4;
      this.ballImage.setPosition(x, y).setDisplaySize(d, d);
      return;
    }

    a.fillStyle(colors.ball, 1);
    a.fillCircle(x, y, r);
    a.fillStyle(colors.ballSpot, 1);
    a.fillCircle(x, y, r * 0.32);
    a.fillCircle(x - r * 0.45, y - r * 0.3, r * 0.18);
    a.fillCircle(x + r * 0.5, y + r * 0.2, r * 0.18);
  }

  private layoutTexts(state: RenderState): void {
    const { layout, match, totalShots } = state;

    this.titleText.setPosition(layout.w / 2, layout.h * 0.035);

    const currentShot = currentShotNumber(match, totalShots);
    this.scoreText.setText(`${match.goals} GOALS · ${currentShot}/${totalShots}`);
    this.scoreText.setPosition(layout.w / 2, layout.h * 0.06);

    this.statusText.setColor(state.statusColor);
    this.statusText.setText(state.statusText);
    this.statusText.setPosition(layout.w / 2, layout.h * 0.52);

    if (match.phase === "aim") {
      this.hintText.setText("Tap a target to shoot");
    } else if (match.phase === "gameover") {
      this.hintText.setText("Tap to shoot again");
    } else {
      this.hintText.setText("");
    }
    this.hintText.setPosition(layout.w / 2, layout.h * 0.96);
  }
}
