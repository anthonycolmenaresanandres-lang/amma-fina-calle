import Phaser from "phaser";
import { FINA_CALLE_CONQUEST_CONFIG } from "./config";
import type { Owner, PacketState, TowerState } from "./types";

type DragState = {
  sourceId: string;
  pointerX: number;
  pointerY: number;
  targetId: string | null;
};

type TowerView = {
  circle: Phaser.GameObjects.Arc;
  label: Phaser.GameObjects.Text;
  glow: Phaser.GameObjects.Arc;
};

const TOWER_RADIUS = 24;

export class ConquestScene extends Phaser.Scene {
  private towers = new Map<string, TowerState>();
  private packets: PacketState[] = [];
  private adjacency = new Map<string, Set<string>>();
  private towerViews = new Map<string, TowerView>();

  private linksGraphics!: Phaser.GameObjects.Graphics;
  private dragGraphics!: Phaser.GameObjects.Graphics;
  private packetGraphics!: Phaser.GameObjects.Graphics;

  private timerText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;

  private dragState: DragState | null = null;

  private timeLeftSec = FINA_CALLE_CONQUEST_CONFIG.rules.matchDurationSec;
  private aiThinkMs = 0;
  private gameOver = false;
  private packetSeq = 0;

  constructor() {
    super("ConquestScene");
  }

  create(): void {
    this.cameras.main.setBackgroundColor(FINA_CALLE_CONQUEST_CONFIG.colors.bg);

    this.initializeState();

    this.linksGraphics = this.add.graphics();
    this.dragGraphics = this.add.graphics();
    this.packetGraphics = this.add.graphics();

    this.timerText = this.add.text(0, 0, "", {
      fontFamily: "Georgia, serif",
      fontSize: "20px",
      color: FINA_CALLE_CONQUEST_CONFIG.colors.text,
    });
    this.timerText.setOrigin(0.5, 0);

    this.statusText = this.add.text(0, 0, "", {
      fontFamily: "Georgia, serif",
      fontSize: "14px",
      color: FINA_CALLE_CONQUEST_CONFIG.colors.text,
      align: "center",
    });
    this.statusText.setOrigin(0.5, 0);

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
      this.towerViews.set(tower.id, { glow, circle, label });
    }

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

  update(_time: number, delta: number): void {
    const dtSec = delta / 1000;

    if (!this.gameOver) {
      this.timeLeftSec = Math.max(0, this.timeLeftSec - dtSec);
      this.applyGrowth(dtSec);
      this.updatePackets(dtSec);
      this.runEnemyAi(delta);
      this.checkEndState();
      this.updateHud();
      this.refreshTowerVisuals();
    }

    this.drawLinks();
    this.drawDragPreview();
    this.drawPackets();
  }

  private initializeState(): void {
    this.towers.clear();
    this.packets = [];
    this.packetSeq = 0;
    this.timeLeftSec = FINA_CALLE_CONQUEST_CONFIG.rules.matchDurationSec;
    this.gameOver = false;
    this.dragState = null;

    for (const tower of FINA_CALLE_CONQUEST_CONFIG.towers) {
      this.towers.set(tower.id, {
        id: tower.id,
        xPct: tower.xPct,
        yPct: tower.yPct,
        owner: tower.owner,
        value: tower.value,
      });
    }

    this.adjacency.clear();
    for (const { a, b } of FINA_CALLE_CONQUEST_CONFIG.links) {
      if (!this.adjacency.has(a)) this.adjacency.set(a, new Set());
      if (!this.adjacency.has(b)) this.adjacency.set(b, new Set());
      this.adjacency.get(a)?.add(b);
      this.adjacency.get(b)?.add(a);
    }
  }

  private resetMatch(): void {
    for (const view of this.towerViews.values()) {
      view.circle.destroy();
      view.glow.destroy();
      view.label.destroy();
    }
    this.towerViews.clear();
    this.linksGraphics.clear();
    this.dragGraphics.clear();
    this.packetGraphics.clear();
    this.statusText.setText("");

    this.initializeState();

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
      this.towerViews.set(tower.id, { glow, circle, label });
    }

