# Claude coordination instructions

Use this checklist for every AMMA / Fina Calle handoff.

## Start here

Open Claude in `C:\Dev\amma\amma-fina-calle`, then read:

1. `AGENTS.md`
2. `OPERATIONS/DATA_CENTER.md`
3. `OPERATIONS/OPERATING_MODEL.md`
4. `OPERATIONS/CODEX_QUEUE.md`
5. `OPERATIONS/HANDOFF_LOG.md`

Run:

```powershell
git status --short --branch
```

Stop if the branch, queue, or log contradicts the requested work. Do not work from the Desktop clone or the unrelated `Documents\clone` checkout.

## Write a Codex task

- Append only to `C:\Dev\amma\amma-fina-calle\OPERATIONS\CODEX_QUEUE.md`.
- Use the five fields: Codex effort, Scope, Token-saving rule, Why, Exact prompt to paste.
- Include exact paths, exclusions, a PASS condition, and a human-only stop condition.
- Revalidate archived tasks against the current branch, proposed migration filename, and applied production state; never copy them back wholesale.
- Tell Anthony the task number and exact path. Codex picks the first `READY` item; if Anthony starts a separate Codex session, tell him to start it in the canonical clone and say `work the first READY queue item`.

## Handoff log discipline

- Add a newest-first `CHECK-IN` before work.
- Add a matching `CHECK-OUT` with Did, State now, Next / handoff to, and Blocked on Anthony.
- Update the canonical log before invoking a close hook.
- Invoke exactly one root close hook from the canonical repo:

```powershell
python handoff.py done "<short result>"
```

The root hook is the notifier trigger. Do not run both root and app hooks for one handoff.

## Slack boundary

- Once installed and Anthony-authorized, the Slack connector may read the AMMA Ops workspace and verify a channel.
- Do not send messages, create channels, invite users, or read/print webhook values.
- The local hook is best-effort and reads `SLACK_WEBHOOK_URL` from Anthony's process environment.
- `.env.example` is documentation only; it does not activate Slack.
- Anthony sets the webhook and visually confirms the test message.
