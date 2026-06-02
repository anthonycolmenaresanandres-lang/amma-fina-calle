import Phaser from "phaser";
import { DEFAULT_CONQUEST_LEVEL } from "./config";
import type { EngineConfig, Owner, PacketState, TowerState } from "./types";

type DragState = {
  sourceId: string;
  pointerX: number;
  pointerY: number;
  targetId: string | null;
};

type SendEmitter = {
  id: string;
  fromId: string;
  toId: string;
  owner: "player" | "enemy";
  remainingUnits: number;
  cadenceMs: number;
  emitTimerMs: number;
};

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

const TOWER_RADIUS = 24;
const DEFAULT_GLOW_ALPHA = 0.22;

export class ConquestScene extends Phaser.Scene {
  private levelConfig: EngineConfig;
  private towers = new Map<string, TowerState>();
  private packets: PacketState[] = [];
  private emitters: SendEmitter[] = [];
  private adjacency = new Map<string, Set<string>>();
  private towerViews = new Map<string, TowerView>();
  private stickerViews = new Map<string, StickerView>();

  private dragGraphics!: Phaser.GameObjects.Graphics;
  private packetGraphics!: Phaser.GameObjects.Graphics;

  private timerText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;

  private dragState: DragState | null = null;

  private timeLeftSec = DEFAULT_CONQUEST_LEVEL.rules.matchDurationSec;
  private aiThinkMs = 0;
  private gameOver = false;
  private packetSeq = 0;
  private emitterSeq = 0;

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

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.gameOver) {
        this.resetMatch();
        return;
      }

      const tower = this.findTowerAt(pointer.x, pointer.y);
      if (!tower || tower.owner !== "player") {
        return;
      }

      this.dragState = {
        sourceId: tower.id,
        pointerX: pointer.x,
        pointerY: pointer.y,
        targetId: null,
      };
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
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

      this.dragState.targetId = this.isLinked(this.dragState.sourceId, hovered.id) ? hovered.id : null;
    });

    this.input.on("pointerup", () => {
      if (!this.dragState || this.gameOver) {
        this.dragState = null;
        return;
      }

      if (this.dragState.targetId) {
        this.trySend(this.dragState.sourceId, this.dragState.targetId, "player");
      }
      this.dragState = null;
    });

    this.scale.on("resize", () => this.layoutScene());
    this.layoutScene();
    this.scheduleNextAi();
    this.refreshTowerVisuals();
    this.updateHud();
  }

  update(_time: number, deltaMs: number): void {
    const dtSec = deltaMs / 1000;

    if (!this.gameOver) {
      this.timeLeftSec = Math.max(0, this.timeLeftSec - dtSec);
      this.applyGrowth(dtSec);
      this.updateEmitters(deltaMs);
      this.updatePackets(dtSec);
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
    this.emitters = [];
    this.packetSeq = 0;
    this.emitterSeq = 0;
    this.timeLeftSec = this.levelConfig.rules.matchDurationSec;
    this.gameOver = false;
    this.dragState = null;

    for (const tower of this.levelConfig.towers) {
      this.towers.set(tower.id, {
        id: tower.id,
        xPct: tower.xPct,
        yPct: tower.yPct,
        owner: tower.owner,
        value: tower.value,
      });
    }

    this.adjacency.clear();
    for (const { a, b } of this.levelConfig.links) {
      if (!this.adjacency.has(a)) this.adjacency.set(a, new Set());
      if (!this.adjacency.has(b)) this.adjacency.set(b, new Set());
      this.adjacency.get(a)?.add(b);
      this.adjacency.get(b)?.add(a);
    }
  }

  private createTowerViews(): void {
    for (const tower of this.towers.values()) {
      const glow = this.add.circle(0, 0, TOWER_RADIUS + 8, 0xffffff, 0.13);
      const circle = this.add.circle(0, 0, TOWER_RADIUS, 0xffffff, 0.95).setStrokeStyle(2, 0xf1d199, 0.85);
      const label = this.add.text(0, 0, "0", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#1a1209",
        fontStyle: "bold",
      });
      label.setOrigin(0.5, 0.5);

      const inText = this.add.text(0, 0, "IN 0", {
        fontFamily: "Arial",
        fontSize: "10px",
        color: "#e7d8bc",
      });
      inText.setOrigin(1, 0.5);

      const outText = this.add.text(0, 0, "OUT 0", {
        fontFamily: "Arial",
        fontSize: "10px",
        color: "#e7d8bc",
      });
      outText.setOrigin(0, 0.5);

      this.towerViews.set(tower.id, { glow, circle, label, inText, outText });
    }
  }

  private createStickerViews(): void {
    for (const sticker of this.levelConfig.stickers ?? []) {
      const badge = this.add.rectangle(0, 0, 54, 22, 0x2b170d, 0.94).setStrokeStyle(1, 0xd4a24c, 0.78);
      const label = this.add.text(0, 0, sticker.label, {
        fontFamily: "Arial",
        fontSize: "10px",
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
    this.scheduleNextAi();
  }

  private updateHud(): void {
    const timer = Math.ceil(this.timeLeftSec);
    this.timerText.setText(`Level ${this.levelConfig.levelNumber}: ${this.levelConfig.levelName}  |  ${timer}s`);

    const size = this.scale.gameSize;
    this.timerText.setPosition(size.width / 2, 12);
    this.statusText.setPosition(size.width / 2, 42);
  }

  private applyGrowth(dtSec: number): void {
    const growth = this.levelConfig.rules.growthPerSec * dtSec;
    for (const tower of this.towers.values()) {
      if (tower.owner === "neutral") continue;
      tower.value = Math.min(this.levelConfig.rules.maxTowerValue, tower.value + growth);
    }
  }

  private runEnemyAi(deltaMs: number): void {
    this.aiThinkMs -= deltaMs;
    if (this.aiThinkMs > 0) return;
    this.scheduleNextAi();

    let best:
      | {
          source: TowerState;
          target: TowerState;
          score: number;
        }
      | undefined;

    for (const source of this.towers.values()) {
      if (source.owner !== "enemy" || source.value < 8) continue;
      const neighbors = this.adjacency.get(source.id);
      if (!neighbors) continue;

      for (const targetId of neighbors) {
        const target = this.towers.get(targetId);
        if (!target || target.owner === "enemy") continue;

        const sendAmount = Math.floor(source.value * this.levelConfig.rules.sendPercent);
        let score = 100 - target.value;
        if (target.owner === "neutral") score += 8;
        if (sendAmount > target.value) score += 20;

        if (!best || score > best.score) {
          best = { source, target, score };
        }
      }
    }

    if (best) {
      this.trySend(best.source.id, best.target.id, "enemy");
    }
  }

  private scheduleNextAi(): void {
    const { aiThinkMinMs, aiThinkMaxMs } = this.levelConfig.rules;
    this.aiThinkMs = Phaser.Math.Between(aiThinkMinMs, aiThinkMaxMs);
  }

  private trySend(fromId: string, toId: string, sender: "player" | "enemy"): void {
    if (!this.isLinked(fromId, toId)) return;

    const source = this.towers.get(fromId);
    const target = this.towers.get(toId);
    if (!source || !target || source.owner !== sender) return;

    const sourceValueAtSend = source.value;
    const amount = Math.floor(sourceValueAtSend * this.levelConfig.rules.sendPercent);
    if (amount < 1) return;

    source.value -= amount;

    this.emitters.push({
      id: `emit-${this.emitterSeq++}`,
      fromId,
      toId,
      owner: sender,
      remainingUnits: amount,
      cadenceMs: this.computeCadenceMs(sourceValueAtSend),
      emitTimerMs: 0,
    });
  }

  private computeCadenceMs(sourceValue: number): number {
    // Higher tower value emits queued single units faster.
    // At low values cadence is slower; at high values cadence approaches the lower cap.
    return Phaser.Math.Clamp(220 - Math.floor(sourceValue) * 2, 45, 220);
  }

  private updateEmitters(deltaMs: number): void {
    const next: SendEmitter[] = [];

    for (const emitter of this.emitters) {
      emitter.emitTimerMs -= deltaMs;

      while (emitter.remainingUnits > 0 && emitter.emitTimerMs <= 0) {
        this.packets.push({
          id: `pkt-${this.packetSeq++}`,
          fromId: emitter.fromId,
          toId: emitter.toId,
          owner: emitter.owner,
          amount: 1,
          progress: 0,
        });
        emitter.remainingUnits -= 1;
        emitter.emitTimerMs += emitter.cadenceMs;
      }

      if (emitter.remainingUnits > 0) {
        next.push(emitter);
      }
    }

    this.emitters = next;
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

    target.value -= packet.amount;
    if (target.value < 0) {
      target.owner = packet.owner;
      target.value = Math.abs(target.value);
    }
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
        ? `${this.levelConfig.winText}\nTap Replay or choose another level`
        : `${this.levelConfig.loseText}\nTap Replay or choose another level`,
    );
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
    for (const tower of this.towers.values()) {
      const view = this.towerViews.get(tower.id);
      if (!view) continue;
      const pos = this.toScreen(tower.xPct, tower.yPct);
      view.glow.setPosition(pos.x, pos.y);
      view.circle.setPosition(pos.x, pos.y);
      view.label.setPosition(pos.x, pos.y);
      view.inText.setPosition(pos.x - (TOWER_RADIUS + 6), pos.y - (TOWER_RADIUS + 8));
      view.outText.setPosition(pos.x + (TOWER_RADIUS + 6), pos.y - (TOWER_RADIUS + 8));
    }

    for (const sticker of this.levelConfig.stickers ?? []) {
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
    this.dragGraphics.clear();
    if (!this.dragState) return;

    const source = this.towers.get(this.dragState.sourceId);
    if (!source) return;

    const from = this.toScreen(source.xPct, source.yPct);
    const to = this.dragState.targetId
      ? this.toScreen(
          this.towers.get(this.dragState.targetId)?.xPct ?? source.xPct,
          this.towers.get(this.dragState.targetId)?.yPct ?? source.yPct,
        )
      : { x: this.dragState.pointerX, y: this.dragState.pointerY };

    this.dragGraphics.lineStyle(3, 0xe4bf6d, 0.9);
    this.dragGraphics.lineBetween(from.x, from.y, to.x, to.y);
    this.dragGraphics.fillStyle(0xe4bf6d, 0.85);
    this.dragGraphics.fillCircle(to.x, to.y, 6);
  }

  private drawPackets(): void {
    this.packetGraphics.clear();

    for (const packet of this.packets) {
      const from = this.towers.get(packet.fromId);
      const to = this.towers.get(packet.toId);
      if (!from || !to) continue;

      const fromPos = this.toScreen(from.xPct, from.yPct);
      const toPos = this.toScreen(to.xPct, to.yPct);
      const x = Phaser.Math.Linear(fromPos.x, toPos.x, packet.progress);
      const y = Phaser.Math.Linear(fromPos.y, toPos.y, packet.progress);

      const color = packet.owner === "player" ? this.levelConfig.colors.player : this.levelConfig.colors.enemy;
      this.packetGraphics.lineStyle(2, color, 0.32);
      const backProgress = Math.max(0, packet.progress - 0.06);
      const tx = Phaser.Math.Linear(fromPos.x, toPos.x, backProgress);
      const ty = Phaser.Math.Linear(fromPos.y, toPos.y, backProgress);
      this.packetGraphics.lineBetween(tx, ty, x, y);

      this.packetGraphics.fillStyle(color, 0.95);
      this.packetGraphics.fillCircle(x, y, 3.5);
    }
  }

  private refreshTowerVisuals(): void {
    const linkedTargets = this.dragState ? this.adjacency.get(this.dragState.sourceId) : undefined;

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
      } else if (linkedTargets?.has(tower.id)) {
        glowAlpha = 0.4;
        strokeWidth = 2;
        strokeColor = 0xe4bf6d;
        strokeAlpha = 0.95;
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
    let queued = 0;
    for (const emitter of this.emitters) {
      if (emitter.fromId === towerId) queued += emitter.remainingUnits;
    }
    let inFlight = 0;
    for (const packet of this.packets) {
      if (packet.fromId === towerId) inFlight += packet.amount;
    }
    return queued + inFlight;
  }

  private getIncomingCount(towerId: string): number {
    let queued = 0;
    for (const emitter of this.emitters) {
      if (emitter.toId === towerId) queued += emitter.remainingUnits;
    }
    let inFlight = 0;
    for (const packet of this.packets) {
      if (packet.toId === towerId) inFlight += packet.amount;
    }
    return queued + inFlight;
  }

  private ownerColor(owner: Owner): number {
    if (owner === "player") return this.levelConfig.colors.player;
    if (owner === "enemy") return this.levelConfig.colors.enemy;
    return this.levelConfig.colors.neutral;
  }

  private findTowerAt(x: number, y: number): TowerState | null {
    for (const tower of this.towers.values()) {
      const pos = this.toScreen(tower.xPct, tower.yPct);
      if (Phaser.Math.Distance.Between(x, y, pos.x, pos.y) <= TOWER_RADIUS + 8) {
        return tower;
      }
    }
    return null;
  }

  private isLinked(a: string, b: string): boolean {
    return this.adjacency.get(a)?.has(b) ?? false;
  }

  private toScreen(xPct: number, yPct: number): { x: number; y: number } {
    const size = this.scale.gameSize;
    const padX = 24;
    const padTop = 84;
    const padBottom = 32;

    const usableW = Math.max(1, size.width - padX * 2);
    const usableH = Math.max(1, size.height - padTop - padBottom);

    return {
      x: padX + (xPct / 100) * usableW,
      y: padTop + (yPct / 100) * usableH,
    };
  }
}
