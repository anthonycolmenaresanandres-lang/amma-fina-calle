# Dual Perspective Newsroom — Reliability Diagnostic (build #1, step 1)

_2026-06-10. Read-only analysis of `New project/.data/cron-responses` (222 files) + `.data/production-cron.log` (377 KB). This is the scoping diagnostic for the audit's BUILD #1 (Newsroom reliability sprint). No code was changed._

## Headline

The **publish path is healthy since the 2026-06-05 fix**; the **catch-up / auto-recovery + alerting layer is the real weak point.** "The Newsroom is unreliable" is a pre-fix story. The remaining risk is that a failed or review-gated run gets **stuck with no alert and no auto-recovery**, so a silent gap can persist for hours.

## Publish-path outcomes (from cron-response files)

| Window | n | Hard-fail (ok=false) | IG published | Non-publish (by design) |
|---|--:|--:|--:|--:|
| **Pre-fix** (< 2026-06-05) | 140 dated | **49%** | 3% | review/skip |
| **Post-fix** (≥ 2026-06-05) | 16 | **0%** | **75% (12/16)** | 4 (all "no eligible job / review-gated") |

Post-fix, **every day 2026-06-05 → 06-10 published ≥1 with zero hard-fails** in the response files. The 4 non-publishes were legitimate "No eligible Instagram job or run requires review" skips — by design, not failures.

_Data caveat: of 222 response files, only 156 carry a parseable date and ~93 carry the current status schema; the rest are older May-11 diagnostic dumps. The post-fix clean window is real but small (16 runs / 6 days) — extend to a 14-day green streak before declaring "hands-off"._

## The actual reliability gap (from the scheduler log — response files miss this)

The `[catchup]` subsystem, not the cycle, is where failures live:

1. **A failed run is not auto-recovered and not alerted.** 2026-06-09 **evening went to state `failed`** and sat there from ~20:10 to 23:50 — catch-up logged `Catch-up skipped for evening; existing state 'failed' requires manual recovery` every 10 minutes all night. Because email is disabled (`email.status = not_configured`, "disabled by operator"), nobody was told. A whole evening slot was silently lost.
2. **The staged catch-up runner is erroring.** 2026-06-10 06:00 and 12:00: `Catch-up failed for {morning,midday}: staged catch-up exited with code 1`. The recovery path itself exits non-zero.
3. **`needs_review` also wedges catch-up.** 2026-06-10 midday correctly produced `NEEDS_REVIEW` (low-confidence source) → `livePublish=skipped`; catch-up then repeats `requires manual recovery` every 10 min. Review-gating is correct, but it parks the window with the same silent-stuck behavior.

## What BUILD #1 should actually fix (scoped)

- **Alerting first:** turn on a real failure alert (the audit's `RESEND_API_KEY` + `email_enabled`) so a `failed`/stuck state pages the operator instead of dying silently. This is the single highest-leverage fix.
- **Fix the staged catch-up exit-1** (read `scripts/run-staged-newsroom-cycle.ts` catch-up path) so recovery doesn't itself fail.
- **Bound the "requires manual recovery" loop** — stop 10-min infinite log spam; after N attempts, alert + back off.
- **Distinguish "no eligible job" (healthy) from "content-supply gap" (problem)** — confirm the 4 no-eligible skips are "nothing newsworthy / all reviewed," not the ingest silently producing zero stories.
- **Then** instrument and run to a clean 14-day green streak before any productization/multi-tenant work.

## Open questions for the build (need a decision / deeper code read)
- Does a `needs_review` run ever get published after manual review, or does the slot just lapse? (Defines whether review-gating costs posts.)
- Is the evening `failed` on 06-09 a one-off (render/Meta API) or a recurring class? Needs the failed run's payload + error.
- Email alerting requires `RESEND_API_KEY` in env — an operator/secret action only Anthony can do.

_Source files: `New project/.data/cron-responses/*.json`, `New project/.data/production-cron.log`. Method: parsed outcome fields by date, split on the 2026-06-05 unblock; cross-checked against the scheduler log, which surfaced the catch-up failures the response files omit._
