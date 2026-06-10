// The "world" layer only: an illustrated territory board with clickable,
// draggable business tiles, camera pan/zoom/pinch, hover tooltips, selection
// highlight, and capture/upgrade animations. HUD + side panel live in React.
// State is owned by React; this scene renders the leads it's given, reports
// clicks via onSelect, and drag-repositioning via onMove.

import Phaser from "phaser";
import type { LeadState, Stage } from "../types";
import { FIT_COLOR, STAGE_COLOR } from "../types";

export interface WorldHooks {
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
}

const WATER = 0x16344a;
const WATER_HI = 0x1c415c;
const LAND = 0x244a2c;
const LAND_HI = 0x2c5a34;
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2.6;

function reducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

export class WorldScene extends Phaser.Scene {
  private hooks: WorldHooks;
  private leads: LeadState[] = [];
  private selectedId: string | null = null;
  private board?: Phaser.GameObjects.Graphics;
  private tileLayer?: Phaser.GameObjects.Container;
  private tip?: Phaser.GameObjects.Container;
  private tipText?: Phaser.GameObjects.Text;
  private tipBg?: Phaser.GameObjects.Graphics;
  private tiles = new Map<string, Phaser.GameObjects.Container>();
  private ready = false;

  private dragging = false;
  private downOnTile = false;
  private dragMoved = false;
  private pinchDist = 0;

  constructor(hooks: WorldHooks) {
    super("LeadArcadeWorld");
    this.hooks = hooks;
  }

  create(): void {
    this.board = this.add.graphics();
    this.tileLayer = this.add.container(0, 0);
    this.buildTooltip();
    this.ready = true;
    this.input.addPointer(1);
    this.setupCamera();
    this.layout();
    this.scale.on("resize", () => this.layout());
  }

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

  private buildTooltip(): void {
    this.tipBg = this.add.graphics();
    this.tipText = this.add.text(0, 0, "", { fontFamily: "system-ui, sans-serif", fontSize: "12px", color: "#f4e6cc" }).setOrigin(0.5, 1);
    this.tip = this.add.container(0, 0, [this.tipBg, this.tipText]).setDepth(60).setVisible(false);
  }

  private showTooltip(x: number, y: number, text: string): void {
    if (!this.tip || !this.tipText || !this.tipBg) return;
    this.tipText.setText(text);
    const w = this.tipText.width + 16;
    const h = this.tipText.height + 10;
    this.tipBg.clear().fillStyle(0x100a05, 0.92).fillRoundedRect(-w / 2, -h, w, h, 6);
    this.tipText.setPosition(0, -5);
    this.tip.setPosition(x, y).setVisible(true);
  }

  private hideTooltip(): void {
    this.tip?.setVisible(false);
  }

