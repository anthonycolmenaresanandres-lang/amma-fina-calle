// Café Rush scene — the reusable catch game (Phaser 4). Thin orchestrator that
// owns Phaser timing/animation and renders the active skin's primitives:
//   - config (pure):  rounds, spawn cadence, scoring, rating
//   - skin:           palette + falling-item look (primitive-drawn, no-404)
//
// Gameplay never changes per client — only the skin's colors and item set do
// (PRODUCT_MODULES/GAME_CUSTOMIZATION_PROTOCOL.md). Mirrors PenaltyScene.

import Phaser from "phaser";
import { DEFAULT_CAFERUSH_LEVEL, ratingFor, spawnIntervalMs } from "./config";
import { DEFAULT_CAFERUSH_SKIN } from "./skins";
import type { CafeRushItem, CafeRushLevel, CafeRushSkin } from "./types";

type FallingItem = {
  container: Phaser.GameObjects.Container;
  item: CafeRushItem;
  xFrac: number;
  yFrac: number;
  speed: number; // canvas-heights per second
  spin: number; // radians per second
  rFrac: number; // radius as a fraction of the smaller canvas edge
  settled: boolean; // caught or dropped — pending removal
};

const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));

// Catcher band: the mouth sits at this height; anything crossing it near the
// catcher's x is caught. Kept above the counter so the catch reads cleanly.
const CATCHER_Y_FRAC = 0.84;
const CATCHER_HALF_WIDTH_FRAC = 0.16;

export class CafeRushScene extends Phaser.Scene {
  private readonly level: CafeRushLevel;
  private readonly skin: CafeRushSkin;

  private bg!: Phaser.GameObjects.Graphics;
  private catcher!: Phaser.GameObjects.Container;
  private catcherGfx!: Phaser.GameObjects.Graphics;
  private hud!: Phaser.GameObjects.Text;
  private banner!: Phaser.GameObjects.Text;

  private falling: FallingItem[] = [];
  private pointerXFrac = 0.5;
  private catcherXFrac = 0.5;

  private score = 0;
  private spawnedCount = 0;
  private sinceSpawnMs = 0;
  private remainingMs = 0;
  private phase: "playing" | "over" = "playing";

  constructor(level: CafeRushLevel = DEFAULT_CAFERUSH_LEVEL, skin: CafeRushSkin = DEFAULT_CAFERUSH_SKIN) {
    super(`CafeRushScene-${skin.id}-${level.id}`);
    this.level = level;
    this.skin = skin;
  }

  private size(): { w: number; h: number; min: number } {
    const { width, height } = this.scale.gameSize;
    return { w: width, h: height, min: Math.min(width, height) };
  }

