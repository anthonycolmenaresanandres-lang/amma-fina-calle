# FOUNDATION — AMMA / Fina Calle master context & chat kickoffs

> **Purpose.** One self-contained brief that gives *any* new chat or agent the full
> context we're operating from — plus copy-paste **kickoff prompts** (§8) so a fresh
> conversation starts with zero ramp-up. Hand a chat this file (or its GitHub link), then
> paste the matching prompt. Keep it current; it's the canonical onboarding doc.
>
> Last updated: 2026-06-10.

---

## 1. The company & the thesis
**AMMA Ventures LLC dba Fina Calle** (Virginia Beach) builds repeatable digital systems
for local businesses: interactive storefronts, branded engagement games, owner tools,
content/website generation, and reusable product modules.

**Operating thesis — the "Managerial Factory":** bring the *factory process* to the
*managerial process* using code + AI as the aid. A **frozen engine** with **swappable
parts**; standardize → reuse → **cap work-in-progress** (the founder is the bottleneck —
keep to 1–2 active builds, everything else parked with a trigger).

## 2. Who does what (multi-agent operating model)
- **Cloud Claude** (this agent) — owns the **`amma-fina-calle` GitHub repo**. Does
  reasoning, code, PRs/merges, Vercel deploys, image processing/preview. **Scoped to this
  one repo**; cannot reach the local machine or other repos unless they're pushed to
  GitHub and added to the session.
