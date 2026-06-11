import type { BandstandSkin, VoiceRole } from "./types";

// ---------------------------------------------------------------------------
// Bandstand synth engine
// ---------------------------------------------------------------------------
// Core illusion = everything stays in sync. We use a single AudioContext master
// clock with the classic lookahead scheduler ("A Tale of Two Clocks"): a cheap
// timer wakes up often and schedules any notes falling inside a short window at
// sample-accurate times. Mascots you toggle on/off only affect notes scheduled
// from "now" forward, so adds/removes always land on the grid — never drift.
//
// The loop is TWO bars (call-and-response phrasing + a chord lift in bar 2) for
// musical variety. All notes are drawn from one pentatonic scale, so any
// combination of active mascots is automatically consonant.
//
// Progression: players START with a couple of mascots and EARN the rest by
// keeping the jam going — a "fans" meter fills faster the fuller the band is.
// Unlocks persist to localStorage, so earned characters stay earned.

const PENTA = [0, 3, 5, 7, 10]; // C minor pentatonic (relative semitones)
const ROOT = 48; // C3
const STEPS_PER_BAR = 16; // sixteenth-note grid
const STEPS_PER_LOOP = 32; // two-bar loop

// Unlock thresholds by mascot order. 0 = available from the start.
const UNLOCK_THRESHOLDS = [0, 0, 6, 16, 30, 50];
const FANS_PER_PART_PER_SEC = 0.7;

type Hit = { step: number; degree: number; octave: number; vel: number; durSteps: number };

export type UnlockEvent = { id: string };

function midiToFreq(m: number): number {
  return 440 * Math.pow(2, (m - 69) / 12);
}

function noteFor(h: Hit): number {
  return ROOT + h.octave * 12 + PENTA[((h.degree % PENTA.length) + PENTA.length) % PENTA.length];
}

function tone(step: number, degree: number, octave: number, vel: number, durSteps: number): Hit {
  return { step, degree, octave, vel, durSteps };
}

// Per-role two-bar patterns. The engine owns these; skins never touch them.
const PATTERNS: Record<VoiceRole, Hit[]> = {
  kick: [0, 4, 8, 12, 16, 20, 24, 28, 30].map((step) => tone(step, 0, -2, 1, 1)),
  hat: [2, 6, 10, 14, 18, 22, 26, 29, 30, 31].map((step) => tone(step, 0, 0, 0.5, 1)),
  bass: [
    tone(0, 0, -1, 0.9, 3),
    tone(6, 2, -1, 0.7, 2),
    tone(8, 0, -1, 0.9, 3),
    tone(11, 3, -1, 0.7, 2),
    tone(14, 2, -1, 0.6, 2),
    tone(16, 0, -1, 0.9, 3),
    tone(22, 4, -1, 0.7, 2),
    tone(24, 2, -1, 0.9, 3),
    tone(27, 1, -1, 0.7, 2),
    tone(30, 0, -1, 0.6, 2),
  ],
  // Pad: bar 1 root chord, bar 2 lifts up a step (degree picked in playPad).
  pad: [tone(0, 0, 0, 0.5, 16), tone(16, 0, 0, 0.5, 16)],
  lead: [
    // bar 1 — question
    tone(0, 4, 1, 0.8, 2),
    tone(3, 3, 1, 0.7, 1),
    tone(6, 2, 1, 0.8, 2),
    tone(10, 3, 1, 0.7, 1),
    tone(13, 4, 1, 0.8, 2),
    // bar 2 — answer, resolves down to root
    tone(16, 4, 1, 0.8, 2),
    tone(19, 3, 1, 0.7, 1),
    tone(22, 2, 1, 0.8, 2),
    tone(24, 1, 1, 0.7, 1),
    tone(28, 0, 1, 0.9, 3),
  ],
  arp: [
    ...[0, 2, 4, 6, 8, 10, 12, 14].map((step, i) => tone(step, [0, 1, 2, 3, 4, 3, 2, 1][i], 1, 0.5, 1)),
    ...[16, 18, 20, 22, 24, 26, 28, 30].map((step, i) => tone(step, [4, 3, 2, 1, 0, 1, 2, 3][i], 1, 0.5, 1)),
  ],
};

type SavedState = { fans: number; unlocked: string[] };

export class Bandstand {
  readonly skin: BandstandSkin;

  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private recDest: MediaStreamAudioDestinationNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private active = new Set<string>();
  private unlocked = new Set<string>();
  private timer: number | null = null;
  private nextNoteTime = 0;
  private currentStep = 0;
  private readonly secPerStep: number;

  private fans = 0;
  private lastUpdate = 0;
  private lastSave = 0;

  // Visual feedback: per-mascot ring buffer of scheduled hit times.
  private hits = new Map<string, number[]>();

  private recorder: MediaRecorder | null = null;
  private recChunks: BlobPart[] = [];