  private setupCamera(): void {
    this.input.on("wheel", (_p: Phaser.Input.Pointer, _o: unknown, _dx: number, dy: number) => {
      const cam = this.cameras.main;
      cam.zoom = Phaser.Math.Clamp(cam.zoom - dy * 0.0015, ZOOM_MIN, ZOOM_MAX);
    });
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      const p1 = this.input.pointer1;
      const p2 = this.input.pointer2;
      if (p1?.isDown && p2?.isDown) {
        const dist = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
        if (this.pinchDist) {
          const cam = this.cameras.main;
          cam.zoom = Phaser.Math.Clamp(cam.zoom * (dist / this.pinchDist), ZOOM_MIN, ZOOM_MAX);
        }
        this.pinchDist = dist;
        return;
      }
      this.pinchDist = 0;
      if (p.isDown && !this.dragging && !this.downOnTile) {
        const cam = this.cameras.main;
        cam.scrollX -= (p.x - p.prevPosition.x) / cam.zoom;
        cam.scrollY -= (p.y - p.prevPosition.y) / cam.zoom;
      }
    });
    this.input.on("pointerup", () => { this.downOnTile = false; this.pinchDist = 0; });
  }

  private toBoardPct(px: number, py: number): { x: number; y: number } {
    const { w, h } = this.size();
    const m = Math.min(w, h) * 0.06;
    return {
      x: Phaser.Math.Clamp((px - m) / (w - 2 * m), 0, 1),
      y: Phaser.Math.Clamp((py - m) / (h - 2 * m), 0, 1),
    };
  }

  private layout(): void {
    if (!this.board) return;
    const { w, h } = this.size();
    this.cameras.main.setBounds(0, 0, w, h);
    const g = this.board;
    g.clear();
    g.fillStyle(WATER, 1).fillRect(0, 0, w, h);
    // water shimmer dots
    g.fillStyle(WATER_HI, 0.5);
    for (let x = 20; x < w; x += 60) for (let y = 20; y < h; y += 60) g.fillCircle(x + ((y / 60) % 2) * 30, y, 2);
    const m = Math.min(w, h) * 0.06;
    // coastline glow + land
    g.fillStyle(0x0e2a1a, 1).fillRoundedRect(m - 4, m - 4, w - 2 * m + 8, h - 2 * m + 8, 32);
    g.fillStyle(LAND, 1).fillRoundedRect(m, m, w - 2 * m, h - 2 * m, 28);
    g.fillStyle(LAND_HI, 1).fillRoundedRect(m * 1.6, m * 1.6, w - 3.2 * m, h - 3.2 * m, 22);
    // parks (lighter blobs)
    g.fillStyle(0x356a3c, 0.5);
    [[0.3, 0.45], [0.7, 0.35], [0.55, 0.66]].forEach(([px, py]) => g.fillCircle(m + px * (w - 2 * m), m + py * (h - 2 * m), Math.min(w, h) * 0.05));
    // grid
    g.lineStyle(1, 0xffffff, 0.05);
    for (let x = m; x < w - m; x += 48) g.lineBetween(x, m, x, h - m);
    for (let y = m; y < h - m; y += 48) g.lineBetween(m, y, w - m, y);
    // compass
    const cxp = w - m - 26, cyp = m + 26;
    g.lineStyle(2, 0xf4e6cc, 0.5).strokeCircle(cxp, cyp, 16);
    g.fillStyle(0xe8553a, 0.9).fillTriangle(cxp, cyp - 14, cxp - 5, cyp, cxp + 5, cyp);
    g.fillStyle(0xf4e6cc, 0.7).fillTriangle(cxp, cyp + 14, cxp - 5, cyp, cxp + 5, cyp);
    this.renderTiles();
  }

  private tierSize(stage: Stage, upgrades: number): number {
    const base = { prospect: 15, surveyed: 17, pitched: 19, client: 23, flagship: 27 }[stage];
    return base + Math.min(upgrades, 3) * 2;
  }

  private drawBuilding(g: Phaser.GameObjects.Graphics, stage: Stage, r: number): void {
    const col = STAGE_COLOR[stage];
    if (stage === "client" || stage === "flagship") {
      // shop: body + darker roof + door + window
      g.fillStyle(0x000000, 0.22).fillRoundedRect(-r, r * 0.6, r * 2, r * 0.3, 4); // ground shadow
      g.fillStyle(col, 1).fillRoundedRect(-r, -r * 0.5, r * 2, r * 1.3, 4);
      g.fillStyle(0x1b120a, 0.9).fillTriangle(-r - 3, -r * 0.5, r + 3, -r * 0.5, 0, -r * 1.15); // roof
      g.fillStyle(0x12331c, 1).fillRect(-r * 0.28, r * 0.05, r * 0.56, r * 0.75); // door
      g.fillStyle(0xfff4d6, 0.85).fillRect(r * 0.32, -r * 0.2, r * 0.4, r * 0.4); // window
      g.fillStyle(0xfff4d6, 0.85).fillRect(-r * 0.72, -r * 0.2, r * 0.4, r * 0.4);
    } else {
      g.fillStyle(0x000000, 0.2).fillEllipse(0, r * 0.7, r * 1.7, r * 0.6);
      g.fillStyle(col, 1).fillCircle(0, 0, r);
      if (stage === "surveyed") g.lineStyle(2, 0xf4e6cc, 0.7).strokeCircle(0, 0, r * 0.5);
      if (stage === "pitched") { g.fillStyle(0xf4e6cc, 1).fillRect(r * 0.1, -r - 8, 2, 10); g.fillStyle(0xe8553a, 1).fillTriangle(r * 0.1 + 2, -r - 8, r * 0.1 + 2, -r - 2, r * 0.1 + 12, -r - 5); }
    }
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
      const id = lead.meta.id;
      const c = this.add.container(ix(lead.meta.position.x), iy(lead.meta.position.y));
      const r = this.tierSize(lead.stage, lead.upgrades);
      const isClient = lead.stage === "client" || lead.stage === "flagship";
      const selected = id === this.selectedId;

      const body = this.add.graphics();
      this.drawBuilding(body, lead.stage, r);
      const ring = this.add.graphics();
      if (!isClient) ring.lineStyle(3, FIT_COLOR[lead.meta.dossier.fit], 1).strokeCircle(0, 0, r + 3);
      const halo = this.add.graphics();
      if (selected) halo.lineStyle(3, 0xffffff, 0.9).strokeCircle(0, 0, r + 9);

      const label = this.add.text(0, r + 12, lead.meta.name, {
        fontFamily: "system-ui, sans-serif", fontSize: "12px", color: "#f4e6cc",
      }).setOrigin(0.5, 0);

      c.add([halo, body, ring, label]);
      if (!isClient) {
        c.add(this.add.text(0, isClient ? 0 : -r * 0.05, lead.meta.name.charAt(0).toUpperCase(), {
          fontFamily: "system-ui, sans-serif", fontSize: `${Math.round(r)}px`, color: "#fff",
        }).setOrigin(0.5));
      }
      if (lead.stage === "flagship") {
        c.add(this.add.text(0, -r - 16, "★", { fontFamily: "system-ui, sans-serif", fontSize: "16px", color: "#d8a24c" }).setOrigin(0.5));
      }
      if (isClient && lead.mrr > 0) {
        c.add(this.add.text(r + 2, -r, `$${lead.mrr}`, {
          fontFamily: "system-ui, sans-serif", fontSize: "11px", color: "#1b120a",
          backgroundColor: "#d8a24c", padding: { x: 4, y: 1 },
        }).setOrigin(0.5));
      }

      const hit = Math.max(r + 12, 22);
      c.setSize(hit * 2, hit * 2);
      c.setInteractive(new Phaser.Geom.Rectangle(-hit, -hit, hit * 2, hit * 2), Phaser.Geom.Rectangle.Contains);
      this.input.setDraggable(c);
      const tip = `${lead.meta.name}  ·  ${lead.stage.toUpperCase()}${isClient ? `  ·  $${lead.mrr}/mo` : `  ·  ${lead.meta.dossier.fit}`}`;
      c.on("pointerover", () => { this.input.setDefaultCursor("pointer"); this.showTooltip(c.x, c.y - r - 6, tip); });
      c.on("pointerout", () => { this.input.setDefaultCursor("default"); this.hideTooltip(); });
      c.on("pointerdown", () => { this.downOnTile = true; this.dragMoved = false; });
      c.on("dragstart", () => { this.dragging = true; this.dragMoved = false; this.hideTooltip(); });
      c.on("drag", (_p: Phaser.Input.Pointer, dragX: number, dragY: number) => { c.x = dragX; c.y = dragY; this.dragMoved = true; });
      c.on("dragend", () => {
        this.dragging = false; this.downOnTile = false;
        if (this.dragMoved) { const pos = this.toBoardPct(c.x, c.y); this.hooks.onMove(id, pos.x, pos.y); }
      });
      c.on("pointerup", () => { if (!this.dragMoved) this.hooks.onSelect(id); this.downOnTile = false; });

      this.tileLayer.add(c);
      this.tiles.set(id, c);
    }
  }

  private floatText(x: number, y: number, str: string, size: number): void {
    const t = this.add.text(x, y, str, {
      fontFamily: "system-ui, sans-serif", fontSize: `${size}px`, color: "#d8a24c", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(50);
    const dur = reducedMotion() ? 600 : 900;
    this.tweens.add({ targets: t, y: y - (reducedMotion() ? 12 : 50), alpha: 0, duration: dur, ease: "Cubic.out", onComplete: () => t.destroy() });
  }

  playCapture(id: string): void {
    const c = this.tiles.get(id);
    if (!c) return;
    this.floatText(c.x, c.y - 30, "GOAL!", 26);
    if (reducedMotion()) return;
    this.tweens.add({ targets: c, scale: { from: 1, to: 1.35 }, yoyo: true, duration: 220, ease: "Back.out" });
    for (let i = 0; i < 8; i++) {
      const coin = this.add.circle(c.x, c.y, 5, 0xd8a24c).setDepth(49);
      this.tweens.add({
        targets: coin, x: c.x + (Math.random() - 0.5) * 120, y: c.y - 30 - Math.random() * 70,
        alpha: 0, duration: 700 + Math.random() * 300, ease: "Cubic.out", onComplete: () => coin.destroy(),
      });
    }
  }

  playUpgrade(id: string): void {
    const c = this.tiles.get(id);
    if (!c) return;
    this.floatText(c.x, c.y - 26, "UPGRADE!", 18);
    if (reducedMotion()) return;
    this.tweens.add({ targets: c, scale: { from: 1, to: 1.2 }, yoyo: true, duration: 180, ease: "Back.out" });
  }
}
