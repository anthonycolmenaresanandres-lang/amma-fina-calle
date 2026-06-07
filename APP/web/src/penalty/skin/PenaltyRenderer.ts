// Renderer for Penalty Shootout. Draws a frame from a pure RenderState snapshot
// using the active skin's PenaltyColors. Optional skin image assets (background,
// logo, ball) are drawn when present and fall back to the asset-free primitive
// look when absent or if a file fails to load — so a missing asset never breaks
// the scene (no 404 break). With no assets, output is pixel-identical to V1.

import Phaser from "phaser";
import { PENALTY_ZONES } from "../config";
import type {
  BackgroundFit,
  InputMode,
  PenaltyCampaign,
  PenaltyChrome,
  PenaltyColors,
  SpriteFit,
} from "../types";
import { zoneCenter, type AimPreview, type Layout, type Vec2 } from "../geometry";
import { currentShotNumber, type MatchState } from "../engine/match";
import { DEFAULT_CAMPAIGN } from "./campaigns";
import { AD_ZONE_PANEL } from "./backgroundTemplate";

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
  inputMode: InputMode;
  aimPreview: AimPreview | null;
  /** Ball image rotation (radians); spins during flight. 0 when not shooting. */
  ballSpin: number;
  /** Kicker lean 0..1; pulses on the shot. 0 = upright. */
  kickLean: number;
};

// Texture keys for any skin assets that actually loaded (undefined = fall back).
export type RendererAssets = {
  backgroundKey?: string;
  logoKey?: string;
  ballKey?: string;
  kickerKey?: string;
  /** Campaign behind-goal ad-zone image (Campaign Pack). Undefined = no ad. */
  adZoneKey?: string;
};

const TEXT_FONT = "Georgia, serif";

// Explicit depths so the layer order is deterministic regardless of object
// creation order, and identical to V1 in the no-asset case (field < actors < text).
// The field backdrop (sky/grass or photo scrim) sits on its own layer below the
// goal frame so the optional behind-goal ad zone can slot BETWEEN them — above
// the backdrop, below the goal frame/net/targets/keeper/ball. With no ad image
// the in-between layers are empty, so output is unchanged.
const DEPTH = {
  background: -10,
  backdrop: -6,
  adZone: -5,
  adZoneOverlay: -4,
  field: 0,
  actors: 10,
  ball: 11,
  kicker: 16,
  text: 20,
  logo: 30,
} as const;

export class PenaltyRenderer {
  private readonly colors: PenaltyColors;
  // Field backdrop (sky/grass or photo scrim) on its own layer beneath the goal
  // frame, so the ad zone can slot between them.
  private readonly backdropGraphics: Phaser.GameObjects.Graphics;
  private readonly fieldGraphics: Phaser.GameObjects.Graphics;
  private readonly actorGraphics: Phaser.GameObjects.Graphics;
  // Behind-goal ad zone (Campaign Pack). Created only when an ad image loaded;
  // null otherwise so the scene falls back cleanly to the current backdrop.
  private readonly adZoneImage: Phaser.GameObjects.Image | null = null;
  private readonly adZoneOverlay: Phaser.GameObjects.Graphics | null = null;
  private readonly adZoneMask: Phaser.GameObjects.Graphics | null = null;
  private readonly titleText: Phaser.GameObjects.Text;
  private readonly scoreText: Phaser.GameObjects.Text;
  private readonly statusText: Phaser.GameObjects.Text;
  private readonly hintText: Phaser.GameObjects.Text;
  private readonly titleLabel: string;

  private readonly bgImage: Phaser.GameObjects.Image | null = null;
  private readonly logoImage: Phaser.GameObjects.Image | null = null;
  private readonly ballImage: Phaser.GameObjects.Image | null = null;
  private readonly kickerImage: Phaser.GameObjects.Image | null = null;
  private readonly bgFit: BackgroundFit;
  private readonly kickerFit: SpriteFit;
  private readonly chrome: PenaltyChrome;
  // Campaign Pack (behind-goal ad zone + kits). Step 1: stored but not yet used
  // for drawing — the ad-zone renderer and tintable kit arrive in later steps.
  private readonly campaign: PenaltyCampaign;

