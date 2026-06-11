import Phaser from "phaser";
import { DEFAULT_CONQUEST_LEVEL } from "./config";
import type { EngineConfig, Owner, PacketState, StickerConfig, TowerState } from "./types";

type DragState = {
  sourceId: string;
  pointerX: number;
  pointerY: number;
  targetId: string | null;
};

// A persistent stream from one node to another — keeps emitting units until the
// source is lost (overpowered) or the player slashes it. Not a one-shot burst.
type Flow = {
  id: string;
  fromId: string;
  toId: string;
  owner: "player" | "enemy";
  emitTimerMs: number;
};

type SlashState = { x0: number; y0: number; x: number; y: number };

type TowerView = {
  circle: Phaser.GameObjects.Arc;
  label: Phaser.GameObjects.Text;
  glow: Phaser.GameObjects.Arc;
  inText: Phaser.GameObjects.Text;
  outText: Phaser.GameObjects.Text;
};

type StickerView = {
  badge: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
};

const DEFAULT_GLOW_ALPHA = 0.22;

export class ConquestScene extends Phaser.Scene {
  private levelConfig: EngineConfig;
  private towers = new Map<string, TowerState>();
  private packets: PacketState[] = [];
  private flows: Flow[] = [];
  private towerViews = new Map<string, TowerView>();
  private stickerViews = new Map<string, StickerView>();

  private dragGraphics!: Phaser.GameObjects.Graphics;
  private packetGraphics!: Phaser.GameObjects.Graphics;
  private barGraphics!: Phaser.GameObjects.Graphics;

  private timerText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;

  private dragState: DragState | null = null;
  private slashState: SlashState | null = null; // an in-progress cut gesture

  private timeLeftSec = DEFAULT_CONQUEST_LEVEL.rules.matchDurationSec;
  private aiCooldown = new Map<string, number>(); // per-enemy-node action timer (real-time, no turns)
  private gameOver = false;
  private packetSeq = 0;
  private flowSeq = 0;

  constructor(levelConfig: EngineConfig = DEFAULT_CONQUEST_LEVEL) {
    super(`ConquestScene-${levelConfig.id}`);
    this.levelConfig = levelConfig;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(this.levelConfig.colors.bg);

    this.initializeState();

    this.dragGraphics = this.add.graphics();
    this.packetGraphics = this.add.graphics();

    this.timerText = this.add.text(0, 0, "", {
      fontFamily: "Georgia, serif",
      fontSize: "20px",
      color: this.levelConfig.colors.text,
    });
    this.timerText.setOrigin(0.5, 0);

    this.statusText = this.add.text(0, 0, "", {
      fontFamily: "Georgia, serif",
      fontSize: "14px",
      color: this.levelConfig.colors.text,
      align: "center",
    });
    this.statusText.setOrigin(0.5, 0);

    this.createTowerViews();
    this.createStickerViews();
    this.barGraphics = this.add.graphics(); // top — territory bar

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.gameOver) {
        this.resetMatch();
        return;
      }

      const tower = this.findTowerAt(pointer.x, pointer.y);

      if (tower && tower.owner === "player") {
        // Press your node: on release, open a flow to a target — or (tap) cut its flow.
        this.dragState = { sourceId: tower.id, pointerX: pointer.x, pointerY: pointer.y, targetId: null };
        return;
      }

