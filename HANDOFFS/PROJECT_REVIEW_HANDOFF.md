# Project Review — Handoff & "what I need to proceed"

How to get Claude examining **every** AMMA-adjacent project, and exactly what each
review needs. Pairs with `BUSINESS/PROJECT_PORTFOLIO_TRIAGE.md` (moves) and
`HANDOFFS/LOCAL_CODE_INVENTORY.md` (full inventory).

## The constraint (read first)
A cloud Claude **session is scoped to ONE repo**. The current session is locked to
`amma-fina-calle`, so it **cannot read other repos**. To review another project,
**open a Claude Code session on that repo** (claude.ai/code → select the repo) — or
add that repo to the environment's allowed list (a session/env setting). Local-only
repos must be **pushed to GitHub first** (one repo each).

## Order of attack
1. **VBFH Media Engine** (push → review → productize). 2. Newsroom. 3. Colattao Rush.
Core cleanup (retire stale clones, ship Landing, salvage scraps) runs in parallel.

## What I need to review ANY repo
- It's on **GitHub** + a Claude session opened on it (or added to scope).
- **README** + the file tree; **entry points** (run/build/test scripts).
- **Env var NAMES only** (never values) — e.g. `OPENAI_API_KEY`, `SMTP_*` — so I know
  the integrations without touching secrets.
- One line on **who the customer is** and **what "done/sellable" means** for it.

## Per-project specifics

### VBFH Media Engine ⭐ (first)
Repo: push to `vbfh-media-engine` (private). To productize, tell me:
- **Customer:** just Virginia Beach Field House, or sell to **other facilities/leagues**? (multi-tenant or not)
- **Data source:** DaySmart/Dash — public pages only, or any login/API key? Terms-of-use constraints on scraping?
- **Outputs in use today:** which of {recap images, captions, PPTX, email} are live vs WIP? Where do they post (email? Instagram? a screen at the venue)?
- **Branding:** is there a VBFH brand kit (logo/colors/fonts) the images use? where?
- **Scheduling:** how is `daily:run` triggered today (cron? manual? the Windows scheduler script)?
- **Env var names** (SMTP, OpenAI, any DaySmart creds) — names only.
Then I'll review the code + write the productization spec (multi-tenant config, branding
pack, hosted scheduler, go-live) and start building, like the voice gateway.

### Newsroom (Dual Perspective)
Repo: `newsroom-agent` (already on GitHub). Decide: **standalone product** vs **Fina
Calle content-engine module**. I need: the publish flow's current state, which channels
are wired (IG/X), the review-gate logic, and env var names. Brand/misinformation risk
is the main thing to design around.

### Colattao Cafe Rush
Repo: `colattao-cafe-rush` (on GitHub). I need: is it live for Colattao? what's reusable
for the OS game library vs Colattao-specific? Supabase/Resend/Blob env var names.

### Core cleanup (no review needed — just do)
Retire the 4 stale AMMA variant clones (verify-merged → delete locally), confirm the
Landing site is deployed + domain pointed, salvage asset/anime/build scraps into
`ASSET_REGISTRY/` + `tools/`, fold the ops watchdog into Shadow Engineer.

## Guardrails (every project)
Public/own data only; **never read/move `.env` or credentials without explicit OK**;
keep secrets out of any repo; flag regulated data (payments, health, customer/employee).
