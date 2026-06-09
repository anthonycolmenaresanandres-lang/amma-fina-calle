// The "world" layer only (per spec v2): an illustrated territory board with
// clickable business tiles, selection highlight, and a capture animation.
// HUD + side panel live in React. State is owned by React; this scene just
// renders the leads it's given and reports clicks back via onSelect.

import Phaser from "phaser";
import type { LeadState, Stage } from "../types";
import { FIT_COLOR, STAGE_COLOR } from "../types";

export interface WorldHooks {
  onSelect: (id: string) => void;
}

const WATER = 0x16344a;
const LAND = 0x244a2c;
const LAND_HI = 0x2c5a34;

export class WorldScene extends Phaser.Scene {
  private hooks: WorldHooks;
  private leads: LeadState[] = [];
  private selectedId: string | null = null;
  private board?: Phaser.GameObjects.Graphics;
  private tileLayer?: Phaser.GameObjects.Container;
  private tiles = new Map<string, Phaser.GameObjects.Container>();
  private ready = false;

  constructor(hooks: WorldHooks) {
    super("LeadArcadeWorld");
    this.hooks = hooks;
  }

  create(): void {
    this.board = this.add.graphics();
    this.tileLayer = this.add.container(0, 0);
    this.ready = true;
    this.layout();
    this.scale.on("resize", () => this.layout());
  }

  /** Replace the rendered world with a new set of leads. */
  applyLeads(leads: LeadState[], selectedId: string | null): void {
    this.leads = leads;
    this.selectedId = selectedId;
    if (this.ready) this.renderTiles();
  }

  setSelected(id: string | null): void {
    this.selectedId = id;
    if (this.ready) this.renderTiles();
  }

  private size(): { w: number; h: number } {
    return { w: this.scale.width, h: this.scale.height };
  }

  private layout(): void {
    if (!this.board) return;
    const { w, h } = this.size();
    const g = this.board;
    g.clear();
    g.fillStyle(WATER, 1).fillRect(0, 0, w, h);
    // land mass (rounded) with a lighter inner
    const m = Math.min(w, h) * 0.06;
    g.fillStyle(LAND, 1).fillRoundedRect(m, m, w - 2 * m, h - 2 * m, 28);
    g.fillStyle(LAND_HI, 1).fillRoundedRect(m * 1.6, m * 1.6, w - 3.2 * m, h - 3.2 * m, 22);
    // subtle grid
    g.lineStyle(1, 0xffffff, 0.05);
    for (let x = m; x < w - m; x += 48) g.lineBetween(x, m, x, h - m);
    for (let y = m; y < h - m; y += 48) g.lineBetween(m, y, w - m, y);
    this.renderTiles();
  }

  private tierSize(stage: Stage, upgrades: number): number {
    const base = { prospect: 16, surveyed: 18, pitched: 20, client: 24, flagship: 28 }[stage];
    return base + Math.min(upgrades, 3) * 2;
  }

  private renderTiles(): void {
    if (!this.tileLayer) return;
    this.tileLayer.removeAll(true);
    this.tiles.clear();
    const { w, h } = this.size();
    const m = Math.min(w, h) * 0.06;
    const ix = (p: number) => m + p * (w - 2 * m);
    const iy = (p: number) => m + p * (h - 2 * m);

    for (const lead of this.leads) {
      const cx = ix(lead.meta.position.x);
      const cy = iy(lead.meta.position.y);
      const c = this.add.container(cx, cy);
      const r = this.tierSize(lead.stage, lead.upgrades);
      const isClient = lead.stage === "client" || lead.stage === "flagship";
      const selected = lead.meta.id === this.selectedId;

      const shadow = this.add.ellipse(0, r * 0.7, r * 1.8, r * 0.7, 0x000000, 0.25);
      const body = this.add.graphics();
      if (isClient) {
        // a "shop": building block + roof
        body.fillStyle(STAGE_COLOR[lead.stage], 1).fillRoundedRect(-r, -r * 0.6, r * 2, r * 1.4, 5);
        body.fillStyle(0x000000, 0.18).fillRoundedRect(-r, -r * 0.6, r * 2, r * 0.35, 5);
      } else {
        // a "marker": pin circle
        body.fillStyle(STAGE_COLOR[lead.stage], 1).fillCircle(0, 0, r);
      }
      // fit ring for non-clients
      const ring = this.add.graphics();
      if (!isClient) ring.lineStyle(3, FIT_COLOR[lead.meta.dossier.fit], 1).strokeCircle(0, 0, r + 3);
      // selection halo
      const halo = this.add.graphics();
      if (selected) halo.lineStyle(3, 0xffffff, 0.9).strokeCircle(0, 0, r + 9);

      const initial = this.add.text(0, 0, lead.meta.name.charAt(0).toUpperCase(), {
        fontFamily: "system-ui, sans-serif", fontSize: `${Math.round(r)}px`, color: "#fff",
      }).setOrigin(0.5);
      const label = this.add.text(0, r + 12, lead.meta.name, {
        fontFamily: "system-ui, sans-serif", fontSize: "12px", color: "#f4e6cc",
      }).setOrigin(0.5, 0);

      c.add([shadow, halo, body, ring, initial, label]);
      if (isClient && lead.mrr > 0) {
        const coin = this.add.text(r - 2, -r, `$${lead.mrr}`, {
          fontFamily: "system-ui, sans-serif", fontSize: "11px", color: "#1b120a",
          backgroundColor: "#d8a24c", padding: { x: 4, y: 1 },
        }).setOrigin(0.5);
        c.add(coin);
      }

      const hit = Math.max(r + 12, 22);
      c.setSize(hit * 2, hit * 2);
      c.setInteractive(new Phaser.Geom.Rectangle(-hit, -hit, hit * 2, hit * 2), Phaser.Geom.Rectangle.Contains);
      c.on("pointerover", () => this.input.setDefaultCursor("pointer"));
      c.on("pointerout", () => this.input.setDefaultCursor("default"));
      c.on("pointerdown", () => this.hooks.onSelect(lead.meta.id));

      this.tileLayer.add(c);
      this.tiles.set(lead.meta.id, c);
    }
  }

  /** Capture flourish when a lead converts to a client. */
  playCapture(id: string): void {
    const c = this.tiles.get(id);
    if (!c) return;
    this.tweens.add({ targets: c, scale: { from: 1, to: 1.35 }, yoyo: true, duration: 220, ease: "Back.out" });
    const goal = this.add.text(c.x, c.y - 30, "GOAL!", {
      fontFamily: "system-ui, sans-serif", fontSize: "26px", color: "#d8a24c", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(50);
    this.tweens.add({ targets: goal, y: goal.y - 50, alpha: 0, duration: 900, ease: "Cubic.out", onComplete: () => goal.destroy() });
    for (let i = 0; i < 8; i++) {
      const coin = this.add.circle(c.x, c.y, 5, 0xd8a24c).setDepth(49);
      this.tweens.add({
        targets: coin, x: c.x + (Math.random() - 0.5) * 120, y: c.y - 30 - Math.random() * 70,
        alpha: 0, duration: 700 + Math.random() * 300, ease: "Cubic.out", onComplete: () => coin.destroy(),
      });
    }
  }
}
