// Minimal WebAudio synth — no asset files. Browsers block audio without a user
// gesture, so the AudioContext is created/resumed lazily on the first call that
// follows a gesture (the sound toggle / a tap). Honors an on/off flag.

let ctx: AudioContext | null = null;

type WebAudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const w = window as WebAudioWindow;
    const Ctor = window.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function blip(freq: number, start: number, dur: number, gain: number, type: OscillatorType = "triangle"): void {
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime + start);
  g.gain.setValueAtTime(0.0001, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + start);
  o.stop(c.currentTime + start + dur + 0.02);
}

/** Rising arpeggio for a conversion ("GOAL!"). */
export function playGoal(): void {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => blip(f, i * 0.08, 0.18, 0.12));
}

/** Short coin tick for a collected payment. */
export function playCoin(): void {
  blip(987.77, 0, 0.08, 0.1, "square");
  blip(1318.5, 0.06, 0.1, 0.08, "square");
}

/** Soft click for a routine pipeline step. */
export function playStep(): void {
  blip(330, 0, 0.06, 0.06, "sine");
}

/** Prime the context inside a user gesture handler. */
export function primeAudio(): void {
  ac();
}
