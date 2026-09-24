/** Short synthesized catch cues: no downloads, background music or queued sounds. */
export class BodegaCatchAudio {
  private context?: AudioContext;
  private master?: GainNode;
  private voices = new Set<OscillatorNode>();
  private muted = false;

  /** Call directly from Start/Resume/Unmute or a play-area gesture for iOS. */
  unlock(): void {
    if (this.muted) return;
    try {
      const Audio = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Audio) return;
      if (!this.context) {
        this.context = new Audio();
        this.master = this.context.createGain();
        this.master.gain.value = 0.14;
        this.master.connect(this.context.destination);
      }
      // Resume even while a preceding suspend is pending (Replay/Resume on Safari).
      void this.context.resume().catch(() => {});
    } catch { /* Unsupported/blocked audio never blocks play. */ }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master && this.context) this.master.gain.setValueAtTime(muted ? 0 : 0.14, this.context.currentTime);
    if (muted) this.pause();
    else this.unlock();
  }

  play(itemId: string): void {
    const ctx = this.context;
    if (this.muted || !ctx || ctx.state !== "running" || !this.master) return;
    // Bound rapid multitouch so cues stay quiet and don't build up.
    this.stopVoices();
    const tones: Array<[number, number, number, OscillatorType, number]> = itemId === "spanish"
      ? [[660, 880, 0.14, "sine", 0], [880, 880, 0.12, "sine", 0.055]]
      : itemId === "green" ? [[850, 360, 0.11, "sine", 0]]
      : itemId === "bites" ? [[1250, 700, 0.07, "triangle", 0]]
      : [[160, 95, 0.09, "sine", 0]];
    for (const [from, to, duration, type, delay] of tones) {
      const oscillator = ctx.createOscillator();
      const envelope = ctx.createGain();
      const start = ctx.currentTime + delay;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(from, start);
      oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
      envelope.gain.setValueAtTime(0, start);
      envelope.gain.linearRampToValueAtTime(0.5, start + 0.005);
      envelope.gain.exponentialRampToValueAtTime(0.001, start + duration);
      oscillator.connect(envelope);
      envelope.connect(this.master);
      this.voices.add(oscillator);
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); this.voices.delete(oscillator); };
      oscillator.start(start);
      oscillator.stop(start + duration + 0.01);
    }
  }

  private stopVoices(): void {
    this.voices.forEach((voice) => { try { voice.stop(); } catch {} });
    this.voices.clear();
  }

  pause(): void {
    this.stopVoices();
    if (this.context?.state === "running") void this.context.suspend().catch(() => {});
  }

  dispose(): void {
    this.stopVoices();
    if (this.context && this.context.state !== "closed") void this.context.close().catch(() => {});
    this.context = undefined;
    this.master = undefined;
  }
}
