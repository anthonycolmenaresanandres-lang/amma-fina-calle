// Primitive renderer for Penalty Shootout (the default, asset-free skin).
// Owns the Phaser graphics + text objects and draws a frame from a pure
// RenderState snapshot. Reads colors from the level's PenaltyColors (the V1
// "skin" surface). All drawing is verbatim from the V1 scene — pixels identical.
//
// This is the seam the V2 skin system grows from: a future asset-backed skin
// swaps this renderer (or extends it) without touching engine or input.

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

const TEXT_FONT = "Georgia, serif";

export class PenaltyRenderer {
  private readonly colors: PenaltyColors;
  private readonly fieldGraphics: Phaser.GameObjects.Graphics;
  private readonly actorGraphics: Phaser.GameObjects.Graphics;
  private readonly titleText: Phaser.GameObjects.Text;
  private readonly scoreText: Phaser.GameObjects.Text;
  private readonly statusText: Phaser.GameObjects.Text;
  private readonly hintText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, colors: PenaltyColors, skinName: string) {
    this.colors = colors;

    // Creation order matters for z-order (later objects render on top): field,
    // then actors, then text — identical to V1.
    this.fieldGraphics = scene.add.graphics();
    this.actorGraphics = scene.add.graphics();

    this.titleText = scene.add
      .text(0, 0, skinName.toUpperCase(), {
        fontFamily: TEXT_FONT,
        fontSize: "13px",
        color: "#d8b36d",
      })
      .setOrigin(0.5, 0);

    this.scoreText = scene.add
      .text(0, 0, "", {
        fontFamily: TEXT_FONT,
        fontSize: "20px",
        color: colors.text,
      })
      .setOrigin(0.5, 0);

    this.statusText = scene.add
      .text(0, 0, "", {
        fontFamily: TEXT_FONT,
        fontSize: "26px",
        fontStyle: "bold",
        color: colors.text,
        align: "center",
      })
      .setOrigin(0.5, 0.5);

    this.hintText = scene.add
      .text(0, 0, "", {
        fontFamily: TEXT_FONT,
        fontSize: "13px",
        color: colors.text,
        align: "center",
      })
      .setOrigin(0.5, 1);
  }

  render(state: RenderState): void {
    this.drawField(state);

    const a = this.actorGraphics;
    a.clear();
    this.drawKeeper(a, state);
    this.drawBall(a, state);

    this.layoutTexts(state);
  }

  private drawField(state: RenderState): void {
    const { layout } = state;
    const colors = this.colors;
    const g = this.fieldGraphics;
    g.clear();

    // Sky / stand backdrop and pitch.
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

    // Ground shadow scales down as the ball rises (sky region).
    const groundFactor = Phaser.Math.Clamp((y - layout.goalTop) / (layout.spotY - layout.goalTop), 0.2, 1);
    a.fillStyle(0x000000, 0.22 * groundFactor);
    a.fillCircle(x, layout.spotY, r * groundFactor);

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