  constructor(skin: BandstandSkin) {
    this.skin = skin;
    this.secPerStep = 60 / skin.bpm / 4;
    for (const m of skin.mascots) this.hits.set(m.id, []);
    this.loadState();
  }

  private storageKey(): string {
    return `bandstand:${this.skin.id}`;
  }

  private loadState(): void {
    let saved: SavedState | null = null;
    try {
      const raw = typeof localStorage !== "undefined" ? localStorage.getItem(this.storageKey()) : null;
      if (raw) saved = JSON.parse(raw) as SavedState;
    } catch {
      saved = null;
    }
    if (saved) {
      this.fans = saved.fans ?? 0;
      for (const id of saved.unlocked ?? []) {
        if (this.skin.mascots.some((m) => m.id === id)) this.unlocked.add(id);
      }
    }
    // Always guarantee the starter mascots are unlocked.
    this.skin.mascots.forEach((m, i) => {
      if ((UNLOCK_THRESHOLDS[i] ?? 0) === 0) this.unlocked.add(m.id);
    });
  }

  private saveState(): void {
    try {
      if (typeof localStorage === "undefined") return;
      const data: SavedState = { fans: this.fans, unlocked: [...this.unlocked] };
      localStorage.setItem(this.storageKey(), JSON.stringify(data));
    } catch {
      // ignore (private mode / quota)
    }
  }

  // Must be called from a user gesture (autoplay policy).
  async start(): Promise<void> {
    if (this.ctx) return;
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    await ctx.resume();

    const master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);

    const recDest = ctx.createMediaStreamDestination();
    master.connect(recDest);

    const noise = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    this.ctx = ctx;
    this.master = master;
    this.recDest = recDest;
    this.noiseBuffer = noise;

