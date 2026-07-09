// SoundGate — the local, synchronous turn-taking referee between the phone audio and the
// AI brain (concept: PRODUCT_MODULES/FINA_CALLE_SOUNDGATE_CONCEPT.md). It runs IN-PROCESS
// on every turn signal — never an LLM round-trip — so it can never add conversational
// latency. This first slice is barge-in debounce: hold the floor through transient noise
// and short backchannels, and only YIELD to *sustained* directed speech. Energy /
// confidence / noise-label inputs are deliberate extension points for Phase 3.

export interface SoundGateConfig {
  /** Sustained speech (ms) required before the agent yields the floor on a barge-in.
   *  `0` = yield instantly (legacy behavior). Raise for noisy venues so a blender/clink/
   *  cough — or a one-word backchannel like "mm-hm" — doesn't kill the agent's turn. */
  bargeInMinMs: number;
}

export type FloorAction = "hold" | "yield";

/** Pure policy: did contiguous directed speech last long enough to take the floor? */
export function bargeInDecision(sustainedSpeechMs: number, cfg: SoundGateConfig): FloorAction {
  return sustainedSpeechMs >= Math.max(0, cfg.bargeInMinMs) ? "yield" : "hold";
}

/** A tiny time-injected state machine for one call. The transport (realtime.ts) feeds it
 *  VAD edges with timestamps and schedules the re-check; SoundGate owns the *decision*.
 *  Time is passed in (never read from the clock here) so the logic is deterministically
 *  testable without timers or a live call. */
export class BargeInGate {
  private speaking = false;
  private startedAt = 0;

  constructor(private readonly cfg: SoundGateConfig) {}

  /** Caller speech began (VAD `speech_started`). `yieldNow` is true only when there's no
   *  debounce (minMs<=0); otherwise the caller re-checks via `evaluate` after `delayMs`. */
  onSpeechStarted(nowMs: number): { yieldNow: boolean; delayMs: number } {
    this.speaking = true;
    this.startedAt = nowMs;
    const delayMs = Math.max(0, this.cfg.bargeInMinMs);
    return { yieldNow: delayMs === 0, delayMs };
  }

  /** Caller speech stopped before it was sustained — a transient. Cancels the pending
   *  barge-in so the agent keeps its turn. */
  onSpeechStopped(): void {
    this.speaking = false;
    this.startedAt = 0;
  }

  /** Re-check when the debounce window elapses: YIELD only if speech has been continuous
   *  since it started and has now lasted at least `bargeInMinMs`. */
  evaluate(nowMs: number): FloorAction {
    if (!this.speaking) return "hold";
    return bargeInDecision(nowMs - this.startedAt, this.cfg);
  }

  get pending(): boolean { return this.speaking; }

  reset(): void { this.speaking = false; this.startedAt = 0; }
}
