// Voice-only privacy controls. Defaults preserve existing tenants' behavior.
// These govern this gateway, not provider HTTP/telephony/model logging.
import { createHmac, randomBytes } from "node:crypto";

export interface VoicePrivacy {
  retainCallerId?: boolean;
  missedCallFollowup?: boolean;
}

export function retainedCallerId(fromPhone: string | undefined, privacy?: VoicePrivacy): string | undefined {
  return privacy?.retainCallerId === false ? undefined : fromPhone;
}

/** Process-local keyed pseudonyms only; no phone or pseudonym is written to disk.
 * Expire admitted timestamps on a sliding window and reclaim idle keys on a timer.
 * When capacity is exhausted, reject new keys rather than evicting active counters.
 */
export class PrivateCallerLimiter {
  readonly #secret = randomBytes(32);
  readonly #entries = new Map<string, number[]>();
  readonly #windowMs: number;
  readonly #maxKeys: number;
  readonly #now: () => number;
  readonly #timer?: ReturnType<typeof setInterval>;

  constructor(options: { windowMs?: number; maxKeys?: number; now?: () => number; sweepIntervalMs?: number } = {}) {
    this.#windowMs = options.windowMs ?? 3_600_000;
    this.#maxKeys = options.maxKeys ?? 4096;
    this.#now = options.now ?? Date.now;
    const interval = options.sweepIntervalMs ?? 60_000;
    if (interval > 0) {
      this.#timer = setInterval(() => this.prune(), interval);
      this.#timer.unref();
    }
  }

  get keyCount(): number { return this.#entries.size; }

  prune(): void {
    const cutoff = this.#now() - this.#windowMs;
    for (const [key, times] of this.#entries) {
      const recent = times.filter(time => time > cutoff);
      if (recent.length) this.#entries.set(key, recent); else this.#entries.delete(key);
    }
  }

  allow(tenantId: string, caller: string, limit: number): boolean {
    if (!caller || limit <= 0) return true;
    this.prune();
    const normalized = caller.replace(/\D/g, "") || caller.trim();
    const key = createHmac("sha256", this.#secret).update(tenantId + "\0" + normalized).digest("hex");
    const recent = this.#entries.get(key);
    if (recent && recent.length >= limit) return false;
    if (!recent && this.#entries.size >= this.#maxKeys) return false;
    this.#entries.set(key, [...(recent ?? []), this.#now()]);
    return true;
  }

  close(): void { if (this.#timer) clearInterval(this.#timer); }
}
