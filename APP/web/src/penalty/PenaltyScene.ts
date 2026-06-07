// Penalty Shootout scene — thin orchestrator. Owns Phaser timing/animation and
// wires the layers together:
//   - engine (pure):   resolveShot + match state/transitions
//   - input:           TapInput (default) or SwipeInput, by inputMode
//   - skin/renderer:   PenaltyRenderer (primitive + optional skin assets)
//
// Input only selects an aim zone; scoring, keeper logic, levels, and the route
// are unchanged regardless of input mode or skin.

import Phaser from "phaser";
import { DEFAULT_PENALTY_LEVEL, PENALTY_ZONES } from "./config";
import type {
  InputMode,
  PenaltyCampaign,
  PenaltyColors,
  PenaltyLevel,
  PenaltySkin,
  ShotOutcome,
  ZoneConfig,
} from "./types";
import {
  computeLayout,
  zoneByColRow,
  zoneCenter,
  zoneNearest,
  type AimPreview,
  type Layout,
  type Vec2,
} from "./geometry";
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
import { SwipeInput } from "./input/SwipeInput";
import { PenaltyRenderer, type RenderState } from "./skin/PenaltyRenderer";
import { DEFAULT_PENALTY_SKIN, resolveColors } from "./skin/skins";
import { getCampaign } from "./skin/campaigns";

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export class PenaltyScene extends Phaser.Scene {
  private readonly level: PenaltyLevel;
  private readonly skin: PenaltySkin;
  // The Campaign Pack riding on the fixed shell (behind-goal ad zone + kits).
  // Step 1: wired through but inert — it does not change rendering yet.
  private readonly campaign: PenaltyCampaign;
  // Effective canvas palette for this match = active skin's colors with the
  // level's optional tweaks applied. Gameplay/rules are unaffected by the skin.
  private readonly colors: PenaltyColors;
  private readonly inputMode: InputMode;
  private penaltyRenderer!: PenaltyRenderer;

  private match: MatchState = createMatch();
  private phaseTimeMs = 0;

  private hoverZoneId: string | null = null;
  private aimPreview: AimPreview | null = null;

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
    inputMode: InputMode = "tap",
    // Campaign defaults to the one registered for this skin id (neutral fallback
    // otherwise), so existing call sites are unchanged and behavior is identical.
    campaign: PenaltyCampaign = getCampaign(skin.id),
  ) {
    super(`PenaltyScene-${skin.id}-${level.id}`);
    this.level = level;
    this.skin = skin;
    this.inputMode = inputMode;
    this.campaign = campaign;
    this.colors = resolveColors(skin, level);
    this.statusColor = this.colors.text;
  }

  private layout(): Layout {
    const { width, height } = this.scale.gameSize;
    return computeLayout(width, height);
  }

  // Per-skin texture key (skin id keeps keys unique across skins).
  private assetKey(kind: "background" | "logo" | "ball" | "kicker"): string {
    return `penalty-${kind}-${this.skin.id}`;
  }

  // Queue any declared skin image assets. A missing/failed file is harmless:
  // the texture simply won't exist and create() falls back to primitives.
  preload(): void {
    const assets = this.skin.assets;
    if (!assets) {
      return;
    }
    if (assets.background) this.load.image(this.assetKey("background"), assets.background);
    if (assets.logo) this.load.image(this.assetKey("logo"), assets.logo);
    if (assets.ball) this.load.image(this.assetKey("ball"), assets.ball);
    if (assets.kicker) this.load.image(this.assetKey("kicker"), assets.kicker);
    // Swallow load errors — the primitive fallback covers any missing asset.
    this.load.on("loaderror", () => {});
  }

  private loadedKey(kind: "background" | "logo" | "ball" | "kicker"): string | undefined {
    const key = this.assetKey(kind);
    return this.textures.exists(key) ? key : undefined;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(this.colors.bg);

    this.penaltyRenderer = new PenaltyRenderer(
      this,
      this.colors,
      this.skin.skinName,
      {
        backgroundKey: this.loadedKey("background"),
        logoKey: this.loadedKey("logo"),
        ballKey: this.loadedKey("ball"),
        kickerKey: this.loadedKey("kicker"),
      },
      this.skin.backgroundFit ?? {},
      this.skin.kickerFit ?? {},
      this.skin.chrome ?? {},
      this.campaign,
    );

    const layout = this.layout();
    this.ballPos = { x: layout.spotX, y: layout.spotY };
    this.keeperRest = { x: layout.w / 2, y: layout.keeperLineY };
    this.keeperPos = { ...this.keeperRest };

    if (this.inputMode === "tap") {
      new TapInput(this, {
        pickZone: (x, y) => zoneNearest(PENALTY_ZONES, this.layout(), x, y),
        getPhase: () => this.match.phase,
        onHover: (zone) => {
          this.hoverZoneId = zone.id;
        },
        onShoot: (zone) => this.takeShot(zone),
        onReset: () => this.resetMatch(),
      });
    } else {
      new SwipeInput(this, {
        getPhase: () => this.match.phase,
        getLayout: () => this.layout(),
        pickZone: (x, y) => zoneNearest(PENALTY_ZONES, this.layout(), x, y),
        zoneFor: (column, row) => zoneByColRow(PENALTY_ZONES, column, row),
        onPreview: (preview) => {
          this.aimPreview = preview;
          this.hoverZoneId = preview?.zoneId ?? null;
        },
        onShoot: (zone) => this.takeShot(zone),
        onReset: () => this.resetMatch(),
      });
    }

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
      inputMode: this.inputMode,
      aimPreview: this.aimPreview,
      ballSpin: this.match.phase === "shooting" ? this.phaseTimeMs * 0.018 : 0,
      kickLean: this.computeKickLean(),
    };
  }

  // Kicker lean pulse on the shot: wind up, then settle back upright. Only used
  // by skins that supply a kicker sprite; no effect otherwise.
  private computeKickLean(): number {
    if (this.match.phase !== "shooting") {
      return 0;
    }
    const t = this.phaseTimeMs;
    if (t < 120) return t / 120;
    if (t < 260) return 1 - (t - 120) / 140;
    return 0;
  }

  // --- Shot lifecycle -----------------------------------------------------

  private takeShot(zone: ZoneConfig): void {
    const layout = this.layout();
    const rules = this.level.rules;
    this.hoverZoneId = null;
    this.aimPreview = null;

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
