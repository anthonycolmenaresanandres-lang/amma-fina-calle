// Penalty Shootout scene — thin orchestrator. Owns Phaser timing/animation and
// wires the three V1 layers together:
//   - engine (pure):   resolveShot + match state/transitions
//   - input:           TapInput (tap to aim/shoot/reset)
//   - skin/renderer:   PenaltyRenderer (primitive, asset-free)
//
// Behavior, visuals, scoring, levels, and the route are unchanged from V1; this
// is a structural refactor only (V2 Step 1).

import Phaser from "phaser";
import { DEFAULT_PENALTY_LEVEL, PENALTY_ZONES } from "./config";
import type { PenaltyColors, PenaltyLevel, PenaltySkin, ShotOutcome, ZoneConfig } from "./types";
import { computeLayout, zoneCenter, zoneNearest, type Layout, type Vec2 } from "./geometry";
import { resolveShot, type ShotResolution } from "./engine/resolveShot";
import {
  beginShot,
  createMatch,
  finishShot,
  ratingFor,
  recordResult,
  type MatchState,
} from "./engine/match";
import { TapInput } from "./input/TapInput";
import { PenaltyRenderer, type RenderState } from "./skin/PenaltyRenderer";
import { DEFAULT_PENALTY_SKIN, resolveColors } from "./skin/skins";

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export class PenaltyScene extends Phaser.Scene {
  private readonly level: PenaltyLevel;
  // Effective canvas palette for this match = active skin's colors with the
  // level's optional tweaks applied. Gameplay/rules are unaffected by the skin.
  private readonly colors: PenaltyColors;
  private readonly skinName: string;
  private penaltyRenderer!: PenaltyRenderer;

  private match: MatchState = createMatch();
  private phaseTimeMs = 0;

  private hoverZoneId: string | null = null;

  // Per-shot animation state, set when the player commits a shot.
  private currentResolution: ShotResolution | null = null;
  private ballStart: Vec2 = { x: 0, y: 0 };
  private ballTarget: Vec2 = { x: 0, y: 0 };
  private ballPos: Vec2 = { x: 0, y: 0 };
  private keeperRest: Vec2 = { x: 0, y: 0 };
  private keeperTarget: Vec2 = { x: 0, y: 0 };
  private keeperPos: Vec2 = { x: 0, y: 0 };

  private statusMessage = "";
  private statusColor: string;

  constructor(
    level: PenaltyLevel = DEFAULT_PENALTY_LEVEL,
    skin: PenaltySkin = DEFAULT_PENALTY_SKIN,
  ) {
    super(`PenaltyScene-${skin.id}-${level.id}`);
    this.level = level;
    this.colors = resolveColors(skin, level);
    this.skinName = skin.skinName;
    this.statusColor = this.colors.text;
  }

  private layout(): Layout {
    const { width, height } = this.scale.gameSize;
    return computeLayout(width, height);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(this.colors.bg);

    this.penaltyRenderer = new PenaltyRenderer(this, this.colors, this.skinName);

    const layout = this.layout();
    this.ballPos = { x: layout.spotX, y: layout.spotY };
    this.keeperRest = { x: layout.w / 2, y: layout.keeperLineY };
    this.keeperPos = { ...this.keeperRest };

    new TapInput(this, {
      pickZone: (x, y) => zoneNearest(PENALTY_ZONES, this.layout(), x, y),
      getPhase: () => this.match.phase,
      onHover: (zone) => {
        this.hoverZoneId = zone.id;
      },
      onShoot: (zone) => this.takeShot(zone),
      onReset: () => this.resetMatch(),
    });

    this.scale.on("resize", () => {
      // Positions are recomputed every frame from gameSize, so a resize just
      // needs the resting actors snapped back onto the new goal line.
      if (this.match.phase === "aim" || this.match.phase === "gameover") {
        const next = this.layout();
        this.ballPos = { x: next.spotX, y: next.spotY };
        this.keeperRest = { x: next.w / 2, y: next.keeperLineY };
        this.keeperPos = { ...this.keeperRest };
      }
    });
  }

  update(_time: number, deltaMs: number): void {
    this.phaseTimeMs += deltaMs;

    if (this.match.phase === "shooting") {
      this.advanceShot();
    } else if (this.match.phase === "result") {
      if (this.phaseTimeMs >= this.level.rules.resultHoldMs) {
        this.finishShotStep();
      }
    }

    this.penaltyRenderer.render(this.snapshot());
  }

  private snapshot(): RenderState {
    return {
      layout: this.layout(),
      match: this.match,
      totalShots: this.level.rules.totalShots,
      hoverZoneId: this.hoverZoneId,
      ballPos: this.ballPos,
      keeperPos: this.keeperPos,
      keeperRest: this.keeperRest,
      statusText: this.statusMessage,
      statusColor: this.statusColor,
    };
  }

  // --- Shot lifecycle -----------------------------------------------------

  private takeShot(zone: ZoneConfig): void {
    const layout = this.layout();
    const rules = this.level.rules;
    this.hoverZoneId = null;

    const resolution = resolveShot(zone, rules);
    this.currentResolution = resolution;
    const { keeperColumn, keeperRow, outcome } = resolution;

    const target = zoneCenter(zone, layout);
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

    this.match = beginShot(this.match);
    this.phaseTimeMs = 0;
    this.statusMessage = "";
  }

  private advanceShot(): void {
    const rules = this.level.rules;
    const tBall = Phaser.Math.Clamp(this.phaseTimeMs / rules.ballFlightMs, 0, 1);
    const tKeeper = easeOutCubic(Phaser.Math.Clamp(this.phaseTimeMs / rules.keeperDiveMs, 0, 1));
    const layout = this.layout();

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
    const outcome: ShotOutcome = this.currentResolution?.outcome ?? "goal";
    this.match = recordResult(this.match, outcome);
    this.phaseTimeMs = 0;

    if (outcome === "goal") {
      this.statusColor = this.colors.goalText;
      this.statusMessage = "GOAL!";
    } else if (outcome === "save") {
      // Park the ball in the keeper's hands for the hold.
      this.ballPos = { x: this.keeperPos.x, y: this.keeperPos.y };
      this.statusColor = this.colors.saveText;
      this.statusMessage = "SAVED";
    } else {
      this.statusColor = this.colors.missText;
      this.statusMessage = "MISS";
    }
  }

  private finishShotStep(): void {
    this.match = finishShot(this.match, this.level.rules.totalShots);
    this.statusMessage = "";

    if (this.match.phase === "gameover") {
      this.phaseTimeMs = 0;
      this.statusColor = this.colors.text;
      this.statusMessage = `${this.match.goals} / ${this.level.rules.totalShots}\n${ratingFor(
        this.match.goals,
        this.level.rules.totalShots,
      )}`;
      return;
    }

    const layout = this.layout();
    this.ballPos = { x: layout.spotX, y: layout.spotY };
    this.keeperPos = { x: layout.w / 2, y: layout.keeperLineY };
    this.phaseTimeMs = 0;
  }

  private resetMatch(): void {
    this.match = createMatch();
    const layout = this.layout();
    this.ballPos = { x: layout.spotX, y: layout.spotY };
    this.keeperPos = { x: layout.w / 2, y: layout.keeperLineY };
    this.statusMessage = "";
    this.phaseTimeMs = 0;
  }
}