    this.layoutScene();
    this.refreshTowerVisuals();
    this.updateHud();
    this.scheduleNextAi();
  }

  private updateHud(): void {
    const timer = Math.ceil(this.timeLeftSec);
    this.timerText.setText(`${FINA_CALLE_CONQUEST_CONFIG.brandName}  |  ${timer}s`);

    const size = this.scale.gameSize;
    this.timerText.setPosition(size.width / 2, 12);
    this.statusText.setPosition(size.width / 2, 42);
  }

  private applyGrowth(dtSec: number): void {
    const growth = FINA_CALLE_CONQUEST_CONFIG.rules.growthPerSec * dtSec;
    for (const tower of this.towers.values()) {
      if (tower.owner === "neutral") continue;
      tower.value = Math.min(FINA_CALLE_CONQUEST_CONFIG.rules.maxTowerValue, tower.value + growth);
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

        const sendAmount = Math.floor(source.value * FINA_CALLE_CONQUEST_CONFIG.rules.sendPercent);
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
    const { aiThinkMinMs, aiThinkMaxMs } = FINA_CALLE_CONQUEST_CONFIG.rules;
    this.aiThinkMs = Phaser.Math.Between(aiThinkMinMs, aiThinkMaxMs);
  }

  private trySend(fromId: string, toId: string, sender: "player" | "enemy"): void {
    if (!this.isLinked(fromId, toId)) return;

    const source = this.towers.get(fromId);
    const target = this.towers.get(toId);
    if (!source || !target || source.owner !== sender) return;

    const amount = Math.floor(source.value * FINA_CALLE_CONQUEST_CONFIG.rules.sendPercent);
    if (amount < 1) return;

    source.value -= amount;
    this.packets.push({
      id: `pkt-${this.packetSeq++}`,
      fromId,
      toId,
      owner: sender,
      amount,
      progress: 0,
    });
  }

  private updatePackets(dtSec: number): void {
    const speed = FINA_CALLE_CONQUEST_CONFIG.rules.projectileSpeed;
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
      target.value = Math.min(FINA_CALLE_CONQUEST_CONFIG.rules.maxTowerValue, target.value + packet.amount);
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
        ? `${FINA_CALLE_CONQUEST_CONFIG.winText}\nTap anywhere to replay`
        : `${FINA_CALLE_CONQUEST_CONFIG.loseText}\nTap anywhere to replay`,
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
    }

    const size = this.scale.gameSize;
    this.timerText.setPosition(size.width / 2, 12);
    this.statusText.setPosition(size.width / 2, 42);
  }

  private drawLinks(): void {
    this.linksGraphics.clear();
    this.linksGraphics.lineStyle(2, FINA_CALLE_CONQUEST_CONFIG.colors.grid, 0.7);

    for (const link of FINA_CALLE_CONQUEST_CONFIG.links) {
      const a = this.towers.get(link.a);
      const b = this.towers.get(link.b);
      if (!a || !b) continue;
      const pa = this.toScreen(a.xPct, a.yPct);
      const pb = this.toScreen(b.xPct, b.yPct);
      this.linksGraphics.lineBetween(pa.x, pa.y, pb.x, pb.y);
    }
  }

  private drawDragPreview(): void {
    this.dragGraphics.clear();
    if (!this.dragState) return;

    const source = this.towers.get(this.dragState.sourceId);
    if (!source) return;

    const from = this.toScreen(source.xPct, source.yPct);
    const to = this.dragState.targetId
      ? this.toScreen(this.towers.get(this.dragState.targetId)?.xPct ?? source.xPct, this.towers.get(this.dragState.targetId)?.yPct ?? source.yPct)
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

      const color = packet.owner === "player" ? FINA_CALLE_CONQUEST_CONFIG.colors.player : FINA_CALLE_CONQUEST_CONFIG.colors.enemy;
      this.packetGraphics.lineStyle(2, color, 0.35);
      const backProgress = Math.max(0, packet.progress - 0.08);
      const tx = Phaser.Math.Linear(fromPos.x, toPos.x, backProgress);
      const ty = Phaser.Math.Linear(fromPos.y, toPos.y, backProgress);
      this.packetGraphics.lineBetween(tx, ty, x, y);

      this.packetGraphics.fillStyle(color, 0.95);
      this.packetGraphics.fillCircle(x, y, 4);
    }
  }

  private refreshTowerVisuals(): void {
    for (const tower of this.towers.values()) {
      const view = this.towerViews.get(tower.id);
      if (!view) continue;

      const color = this.ownerColor(tower.owner);
      view.circle.setFillStyle(color, 0.96);
      view.glow.setFillStyle(color, 0.22);
      view.label.setText(String(Math.floor(tower.value)));
    }
  }

  private ownerColor(owner: Owner): number {
    if (owner === "player") return FINA_CALLE_CONQUEST_CONFIG.colors.player;
    if (owner === "enemy") return FINA_CALLE_CONQUEST_CONFIG.colors.enemy;
    return FINA_CALLE_CONQUEST_CONFIG.colors.neutral;
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