  create(): void {
    this.cameras.main.setBackgroundColor(this.skin.colors.bg);

    this.bg = this.add.graphics();
    this.catcherGfx = this.add.graphics();
    this.catcher = this.add.container(0, 0, [this.catcherGfx]);
    this.catcher.setDepth(5);

    this.hud = this.add
      .text(0, 0, "", {
        fontFamily: "var(--font-mono, monospace)",
        fontSize: "16px",
        color: this.skin.colors.scoreText,
      })
      .setDepth(20);

    this.banner = this.add
      .text(0, 0, "", {
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "22px",
        color: this.skin.colors.text,
        align: "center",
        wordWrap: { width: 300 },
      })
      .setOrigin(0.5)
      .setDepth(30)
      .setVisible(false);

    // Catcher follows the pointer horizontally (drag on touch, move on mouse).
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      this.pointerXFrac = clamp(p.x / this.size().w, 0, 1);
    });
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (this.phase === "over") {
        this.restart();
        return;
      }
      this.pointerXFrac = clamp(p.x / this.size().w, 0, 1);
    });

    this.startRound();

    this.drawBackground();
  }

  private startRound(): void {
    this.falling.forEach((f) => f.container.destroy());
    this.falling = [];
    this.score = 0;
    this.spawnedCount = 0;
    this.sinceSpawnMs = 0;
    this.remainingMs = this.level.rules.durationSec * 1000;
    this.phase = "playing";
    this.banner.setVisible(false);
  }

  private restart(): void {
    this.startRound();
  }

  update(_time: number, deltaMs: number): void {
    const dt = deltaMs / 1000;
    const { w, h } = this.size();

    // Ease the catcher toward the pointer so motion is smooth, not jittery.
    this.catcherXFrac += (this.pointerXFrac - this.catcherXFrac) * Math.min(1, dt * 14);

    if (this.phase === "playing") {
      this.remainingMs -= deltaMs;
      this.sinceSpawnMs += deltaMs;

      const interval = spawnIntervalMs(this.level.rules, this.spawnedCount);
      if (this.sinceSpawnMs >= interval) {
        this.sinceSpawnMs = 0;
        this.spawnItem();
      }

      this.advanceItems(dt);

      if (this.remainingMs <= 0) {
        this.remainingMs = 0;
        this.endRound();
      }
    }

    this.layoutActors(w, h);
    this.updateHud(w);
  }

  // --- Spawning + physics --------------------------------------------------

  private pickItem(): CafeRushItem {
    const rules = this.level.rules;
    const bad = this.skin.items.filter((i) => i.kind === "bad");
    const good = this.skin.items.filter((i) => i.kind === "good");
    const pool = Math.random() < rules.badChance && bad.length > 0 ? bad : good;
    const weighted = pool.flatMap((i) => Array<CafeRushItem>(Math.max(1, Math.round((i.weight ?? 1) * 2))).fill(i));
    return weighted[Math.floor(Math.random() * weighted.length)] ?? good[0] ?? this.skin.items[0];
  }

  private spawnItem(): void {
    const rules = this.level.rules;
    const item = this.pickItem();
    const rFrac = 0.075;
    const xFrac = clamp(0.1 + Math.random() * 0.8, rFrac, 1 - rFrac);
    const speed = rules.fallSpeed[0] + Math.random() * (rules.fallSpeed[1] - rules.fallSpeed[0]);

    const container = this.add.container(0, 0);
    container.setDepth(10);
    const gfx = this.add.graphics();
    this.drawItem(gfx, item, this.size().min * rFrac);
    container.add(gfx);

    this.falling.push({
      container,
      item,
      xFrac,
      yFrac: -rFrac,
      speed,
      spin: (Math.random() - 0.5) * 1.2,
      rFrac,
      settled: false,
    });
    this.spawnedCount += 1;
  }

  private advanceItems(dt: number): void {
    const catchTop = CATCHER_Y_FRAC;
    for (const f of this.falling) {
      if (f.settled) continue;
      f.yFrac += f.speed * dt;
      f.container.rotation += f.spin * dt;

      const nearMouth = f.yFrac + f.rFrac >= catchTop && f.yFrac - f.rFrac <= catchTop + 0.06;
      const overCatcher = Math.abs(f.xFrac - this.catcherXFrac) <= CATCHER_HALF_WIDTH_FRAC;
      if (nearMouth && overCatcher) {
        this.catchItem(f);
        continue;
      }
      if (f.yFrac - f.rFrac > 1) {
        this.dropItem(f);
      }
    }
    this.falling = this.falling.filter((f) => !f.settled);
  }

  private catchItem(f: FallingItem): void {
    f.settled = true;
    f.container.destroy();
    this.score += f.item.points;
    const good = f.item.points >= 0;
    this.popFeedback(
      f.xFrac,
      CATCHER_Y_FRAC - 0.05,
      `${good ? "+" : ""}${f.item.points}`,
      good ? this.skin.colors.goodText : this.skin.colors.badText,
    );
  }

  private dropItem(f: FallingItem): void {
    f.settled = true;
    f.container.destroy();
    if (f.item.kind === "good" && this.level.rules.dropPenalty > 0) {
      this.score -= this.level.rules.dropPenalty;
      this.popFeedback(f.xFrac, 0.9, "miss", this.skin.colors.badText);
    }
  }

  private endRound(): void {
    this.phase = "over";
    const target = this.level.rules.targetScore;
    const won = this.score >= target;
    this.banner
      .setText(
        `${won ? "Order up! 🎉" : "Round over"}\n${this.score} / ${target}\n${ratingFor(this.score, target)}\n\nTap to play again`,
      )
      .setColor(won ? this.skin.colors.goodText : this.skin.colors.text)
      .setVisible(true);
  }

  // --- Layout + HUD --------------------------------------------------------

  private layoutActors(w: number, h: number): void {
    // Falling items to pixel space.
    for (const f of this.falling) {
      f.container.setPosition(f.xFrac * w, f.yFrac * h);
    }
    // Catcher.
    this.catcher.setPosition(this.catcherXFrac * w, CATCHER_Y_FRAC * h);
    this.drawCatcher(w);
    // Banner centered.
    this.banner.setPosition(w / 2, h * 0.42);
    this.banner.setWordWrapWidth(Math.min(320, w - 48));
  }

  private updateHud(w: number): void {
    const secs = Math.ceil(this.remainingMs / 1000);
    this.hud.setText(`SCORE ${this.score}   ·   TARGET ${this.level.rules.targetScore}   ·   ${secs}s`);
    this.hud.setPosition(w / 2, 14).setOrigin(0.5, 0);
  }

  private popFeedback(xFrac: number, yFrac: number, text: string, color: string): void {
    const { w, h } = this.size();
    const label = this.add
      .text(xFrac * w, yFrac * h, text, {
        fontFamily: "var(--font-mono, monospace)",
        fontSize: "20px",
        fontStyle: "bold",
        color,
      })
      .setOrigin(0.5)
      .setDepth(25);
    this.tweens.add({
      targets: label,
      y: yFrac * h - 46,
      alpha: 0,
      duration: 650,
      ease: "Cubic.easeOut",
      onComplete: () => label.destroy(),
    });
  }

  // --- Primitive rendering (the no-404 fallback that IS the default) --------

  private drawBackground(): void {
    const draw = () => {
      const { w, h } = this.size();
      const c = this.skin.colors;
      this.bg.clear();
      // Vertical wash: darker floor, lighter "steam" near the top.
      this.bg.fillStyle(c.bg, 1).fillRect(0, 0, w, h);
      this.bg.fillStyle(c.counter, 0.35).fillRect(0, h * 0.55, w, h * 0.45);
      // Counter band the catcher slides along.
      const counterY = h * CATCHER_Y_FRAC + this.size().min * 0.075;
      this.bg.fillStyle(c.counter, 1).fillRect(0, counterY, w, h - counterY);
      this.bg.fillStyle(c.counterEdge, 1).fillRect(0, counterY, w, Math.max(2, h * 0.004));
      // Soft accent guide line at the catch mouth.
      this.bg.fillStyle(c.accent, 0.1).fillRect(0, h * CATCHER_Y_FRAC, w, Math.max(1, h * 0.002));
    };
    draw();
    this.scale.on("resize", draw);
  }

  private drawCatcher(w: number): void {
    const c = this.skin.colors;
    const half = CATCHER_HALF_WIDTH_FRAC * w;
    const height = Math.max(18, half * 0.42);
    this.catcherGfx.clear();
    // Tray/cup body: rounded, brand-cream with a gold rim.
    this.catcherGfx.fillStyle(c.catcher, 1);
    this.catcherGfx.fillRoundedRect(-half, -height * 0.2, half * 2, height, { tl: 6, tr: 6, bl: 16, br: 16 });
    this.catcherGfx.fillStyle(c.catcherRim, 1);
    this.catcherGfx.fillRoundedRect(-half, -height * 0.35, half * 2, height * 0.36, 6);
    // Inner shadow for depth.
    this.catcherGfx.fillStyle(0x000000, 0.12);
    this.catcherGfx.fillRoundedRect(-half + 6, -height * 0.05, half * 2 - 12, height * 0.5, 8);
  }

  private drawItem(g: Phaser.GameObjects.Graphics, item: CafeRushItem, r: number): void {
    const { fill, accent } = item;
    g.clear();
    switch (item.shape) {
      case "cup": {
        // Hot cup: tapered body, cream lid rim, small handle.
        g.fillStyle(fill, 1).fillRoundedRect(-r * 0.7, -r * 0.75, r * 1.4, r * 1.5, { tl: 6, tr: 6, bl: 12, br: 12 });
        g.fillStyle(accent, 1).fillRoundedRect(-r * 0.78, -r * 0.9, r * 1.56, r * 0.34, 6);
        g.lineStyle(Math.max(3, r * 0.16), accent, 1).strokeCircle(r * 0.95, 0, r * 0.4);
        break;
      }
      case "iced": {
        // Iced glass: tall body, liquid fill, straw.
        g.fillStyle(accent, 0.35).fillRoundedRect(-r * 0.6, -r * 0.9, r * 1.2, r * 1.8, 8);
        g.fillStyle(fill, 1).fillRoundedRect(-r * 0.6, -r * 0.1, r * 1.2, r * 1.0, { tl: 0, tr: 0, bl: 8, br: 8 });
        g.fillStyle(accent, 1).fillRect(r * 0.18, -r * 1.15, r * 0.16, r * 1.1);
        break;
      }
      case "pastry": {
        // Croissant/pretzel: warm crescent body with a highlight.
        g.fillStyle(fill, 1).fillEllipse(0, 0, r * 1.9, r * 1.15);
        g.fillStyle(accent, 0.9).fillEllipse(-r * 0.2, -r * 0.15, r * 1.1, r * 0.5);
        g.lineStyle(Math.max(2, r * 0.1), accent, 0.8).beginPath();
        g.arc(0, 0, r * 0.7, Math.PI * 0.15, Math.PI * 0.85);
        g.strokePath();
        break;
      }
      case "disc": {
        // Lime/burger: round with an inner ring.
        g.fillStyle(fill, 1).fillCircle(0, 0, r);
        g.lineStyle(Math.max(3, r * 0.18), accent, 1).strokeCircle(0, 0, r * 0.62);
        g.fillStyle(accent, 1).fillCircle(0, 0, r * 0.16);
        break;
      }
      case "wedge": {
        // Taco/wings/pretzel wedge: triangle with a filling stripe.
        g.fillStyle(fill, 1).fillTriangle(-r, r * 0.75, r, r * 0.75, 0, -r);
        g.fillStyle(accent, 1).fillTriangle(-r * 0.55, r * 0.35, r * 0.55, r * 0.35, 0, -r * 0.35);
        break;
      }
      case "spill":
      default: {
        // Spill: dark puddle with drips + a tipped cup — the "avoid" item.
        g.fillStyle(fill, 1).fillEllipse(0, r * 0.35, r * 2.1, r * 0.9);
        g.fillStyle(fill, 1).fillCircle(-r * 0.8, r * 0.1, r * 0.28);
        g.fillStyle(fill, 1).fillCircle(r * 0.9, r * 0.25, r * 0.22);
        g.fillStyle(accent, 1).fillRoundedRect(-r * 0.5, -r * 0.9, r, r * 0.9, 5);
        g.fillStyle(accent, 0.85).fillEllipse(0, -r * 0.9, r * 1.15, r * 0.35);
        break;
      }
    }
  }
}
