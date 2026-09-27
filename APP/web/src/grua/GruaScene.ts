import Phaser from "phaser";
import { GRUA_LEVEL, STRINGMAN } from "./profile";
import { swingAmplitude } from "./physics";
import { BINS, ITEM_KINDS, gripper, newRound, step, type BinId, type GruaEvent, type Item, type Round } from "./round";
import { GruaRecorder } from "./recorder";

// Top-down view of the café floor. The engine (round.ts) owns every rule; this scene only
// turns input into velocity commands, advances robot time, records, and draws.

export type GruaStatus = {
  secondsLeft: number;
  score: number;
  cleared: number;
  total: number;
  load: string | null;
  loadKg: number;
  peakTension: number;
  tensions: number[];
  swingMm: number;
  altitude: number;
  phase: Round["phase"];
  straining: boolean;
  over: boolean;
  steadyGrabs: number;
  missedGrabs: number;
  strainEvents: number;
  holding: boolean;
  canAct: boolean;
  frames: number;
  episodes: number;
};

export type GruaAnnouncement = { text: string; tone: "good" | "neutral" | "warn" };

const C = {
  ink: 0x07090b, floor: 0x0d1115, gridMinor: 0x141a20, gridMajor: 0x1f262e, wall: 0x3a434d,
  gold: 0xc8aa72, paper: 0xf0ece4, steel: 0xb9c0c6, kraft: 0xa88a5a, strain: 0xe5484d,
};
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const ROOM = 2;
const STICK_RADIUS = 56;

function mix(a: number, b: number, t: number) {
  const k = Math.min(1, Math.max(0, t));
  const ch = (s: number) => Math.round(((a >> s) & 255) + (((b >> s) & 255) - ((a >> s) & 255)) * k) << s;
  return ch(16) | ch(8) | ch(0);
}

export class GruaScene extends Phaser.Scene {
  readonly round: Round;
  readonly recorder: GruaRecorder | null;
  private gfx!: Phaser.GameObjects.Graphics;
  private hud!: Phaser.GameObjects.Graphics;
  private binLabels: Partial<Record<BinId, Phaser.GameObjects.Text>> = {};
  private keys = { up: false, down: false, left: false, right: false };
  private stick: { id: number; ox: number; oy: number; x: number; y: number } | null = null;
  private actionQueued = false;
  private accumulator = 0;
  private stepCount = 0;
  private pending: GruaEvent[] = [];
  private statusClock = 0;
  private reportedOver = false;
  private cam = { x: 0, y: 0 };
  private pulses: { x: number; y: number; age: number; color: number }[] = [];
  private readonly reducedMotion: boolean;
  private readonly onStatus: (status: GruaStatus) => void;
  private readonly onAnnounce: (announcement: GruaAnnouncement) => void;

  // Callbacks rather than scene events: Phaser only creates `events` once the scene boots.
  constructor(opts: { seed: number; record: boolean; reducedMotion: boolean; onStatus: (s: GruaStatus) => void; onAnnounce: (a: GruaAnnouncement) => void }) {
    super("grua");
    this.round = newRound(opts.seed);
    this.recorder = opts.record ? new GruaRecorder(opts.seed) : null;
    this.reducedMotion = opts.reducedMotion;
    this.onStatus = opts.onStatus;
    this.onAnnounce = opts.onAnnounce;
  }

