# Fina Calle — Ops Automation Progress

Status record for the autonomous watchdog / automation initiative.
Owner: Anthony. Last updated: 2026-06-05.

## Guardrail philosophy (applies to every watchdog)
- One check, one decision, one log line per run.
- Try each action AT MOST once. Never retry, escalate, or improvise.
- If stuck/ambiguous: do nothing, write a "Report to Anthony" note with raw output. No inference.
- Edit no source files; only append to protocol logs.

## Shipped (token-optimized v2)
| Item | Detail |
|---|---|
| Clone watchdog | **PowerShell script + Windows Task Scheduler**, hourly. ZERO model tokens. |
| Script | `C:\Users\antho\fina-calle-ops\watchdog.ps1` (kept outside the repo so it never dirties the tree) |
| Win task | `FinaCalleCloneWatchdog` (manage via Task Scheduler) |
| Monitors | This repo (origin: amma-fina-calle) |
| Behavior | Clean + ahead + idle >90min -> push once; dirty/recent -> wait; ambiguous -> write `NEEDS_CLAUDE.flag` |
| Run log | `HANDOFFS/watchdog_log.md` (append-only) |
| Claude only when | `C:\Users\antho\fina-calle-ops\NEEDS_CLAUDE.flag` exists (rare exceptions) |

Retired: the hourly *cloud LLM* task `fina-calle-clone-watchdog` (deleted) — it burned tokens 24x/day to usually do nothing.

## Why v2 is better
- Zero tokens on the deterministic path; model only invoked for genuine judgment.
- OS-level: runs even when the Claude app is closed.
- Ignores deliberately-untracked folders via `--untracked-files=no` (won't false-trigger).

## Known limits
- The script auto-pushes committed-but-idle work. If a commit should stay local, push/hold it before it ages past 90 min.
- Windows Task Scheduler runs the script under your user; no extra approval needed for `git push`.

## Next planned (priority order)
1. Pre-approve git push for the watchdog.
2. Scheduler heartbeat (every 15-30 min) — addresses known scheduler reliability gap.
3. Production URL freshness check — detects the stale-bytes bug.
4. Git hygiene sweep (daily) + morning operations brief.

## Skills roadmap
See companion note: `HANDOFFS/SKILLS_ROADMAP.md`.
