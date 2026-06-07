import Phaser from "phaser";
import { DEFAULT_PENALTY_LEVEL, PENALTY_ZONES } from "./config";
import type {
  PenaltyLevel,
  ShotOutcome,
  ZoneConfig,
} from "./types";

type Phase = "aim" | "shooting" | "result" | "gameover";

type Layout = {
  w: number;
  h: number;
  goalLeft: number;
  goalRight: number;
  goalTop: number;
  goalBottom: number;
  goalWidth: number;
  goalHeight: number;
  spotX: number;
  spotY: number;
  ballRadius: number;
  zoneRadius: number;
  keeperWidth: number;
  keeperHeight: number;
  keeperLineY: number;
};

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export class PenaltyScene extends Phaser.Scene {
  private level: PenaltyLevel;

  private fieldGraphics!: Phaser.GameObjects.Graphics;
  private actorGraphics!: Phaser.GameObjects.Graphics;

  private titleText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;

  private phase: Phase = "aim";
  private phaseTimeMs = 0;

  private shotsTaken = 0;
  private goals = 0;
  private results: ShotOutcome[] = [];

  private hoverZoneId: string | null = null;

  // Per-shot resolution, computed when the player commits a shot.
  private shotZone: ZoneConfig | null = null;
  private currentOutcome: ShotOutcome = "goal";
  private ballStart = { x: 0, y: 0 };
  private ballTarget = { x: 0, y: 0 };
  private ballPos = { x: 0, y: 0 };
  private keeperRest = { x: 0, y: 0 };
  private keeperTarget = { x: 0, y: 0 };
  private keeperPos = { x: 0, y: 0 };

  constructor(level: PenaltyLevel = DEFAULT_PENALTY_LEVEL) {
    super(`PenaltyScene-${level.id}`);
    this.level = level;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(this.level.colors.bg);

    this.fieldGraphics = this.add.graphics();
    this.actorGraphics = this.add.graphics();

    this.titleText = this.add
      .text(0, 0, this.level.skinName.toUpperCase(), {
        fontFamily: "Georgia, serif",
        fontSize: "13px",
        color: "#d8b36d",
      })
      .setOrigin(0.5, 0);

    this.scoreText = this.add
      .text(0, 0, "", {
        fontFamily: "Georgia, serif",
        fontSize: "20px",
        color: this.level.colors.text,
      })
      .setOrigin(0.5, 0);

    this.statusText = this.add
      .text(0, 0, "", {
        fontFamily: "Georgia, serif",
        fontSize: "26px",
        fontStyle: "bold",
        color: this.level.colors.text,
        align: "center",
      })
      .setOrigin(0.5, 0.5);

    this.hintText = this.add
      .text(0, 0, "", {
        fontFamily: "Georgia, serif",
        fontSize: "13px",
        color: this.level.colors.text,
        align: "center",
      })
      .setOrigin(0.5, 1);

    const layout = this.getLayout();
    this.ballPos = { x: layout.spotX, y: layout.spotY };
    this.keeperRest = { x: layout.w / 2, y: layout.keeperLineY };
    this.keeperPos = { ...this.keeperRest };

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.phase !== "aim") {
        return;
      }
      this.hoverZoneId = this.zoneNearest(pointer.x, pointer.y).id;
    });

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.phase === "gameover") {
        this.resetMatch();
        return;
      }
      if (this.phase !== "aim") {
        return;
      }
      this.takeShot(this.zoneNearest(pointer.x, pointer.y));
    });

    this.scale.on("resize", () => {
      // Positions are recomputed every frame from gameSize, so a resize just
      // needs the resting actors snapped back onto the new goal line.
      if (this.phase === "aim" || this.phase === "gameover") {
        const next = this.getLayout();
        this.ballPos = { x: next.spotX, y: next.spotY };
        this.keeperRest = { x: next.w / 2, y: next.keeperLineY };
        this.keeperPos = { ...this.keeperRest };
      }
    });
  }

  update(_time: number, deltaMs: number): void {
    this.phaseTimeMs += deltaMs;

    if (this.phase === "shooting") {
      this.advanceShot();
    } else if (this.phase === "result") {
      if (this.phaseTimeMs >= this.level.rules.resultHoldMs) {
        this.finishShot();
      }
    }

    this.draw();
  }

  // --- Layout -------------------------------------------------------------

  private getLayout(): Layout {
    const { width: w, height: h } = this.scale.gameSize;

    const goalLeft = w * 0.13;
    const goalRight = w * 0.87;
    const goalTop = h * 0.14;
    const goalBottom = h * 0.42;

    return {
      w,
      h,
      goalLeft,
      goalRight,
      goalTop,
      goalBottom,
      goalWidth: goalRight - goalLeft,
      goalHeight: goalBottom - goalTop,
      spotX: w * 0.5,
      spotY: h * 0.82,
      ballRadius: Math.max(7, w * 0.026),
      // Height-aware so the six targets never overlap when the goal is short
      // (landscape / very small viewports). Portrait is unaffected.
      zoneRadius: Math.max(16, Math.min(w * 0.075, h * 0.05)),
      keeperWidth: Math.max(34, w * 0.13),
      keeperHeight: Math.max(60, h * 0.13),
      keeperLineY: goalBottom,
    };
  }

  private zoneCenter(zone: ZoneConfig, layout: Layout): { x: number; y: number } {
    return {
      x: layout.goalLeft + zone.xPct * layout.goalWidth,
      y: layout.goalTop + zone.yPct * layout.goalHeight,
    };
  }

  private zoneNearest(px: number, py: number): ZoneConfig {
    const layout = this.getLayout();
    let best = PENALTY_ZONES[0];
    let bestDist = Number.POSITIVE_INFINITY;
    for (const zone of PENALTY_ZONES) {
      const c = this.zoneCenter(zone, layout);
      const d = (c.x - px) ** 2 + (c.y - py) ** 2;
      if (d < bestDist) {
        bestDist = d;
        best = zone;
      }
    }
    return best;
  }

  // --- Shot resolution ----------------------------------------------------

  private takeShot(zone: ZoneConfig): void {
    const layout = this.getLayout();
    const rules = this.level.rules;
    this.shotZone = zone;
    this.hoverZoneId = null;

    const keeperColumn =
      Math.random() < rules.keeperReadColumn ? zone.column : this.randomColumn();
    const keeperRow =
      Math.random() < rules.keeperReadRow ? zone.row : (Math.random() < 0.5 ? 0 : 1);

    let outcome: ShotOutcome;
    if (Math.random() < rules.missChance[zone.row]) {
      outcome = "miss";
    } else if (keeperColumn === zone.column) {
      let saveProb = rules.colMatchSave * rules.rowSaveFactor[zone.row];
      if (keeperRow === zone.row) {
        saveProb *= rules.sameRowBonus;
      }
      saveProb = Math.min(saveProb, rules.maxSaveProbability);
      outcome = Math.random() < saveProb ? "save" : "goal";
    } else {
      outcome = "goal";
    }
    this.currentOutcome = outcome;

    const target = this.zoneCenter(zone, layout);
    this.ballStart = { x: layout.spotX, y: layout.spotY };
    this.ballPos = { ...this.ballStart };

    if (outcome === "miss") {
      // Over the bar or just wide of the post.
      const overBar = zone.row === 0;
      this.ballTarget = overBar
        ? { x: target.x + (Math.random() - 0.5) * layout.goalWidth * 0.2, y: layout.goalTop - layout.h * 0.04 }
        : {
            x: zone.column === 0 ? layout.goalLeft - layout.w * 0.05 : layout.goalRight + layout.w * 0.05,
            y: target.y,
          };
    } else {
      this.ballTarget = target;
    }

    // Keeper dive: commit toward its guessed column / row band.
    const columnX =
      keeperColumn === 0
        ? layout.goalLeft + layout.goalWidth * 0.16
        : keeperColumn === 2
          ? layout.goalLeft + layout.goalWidth * 0.84
          : layout.w / 2;
    const rowY = keeperRow === 0 ? layout.goalTop + layout.goalHeight * 0.4 : layout.keeperLineY;
    this.keeperRest = { x: layout.w / 2, y: layout.keeperLineY };
    this.keeperPos = { ...this.keeperRest };
    this.keeperTarget = { x: columnX, y: rowY };

    this.phase = "shooting";
    this.phaseTimeMs = 0;
    this.statusText.setText("");
  }

  private advanceShot(): void {
    const rules = this.level.rules;
    const tBall = Phaser.Math.Clamp(this.phaseTimeMs / rules.ballFlightMs, 0, 1);
    const tKeeper = easeOutCubic(Phaser.Math.Clamp(this.phaseTimeMs / rules.keeperDiveMs, 0, 1));
    const layout = this.getLayout();

    const lift = Math.sin(tBall * Math.PI) * layout.goalHeight * 0.5;
    this.ballPos = {
      x: lerp(this.ballStart.x, this.ballTarget.x, tBall),
      y: lerp(this.ballStart.y, this.ballTarget.y, tBall) - lift,
    };
    this.keeperPos = {
      x: lerp(this.keeperRest.x, this.keeperTarget.x, tKeeper),
      y: lerp(this.keeperRest.y, this.keeperTarget.y, tKeeper),
    };

    if (tBall >= 1) {
      this.lockResult();
    }
  }

  private lockResult(): void {
    this.phase = "result";
    this.phaseTimeMs = 0;
    this.results.push(this.currentOutcome);
    if (this.currentOutcome === "goal") {
      this.goals += 1;
      this.statusText.setColor(this.level.colors.goalText);
      this.statusText.setText("GOAL!");
    } else if (this.currentOutcome === "save") {
      // Park the ball in the keeper's hands for the hold.
      this.ballPos = { x: this.keeperPos.x, y: this.keeperPos.y };
      this.statusText.setColor(this.level.colors.saveText);
      this.statusText.setText("SAVED");
    } else {
      this.statusText.setColor(this.level.colors.missText);
      this.statusText.setText("MISS");
    }
  }

  private finishShot(): void {
    this.shotsTaken += 1;
    this.statusText.setText("");

    if (this.shotsTaken >= this.level.rules.totalShots) {
      this.phase = "gameover";
      this.phaseTimeMs = 0;
      this.statusText.setColor(this.level.colors.text);
      this.statusText.setText(`${this.goals} / ${this.level.rules.totalShots}\n${this.ratingFor(this.goals)}`);
      return;
    }

    const layout = this.getLayout();
    this.ballPos = { x: layout.spotX, y: layout.spotY };
    this.keeperPos = { x: layout.w / 2, y: layout.keeperLineY };
    this.shotZone = null;
    this.phase = "aim";
    this.phaseTimeMs = 0;
  }

  private resetMatch(): void {
    this.shotsTaken = 0;
    this.goals = 0;
    this.results = [];
    this.shotZone = null;
    const layout = this.getLayout();
    this.ballPos = { x: layout.spotX, y: layout.spotY };
    this.keeperPos = { x: layout.w / 2, y: layout.keeperLineY };
    this.statusText.setText("");
    this.phase = "aim";
    this.phaseTimeMs = 0;
  }

  private randomColumn(): 0 | 1 | 2 {
    const r = Math.floor(Math.random() * 3);
    return (r === 0 ? 0 : r === 1 ? 1 : 2) as 0 | 1 | 2;
  }

  private ratingFor(goals: number): string {
    const total = this.level.rules.totalShots;
    if (goals === total) return "PERFECT — Top Scorer";
    if (goals >= Math.ceil(total * 0.8)) return "Clinical finishing";
    if (goals >= Math.ceil(total * 0.6)) return "Solid from the spot";
    if (goals >= Math.ceil(total * 0.4)) return "Keep practicing";
    return "The keeper had your number";
  }

  // --- Rendering ----------------------------------------------------------

  private draw(): void {
    const layout = this.getLayout();
    const colors = this.level.colors;
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
    if (this.phase === "aim") {
      for (const zone of PENALTY_ZONES) {
        const c = this.zoneCenter(zone, layout);
        const hovered = this.hoverZoneId === zone.id;
        g.fillStyle(colors.accent, hovered ? 0.22 : 0.1);
        g.fillCircle(c.x, c.y, layout.zoneRadius);
        g.fillStyle(colors.accent, hovered ? 0.95 : 0.55);
        g.fillCircle(c.x, c.y, Math.max(5, layout.zoneRadius * (hovered ? 0.34 : 0.22)));
      }
    }

    // Keeper + ball on the actor layer.
    const a = this.actorGraphics;
    a.clear();
    this.drawKeeper(a, layout);
    this.drawBall(a, layout);

    this.layoutTexts(layout);
  }

  private drawKeeper(a: Phaser.GameObjects.Graphics, layout: Layout): void {
    const colors = this.level.colors;
    const kw = layout.keeperWidth;
    const kh = layout.keeperHeight;
    const x = this.keeperPos.x;
    const y = this.keeperPos.y;
    const diving = this.phase === "shooting" || this.phase === "result";
    const reach = diving ? Math.abs(this.keeperPos.x - this.keeperRest.x) : 0;
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

  private drawBall(a: Phaser.GameObjects.Graphics, layout: Layout): void {
    const colors = this.level.colors;
    const r = layout.ballRadius;
    const { x, y } = this.ballPos;

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

  private layoutTexts(layout: Layout): void {
    const total = this.level.rules.totalShots;

    this.titleText.setPosition(layout.w / 2, layout.h * 0.035);
    // Shot in progress = shotsTaken + 1 until the match ends; avoids the counter
    // momentarily reading "0/5" while the first shot is still in flight.
    const currentShot = this.phase === "gameover" ? total : Math.min(this.shotsTaken + 1, total);
    this.scoreText.setText(`${this.goals} GOALS · ${currentShot}/${total}`);
    this.scoreText.setPosition(layout.w / 2, layout.h * 0.06);

    this.statusText.setPosition(layout.w / 2, layout.h * 0.52);

    if (this.phase === "aim") {
      this.hintText.setText("Tap a target to shoot");
    } else if (this.phase === "gameover") {
      this.hintText.setText("Tap to shoot again");
    } else {
      this.hintText.setText("");
    }
    this.hintText.setPosition(layout.w / 2, layout.h * 0.96);
  }
}