  constructor(
    scene: Phaser.Scene,
    colors: PenaltyColors,
    skinName: string,
    assets: RendererAssets = {},
    backgroundFit: BackgroundFit = {},
    kickerFit: SpriteFit = {},
    chrome: PenaltyChrome = {},
    campaign: PenaltyCampaign = DEFAULT_CAMPAIGN,
  ) {
    this.colors = colors;
    this.bgFit = backgroundFit;
    this.kickerFit = kickerFit;
    this.chrome = chrome;
    this.campaign = campaign;
    this.titleLabel = skinName.toUpperCase();

    // Optional photographic backdrop (behind everything).
    if (assets.backgroundKey) {
      this.bgImage = scene.add
        .image(0, 0, assets.backgroundKey)
        .setOrigin(0.5, 0.5)
        .setDepth(DEPTH.background);
    }

    this.backdropGraphics = scene.add.graphics().setDepth(DEPTH.backdrop);

    // Optional behind-goal ad zone (Campaign Pack). Drawn above the backdrop and
    // below the goal frame; clipped to a reserved panel via a geometry mask.
    if (assets.adZoneKey) {
      this.adZoneImage = scene.add
        .image(0, 0, assets.adZoneKey)
        .setOrigin(0.5, 0.5)
        .setDepth(DEPTH.adZone);
      this.adZoneMask = scene.make.graphics();
      this.adZoneImage.setMask(this.adZoneMask.createGeometryMask());
      this.adZoneOverlay = scene.add.graphics().setDepth(DEPTH.adZoneOverlay);
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

    // Optional foreground kicker (bottom-anchored so it can crop off the bottom).
    if (assets.kickerKey) {
      this.kickerImage = scene.add
        .image(0, 0, assets.kickerKey)
        .setOrigin(0.5, 1)
        .setDepth(DEPTH.kicker);
    }

    this.titleText = scene.add
      .text(0, 0, this.titleLabel, {
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

    this.drawBackdrop(state);
    this.drawAdZone(state);
    this.drawField(state);
    this.drawAdBanner(state);

    const a = this.actorGraphics;
    a.clear();
    this.drawKeeper(a, state);
    this.drawBall(a, state);
    this.drawAimPreview(a, state);

    this.layoutTexts(state);
  }

  // Swipe aim feedback: a line from the spot to the targeted zone + a power
  // meter. No-op in tap mode (aimPreview is null), so tap rendering is unchanged.
  private drawAimPreview(a: Phaser.GameObjects.Graphics, state: RenderState): void {
    const p = state.aimPreview;
    if (!p || state.match.phase !== "aim") {
      return;
    }
    const { layout } = state;
    const colors = this.colors;

    a.lineStyle(Math.max(3, layout.w * 0.01), colors.accent, 0.85);
    a.lineBetween(p.from.x, p.from.y, p.to.x, p.to.y);
    a.fillStyle(colors.accent, 0.9);
    a.fillCircle(p.to.x, p.to.y, Math.max(6, layout.zoneRadius * 0.34));

    // Power meter near the bottom.
    const barW = layout.w * 0.44;
    const barH = Math.max(6, layout.h * 0.012);
    const bx = layout.w * 0.5 - barW / 2;
    const by = layout.h * 0.9;
    a.fillStyle(colors.net, 0.3);
    a.fillRect(bx, by, barW, barH);
    a.fillStyle(colors.accent, 0.95);
    a.fillRect(bx, by, barW * p.power, barH);
  }

  // Position/scale the optional image assets to the current layout.
  private positionAssets(state: RenderState): void {
    const { layout } = state;

    if (this.bgImage) {
      // Cover-fit the backdrop to the canvas, then apply optional per-skin
      // zoom + offset so a photo can be nudged onto the fixed goal layout.
      const iw = this.bgImage.width || 1;
      const ih = this.bgImage.height || 1;
      const scale = Math.max(layout.w / iw, layout.h / ih) * (this.bgFit.scale ?? 1);
      const ox = (this.bgFit.offsetXPct ?? 0) * layout.w;
      const oy = (this.bgFit.offsetYPct ?? 0) * layout.h;
      this.bgImage.setPosition(layout.w / 2 + ox, layout.h / 2 + oy).setScale(scale);
    }

    if (this.logoImage) {
      const targetH = Math.max(18, layout.h * 0.05);
      const scale = targetH / (this.logoImage.height || 1);
      this.logoImage.setScale(scale).setPosition(layout.w - layout.w * 0.04, layout.h * 0.03);
    }

    if (this.kickerImage) {
      // Bottom-foreground; sized to the layout and tuned per skin. A small lean
      // pulses on the shot (kickLean 0..1). Default places feet just off-screen
      // so the kicker frames the shot without covering the goal/keeper.
      const targetH = layout.keeperHeight * 1.5 * (this.kickerFit.scale ?? 1);
      const scale = targetH / (this.kickerImage.height || 1);
      const x = layout.w * (0.5 + (this.kickerFit.offsetXPct ?? 0));
      const y = layout.h * (1.02 + (this.kickerFit.offsetYPct ?? 0));
      this.kickerImage.setScale(scale).setPosition(x, y).setRotation(state.kickLean * -0.12);
    }
  }

  // Field backdrop (sky/grass or photo scrim). Its own layer (below the ad zone
  // and goal frame) so the behind-goal ad zone can slot in front of it. Output
  // is identical to the pre-split single-pass field when no ad image is present.
  private drawBackdrop(state: RenderState): void {
    const { layout } = state;
    const colors = this.colors;
    const g = this.backdropGraphics;
    g.clear();

    if (this.bgImage) {
      // Photographic backdrop is its own object (behind); lay a scrim so the
      // goal, ball, and text stay legible. Scrim alpha is per-skin tunable.
      g.fillStyle(0x000000, this.bgFit.scrim ?? 0.45);
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
  }

  // Reserved behind-goal ad panel (Campaign Pack). Cover-fits the campaign image
  // into a panel in the upper-field backdrop, clipped by a geometry mask, with a
  // light readability scrim and a feather into the grass so it reads as part of
  // the scene. No-op (and clean fallback to the backdrop) when no ad image
  // loaded. Panel insets are intentionally simple — exact placement is a tuning
  // step done against real campaign art, like the stadium backdrop fit.
  private drawAdZone(state: RenderState): void {
    const image = this.adZoneImage;
    const mask = this.adZoneMask;
    const overlay = this.adZoneOverlay;
    if (!image || !mask || !overlay) {
      return;
    }
    const { layout } = state;

    // Reserved panel from the canonical background template (single source): the
    // upper-field backdrop behind the goal mouth, down to the goal line, a touch
    // wider than the goal. See ASSET_SPECS/PENALTY_BACKGROUND_TEMPLATE.md.
    const px = layout.w * AD_ZONE_PANEL.leftPct;
    const pw = layout.w * AD_ZONE_PANEL.widthPct;
    const pyTop = layout.h * AD_ZONE_PANEL.topPct;
    const pyBottom = layout.goalBottom;
    const ph = pyBottom - pyTop;

    // Cover-fit the image to the panel, then the optional per-campaign nudge.
    const fit = this.campaign.adZone?.fit ?? {};
    const iw = image.width || 1;
    const ih = image.height || 1;
    const scale = Math.max(pw / iw, ph / ih) * (fit.scale ?? 1);
    const cx = px + pw / 2 + (fit.offsetXPct ?? 0) * pw;
    const cy = pyTop + ph / 2 + (fit.offsetYPct ?? 0) * ph;
    image.setPosition(cx, cy).setScale(scale);

    // Clip the (cover-fit, possibly overflowing) image to the panel rectangle.
    mask.clear();
    mask.fillStyle(0xffffff, 1);
    mask.fillRect(px, pyTop, pw, ph);

    // Readability scrim + feather into the grass so the panel doesn't float.
    overlay.clear();
    overlay.fillStyle(0x000000, AD_ZONE_PANEL.scrimAlpha);
    overlay.fillRect(px, pyTop, pw, ph);

    const featherH = ph * AD_ZONE_PANEL.featherPct;
    const bands = AD_ZONE_PANEL.featherBands;
    const bandH = featherH / bands;
    for (let i = 0; i < bands; i += 1) {
      const y = pyBottom - featherH + i * bandH;
      const alpha = ((i + 1) / bands) * AD_ZONE_PANEL.featherMaxAlpha; // transparent top → grass base
      overlay.fillStyle(this.colors.grass, alpha);
      overlay.fillRect(px, y, pw, bandH + 1);
    }
  }

  private drawField(state: RenderState): void {
    const { layout } = state;
    const colors = this.colors;
    const g = this.fieldGraphics;
    g.clear();

    if (!this.chrome.hideGoalArt) {
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
    }

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

  private drawAdBanner(state: RenderState): void {
    if (!this.chrome.adBanner) {
      return;
    }

    const { layout } = state;
    this.fieldGraphics.fillStyle(0x000000, 1);
    this.fieldGraphics.fillRect(0, layout.h * 0.84, layout.w, layout.h * 0.08);
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
      this.ballImage.setPosition(x, y).setDisplaySize(d, d).setRotation(state.ballSpin);
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

    this.titleText.setText(this.chrome.hideTitle ? "" : this.titleLabel);
    this.titleText.setPosition(layout.w / 2, layout.h * 0.035);

    const currentShot = currentShotNumber(match, totalShots);
    this.scoreText.setText(`${match.goals} GOALS · ${currentShot}/${totalShots}`);
    this.scoreText.setPosition(layout.w / 2, layout.h * 0.06);

    this.statusText.setColor(state.statusColor);
    this.statusText.setText(state.statusText);
    this.statusText.setPosition(layout.w / 2, layout.h * 0.52);

    if (match.phase === "aim") {
      this.hintText.setText(
        state.inputMode === "tap" ? "Tap a target to shoot" : "Swipe up to shoot",
      );
    } else if (match.phase === "gameover") {
      this.hintText.setText("Tap to shoot again");
    } else {
      this.hintText.setText("");
    }
    this.hintText.setPosition(layout.w / 2, layout.h * 0.96);
  }
}
