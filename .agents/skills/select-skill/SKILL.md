---
name: select-skill
description: Deterministically select the best installed skill for a request, with confidence, alternates, and independent approval-risk flags. Use when the correct skill is unclear, the request spans several domains, the active model is Claude Haiku-class or another small/less-capable model, or reliable routing must not depend on broad inference.
---

# Select Skill

Choose one primary workflow with the smallest possible reasoning burden. Never treat skill selection as authorization to act.

## Selection contract

Follow these steps in order. Do not skip or reorder them.

1. **Honor an explicit skill.** If the user names an installed skill, select it. Read its complete `SKILL.md` before acting.
2. **Skip unnecessary routing.** If the request is a simple one-step answer or command and no specific skill applies, proceed without a skill.
3. **Rank uncertain matches.** Run:

   ```powershell
   python scripts/select_skill.py --query "<exact user request>" --json
   ```

   From another directory, use the absolute path to this skill's script.
4. **Apply the confidence rule.**
   - `high`: select `primary`.
   - `medium`: compare only `primary` and the first alternate; select the one whose description matches the requested artifact and action more exactly.
   - `low` or `no_match`: use `skill-router` for a multi-domain request. Ask one concise question only when the available choices would materially change the result and safe read-only inspection cannot resolve it.

## Tie-break order

When two skills remain tied, choose in this order:

1. Exact file or artifact skill, such as PDF, spreadsheet, document, presentation, image, or video.
2. Exact provider or framework skill, such as Gmail, GitHub, Vercel, Phaser, or Remotion.
3. Exact action skill, such as deploy, render, audit, troubleshoot, or create.
4. Narrow domain skill.
5. Broad router.

## Multi-skill limit

Use one primary skill by default. Add at most one secondary skill, and only when it has a distinct role:

- primary skill produces the result;
- secondary skill verifies, publishes, or handles a required file format.

State the order before using both. Never load several candidate skills "just in case."

## Safety gate

Read `approval_gates` from the script output independently of skill confidence. Stop for the existing approval rule whenever the request involves publishing, sending, deploying, merging, spending, secrets, access, destructive actions, or production. A high-confidence skill match never overrides a gate.

## Script fallback

If Python or the catalog is unavailable, extract exactly four fields from the request:

- `action`: create, edit, analyze, verify, publish, diagnose, or manage;
- `artifact`: the file, UI, message, dataset, video, game, or system;
- `provider`: the named app, framework, or service;
- `risk`: external write, money, secrets, access, destructive action, or production.

Match provider first, then artifact, then action. Use the risk field only to stop or request approval, never to choose a more permissive skill.