  create() {
    this.gfx = this.add.graphics();
    this.hud = this.add.graphics().setDepth(20);
    (Object.keys(BINS) as BinId[]).forEach((id) => {
      this.binLabels[id] = this.add.text(0, 0, BINS[id].label.toUpperCase(), { fontFamily: MONO, fontSize: "11px", color: "#b9c0c6" }).setOrigin(0.5, 0).setDepth(5);
    });
    this.input.addPointer(1);
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (!this.stick) this.stick = { id: p.id, ox: p.x, oy: p.y, x: p.x, y: p.y };
    });
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      if (this.stick && this.stick.id === p.id) { this.stick.x = p.x; this.stick.y = p.y; }
    });
    const release = (p: Phaser.Input.Pointer) => { if (this.stick && this.stick.id === p.id) this.stick = null; };
    this.input.on("pointerup", release);
    this.input.on("pointerupoutside", release);
    this.cam = { x: this.round.gantry[0], y: this.round.gantry[1] };
    this.draw(0);
    this.emitStatus();
  }

  /** Grab when empty, drop when holding. Applied on the next physics step. */
  pressAction() { if (!this.round.over) this.actionQueued = true; }

  setKey(direction: keyof GruaScene["keys"], down: boolean) { this.keys[direction] = down; }

  releaseControls() {
    this.stick = null;
    this.keys = { up: false, down: false, left: false, right: false };
  }

  private command() {
    let vx = 0, vy = 0;
    if (this.stick) {
      const dx = this.stick.x - this.stick.ox, dy = this.stick.y - this.stick.oy;
      const m = Math.min(1, Math.hypot(dx, dy) / STICK_RADIUS);
      const d = Math.hypot(dx, dy) || 1;
      vx = (dx / d) * m * STRINGMAN.maxSpeed;
      vy = (-dy / d) * m * STRINGMAN.maxSpeed;
    } else {
      const x = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
      const y = (this.keys.up ? 1 : 0) - (this.keys.down ? 1 : 0);
      const d = Math.hypot(x, y) || 1;
      vx = (x / d) * STRINGMAN.maxSpeed;
      vy = (y / d) * STRINGMAN.maxSpeed;
    }
    const action = this.actionQueued ? "grab" as const : null;
    this.actionQueued = false;
    return { vx, vy, action };
  }

  update(_time: number, delta: number) {
    const clamped = Math.min(delta, 100);
    if (!this.round.over) {
      const dt = 1 / GRUA_LEVEL.physicsHz;
      const every = GRUA_LEVEL.physicsHz / GRUA_LEVEL.recordHz;
      this.accumulator += (clamped / 1000) * GRUA_LEVEL.timeScale;
      while (this.accumulator >= dt && !this.round.over) {
        this.accumulator -= dt;
        step(this.round, this.command(), dt);
        const events = this.round.events;
        this.round.events = [];
        this.pending.push(...events);
        events.forEach((e) => this.announce(e));
        this.stepCount += 1;
        if (this.recorder && (this.stepCount % every === 0 || this.round.over)) {
          this.recorder.sample(this.round, this.pending);
          this.pending = [];
        }
      }
    }
    this.statusClock += clamped;
    const finalReport = this.round.over && !this.reportedOver;
    if (this.statusClock > 120 && !this.round.over || finalReport) {
      this.statusClock = 0;
      this.reportedOver = this.round.over;
      this.emitStatus();
    }
    this.draw(clamped);
  }

  private announce(e: GruaEvent) {
    const item = (id: string | null) => {
      const found = this.round.items.find((i) => i.id === id);
      return found ? ITEM_KINDS[found.kind].label : "item";
    };
    if (e.type === "grab") {
      this.onAnnounce(e.itemId
        ? { text: `Got the ${item(e.itemId)}${e.steady ? " — steady grab +5" : ""}.`, tone: "good" }
        : { text: "Missed. Stop over the item before you grab.", tone: "neutral" } satisfies GruaAnnouncement);
    } else if (e.type === "drop") {
      const where = e.into === "floor" ? "on the floor" : `in the ${BINS[e.into].label}`;
      this.onAnnounce({ text: `${item(e.itemId)} ${where}${e.points ? ` +${e.points}` : e.into === "floor" ? "" : " — wrong bin"}.`.replace(/^./, (c) => c.toUpperCase()), tone: e.points ? "good" : "neutral" } satisfies GruaAnnouncement);
      if (e.into !== "floor" && !this.reducedMotion) this.pulses.push({ x: BINS[e.into].at[0], y: BINS[e.into].at[1], age: 0, color: e.correct ? C.gold : C.steel });
    } else if (e.type === "strain") {
      this.onAnnounce({ text: "Line limit. Heavy loads ride the middle of the room.", tone: "warn" } satisfies GruaAnnouncement);
    } else if (e.type === "clear") {
      this.onAnnounce({ text: `Floor clear. Time bonus +${e.bonus}.`, tone: "good" } satisfies GruaAnnouncement);
    }
  }

  private emitStatus() {
    const r = this.round;
    const held = r.items.find((i) => i.id === r.holding);
    const status: GruaStatus = {
      secondsLeft: Math.max(0, Math.ceil((r.limit - r.time) / GRUA_LEVEL.timeScale)),
      score: r.score,
      cleared: r.items.filter((i) => i.state === "tub" || i.state === "trash").length,
      total: r.items.length,
      load: held ? ITEM_KINDS[held.kind].label : null,
      loadKg: held ? ITEM_KINDS[held.kind].mass : 0,
      peakTension: Math.max(...r.tensions),
      tensions: [...r.tensions],
      swingMm: swingAmplitude(r.swing) * 1000,
      altitude: r.gantry[2],
      phase: r.phase,
      straining: r.straining,
      over: r.over,
      steadyGrabs: r.steadyGrabs,
      missedGrabs: r.missedGrabs,
      strainEvents: r.strainEvents,
      holding: Boolean(r.holding),
      canAct: r.phase === "cruise" && !r.over,
      frames: this.recorder?.frameCount() ?? 0,
      episodes: this.recorder?.episodes.length ?? 0,
    };
    this.onStatus(status);
  }

  private draw(delta: number) {
    const { width: w, height: h } = this.scale.gameSize;
    const short = Math.min(w, h);
    const viewMeters = short < 520 ? 2.7 : 4.3;
    const ppm = short / viewMeters;
    const half = { x: w / 2 / ppm, y: h / 2 / ppm };
    const edge = ROOM + 0.1;
    const target = {
      x: half.x >= edge ? 0 : Phaser.Math.Clamp(this.round.gantry[0], -edge + half.x, edge - half.x),
      y: half.y >= edge ? 0 : Phaser.Math.Clamp(this.round.gantry[1], -edge + half.y, edge - half.y),
    };
    const ease = this.reducedMotion ? 1 : Math.min(1, delta * 0.006);
    this.cam.x += (target.x - this.cam.x) * ease;
    this.cam.y += (target.y - this.cam.y) * ease;
    const sx = (x: number) => w / 2 + (x - this.cam.x) * ppm;
    const sy = (y: number) => h / 2 - (y - this.cam.y) * ppm;
    const g = this.gfx.clear();

    g.fillStyle(C.ink, 1).fillRect(0, 0, w, h);
    g.fillStyle(C.floor, 1).fillRect(sx(-ROOM), sy(ROOM), ROOM * 2 * ppm, ROOM * 2 * ppm);
    for (let v = -ROOM; v <= ROOM + 1e-9; v += 0.25) {
      const major = Math.abs(v - Math.round(v)) < 1e-6;
      g.lineStyle(1, major ? C.gridMajor : C.gridMinor, 1);
      g.lineBetween(sx(v), sy(-ROOM), sx(v), sy(ROOM));
      g.lineBetween(sx(-ROOM), sy(v), sx(ROOM), sy(v));
    }
    g.lineStyle(2, C.wall, 1).strokeRect(sx(-ROOM), sy(ROOM), ROOM * 2 * ppm, ROOM * 2 * ppm);

    // Bins.
    (Object.keys(BINS) as BinId[]).forEach((id) => {
      const b = BINS[id];
      const [x, y] = [sx(b.at[0]), sy(b.at[1])];
      const r = b.radius * ppm;
      g.fillStyle(0x161c22, 1).lineStyle(2, C.steel, 0.9);
      if (id === "tub") { g.fillRoundedRect(x - r, y - r * 0.72, r * 2, r * 1.44, 6); g.strokeRoundedRect(x - r, y - r * 0.72, r * 2, r * 1.44, 6); }
      else { g.fillCircle(x, y, r); g.strokeCircle(x, y, r); }
      const inside = this.round.items.filter((i) => i.state === id).length;
      for (let k = 0; k < inside; k++) g.fillStyle(id === "tub" ? C.paper : C.kraft, 0.85).fillCircle(x - r * 0.5 + (k % 4) * r * 0.33, y - r * 0.2 + Math.floor(k / 4) * r * 0.36, Math.max(2, r * 0.1));
      this.binLabels[id]?.setPosition(x, y + (id === "tub" ? r * 0.72 : r) + 7);
    });

    // Pulses from drops.
    this.pulses = this.pulses.filter((p) => (p.age += delta) < 500);
    this.pulses.forEach((p) => g.lineStyle(2, p.color, 1 - p.age / 500).strokeCircle(sx(p.x), sy(p.y), (0.25 + p.age / 1200) * ppm));

    // Items on the floor.
    this.round.items.filter((i) => i.state === "floor").forEach((i) => this.drawItem(g, i, sx(i.at[0]), sy(i.at[1]), ppm));

    // Cables: the signature. Each shades from gold to red as it nears the safe limit.
    const gantry = this.round.gantry;
    STRINGMAN.corners.forEach((c, k) => {
      const t = this.round.tensions[k] ?? 0;
      const warn = Math.max(0, (t / STRINGMAN.maxSafeTension - 0.6) / 0.4);
      g.lineStyle(t < 0.2 ? 1 : 2, mix(C.gold, C.strain, warn), t < 0.2 ? 0.35 : 0.95);
      g.lineBetween(sx(c[0]), sy(c[1]), sx(gantry[0]), sy(gantry[1]));
      g.fillStyle(C.steel, 1).fillRect(sx(c[0]) - 4, sy(c[1]) - 4, 8, 8);
    });

    // Gantry card and the gripper hanging below it.
    const grip = gripper(this.round);
    const heightScale = 0.75 + 0.25 * ((gantry[2] - GRUA_LEVEL.grabAltitude) / (GRUA_LEVEL.cruiseAltitude - GRUA_LEVEL.grabAltitude));
    const card = Math.max(12, 0.09 * ppm) * heightScale;
    g.fillStyle(C.floor, 0.9).lineStyle(2, C.gold, 1);
    g.beginPath(); g.moveTo(sx(gantry[0]), sy(gantry[1]) - card / 1.4); g.lineTo(sx(gantry[0]) + card / 1.4, sy(gantry[1])); g.lineTo(sx(gantry[0]), sy(gantry[1]) + card / 1.4); g.lineTo(sx(gantry[0]) - card / 1.4, sy(gantry[1])); g.closePath(); g.fillPath(); g.strokePath();

    const held = this.round.items.find((i) => i.id === this.round.holding);
    if (held) this.drawItem(g, held, sx(grip[0]), sy(grip[1]), ppm);
    const reticle = Math.max(10, 0.05 * ppm);
    const open = (STRINGMAN.fingerClosed - this.round.finger) / (STRINGMAN.fingerClosed - STRINGMAN.fingerOpen);
    g.lineStyle(2, this.round.straining ? C.strain : C.paper, 1).strokeCircle(sx(grip[0]), sy(grip[1]), reticle);
    const gap = reticle * (0.25 + 0.75 * open);
    g.lineStyle(3, C.gold, 1);
    g.lineBetween(sx(grip[0]) - gap, sy(grip[1]) - reticle * 0.55, sx(grip[0]) - gap, sy(grip[1]) + reticle * 0.55);
    g.lineBetween(sx(grip[0]) + gap, sy(grip[1]) - reticle * 0.55, sx(grip[0]) + gap, sy(grip[1]) + reticle * 0.55);

    this.drawHud(w, h, ppm);
  }

  private drawItem(g: Phaser.GameObjects.Graphics, item: Item, x: number, y: number, ppm: number) {
    const spec = ITEM_KINDS[item.kind];
    const r = Math.max(6, (spec.size / 2) * ppm);
    if (item.kind === "plate") {
      g.fillStyle(C.paper, 1).fillCircle(x, y, r);
      g.lineStyle(1.5, C.steel, 1).strokeCircle(x, y, r * 0.62);
    } else if (item.kind === "mug") {
      g.fillStyle(C.paper, 1).fillCircle(x, y, r);
      g.fillStyle(C.paper, 1).fillRect(x + r * 0.8, y - r * 0.28, r * 0.7, r * 0.56);
      g.fillStyle(0x3b2a1c, 1).fillCircle(x, y, r * 0.62);
    } else if (item.kind === "pitcher") {
      g.fillStyle(C.steel, 1).fillCircle(x, y, r);
      g.fillTriangle(x - r * 0.3, y - r * 0.85, x + r * 0.3, y - r * 0.85, x, y - r * 1.45);
      g.lineStyle(2, C.paper, 1).strokeCircle(x, y, r * 0.6);
    } else if (item.kind === "cup") {
      g.fillStyle(C.kraft, 1).fillCircle(x, y, r);
      g.fillStyle(0xe8e1d4, 1).fillCircle(x, y, r * 0.72);
      g.fillStyle(C.kraft, 1).fillCircle(x, y, r * 0.16);
    } else {
      g.fillStyle(C.kraft, 1).fillRoundedRect(x - r, y - r * 0.8, r * 2, r * 1.6, 3);
      g.lineStyle(1, 0x6e5a3b, 1).lineBetween(x - r * 0.7, y - r * 0.2, x + r * 0.6, y + r * 0.3);
    }
  }

  private drawHud(w: number, h: number, ppm: number) {
    const g = this.hud.clear();
    // Floating joystick where the thumb went down.
    if (this.stick) {
      const dx = this.stick.x - this.stick.ox, dy = this.stick.y - this.stick.oy;
      const m = Math.min(1, Math.hypot(dx, dy) / STICK_RADIUS);
      const d = Math.hypot(dx, dy) || 1;
      g.lineStyle(2, C.steel, 0.55).strokeCircle(this.stick.ox, this.stick.oy, STICK_RADIUS);
      g.fillStyle(C.gold, 0.85).fillCircle(this.stick.ox + (dx / d) * m * STICK_RADIUS, this.stick.oy + (dy / d) * m * STICK_RADIUS, 16);
    }
    // Minimap whenever the view is cropped.
    const viewMeters = Math.min(w, h) / ppm;
    if (viewMeters < ROOM * 2) {
      const size = 72, pad = 10;
      const ox = w - size - pad, oy = pad;
      const s = size / (ROOM * 2);
      const mx = (x: number) => ox + (x + ROOM) * s;
      const my = (y: number) => oy + (ROOM - y) * s;
      g.fillStyle(C.ink, 0.85).fillRect(ox, oy, size, size);
      g.lineStyle(1, C.wall, 1).strokeRect(ox, oy, size, size);
      (Object.keys(BINS) as BinId[]).forEach((id) => g.fillStyle(C.steel, 0.8).fillCircle(mx(BINS[id].at[0]), my(BINS[id].at[1]), 3));
      this.round.items.filter((i) => i.state === "floor").forEach((i) => g.fillStyle(ITEM_KINDS[i.kind].bin === "tub" ? C.paper : C.kraft, 1).fillCircle(mx(i.at[0]), my(i.at[1]), 1.8));
      g.fillStyle(C.gold, 1).fillCircle(mx(this.round.gantry[0]), my(this.round.gantry[1]), 3);
      g.lineStyle(1, C.gold, 0.5).strokeRect(mx(this.cam.x - w / 2 / ppm), my(this.cam.y + h / 2 / ppm), (w / ppm) * s, (h / ppm) * s);
    }
  }

}
