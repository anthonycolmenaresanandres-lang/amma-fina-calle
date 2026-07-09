# Operating Model â€” AMMA / Fina Calle (how we run)

_Set 2026-06-08. The one-page operating system for our multi-agent work. Scales to new projects._

> ## Constitution
> **Claude decides. Codex executes. Clone watches. Anthony approves irreversible actions.**

## The three agents (lanes)

| Lane | **Claude** (strategy + visual + brain) | **Codex** (pure coding) | **Clone / bot** (automation) |
|---|---|---|---|
| Owns | Decisions, architecture, diagnosis, review; **visual & asset production**; client-facing artifacts; project memory; **writing Codex's prompts** | Implementing specs on the machine; builds; local file ops; publish-prep | Recurring jobs: watchdogs, scheduled checks, publish pipeline, notifications |
| Default | The brain + the designer. Hands Codex specs for grunt work; codes directly only for small/strategic/visual/diagnosis | Executes the queue in `CODEX_QUEUE.md` | Runs unattended on schedule |
| Fallback | Does more hands-on coding **only when Codex is out of tokens/down** | â€” | â€” |

## Handoff protocol
1. **Claude** diagnoses â†’ decides â†’ writes a precise, self-contained Codex prompt into `OPERATIONS/CODEX_QUEUE.md` (paths, IDs, guardrails, acceptance check).
2. **Codex** picks up the queue, executes, reports back; marks items done.
3. **Clone/bot** automates anything repeatable so neither of us has to babysit it.
4. **Anthony** does only the human-gated steps (secrets, approvals, access, publish) â€” see below.

## Source-of-truth map (where things live)
- **Code:** GitHub `anthonycolmenaresanandres-lang/amma-fina-calle`, app in `APP/web`. Canonical local clone = C:\dev\amma\amma-fina-calle (the data center - see OPERATIONS/DATA_CENTER.md). Never work on OneDrive-synced copies. `main` = production.
- **Prod app:** Vercel project `amma-fina-calle` â†’ `finacalleos.com`. Deploys on push to `main`.
- **Database/auth/storage:** Supabase project `colattao-owner-requests` (ref `eipypwifiorzqopindfl`). Migrations in `APP/web/supabase/migrations`, **applied manually** in the SQL editor (next number = **0009**).
- **Secrets:** Vercel env vars + Supabase dashboard (SMTP). Never in the repo. Only Anthony enters them.
- **Project intelligence / durable context:** Claude's memory (loaded every session).
- **Ops docs:** this `OPERATIONS/` folder. Product plans: `PRODUCT_MODULES/`.

## Token / resource discipline (we watch usage)
- Biggest cost = **browser/computer-use screenshots**. Prefer CLI/MCP/text; drive the browser only when there's no other path.
- Lean on memory instead of re-reading. Tight replies. Batch tool calls. No subagents unless asked.
- **A restart is a win:** checkpoint to memory + leave a clean Codex queue, then let the session restart (reloads cheap memory vs a bloated context).

## What ONLY Anthony can do (explicit â€” agents will never do these)
- Enter or handle **secrets / API keys** (Resend, OpenAI, Stripe, etc.).
- **Grant or change access control** (admin allowlists, sharing, permissions).
- **Publish / email / send / purchase / accept terms.**
- **Approve shipping to production** when an agent flags a held decision.
> Agents prep everything up to these lines, then hand Anthony exact click-by-click steps.

## New-project intake (repeatable, as we add projects)
1. Create a folder by client/project name.
2. Separate: references Â· logos Â· menus Â· brand notes Â· QR assets Â· web copy Â· game/package ideas.
3. From minimal info, Claude drafts: client profile â†’ menu structure â†’ brand direction â†’ QR menu/sign package â†’ website starter â†’ next-step checklist (Draft 1).
4. Anything that needs code â†’ Codex prompt in `CODEX_QUEUE.md`. Anything repeatable â†’ clone/bot.

## Automation status (what's hands-off vs next)
- **Live:** clone-repo watchdog (cloud schedule); Vercel auto-deploy on `main`; owner self-service menu edits (audited rail); request inbox at `/customers/requests`.
- **One step from automatic:** request â†’ **email notification** (needs `RESEND_API_KEY` in Vercel; 2 of 3 vars set â€” see Anthony action list).
- **Next automations to consider** (when resources grow): deploy health-check watchdog, nightly Supabase backup check, "new request" push (email/Telegram), seasonal-menu autopilot (`SEASONAL_CHANGE_CYCLE_PLAYBOOK.md`).

