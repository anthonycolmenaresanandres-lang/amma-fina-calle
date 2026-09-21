# FOUNDATION — AMMA / Fina Calle master context & chat kickoffs

> **Purpose.** One self-contained brief that gives *any* new chat or agent the full
> context we're operating from — plus copy-paste **kickoff prompts** (§8) so a fresh
> conversation starts with zero ramp-up. Hand a chat this file (or its GitHub link), then
> paste the matching prompt. Keep it current; it's the canonical onboarding doc.
>
> Last updated: 2026-09-21.

---

## CURRENT STATE OVERRIDE — September 21, 2026

This section supersedes older status statements below wherever they conflict. Detailed evidence and the exact touched-surface register are in `OPERATIONS/AI_WORKFORCE/CHANGE_REGISTER_2026-09-21.md`.

### Revenue and ESM
- Revenue execution is now organized around existing sellable capability before speculative builds.
- Daily scorecard: qualified contacts / replies / demos booked / dollars generated.
- Bryan Schmidt is the current ESM operations outreach target; Steve Cariello is the VBFH context contact.
- Gmail outreach to Bryan (Steve CC) is prepared as a draft only and has not been sent.

### Voice AI
- PR #239 is merged: Fall 2026 VBFH knowledge, ESM demo readiness, and GPT-Live-1 migration evaluation are on main.
- PR #240 is merged: keyless booking/check-in simulations run in CI and the controlled 20-call comparison protocol is documented.
- GPT-Live-1 / Twilio Agent Connect remain evaluation paths; no paid comparison calls were executed in this sprint.

### VBFH Media Engine
- PR #8 is merged to `vbfh-media-engine/master` with stronger public DaySmart verification, dual-team-page final-score corroboration, fail-closed content generation, broadcast assets, and optional AI/email review.
- Scheduled mode remains zero-spend/deterministic by default: email false, AI review false, no scheduled Instagram publish.
- VBFH Pilot 1/7 and the AI Workforce activation test have verified Gmail delivery to Anthony.

### AI workforce
- Company-level SOPs and worker registry now live under `OPERATIONS/AI_WORKFORCE/` on main.
- Active business workers cover Executive Ops, Revenue, Follow-up, Client Success, Product QA, Marketing, Accounts Receivable, Demo/Proposal, Workforce Review, VBFH Knowledge, Revenue Scorecard, and the private VBFH email pilot.
- A second internal control-plane exists on branch `ops/ai-workforce-state` with shared STATE.json, RUN_LOG, handoff/sales/process SOPs. It is internal and unmerged.
- Prospect Research Desk was not created because the account hit the 15-active-task limit. Separate Pipeline Controller / scheduled Process Engineer are therefore not active yet.

### Authority
- Anthony remains the approval gate for external prospect/client sends, spend, secrets/access, binding commercial commitments, and production-risk releases unless a workflow has explicit scoped authorization.
- Status language is strict: MERGED, ACTIVE WORKER, DRAFT, INTERNAL BRANCH, BLOCKED, PLANNED. Scheduled is not the same as completed; drafted is not the same as sent.

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
  status: `PRODUCT_MODULES/AI_PHONE_ASSISTANT_PLAN.md`. The **`vbfh-info` tenant**
  (Virginia Beach Field House phone assistant, tester number +1 757 666 0078) had its
  knowledge pack fully refreshed (early July 2026) from beachfieldhouse.com,
  Instagram/Facebook @beachfieldhouse, and partner camp sites — documented in
  `services/voice-gateway/VBFH_KNOWLEDGE_SOURCES.md`. The engine itself remains
  **v0/pilotable**, not in full production for a paying client.
- **AI front-desk check-in** — plan + partial build:
  `PRODUCT_MODULES/AI_FRONT_DESK_CHECKIN_PLAN.md`. Scope: attendance check-in for an
  already-registered person arriving for tonight's session — **not** new-account
  registration and **not** door/building access. A deterministic rules-pack evaluator
  (identity, roster, time window, waiver, hold, guardian-for-minors — all plain code,
  no AI judgment calls) + mock connector are **built and unit-tested**
  (`services/voice-gateway/src/checkin/`, `npm run simulate:checkin`, 17/17 checks
  passing), but **not wired into any live phone/chat tool yet**. Real integration
  against DaySmart ("the Dash," VBFH's own system) is **blocked** — API access has no
  committed timeline. Interim behavior live today: the `vbfh-info` tenant tells a
  caller it can't verify/complete a check-in by phone, takes a message
  (name/callback/session), and points them to the front desk in person — a message
  relay, not a verified check-in. **Status: planned / in development — not live,
  automated, or available.**
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
- **✅ On GitHub:** `anthonycolmenaresanandres-lang/vbfh-media-engine` (private, branch
  `master`). Cloud Claude can work it from a session scoped to that repo.
- **✅ Phase 0 DONE — the trigger is solved (chose 2b).** A scheduled **GitHub Action**
  (`.github/workflows/daily.yml`: cron + `workflow_dispatch`) runs the daily job **in the
  cloud, PC-off**. A manual run is **green** (`success` → app `needs_review`) and uploads
  the recap artifacts (captions + feed/story PNGs + the daily PPTX). Email is currently
  **off** (`EMAIL_ENABLED:"false"`); to enable emailed delivery, add the SMTP secrets in the
  repo (Settings → Actions secrets) and flip `EMAIL_ENABLED:"true"`.
  - Caveat: GitHub disables scheduled workflows after ~60 days of repo inactivity — push
    occasionally (or run it manually) to keep the cron alive.
- **Productization path (Phase 0 ✅):** Phase 1 de-VBFH into a tenant config (route ~298
  literals through `brandConfig`) → Phase 2 drop-in branding pack → Phase 3 multi-instance
  hosting → Phase 4 second pilot tenant + pricing.

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
