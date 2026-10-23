/** Original El Mariachi prospect prototype; independent of the existing frozen games. */
export const ROUND_MS = 30_000;
export const BEAT_MS = 600;
export const FIRST_BEAT_MS = 1_800;
export const HIT_WINDOW_MS = 160;
export const PERFECT_WINDOW_MS = 75;
export const BEAT_COUNT = 47;
export const BEATS = Array.from({ length: BEAT_COUNT }, (_, index) => FIRST_BEAT_MS + index * BEAT_MS);

export type RoundMode = "ready" | "running" | "paused" | "result";
export type Judgement = "perfect" | "good" | "miss";
export type RoundView = {
  mode: RoundMode;
  elapsed: number;
  score: number;
  streak: number;
  bestStreak: number;
  perfect: number;
  good: number;
  misses: number;
  offbeat: number;
  feedback: string;
  feedbackAt: number;
};

export const initialView = (): RoundView => ({
  mode: "ready", elapsed: 0, score: 0, streak: 0, bestStreak: 0,
  perfect: 0, good: 0, misses: 0, offbeat: 0, feedback: "Find your rhythm", feedbackAt: -1000,
});

/** A monotonic active-time clock. Hidden time never advances the round. */
export class MariachiRound {
  private state = initialView();
  private anchor = 0;
  private elapsedBase = 0;
  private lastTap = -Infinity;
  private judged: Array<Judgement | null> = BEATS.map(() => null);

  get mode(): RoundMode { return this.state.mode; }

  elapsed(now: number): number {
    return Math.min(ROUND_MS, this.elapsedBase + (this.mode === "running" ? Math.max(0, now - this.anchor) : 0));
  }

  view(now: number): RoundView { return { ...this.state, elapsed: this.elapsed(now) }; }

  start(now: number): void {
    this.state = { ...initialView(), mode: "running", feedback: "Get ready" };
    this.anchor = now;
    this.elapsedBase = 0;
    this.lastTap = -Infinity;
    this.judged = BEATS.map(() => null);
  }

  pause(now: number): void {
    this.step(now);
    if (this.mode !== "running") return;
    this.elapsedBase = this.elapsed(now);
    this.state.mode = "paused";
  }

  resume(now: number): void {
    if (this.mode !== "paused") return;
    this.anchor = now;
    this.state.mode = "running";
  }

  step(now: number): void {
    if (this.mode !== "running") return;
    const elapsed = this.elapsed(now);
    BEATS.forEach((at, index) => {
      // Equality is hittable: both ends of the published window are inclusive.
      if (this.judged[index] === null && elapsed > at + HIT_WINDOW_MS) {
        this.judged[index] = "miss";
        this.state.misses += 1;
        this.state.streak = 0;
        this.state.feedback = "Next beat";
        this.state.feedbackAt = elapsed;
      }
    });
    if (elapsed >= ROUND_MS) {
      this.elapsedBase = ROUND_MS;
      this.state.mode = "result";
    }
  }

  tap(now: number): void {
    this.step(now);
    if (this.mode !== "running") return;
    const elapsed = this.elapsed(now);
    if (elapsed - this.lastTap < 100) return;
    this.lastTap = elapsed;
    // The count-in is practice: early exploratory taps do not hurt the result.
    if (elapsed < FIRST_BEAT_MS - HIT_WINDOW_MS) return;
    let candidate = -1;
    let distance = HIT_WINDOW_MS + 1;
    BEATS.forEach((at, index) => {
      const delta = Math.abs(at - elapsed);
      if (this.judged[index] === null && delta <= HIT_WINDOW_MS && delta < distance) {
        candidate = index;
        distance = delta;
      }
    });
    this.state.feedbackAt = elapsed;
    if (candidate < 0) {
      this.state.offbeat += 1;
      this.state.streak = 0;
      this.state.feedback = "Follow the ring";
      return;
    }
    const judgement = distance <= PERFECT_WINDOW_MS ? "perfect" : "good";
    this.judged[candidate] = judgement;
    this.state[judgement] += 1;
    this.state.score += judgement === "perfect" ? 100 : 60;
    this.state.streak += 1;
    this.state.bestStreak = Math.max(this.state.bestStreak, this.state.streak);
    this.state.feedback = judgement === "perfect" ? "Perfect!" : "On beat!";
  }
}

export function beatCue(elapsed: number) {
  const index = Math.max(0, Math.ceil((elapsed - FIRST_BEAT_MS - HIT_WINDOW_MS) / BEAT_MS));
  const until = BEATS[index] === undefined ? Infinity : BEATS[index] - elapsed;
  return {
    visible: until <= BEAT_MS && until >= -HIT_WINDOW_MS,
    radius: 90 + Math.max(-HIT_WINDOW_MS, Math.min(BEAT_MS, until)) / BEAT_MS * 84,
    progress: 1 - Math.max(0, Math.min(1, until / BEAT_MS)),
    onBeat: Math.abs(until) <= PERFECT_WINDOW_MS,
  };
}