- **Local Claude Code** (on Anthony's machine) — direct local file access; can work
  **local-only repos** (e.g. VBFH) that aren't on GitHub.
- **Codex** (local agent) — local file ops, builds, publishing, repo hygiene /
  CLONE_CONTROL governance.
- **ChatGPT** — AI **image generation** (backgrounds, characters, art). Exports PNG.
- **Pipeline / handoff protocol:** short-lived `claude/...` branch → **draft PR** →
  squash-merge to `main` → **Vercel auto-deploys**. The cloud environment is **ephemeral**
  — commit/push anything worth keeping.

## 3. What's live right now
The site is **finacalleos.com** (Next.js, repo root `APP/web`, auto-deploys from `main`).

- **Command Center** — `finacalleos.com/command-center` — private hub (noindex, unlinked)
  linking every idea/design/tool. Maintained in `APP/web/src/app/(internal)/command-center/links.ts`.
- **Project Code Atlas** — `finacalleos.com/command-center/code` — every project's code
  infra (stack · state · where the code lives · the decided MOVE), grouped by triage tier.
  Data in `command-center/code/atlas.ts`.
- **Voice Gateway** — `services/voice-gateway/` — **BUILT v0.11**, the AI front-desk /
  booking bot (Twilio Media Streams ⇄ OpenAI Realtime). Multi-tenant (routes by dialled
  number), draft-first **idempotent** booking, 5 connectors (mock / Cal.com / Square /
  webhook bridge / universal propose-confirm), per-tenant business-hours awareness,
  take-a-message + missed-call alerts, per-tenant ROI at `/stats`, durable atomic
  snapshot + Postgres scale-out schema, `Dockerfile` + `render.yaml`. Verified by a
  **keyless 43-check simulator** (`npm run simulate`). **Needs live keys to go live**
  (OpenAI Realtime, a Twilio number + `PUBLIC_HOST`, per-connector creds). Plan +
  status: `PRODUCT_MODULES/AI_PHONE_ASSISTANT_PLAN.md`.
- **Penalty Shootout** — `/penalty-shootout` — live, Colattao art-complete.
- **Lead Arcade / Conquest** — `/lead-arcade` (internal pipeline-as-a-game; private) +
  `/conquest` (public demo). Now ships **real default leads per territory** (Hampton
  Roads 43, Richmond 11, Norfolk 10 — independent coffee/restaurants/groomers/salons),
  a **📋 Paste list** bulk-scout, **🔭 Survey all** (batch enrich from OSM; richer with
  optional Yelp/Foursquare keys — see `APP/web/docs/LEAD_ARCADE_ENRICHMENT_KEYS.md`), and
  **Export pipeline (CSV)** for outreach. Real lead lists stay client-side (not in the repo).
- **Colattao** — flagship client case study (`CASE_STUDIES/COLATTAO/`).

## 4. Portfolio triage (full map: `BUSINESS/PROJECT_PORTFOLIO_TRIAGE.md`)
- **Tier 1 — AMMA core (ship/consolidate):** canonical repo (double-down); 4 stale AMMA
  variant clones (salvage→delete); Fina Calle Landing (ship); Colattao Cafe Rush
  (ship + harvest); asset/script annexes (salvage); Shadow Engineer + ops watchdog (keep).
- **Tier 2 — build bets (one at a time):** **VBFH Media Engine ⭐ (FIRST)**; Dual
  Perspective Newsroom (2nd).
- **Tier 3 — park:** PermitReadyFencePacket, Kalshi terminal, Franchise Certainty, Unity
  project, Local AI Agent.
- **Tier 4 — archive:** VBFH placeholder, CLMH_Analysis, the two Godot games, Hail Marry,
  Newsroom hardware sketch.
- **Sequence:** VBFH first → core cleanup (parallel) → Colattao Cafe Rush → Newsroom →
  park/archive the rest.

## 5. VBFH Media Engine — the #1 build bet (status + the open fork)
Sports-facility/league **media automation**: scrapes public DaySmart/Dash pages →
validates schedules/results/standings → branded feed/story images + captions + a daily
PPTX + email summary. Stack: Next.js, React, Playwright, Sharp, pptxgenjs, Nodemailer, TS.
- **State:** engine is **healthy** — 185 tests green, full pipeline produces real
  artifacts, last manual run completed clean. Copy was tightened locally (sport-aware
  hooks, operator-language leak fixed, brand strings routed through `brandConfig`).
- **The real gap = the trigger:** the "daily 11 PM" Windows scheduled task was **never
  installed** — every run has been manual. "Stabilize" = close the automation gap.
- **Open fork (needs Anthony's call):** **(2a)** install/verify the local Windows task as
  a stopgap, or **(2b)** skip straight to a hosted/cloud trigger (Vercel Cron / GitHub
  Action / small VM). **Lean: 2b** — don't sink effort into a Windows-only scheduler we'll
  replace in productization Phase 3 anyway.
- **Enabling step for cloud help:** VBFH is **local-only (no GitHub remote)**, so cloud
  Claude can't touch it. Push it first:
  `gh repo create vbfh-media-engine --private --source . --push`.
- **Productization path:** Phase 0 stabilize trigger → Phase 1 de-VBFH into a tenant
  config (route ~298 literals through `brandConfig`) → Phase 2 drop-in branding pack →
  Phase 3 hosted scheduler → Phase 4 second pilot tenant + pricing.

## 6. Hard guardrails (always)
- Never touch **Client OS routes** (`/m/[id]`, `/owner/[id]`, `/customers`), Supabase,
  Stripe, POS, secrets, or customer data.
- Game art: **non-human mascots only**; no FIFA/World-Cup/club/real-face branding; client
  approves assets before publish; **logos are approved overlays, never AI-generated**.
  Asset skins must keep a primitive fallback (no broken/404 visuals).
- Keep **secrets out of the repo** (redact keys); don't migrate `.env`/credentials without
  explicit OK; don't copy large binaries; respect client/IP/licensing constraints.
- `APP/web` runs a **modified Next.js** — read `APP/web/AGENTS.md` (verify APIs against
  `node_modules/next/dist/docs/` before writing app code).
- Cloud env is **ephemeral** — commit/push anything worth keeping.

## 7. Repo entry points (further reading)
- `START_HERE.md` — orientation & folder map.
- `CLAUDE.md` — project memory / session rules (penalty game, asset protocols, guardrails).
- `HANDOFF.md` — long-form master handoff.
- `BUSINESS/PROJECT_PORTFOLIO_TRIAGE.md` · `HANDOFFS/LOCAL_CODE_INVENTORY.md` — the atlas data.
- `PRODUCT_MODULES/MODULE_LIBRARY.md` · `GAME_LIBRARY/GAME_PACKAGE_LIBRARY.md` — catalogs.
- Command Center (`/command-center`) is the human-facing index to all of the above.

## 8. Kickoff prompts for other chats / forms (copy-paste)
Paste the matching block into a fresh chat. Each assumes the agent can read this file.

### 8a — New **cloud** Claude Code session (this repo)
```
You're cloud Claude working the anthonycolmenaresanandres-lang/amma-fina-calle repo.
Read FOUNDATION.md first — it's the full context (company thesis, multi-agent model,
what's live, the portfolio triage, guardrails). Work on short-lived claude/... branches
→ draft PR → squash-merge to main (Vercel auto-deploys). Respect §6 guardrails. Verify
before merging (tsc/lint, and for services/voice-gateway run `npm run simulate`).
My current priority is: <STATE IT>.
```

### 8b — **Local** Claude Code (Anthony's machine; for local-only repos like VBFH)
```
You're local Claude Code on my machine. Read FOUNDATION.md (in the amma-fina-calle repo)
for context. The job is VBFH Media Engine at
C:\Users\antho\OneDrive\Documents\soccer\VBFH APP email (local-only git, no remote).
Engine is healthy (185 tests green); the gap is the trigger. We're at Phase 0 — stabilize.
Do read-only diagnosis first; change nothing until I say go. Don't read/modify .env or
secrets without asking. When I'm ready to involve cloud Claude, push it:
`gh repo create vbfh-media-engine --private --source . --push`.
```

### 8c — **Codex** (local ops / repo hygiene)
```
You're Codex doing local ops for AMMA/Fina Calle. Context: FOUNDATION.md in the
amma-fina-calle repo. Tasks are local file ops, builds, publishing, and CLONE_CONTROL
hygiene (e.g. confirm nothing unmerged in the 4 AMMA variant clones, then delete them;
push local-only repos to GitHub when asked). Never commit secrets; redact keys; don't
copy large binaries. Report what you did with paths.
```

### 8d — **ChatGPT** (art generation)
```
You generate art for Fina Calle games/campaigns. Rules: non-human mascots only; no
FIFA/World-Cup/club/real-face branding; never generate logos (client's real logo is an
approved overlay). Export PNG, ideally with true alpha or a flat magenta #FF00FF ground
(generated PNGs often fake transparency). Use the prompt packs in PROMPTS/ (e.g.
PENALTY_ASSET_PROMPTS.md). The brief is: <STATE IT>.
```

## 9. Open decisions awaiting Anthony
- **VBFH trigger:** 2a local Windows task vs **2b hosted trigger** (lean 2b).
- **Push VBFH to GitHub?** (unblocks cloud Claude for productization).
- **Voice gateway go-live:** provide OpenAI key + a Twilio number to run a first real call.
- **Next active build** after VBFH: Colattao Cafe Rush (ship+harvest) or Newsroom (decide
  standalone vs Fina Calle content-engine module).
