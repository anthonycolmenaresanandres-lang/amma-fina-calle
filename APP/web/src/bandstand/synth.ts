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
// All notes are drawn from one pentatonic scale, so any combination of active
// mascots is automatically consonant.

const PENTA = [0, 3, 5, 7, 10]; // C minor pentatonic (relative semitones)
const ROOT = 48; // C3
const STEPS_PER_BAR = 16; // sixteenth-note grid, one-bar loop

type Hit = { step: number; degree: number; octave: number; vel: number; durSteps: number };

function midiToFreq(m: number): number {
  return 440 * Math.pow(2, (m - 69) / 12);
}

function noteFor(h: Hit): number {
  return ROOT + h.octave * 12 + PENTA[h.degree % PENTA.length];
}

// Per-role one-bar patterns. The engine owns these; skins never touch them.
const PATTERNS: Record<VoiceRole, Hit[]> = {
  kick: [0, 4, 8, 12].map((step) => ({ step, degree: 0, octave: -2, vel: 1, durSteps: 1 })),
  hat: [2, 6, 10, 14].map((step) => ({ step, degree: 0, octave: 0, vel: 0.5, durSteps: 1 })),
  bass: [
    { step: 0, degree: 0, octave: -1, vel: 0.9, durSteps: 3 },
    { step: 6, degree: 2, octave: -1, vel: 0.7, durSteps: 2 },
    { step: 8, degree: 0, octave: -1, vel: 0.9, durSteps: 3 },
    { step: 11, degree: 3, octave: -1, vel: 0.7, durSteps: 2 },
    { step: 14, degree: 2, octave: -1, vel: 0.6, durSteps: 2 },
  ],
  pad: [{ step: 0, degree: 0, octave: 0, vel: 0.5, durSteps: 16 }],
  lead: [
    { step: 0, degree: 4, octave: 1, vel: 0.8, durSteps: 2 },
    { step: 3, degree: 3, octave: 1, vel: 0.7, durSteps: 1 },
    { step: 6, degree: 2, octave: 1, vel: 0.8, durSteps: 2 },
    { step: 8, degree: 3, octave: 1, vel: 0.7, durSteps: 1 },
    { step: 10, degree: 4, octave: 1, vel: 0.9, durSteps: 2 },
    { step: 13, degree: 2, octave: 1, vel: 0.6, durSteps: 2 },
  ],
  arp: [0, 2, 4, 6, 8, 10, 12, 14].map((step, i) => ({
    step,
    degree: [0, 1, 2, 3, 4, 3, 2, 1][i],
    octave: 1,
    vel: 0.5,
    durSteps: 1,
  })),
};

export class Bandstand {
  readonly skin: BandstandSkin;

  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private recDest: MediaStreamAudioDestinationNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private active = new Set<string>();
  private timer: number | null = null;
  private nextNoteTime = 0;
  private currentStep = 0;
  private readonly secPerStep: number;

  // Visual feedback: per-mascot ring buffer of scheduled hit times.
  private hits = new Map<string, number[]>();

  private recorder: MediaRecorder | null = null;
  private recChunks: BlobPart[] = [];

  constructor(skin: BandstandSkin) {
    this.skin = skin;
    this.secPerStep = 60 / skin.bpm / 4;
    for (const m of skin.mascots) this.hits.set(m.id, []);
  }

  // Must be called from a user gesture (autoplay policy).
  async start(): Promise<void> {
    if (this.ctx) return;
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    await ctx.resume();

    const master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);

    const recDest = ctx.createMediaStreamDestination();
    master.connect(recDest);

    // Pre-build a short white-noise buffer for hats.
    const noise = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    this.ctx = ctx;
    this.master = master;
    this.recDest = recDest;
    this.noiseBuffer = noise;

    this.nextNoteTime = ctx.currentTime + 0.1;
    this.currentStep = 0;
    this.timer = window.setInterval(() => this.scheduler(), 25);
  }

  dispose(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    if (this.recorder && this.recorder.state !== "inactive") this.recorder.stop();
    this.recorder = null;
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.recDest = null;
  }

  isRunning(): boolean {
    return this.ctx !== null;
  }

  toggle(id: string): boolean {
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
    const dt = t - best;
    return Math.max(0, Math.exp(-dt * 7));
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
      this.currentStep = (this.currentStep + 1) % STEPS_PER_BAR;
    }
  }

  private scheduleStep(step: number, time: number): void {
    for (const m of this.skin.mascots) {
      if (!this.active.has(m.id)) continue;
      const pattern = PATTERNS[m.role];
      for (const h of pattern) {
        if (h.step !== step) continue;
        this.playRole(m.role, time, h);
        const arr = this.hits.get(m.id);
        if (arr) {
          arr.push(time);
          if (arr.length > 16) arr.shift();
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
        return this.playPad(time, h.durSteps, h.vel);
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

  private playPad(time: number, durSteps: number, vel: number): void {
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
    // Stacked pentatonic chord (root, 5th, octave-ish) — always consonant.
    for (const semi of [PENTA[0], PENTA[2], PENTA[4]]) {
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
