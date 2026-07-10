# Operating Model — AMMA / Fina Calle

_Canonical control-plane contract — 2026-07-10._

## Source of truth

- Code and coordination live in `C:\Dev\amma\amma-fina-calle`.
- `main` is production; agents work on branches and never merge or push to `main` without Anthony's approval.
- `OPERATIONS/CODEX_QUEUE.md` is the live Claude → Codex queue.
- `OPERATIONS/HANDOFF_LOG.md` is the live cross-agent check-in/check-out log.
- `OPERATIONS/DATA_CENTER.md` is the location and worktree contract.
- The former Desktop clone is a preserved archive only. Do not write new specs there.

## Lanes

- Claude decides, diagnoses, writes precise queue specs, and reviews results.
- Codex executes the queue in order, updates the handoff log, verifies targeted surfaces, and stops at human gates.
- Clone/bot watches recurring state; it does not change access, secrets, or production.
- Anthony alone enters secrets, grants access, sends/publishes, and approves production shipping.

## Queue protocol

1. Claude writes a self-contained task into the canonical queue with scope, guardrails, and a PASS condition.
2. Codex checks in, executes only the first actionable item, marks it complete, and checks out.
3. If a task depends on secrets, access, sending, deployment, or a stale migration number, Codex stops and records the exact blocker.
4. Claude revalidates any archived Desktop task before re-queuing it.

## Slack coordination

- The Slack connector is for read-only workspace/channel verification and human-reviewed coordination.
- The local `OPERATIONS/notify_slack.py` hook is best-effort only and reads `SLACK_WEBHOOK_URL` from Anthony's environment.
- Missing webhook, parsing failure, or POST failure must never fail a handoff command.
- Codex must not send Slack messages through the connector or handle the webhook secret without Anthony's explicit human action.

## Retired path

`C:\Users\antho\OneDrive\Desktop\AMMA Ventures LLC DBA Fina Calle` remains intact for historical recovery. Its copied control-plane files are under `OPERATIONS/archive/desktop-20260710/` in this repo; its queue is frozen and redirects here.