      // Anywhere else → start a SLASH gesture (drag across a stream to cut it).
      this.slashState = { x0: pointer.x, y0: pointer.y, x: pointer.x, y: pointer.y };
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.slashState) {
        this.slashState.x = pointer.x;
        this.slashState.y = pointer.y;
        return;
      }
      if (!this.dragState) {
        return;
      }

      this.dragState.pointerX = pointer.x;
      this.dragState.pointerY = pointer.y;
      const hovered = this.findTowerAt(pointer.x, pointer.y);
      if (!hovered || hovered.id === this.dragState.sourceId) {
        this.dragState.targetId = null;
        return;
      }

      // Flow to ANY node — no link restriction.
      this.dragState.targetId = hovered.id;
    });

    this.input.on("pointerup", () => {
      if (this.slashState) {
        const moved = Phaser.Math.Distance.Between(this.slashState.x0, this.slashState.y0, this.slashState.x, this.slashState.y);
        if (moved > 16) this.performSlash(this.slashState);
        this.slashState = null;
        return;
      }

      const drag = this.dragState;
      this.dragState = null;
      if (!drag || this.gameOver) return;

      if (drag.targetId) {
        this.setFlow(drag.sourceId, drag.targetId, "player"); // open a flow
      } else {
        this.flows = this.flows.filter((f) => f.fromId !== drag.sourceId); // tap = stop this node's flow
      }
    });

    this.scale.on("resize", () => this.layoutScene());
    this.layoutScene();
    this.refreshTowerVisuals();
    this.updateHud();
  }

  update(_time: number, deltaMs: number): void {
    const dtSec = deltaMs / 1000;

    if (!this.gameOver) {
      this.timeLeftSec = Math.max(0, this.timeLeftSec - dtSec);
      this.applyGrowth(dtSec);
      this.updateFlows(deltaMs);
      this.updatePackets(dtSec);
      this.resolveClashes();
      this.runEnemyAi(deltaMs);
      this.checkEndState();
      this.updateHud();
      this.refreshTowerVisuals();
    }

    this.drawDragPreview();
    this.drawPackets();
  }

  private initializeState(): void {
    this.towers.clear();
    this.packets = [];
    this.flows = [];
    this.packetSeq = 0;
    this.flowSeq = 0;
    this.timeLeftSec = this.levelConfig.rules.matchDurationSec;
    this.gameOver = false;
    this.dragState = null;
    this.slashState = null;
    this.aiCooldown.clear();

    for (const tower of this.levelConfig.towers) {
      this.towers.set(tower.id, {
        id: tower.id,
        xPct: tower.xPct,
        yPct: tower.yPct,
        owner: tower.owner,
        value: tower.value,
      });
    }

  }

  private createTowerViews(): void {
    const towerRadius = this.towerRadius();
    const labelSize = Math.max(17, Math.round(towerRadius * 0.62));
    const counterSize = Math.max(11, Math.round(towerRadius * 0.34));

    for (const tower of this.towers.values()) {
      const glow = this.add.circle(0, 0, towerRadius + 12, 0xffffff, 0.13);
      const circle = this.add.circle(0, 0, towerRadius, 0xffffff, 0.95).setStrokeStyle(2, 0xf1d199, 0.85);
      const label = this.add.text(0, 0, "0", {
        fontFamily: "Arial",
        fontSize: `${labelSize}px`,
        color: "#1a1209",
        fontStyle: "bold",
      });
      label.setOrigin(0.5, 0.5);

      const inText = this.add.text(0, 0, "IN 0", {
        fontFamily: "Arial",
        fontSize: `${counterSize}px`,
        color: "#e7d8bc",
      });
      inText.setOrigin(1, 0.5);

      const outText = this.add.text(0, 0, "OUT 0", {
        fontFamily: "Arial",
        fontSize: `${counterSize}px`,
        color: "#e7d8bc",
      });
      outText.setOrigin(0, 0.5);

      this.towerViews.set(tower.id, { glow, circle, label, inText, outText });
    }
  }

  private createStickerViews(): void {
    const scale = this.levelConfig.rules.stickerScale;
    const badgeWidth = 54 * scale;
    const badgeHeight = 22 * scale;
    const fontSize = Math.max(10, Math.round(10 * scale));

    for (const sticker of this.activeStickers()) {
      const badge = this.add.rectangle(0, 0, badgeWidth, badgeHeight, 0x2b170d, 0.94).setStrokeStyle(1, 0xd4a24c, 0.78);
      const label = this.add.text(0, 0, sticker.label, {
        fontFamily: "Arial",
        fontSize: `${fontSize}px`,
        color: "#f4e6cc",
        fontStyle: "bold",
      });
      label.setOrigin(0.5, 0.5);
      this.stickerViews.set(sticker.id, { badge, label });
    }
  }

  private resetMatch(): void {
    for (const view of this.towerViews.values()) {
      view.circle.destroy();
      view.glow.destroy();
      view.label.destroy();
      view.inText.destroy();
      view.outText.destroy();
    }
    for (const view of this.stickerViews.values()) {
      view.badge.destroy();
      view.label.destroy();
    }
    this.towerViews.clear();
    this.stickerViews.clear();
    this.dragGraphics.clear();
    this.packetGraphics.clear();
    this.statusText.setText("");

    this.initializeState();
    this.createTowerViews();
    this.createStickerViews();

    this.layoutScene();
    this.refreshTowerVisuals();
    this.updateHud();
  }

  private updateHud(): void {
    const timer = Math.ceil(this.timeLeftSec);
    this.timerText.setText(`Level ${this.levelConfig.levelNumber}: ${this.levelConfig.levelName}  |  ${timer}s`);

    const size = this.scale.gameSize;
    this.timerText.setPosition(size.width / 2, 12);
    this.statusText.setPosition(size.width / 2, 42);

    this.drawTerritoryBar();
  }

  private drawTerritoryBar(): void {
    if (!this.barGraphics) return;
    const w = this.scale.gameSize.width;
    const total = this.towers.size || 1;
    const counts = this.countOwnership();
    const barY = 4;
    const barH = 5;
    this.barGraphics.clear();
    this.barGraphics.fillStyle(0xffffff, 0.06);
    this.barGraphics.fillRect(0, barY, w, barH);
    const playerW = (counts.player / total) * w;
    const enemyW = (counts.enemy / total) * w;
    this.barGraphics.fillStyle(this.levelConfig.colors.player, 0.9);
    this.barGraphics.fillRect(0, barY, playerW, barH);
    this.barGraphics.fillStyle(this.levelConfig.colors.enemy, 0.9);
    this.barGraphics.fillRect(w - enemyW, barY, enemyW, barH);
  }

  private applyGrowth(dtSec: number): void {
    const growth = this.levelConfig.rules.growthPerSec * dtSec;
    for (const tower of this.towers.values()) {
      if (tower.owner === "neutral") continue;
      tower.value = Math.min(this.levelConfig.rules.maxTowerValue, tower.value + growth);
    }
  }

  // Real-time AI — no turns. Each enemy node runs on its OWN cooldown and acts the
  // moment it's ready, so multiple enemy nodes operate continuously and in parallel.
  private runEnemyAi(deltaMs: number): void {
    const { aiThinkMinMs, aiThinkMaxMs } = this.levelConfig.rules;

    for (const source of this.towers.values()) {
      if (source.owner !== "enemy") continue;

      const cd = (this.aiCooldown.get(source.id) ?? 0) - deltaMs;
      if (cd > 0 || source.value < 8) {
        this.aiCooldown.set(source.id, Math.max(0, cd));
        continue;
      }

      let best: TowerState | undefined;
      let bestScore = -Infinity;
      for (const target of this.towers.values()) {
        if (target.id === source.id || target.owner === "enemy") continue;
        const sendAmount = Math.floor(source.value * this.levelConfig.rules.sendPercent);
        let score = 100 - target.value;
        if (target.owner === "neutral") score += 8;
        if (sendAmount > target.value) score += 20;
        if (score > bestScore) {
          bestScore = score;
          best = target;
        }
      }

      if (best) this.setFlow(source.id, best.id, "enemy");
      this.aiCooldown.set(source.id, Phaser.Math.Between(aiThinkMinMs, aiThinkMaxMs));
    }
  }

  /** Stream rate scales with the node's number — more units = faster flow. */
  private flowCadenceFor(value: number): number {
    return Phaser.Math.Clamp(280 - value * 4, 55, 280);
  }

  /** Open a persistent stream source→target (replaces that source's existing flow). */
  private setFlow(fromId: string, toId: string, owner: "player" | "enemy"): void {
    const source = this.towers.get(fromId);
    const target = this.towers.get(toId);
    if (!source || !target || source.id === target.id || source.owner !== owner) return;

    this.flows = this.flows.filter((f) => f.fromId !== fromId); // one outgoing flow per node
    this.flows.push({ id: `flow-${this.flowSeq++}`, fromId, toId, owner, emitTimerMs: 0 });

    if (owner === "player") {
      this.popTower(fromId);
      const p = this.toScreen(source.xPct, source.yPct);
      this.fireCue(p.x, p.y);
    }
  }

  private performSlash(slash: SlashState): void {
    const kept: Flow[] = [];
    let cut = 0;
    for (const flow of this.flows) {
      const from = this.towers.get(flow.fromId);
      const to = this.towers.get(flow.toId);
      if (!from || !to) {
        continue;
      }
      const a = this.toScreen(from.xPct, from.yPct);
      const b = this.toScreen(to.xPct, to.yPct);
      if (this.segmentsIntersect(slash.x0, slash.y0, slash.x, slash.y, a.x, a.y, b.x, b.y)) {
        cut += 1;
        this.spark((a.x + b.x) / 2, (a.y + b.y) / 2, 0xffffff);
      } else {
        kept.push(flow);
      }
    }
    this.flows = kept;
    if (cut > 0) {
      const g = this.add.graphics();
      g.lineStyle(4, 0xffffff, 0.95);
      g.lineBetween(slash.x0, slash.y0, slash.x, slash.y);
      this.tweens.add({ targets: g, alpha: 0, duration: 220, onComplete: () => g.destroy() });
    }
  }

  private segmentsIntersect(
    ax: number, ay: number, bx: number, by: number,
    cx: number, cy: number, dx: number, dy: number,
  ): boolean {
    const denom = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx);
    if (denom === 0) return false;
    const t = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / denom;
    const u = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / denom;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  }

  // Each open flow emits a steady stream while its source has units. The source
  // keeps growing AND feeding — so a flow never stops on its own; only a slash or
  // losing the source (overpowered) ends it.
  private updateFlows(deltaMs: number): void {
    const next: Flow[] = [];

    for (const flow of this.flows) {
      const source = this.towers.get(flow.fromId);
      const target = this.towers.get(flow.toId);
      if (!source || !target || source.owner !== flow.owner) continue; // source lost → flow ends

      flow.emitTimerMs -= deltaMs;
      if (source.value >= 1) {
        let guard = 0;
        while (flow.emitTimerMs <= 0 && source.value >= 1 && guard < 8) {
          this.packets.push({
            id: `pkt-${this.packetSeq++}`,
            fromId: flow.fromId,
            toId: flow.toId,
            owner: flow.owner,
            amount: 1,
            progress: 0,
          });
          source.value -= 1;
          flow.emitTimerMs += this.flowCadenceFor(source.value);
          guard += 1;
        }
      } else if (flow.emitTimerMs < 0) {
        flow.emitTimerMs = 0; // paused with no units; resumes the moment it grows
      }

      next.push(flow);
    }

    this.flows = next;
  }

  private updatePackets(dtSec: number): void {
    const speed = this.levelConfig.rules.projectileSpeed;
    const next: PacketState[] = [];

    for (const packet of this.packets) {
      const from = this.towers.get(packet.fromId);
      const to = this.towers.get(packet.toId);
      if (!from || !to) continue;

      const fromPos = this.toScreen(from.xPct, from.yPct);
      const toPos = this.toScreen(to.xPct, to.yPct);
      const distance = Phaser.Math.Distance.Between(fromPos.x, fromPos.y, toPos.x, toPos.y);
      if (distance <= 0) continue;

      const progressStep = (speed * dtSec) / distance;
      packet.progress += progressStep;

      if (packet.progress >= 1) {
        this.resolveArrival(packet);
      } else {
        next.push(packet);
      }
    }

    this.packets = next;
  }

  private resolveArrival(packet: PacketState): void {
    const target = this.towers.get(packet.toId);
    if (!target) return;

    if (target.owner === packet.owner) {
      target.value = Math.min(this.levelConfig.rules.maxTowerValue, target.value + packet.amount);
      return;
    }

    // A hostile unit hit a defended node — show the fight for control.
    const pos = this.toScreen(target.xPct, target.yPct);
    target.value -= packet.amount;
    if (target.value < 0) {
      target.owner = packet.owner;
      target.value = Math.abs(target.value);
      // Capture juice — pop, ring burst, and a kick of screen-shake on YOUR wins.
      this.popTower(target.id);
      this.ringBurst(pos.x, pos.y, this.ownerColor(target.owner));
      if (packet.owner === "player") this.cameras.main.shake(140, 0.005);
    } else {
      // still contested — flicker the node toward the attacker + a little spark
      this.contestTower(target.id, packet.owner);
      this.spark(pos.x, pos.y, this.ownerColor(packet.owner));
    }
  }

  // --- battle feedback -------------------------------------------------------

  private contestTower(id: string, attacker: Owner): void {
    const view = this.towerViews.get(id);
    if (!view) return;
    const flash = this.ownerColor(attacker);
    view.circle.setFillStyle(flash, 0.96);
    this.tweens.add({ targets: view.circle, scaleX: 1.12, scaleY: 1.12, duration: 70, yoyo: true, ease: "Quad.Out" });
  }

  private spark(x: number, y: number, color: number): void {
    const s = this.add.circle(x, y, this.levelConfig.rules.unitRadius * 0.9, color, 0.95);
    this.tweens.add({
      targets: s,
      scaleX: 0.1,
      scaleY: 0.1,
      alpha: 0,
      duration: 240,
      ease: "Quad.Out",
      onComplete: () => s.destroy(),
    });
  }

  private fireCue(x: number, y: number): void {
    const txt = this.add.text(x, y - this.towerRadius() - 4, "FIRE", {
      fontFamily: "Arial",
      fontSize: "14px",
      color: "#ffe6a8",
      fontStyle: "bold",
    });
    txt.setOrigin(0.5, 1);
    this.tweens.add({
      targets: txt,
      y: y - this.towerRadius() - 26,
      alpha: 0,
      duration: 520,
      ease: "Quad.Out",
      onComplete: () => txt.destroy(),
    });
  }

  // Opposing units that meet in transit annihilate 1-for-1 — so the bigger stream
  // punches through and the remainder flows on (a real clash between nodes).
  private resolveClashes(): void {
    const clashDist = this.levelConfig.rules.unitRadius * 2.4;
    const positions = this.packets.map((p) => this.packetPos(p));
    for (let i = 0; i < this.packets.length; i++) {
      const a = this.packets[i];
      const pa = positions[i];
      if (a.amount <= 0 || !pa) continue;
      for (let j = i + 1; j < this.packets.length; j++) {
        const b = this.packets[j];
        const pb = positions[j];
        if (b.amount <= 0 || !pb || b.owner === a.owner) continue;
        if (Phaser.Math.Distance.Between(pa.x, pa.y, pb.x, pb.y) <= clashDist) {
          a.amount = 0;
          b.amount = 0;
          this.spark((pa.x + pb.x) / 2, (pa.y + pb.y) / 2, 0xfff0c2);
          break;
        }
      }
    }
    if (this.packets.some((p) => p.amount <= 0)) {
      this.packets = this.packets.filter((p) => p.amount > 0);
    }
  }

  // --- juice helpers ---------------------------------------------------------

  private punch(obj: Phaser.GameObjects.Arc): void {
    this.tweens.add({ targets: obj, scaleX: 1.32, scaleY: 1.32, duration: 110, yoyo: true, ease: "Quad.Out" });
  }

  private popTower(id: string): void {
    const view = this.towerViews.get(id);
    if (view) this.punch(view.circle);
  }

  private ringBurst(x: number, y: number, color: number): void {
    const ring = this.add.circle(x, y, this.towerRadius() * 0.7);
    ring.setFillStyle(color, 0);
    ring.setStrokeStyle(3, color, 0.9);
    this.tweens.add({
      targets: ring,
      scaleX: 2.8,
      scaleY: 2.8,
      alpha: 0,
      duration: 430,
      ease: "Cubic.Out",
      onComplete: () => ring.destroy(),
    });
  }

  private checkEndState(): void {
    const ownership = this.countOwnership();

    if (ownership.enemy === 0 && ownership.player > 0) {
      this.finish("win");
      return;
    }

    if (ownership.player === 0 && ownership.enemy > 0) {
      this.finish("lose");
      return;
    }

    if (this.timeLeftSec > 0) return;

    if (ownership.player > ownership.enemy) {
      this.finish("win");
      return;
    }

    if (ownership.enemy > ownership.player) {
      this.finish("lose");
      return;
    }

    const playerPower = Array.from(this.towers.values())
      .filter((t) => t.owner === "player")
      .reduce((sum, t) => sum + t.value, 0);
    const enemyPower = Array.from(this.towers.values())
      .filter((t) => t.owner === "enemy")
      .reduce((sum, t) => sum + t.value, 0);

    this.finish(playerPower > enemyPower ? "win" : "lose");
  }

  private finish(result: "win" | "lose"): void {
    this.gameOver = true;
    this.statusText.setText(
      result === "win"
        ? `${this.levelConfig.winText}\nTap to play again`
        : `${this.levelConfig.loseText}\nTap to play again`,
    );

    if (result === "win") {
      this.cameras.main.flash(280, 244, 230, 204);
      for (const t of this.towers.values()) {
        if (t.owner !== "player") continue;
        const p = this.toScreen(t.xPct, t.yPct);
        this.ringBurst(p.x, p.y, this.levelConfig.colors.player);
      }
    } else {
      this.cameras.main.shake(240, 0.006);
    }
  }

  private countOwnership(): { player: number; enemy: number; neutral: number } {
    let player = 0;
    let enemy = 0;
    let neutral = 0;
    for (const t of this.towers.values()) {
      if (t.owner === "player") player += 1;
      else if (t.owner === "enemy") enemy += 1;
      else neutral += 1;
    }
    return { player, enemy, neutral };
  }

  private layoutScene(): void {
    const towerRadius = this.towerRadius();
    const counterOffsetX = towerRadius + 9;
    const counterOffsetY = towerRadius + 11;

    for (const tower of this.towers.values()) {
      const view = this.towerViews.get(tower.id);
      if (!view) continue;
      const pos = this.toScreen(tower.xPct, tower.yPct);
      view.glow.setPosition(pos.x, pos.y);
      view.circle.setPosition(pos.x, pos.y);
      view.label.setPosition(pos.x, pos.y);
      view.inText.setPosition(pos.x - counterOffsetX, pos.y - counterOffsetY);
      view.outText.setPosition(pos.x + counterOffsetX, pos.y - counterOffsetY);
    }

    for (const sticker of this.activeStickers()) {
      const tower = this.towers.get(sticker.towerId);
      const view = this.stickerViews.get(sticker.id);
      if (!tower || !view) continue;

      const towerPos = this.toScreen(tower.xPct, tower.yPct);
      const x = towerPos.x + (this.scale.gameSize.width * sticker.xOffsetPct) / 100;
      const y = towerPos.y + (this.scale.gameSize.height * sticker.yOffsetPct) / 100;
      view.badge.setPosition(x, y);
      view.label.setPosition(x, y);
    }

    const size = this.scale.gameSize;
    this.timerText.setPosition(size.width / 2, 12);
    this.statusText.setPosition(size.width / 2, 42);
  }

  private drawDragPreview(): void {
    // No aim lines for flows — nodes light up. Draw the in-progress SLASH stroke.
    this.dragGraphics.clear();
    if (this.slashState) {
      this.dragGraphics.lineStyle(3, 0xffffff, 0.85);
      this.dragGraphics.lineBetween(this.slashState.x0, this.slashState.y0, this.slashState.x, this.slashState.y);
    }
  }

  private drawPackets(): void {
    this.packetGraphics.clear();
    const r = this.levelConfig.rules.unitRadius;

    for (const packet of this.packets) {
      const pos = this.packetPos(packet);
      if (!pos) continue;
      const color = packet.owner === "player" ? this.levelConfig.colors.player : this.levelConfig.colors.enemy;
      // glowing dot — a moving "unit", no line trails
      this.packetGraphics.fillStyle(color, 0.22);
      this.packetGraphics.fillCircle(pos.x, pos.y, r + 4);
      this.packetGraphics.fillStyle(color, 1);
      this.packetGraphics.fillCircle(pos.x, pos.y, r);
    }
  }

  /** Current screen position of a packet along its source→target path. */
  private packetPos(packet: PacketState): { x: number; y: number } | null {
    const from = this.towers.get(packet.fromId);
    const to = this.towers.get(packet.toId);
    if (!from || !to) return null;
    const fromPos = this.toScreen(from.xPct, from.yPct);
    const toPos = this.toScreen(to.xPct, to.yPct);
    return {
      x: Phaser.Math.Linear(fromPos.x, toPos.x, packet.progress),
      y: Phaser.Math.Linear(fromPos.y, toPos.y, packet.progress),
    };
  }

  private refreshTowerVisuals(): void {
    for (const tower of this.towers.values()) {
      const view = this.towerViews.get(tower.id);
      if (!view) continue;

      const color = this.ownerColor(tower.owner);
      view.circle.setFillStyle(color, 0.96);
      view.label.setText(String(Math.floor(tower.value)));

      let glowAlpha = DEFAULT_GLOW_ALPHA;
      let strokeWidth = 2;
      let strokeColor = 0xf1d199;
      let strokeAlpha = 0.85;

      if (this.dragState && tower.id === this.dragState.sourceId) {
        glowAlpha = 0.5;
        strokeWidth = 3;
        strokeColor = 0xffde8a;
        strokeAlpha = 1;
      } else if (this.dragState && tower.id === this.dragState.targetId) {
        // the node you're aiming at — highlight it (instead of a line)
        glowAlpha = 0.42;
        strokeWidth = 3;
        strokeColor = 0xfff0c2;
        strokeAlpha = 1;
      }

      view.glow.setFillStyle(color, glowAlpha);
      view.circle.setStrokeStyle(strokeWidth, strokeColor, strokeAlpha);

      const outgoing = this.getOutgoingCount(tower.id);
      const incoming = this.getIncomingCount(tower.id);
      view.inText.setText(`IN ${incoming}`);
      view.outText.setText(`OUT ${outgoing}`);
      view.inText.setAlpha(incoming > 0 ? 1 : 0.48);
      view.outText.setAlpha(outgoing > 0 ? 1 : 0.48);
    }
  }

  private getOutgoingCount(towerId: string): number {
    let n = 0;
    for (const packet of this.packets) if (packet.fromId === towerId) n += packet.amount;
    return n;
  }

  private getIncomingCount(towerId: string): number {
    let n = 0;
    for (const packet of this.packets) if (packet.toId === towerId) n += packet.amount;
    return n;
  }

  private ownerColor(owner: Owner): number {
    if (owner === "player") return this.levelConfig.colors.player;
    if (owner === "enemy") return this.levelConfig.colors.enemy;
    return this.levelConfig.colors.neutral;
  }

  private findTowerAt(x: number, y: number): TowerState | null {
    const hitRadius = this.towerRadius() + 12;

    for (const tower of this.towers.values()) {
      const pos = this.toScreen(tower.xPct, tower.yPct);
      if (Phaser.Math.Distance.Between(x, y, pos.x, pos.y) <= hitRadius) {
        return tower;
      }
    }
    return null;
  }

  private toScreen(xPct: number, yPct: number): { x: number; y: number } {
    const size = this.scale.gameSize;
    const towerRadius = this.towerRadius();
    const padX = Math.max(24, towerRadius + 10);
    const padTop = Math.max(84, towerRadius + 54);
    const padBottom = Math.max(32, towerRadius + 8);

    const usableW = Math.max(1, size.width - padX * 2);
    const usableH = Math.max(1, size.height - padTop - padBottom);

    return {
      x: padX + (xPct / 100) * usableW,
      y: padTop + (yPct / 100) * usableH,
    };
  }

  private towerRadius(): number {
    return this.levelConfig.rules.towerRadius;
  }

  private activeStickers(): StickerConfig[] {
    return (this.levelConfig.stickers ?? []).slice(0, this.levelConfig.rules.maxStickerCount);
  }
}
