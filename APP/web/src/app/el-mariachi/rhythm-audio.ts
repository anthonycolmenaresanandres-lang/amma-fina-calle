/** Original synthesized plucks and percussion. No recordings or third-party music. */
export class MariachiAudio {
  private context?: AudioContext;
  private master?: GainNode;
  private voices = new Set<OscillatorNode>();
  private active = false;
  private disposed = false;
  private revision = 0;

  /** Must be invoked directly from a Start, Resume or Sound gesture. */
  unlock(): void {
    if (this.disposed) return;
    this.active = true;
    const revision = ++this.revision;
    try {
      const Audio = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Audio) return;
      if (!this.context) {
        this.context = new Audio();
        this.master = this.context.createGain();
        this.master.gain.value = 0;
        this.master.connect(this.context.destination);
      }
      const context = this.context;
      void context.resume().then(() => {
        if (this.active && !this.disposed && revision === this.revision) {
          this.master?.gain.setValueAtTime(0.16, context.currentTime);
        }
      }).catch(() => {});
    } catch { /* Visual timing remains available when audio is unsupported. */ }
  }

  scheduleBeat(index: number, delayMs: number): boolean {
    const context = this.context;
    if (!this.active || !context || context.state !== "running" || !this.master) return false;
    const start = context.currentTime + Math.max(0, delayMs) / 1000;
    // Three-beat accents, original short chord voicings, and a quiet woodblock pulse.
    const chord = Math.floor(index / 6) % 2 === 0 ? [220, 277.18, 329.63] : [196, 246.94, 293.66];
    if (index % 3 === 0) {
      chord.forEach((frequency, voice) => this.tone(frequency, frequency, start + voice * 0.008, 0.2, 0.2, "triangle"));
      this.tone(120, 65, start, 0.11, 0.45, "sine");
    } else {
      this.tone(chord[index % 3] * 2, chord[index % 3] * 2, start, 0.12, 0.3, "triangle");
    }
    this.tone(1450, 800, start, 0.035, 0.13, "sine");
    return true;
  }

  private tone(from: number, to: number, start: number, duration: number, level: number, type: OscillatorType): void {
    const context = this.context;
    if (!context || !this.master) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, start);
    oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(level, start + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    this.voices.add(oscillator);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
      this.voices.delete(oscillator);
    };
    oscillator.start(start);
    oscillator.stop(start + duration + 0.01);
  }

  pause(): void {
    this.active = false;
    this.revision += 1;
    if (this.context && this.master) this.master.gain.setValueAtTime(0, this.context.currentTime);
    this.voices.forEach(voice => { try { voice.stop(); } catch {} });
    this.voices.clear();
    if (this.context && this.context.state !== "closed") void this.context.suspend().catch(() => {});
  }

  dispose(): void {
    this.pause();
    this.disposed = true;
    if (this.context && this.context.state !== "closed") void this.context.close().catch(() => {});
    this.context = undefined;
    this.master = undefined;
  }
}