    this.nextNoteTime = ctx.currentTime + 0.1;
    this.currentStep = 0;
    this.lastUpdate = ctx.currentTime;
    this.lastSave = ctx.currentTime;
    this.timer = window.setInterval(() => this.scheduler(), 25);
  }

  dispose(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    if (this.recorder && this.recorder.state !== "inactive") this.recorder.stop();
    this.recorder = null;
    this.saveState();
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.recDest = null;
  }

  isRunning(): boolean {
    return this.ctx !== null;
  }

  // ---- progression ------------------------------------------------------
  isUnlocked(id: string): boolean {
    return this.unlocked.has(id);
  }

  getFans(): number {
    return Math.floor(this.fans);
  }

  // The next mascot to earn + progress toward it (null when the band is full).
  // `from` is the previous threshold so the meter fills segment-by-segment.
  nextUnlock(): { id: string; name: string; have: number; need: number; from: number } | null {
    for (let i = 0; i < this.skin.mascots.length; i++) {
      const m = this.skin.mascots[i];
      if (this.unlocked.has(m.id)) continue;
      return {
        id: m.id,
        name: m.name,
        have: Math.floor(this.fans),
        need: UNLOCK_THRESHOLDS[i] ?? 999,
        from: UNLOCK_THRESHOLDS[i - 1] ?? 0,
      };
    }
    return null;
  }

  // Integrate fans from active parts; unlock the next mascot when earned.
  // Called once per animation frame. Returns an unlock event when one fires.
  update(): UnlockEvent | null {
    const ctx = this.ctx;
    if (!ctx) return null;
    const now = ctx.currentTime;
    const dt = Math.max(0, now - this.lastUpdate);
    this.lastUpdate = now;

    let activeCount = 0;
    for (const id of this.active) if (this.unlocked.has(id)) activeCount++;
    this.fans += dt * activeCount * FANS_PER_PART_PER_SEC;

    let event: UnlockEvent | null = null;
    const next = this.firstLockedIndex();
    if (next >= 0 && this.fans >= (UNLOCK_THRESHOLDS[next] ?? Infinity)) {
      const m = this.skin.mascots[next];
      this.unlocked.add(m.id);
      this.saveState();
      event = { id: m.id };
    }

    if (now - this.lastSave > 4) {
      this.lastSave = now;
      this.saveState();
    }
    return event;
  }

  private firstLockedIndex(): number {
    for (let i = 0; i < this.skin.mascots.length; i++) {
      if (!this.unlocked.has(this.skin.mascots[i].id)) return i;
    }
    return -1;
  }

  // ---- play control -----------------------------------------------------
  toggle(id: string): boolean {
    if (!this.unlocked.has(id)) return false; // locked mascots can't play yet
    if (this.active.has(id)) {
      this.active.delete(id);
      return false;
    }
    this.active.add(id);
    return true;
  }

  isActive(id: string): boolean {
    return this.active.has(id);
  }

  now(): number {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  // 0 = idle, peaks ~1 right after a hit, decays — drives the bob/sing visual.
  getBob(id: string): number {
    const ctx = this.ctx;
    const arr = this.hits.get(id);
    if (!ctx || !arr || arr.length === 0) return 0;
    const t = ctx.currentTime;
    let best = -Infinity;
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i] <= t && arr[i] > best) best = arr[i];
    }
    if (best === -Infinity) return 0;
    return Math.max(0, Math.exp(-(t - best) * 7));
  }

  // Progress through the current bar (0..1), for an on-beat pulse line.
  barPhase(): number {
    if (!this.ctx) return 0;
    const loopSec = this.secPerStep * STEPS_PER_BAR;
    return ((this.ctx.currentTime % loopSec) / loopSec + 1) % 1;
  }

  // ---- scheduler --------------------------------------------------------
  private scheduler(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const aheadTo = ctx.currentTime + 0.1;
    while (this.nextNoteTime < aheadTo) {
      this.scheduleStep(this.currentStep, this.nextNoteTime);
      this.nextNoteTime += this.secPerStep;
      this.currentStep = (this.currentStep + 1) % STEPS_PER_LOOP;
    }
  }

  private scheduleStep(step: number, time: number): void {
    for (const m of this.skin.mascots) {
      if (!this.active.has(m.id) || !this.unlocked.has(m.id)) continue;
      const pattern = PATTERNS[m.role];
      for (const h of pattern) {
        if (h.step !== step) continue;
        this.playRole(m.role, time, h);
        const arr = this.hits.get(m.id);
        if (arr) {
          arr.push(time);
          if (arr.length > 8) arr.shift();
        }
      }
    }
  }

  // ---- synthesis --------------------------------------------------------
  private playRole(role: VoiceRole, time: number, h: Hit): void {
    switch (role) {
      case "kick":
        return this.playKick(time, h.vel);
      case "hat":
        return this.playHat(time, h.vel);
      case "bass":
        return this.playTone(time, noteFor(h), h.durSteps, h.vel, "triangle", 600, 0.012);
      case "pad":
        return this.playPad(time, h.durSteps, h.vel, h.step >= STEPS_PER_BAR);
      case "lead":
        return this.playTone(time, noteFor(h), h.durSteps, h.vel, "square", 2400, 0.006);
      case "arp":
        return this.playBell(time, noteFor(h), h.vel);
    }
  }

  private dur(steps: number): number {
    return steps * this.secPerStep;
  }

  private playKick(time: number, vel: number): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(130, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(0.95 * vel, time + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);
    osc.connect(g).connect(this.master!);
    osc.start(time);
    osc.stop(time + 0.24);
  }

  private playHat(time: number, vel: number): void {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(0.25 * vel, time + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
    src.connect(hp).connect(g).connect(this.master!);
    src.start(time);
    src.stop(time + 0.06);
  }

  private playTone(
    time: number,
    midi: number,
    durSteps: number,
    vel: number,
    type: OscillatorType,
    cutoff: number,
    attack: number,
  ): void {
    const ctx = this.ctx!;
    const d = this.dur(durSteps);
    const osc = ctx.createOscillator();
    const lp = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = midiToFreq(midi);
    lp.type = "lowpass";
    lp.frequency.value = cutoff;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(0.32 * vel, time + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, time + d * 0.95);
    osc.connect(lp).connect(g).connect(this.master!);
    osc.start(time);
    osc.stop(time + d);
  }

  private playPad(time: number, durSteps: number, vel: number, lift: boolean): void {
    const ctx = this.ctx!;
    const d = this.dur(durSteps);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(0.16 * vel, time + 0.3);
    g.gain.setValueAtTime(0.16 * vel, time + d - 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, time + d);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1400;
    g.connect(lp).connect(this.master!);
    // bar 1 = root stack, bar 2 = lift to the 4th-ish — both stay consonant.
    const chord = lift ? [PENTA[2], PENTA[4], 12] : [PENTA[0], PENTA[2], PENTA[4]];
    for (const semi of chord) {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = midiToFreq(ROOT + semi);
      osc.connect(g);
      osc.start(time);
      osc.stop(time + d);
    }
  }

  private playBell(time: number, midi: number, vel: number): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = midiToFreq(midi);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(0.22 * vel, time + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.35);
    osc.connect(g).connect(this.master!);
    osc.start(time);
    osc.stop(time + 0.4);
  }

  // ---- recording (the shareable hook) -----------------------------------
  canRecord(): boolean {
    return typeof MediaRecorder !== "undefined" && this.recDest !== null;
  }

  startRecording(): boolean {
    if (!this.recDest || !this.canRecord() || this.recorder) return false;
    this.recChunks = [];
    const rec = new MediaRecorder(this.recDest.stream);
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) this.recChunks.push(e.data);
    };
    rec.start();
    this.recorder = rec;
    return true;
  }

  stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      const rec = this.recorder;
      if (!rec) return resolve(null);
      rec.onstop = () => {
        const blob = new Blob(this.recChunks, { type: rec.mimeType || "audio/webm" });
        this.recorder = null;
        resolve(blob);
      };
      rec.stop();
    });
  }

  isRecording(): boolean {
    return this.recorder !== null && this.recorder.state === "recording";
  }
}
