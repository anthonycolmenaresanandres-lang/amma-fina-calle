# Handoff

## Project Purpose
AMMA Ventures LLC DBA Fina Calle project workspace for reusable customer/business operations, website generation, and related app modules.

## Current Stage
Protocol docs updated to v1.1 with strategy intake phase. All 3 Web Studio docs now include required Section 0 / strategy questions before design. Ready to run strategy intake with first client.

## Protected Files
- All app/source files are protected from modification during this inspection.
- Existing modified files under APP/web/src/conquest/ are user/local changes and must not be overwritten.
- Secrets and environment files must not be exposed or committed.

## Parked Work
- Stripe implementation is parked.
- Customer portal implementation is parked.
- Auth, webhooks, billing database, automatic access shutoff, and backend billing logic are parked.

## Current Task
Added "Website Strategy Intake — Required Before Design" section to all three Web Studio protocol docs (v1.1). No app files modified.

## Next Task
Run Section 0 strategy intake with the first client (CLIENT_INTAKE/CLIENT_WEBSITE_INTAKE_CHECKLIST.md), then use the updated build prompt template (PROMPTS/WEB_STUDIO_CLIENT_BUILD_PROMPT_TEMPLATE.md) once all 9 strategy questions are answered.

## DONE
- Minimal handoff system created because HANDOFF.md and handoff.py were missing.
- Fina Calle Web Studio company operating protocol created (2026-06-03):
  - PRODUCT_MODULES/FINA_CALLE_WEB_STUDIO_PROTOCOL.md
  - CLIENT_INTAKE/CLIENT_WEBSITE_INTAKE_CHECKLIST.md
  - PROMPTS/WEB_STUDIO_CLIENT_BUILD_PROMPT_TEMPLATE.md
- All three protocol docs updated to v1.1 (2026-06-03): added "Website Strategy Intake — Required Before Design" section with 9 required questions (S1–S9), gating rule, and future-features rule.

## KEY DECISIONS
- Do not implement Stripe.
- Do not add Stripe SDK, webhooks, auth, billing database, customer portal logic, or automatic access shutoff.
- Do not modify app code.
- Preserve existing local modifications.

## Log

- [2026-06-02 15:30:57] START: Handoff session started

- [2026-06-02 15:31:07] DONE: ran required startup commands and confirmed read-only scope before app inspection

- [2026-06-02 15:31:11] NEXT: locate APP web structure and targeted customer intake/upload/config files

- [2026-06-02 15:32:14] DONE: inspected APP/web routes, landing page, layout, package config, relevant intake/payment planning docs, repo separation rules, and confirmed CLIENT_INTAKE/BUSINESS have no files

- [2026-06-02 15:36:48] START: Handoff session started

- [2026-06-02 15:36:58] NEXT: run targeted repo-wide search for intake upload customer request and alternate names

- [2026-06-02 15:37:11] DONE: ran requested repo-wide rg search and found likely existing request code under CASE_STUDIES/COLATTAO/CODE_REFERENCE plus owner request docs

- [2026-06-02 15:37:28] NEXT: inspect Colattao CODE_REFERENCE owner request form route api and owner pages only

- [2026-06-02 15:38:26] DONE: confirmed existing owner request intake upload and email flow exists in Colattao CODE_REFERENCE, not in active APP/web runtime

- [2026-06-02 15:40:28] START: Handoff session started

- [2026-06-02 15:40:37] NOTE: scope changed by user: build first AMMA APP/web customer request foundation from Colattao reference; Conquest files and Stripe/auth/database remain out of scope

- [2026-06-02 15:41:07] NEXT: add APP/web request-update route customer request form and validation-only customer request API

- [2026-06-02 15:42:43] DONE: added APP/web customer request form request-update route and validation-only customer-requests API

- [2026-06-02 15:43:24] DONE: verified APP/web build passes with request-update route and customer-requests API; Conquest files remain only pre-existing modified files

- [2026-06-02 15:56:41] START: Handoff session started

- [2026-06-02 15:56:50] DONE: ran startup for landing CTA and commit task; confirmed Conquest files remain protected modified files

- [2026-06-02 15:56:56] NEXT: add one restrained request-update CTA to APP/web/src/app/page.tsx

- [2026-06-02 15:57:14] DONE: added restrained Request an Update CTA on APP/web landing page linking to /request-update

- [2026-06-02 15:57:20] NEXT: run APP/web build then stage and commit only intake foundation files and handoff infrastructure

- [2026-06-02 15:57:49] DONE: verified APP/web build passes after landing CTA

- [2026-06-02 15:58:01] DONE: staged only intake foundation files landing CTA and handoff infrastructure; Conquest files remain unstaged

- [2026-06-02 18:05:48] START: Handoff session started

- [2026-06-02 18:06:39] DONE: inspected Fina Calle landing page files assets git remote and Vercel deployment status read-only

- [2026-06-02 18:06:39] NEXT: decide smallest landing page visual/content adjustment before editing

- [2026-06-02 18:10:46] START: Handoff session started

- [2026-06-02 18:10:46] NOTE: scope changed by user: redesign only APP/web root landing page into minimal image-first one-screen page; Conquest files remain protected and no auth billing database payment features

- [2026-06-02 18:10:46] NEXT: replace APP/web/src/app/page.tsx root page with minimal premium one-screen landing layout

- [2026-06-02 18:11:34] DONE: replaced APP/web root landing page with minimal premium one-screen Fina Calle layout

- [2026-06-02 18:11:34] NEXT: run APP/web build and verify Conquest files remain untouched

- [2026-06-02 18:12:08] DONE: verified APP/web build passes after minimal root landing page redesign

- [2026-06-02 18:12:08] NEXT: review landing page visually and commit only APP/web/src/app/page.tsx plus handoff if approved

- [2026-06-02 18:14:15] START: Handoff session started

- [2026-06-02 18:14:59] DONE: verified approved landing and Conquest changes build successfully before commit

- [2026-06-02 18:15:00] NEXT: commit and push approved landing redesign plus Conquest demo updates

- [2026-06-02 18:19:49] START: Handoff session started

- [2026-06-02 18:19:49] NOTE: scope changed by user: redesign only APP/web root landing page around approved Fina Calle OS logo asset; Conquest routes and logic remain out of scope

- [2026-06-02 18:19:49] NEXT: locate approved uploaded Fina Calle OS logo and update APP/web root landing page only

- [2026-06-02 18:22:41] DONE: copied approved Fina Calle OS logo asset and redesigned APP/web root landing page around the logo

- [2026-06-02 18:22:41] NEXT: run APP/web build and verify landing-only scope

- [2026-06-02 18:25:59] START: Handoff session started

- [2026-06-02 18:26:41] DONE: verified Fina Calle OS logo landing page build passed and Conquest files have no diff before commit

- [2026-06-02 18:26:41] NEXT: commit and push approved Fina Calle OS landing page files

- [2026-06-02 18:32:52] START: Handoff session started

- [2026-06-02 18:33:34] DONE: inspected APP/web request-update page form component and customer request API read-only

- [2026-06-02 18:33:34] NEXT: decide whether to redesign request-update UI around Fina Calle OS visual system without changing submission behavior

- [2026-06-02 18:36:46] START: Handoff session started

- [2026-06-02 18:36:47] NOTE: scope changed by user: redesign /request-update into premium Fina Calle OS intake page; API behavior endpoint validation and Conquest files remain protected

- [2026-06-02 18:36:47] NEXT: update request-update page presentation and optionally form classes/copy only

- [2026-06-02 18:39:03] DONE: updated request-update page and form presentation for Fina Calle OS intake without API behavior changes

- [2026-06-02 18:39:03] NEXT: run APP/web build and verify request-update scope endpoint and Conquest files

- [2026-06-02 18:39:58] DONE: verified APP/web build passes after Fina Calle OS request-update presentation redesign

- [2026-06-02 18:39:58] NEXT: review request-update UI and commit page/form presentation changes if approved

- [2026-06-02 18:42:06] START: Handoff session started

- [2026-06-02 18:42:59] DONE: verified Fina Calle OS intake page customization build passed before commit

- [2026-06-02 18:43:00] NEXT: commit and push approved Fina Calle OS intake page customization

- [2026-06-02 18:50:33] START: Handoff session started

- [2026-06-02 18:50:45] NOTE: scope changed by user: create deterministic PNG-style intake hero asset and place it on /request-update while preserving form endpoint payload validation API and Conquest files

- [2026-06-02 18:50:45] NEXT: generate APP/web/public/assets/fina-calle-intake-hero.png from existing Fina Calle OS logo and update request-update page presentation only

- [2026-06-02 18:53:52] DONE: generated Fina Calle OS intake hero PNG and placed it at top of request-update page without form API behavior changes

- [2026-06-02 18:53:52] NEXT: run APP/web build and verify endpoint API Conquest and final status

- [2026-06-02 18:54:36] DONE: verified APP/web build passes after adding Fina Calle intake hero PNG to request-update

- [2026-06-02 18:54:36] NEXT: review intake hero asset and commit request-update page plus asset if approved

- [2026-06-02 19:49:45] START: Handoff session started

- [2026-06-02 19:50:44] DONE: verified Fina Calle intake hero asset build passed before commit

- [2026-06-02 19:50:44] NEXT: commit and push approved Fina Calle intake hero asset files

- [2026-06-02 21:10:55] START: Handoff session started

- [2026-06-02 22:06:45] START: Handoff session started

- [2026-06-02 22:07:00] DONE: ran startup handoff show and git status; verified existing handoff stage before app inspection

- [2026-06-02 22:07:00] NEXT: verify APP/web Next.js structure and inspect only routing/style files needed for customer account pages

- [2026-06-02 22:07:21] NOTE: scope authorized: create manual customer account registry routes and data only; preserve Conquest request-update customer request API Stripe auth database and payment boundaries

- [2026-06-02 22:07:21] NEXT: create APP/web customer data registry and /customers routes matching existing Fina Calle OS styling

- [2026-06-02 22:08:29] DONE: created manual customer registry data and /customers plus /customers/[id] routes without touching Conquest request-update API Stripe auth database or payment logic

- [2026-06-02 22:08:29] NEXT: run APP/web build and required route file existence checks

- [2026-06-02 22:09:10] DONE: APP/web build passed and required customer registry route files exist; protected Conquest request-update and API files have no diff

- [2026-06-02 22:09:10] NEXT: stage only customer registry files and HANDOFF.md then commit manual customer account registry

- [2026-06-03 07:27:07] START: Handoff session started

- [2026-06-03] DONE: created Fina Calle Web Studio company operating protocol — PRODUCT_MODULES/FINA_CALLE_WEB_STUDIO_PROTOCOL.md, CLIENT_INTAKE/CLIENT_WEBSITE_INTAKE_CHECKLIST.md, PROMPTS/WEB_STUDIO_CLIENT_BUILD_PROMPT_TEMPLATE.md; HANDOFF.md updated; no app files modified

- [2026-06-03] NEXT: run client intake checklist with first client, then use build prompt template to start first client website build

- [2026-06-03 07:32:31] START: Handoff session started

- [2026-06-03 07:33:27] DONE: committed and pushed Fina Calle web studio protocol docs (549fda2) to main; 4 files, 538 insertions, working tree clean

- [2026-06-03 07:44:28] START: Handoff session started

- [2026-06-03] DONE: updated all three Web Studio protocol docs to v1.1 — added "Website Strategy Intake — Required Before Design" section with 9 required questions (S1–S9), gating rule (no design until intake complete), future-features rule, and updated build prompt task steps and checklist; no app files modified

- [2026-06-03] NEXT: run strategy intake (Section 0) with first client before starting any design or build

- [2026-06-03 08:04:54] START: Handoff session started

- [2026-06-06 23:20:05] DONE: Shipped + merged (PR #3, f8db81e): Content Engine test route, end-to-end customer interface (request inbox, private file uploads, finished contact), and trust+security pass (business email, signed-URL attachments, security headers). Requires Supabase migrations 0005 and 0006.

- [2026-06-06 23:20:05] DONE: Added TECH_ARCHITECTURE/CUSTOMER_INTERFACE_DEPLOYMENT_RUNBOOK.md: activation checklist (env vars, migrations 0001-0006, admin allowlist), login walkthrough, request flow diagram, security posture, and work record.

- [2026-06-06 23:20:05] NEXT: Owner to run migrations 0005 then 0006 in Supabase and confirm NEXT_PUBLIC_SUPABASE_* env vars in Vercel, then log in at finacalleos.com/customers. Open hardening item: durable rate limiting on /api/customer-requests.

- [2026-06-06 23:33:58] DONE: Documented architecture: added TECH_ARCHITECTURE/CUSTOMER_INTERFACE_ARCHITECTURE.md (one Next.js app on Vercel + Supabase; public vs admin = routing + auth gate; multi-tenant by id; DB-level security). Extended runbook with section 7 (Vercel Deployment Protection: keep Production public) and section 8 (custom SMTP for reliable Supabase magic-link emails).

- [2026-06-06 23:33:58] NOTE: Could not verify finacalleos.com from the build environment: outbound blocked by network policy (x-deny-reason: host_not_allowed). Owner to verify in a browser: Production public + Supabase login form vs 'Setup needed'.

- [2026-06-07] DONE: Built Penalty Shootout game package V1 ("Street Shootout") on the Conquest game-engine pattern. New route /penalty-shootout (APP/web/src/penalty/ + APP/web/src/app/penalty-shootout/): Phaser scene, 6 aim targets, 3 keeper difficulties, risk/reward save model, 5-shot match with scoring + rating. No existing game code touched. APP/web build passes. Surfaced on /rd; registered in GAME_LIBRARY (GAME_PACKAGE_LIBRARY.md + new PENALTY_SHOOTOUT.md spec).

- [2026-06-07] NEXT: Visual smoke-test /penalty-shootout on a mobile viewport. Optional next steps in GAME_LIBRARY/PENALTY_SHOOTOUT.md: scene->client win/lose callback + result card, sudden death, power/timing skill element, per-client skin pass.

- [2026-06-07] CORRECTION: Prior Penalty Shootout work DOES exist outside this repo — owner confirmed a beta in `colattao-cafe-rush` (src/game/catalog/penalty-shootout/PenaltyScene.ts + PenaltyBootScene.ts, "Colattao Penalty Shootout" beta, asset-free Phaser primitives, best-of-5, resize-aware, not visually QA'd). The earlier "no prior Penalty Shootout work" framing was wrong as a global claim. Accurate scoping: none inside amma-fina-calle (verified full history + global code search), but correlated prior beta exists in colattao-cafe-rush (I could not read that repo — session scope denied; comparison is conceptual from owner-provided facts).

- [2026-06-07] DECISION: PR #6 (this repo's V1) SUPERSEDES the old Colattao beta as the canonical AMMA/Fina Calle Penalty Shootout. It does NOT import the old code (clean-room reimplementation on the Conquest pattern) and does NOT archive/delete the old beta (stays in colattao-cafe-rush, out of scope). Lessons preserved: Colattao palette (as optional skin), asset-free/no-404 strategy, best-of-5 flow, resize-aware layout, "beta/not visually QA'd" warning. Full comparison table in GAME_LIBRARY/PENALTY_SHOOTOUT.md. Do NOT merge PR #6 yet.

- [2026-06-07] DONE: Mobile QA pass on /penalty-shootout (PR #6). Could NOT run live device QA (no browser in container; Vercel preview is HTTP 403 behind Deployment Protection). Did a geometry audit from the real getLayout() math across 7 viewports + landscape, a logic/stability review, and a production build. Portrait passes on all tested devices (no crop/overlap). Fixed 2 issues: (1) score counter flashing "0/5" during the first shot's flight; (2) aim targets overlapping in landscape/short canvases (zoneRadius now height-aware; portrait unchanged). Build passes; /penalty-shootout still prerenders static. Known minor: title/score labels ~1px apart on 320-wide/landscape only (cosmetic, deferred).

- [2026-06-07] NEXT: PR #6 still NOT merge-ready — needs a real eyes-on-glass mobile pass against a PUBLIC preview (Deployment Protection currently 403s the preview). Owner action: open the preview in a phone browser (or make the preview public) and confirm animation/tap feel; then PR #6 can go merge-ready. No new gameplay until then.

- [2026-06-07] WAITING ON ANTHONY — Manual mobile QA acceptance checklist for /penalty-shootout (PR #6 stays DRAFT until all pass):
  - [ ] Preview opens on phone
  - [ ] Level select readable
  - [ ] All 3 keeper levels playable (Street / Club / Pro)
  - [ ] Aim targets tappable
  - [ ] No canvas crop/scroll bugs
  - [ ] GOAL / SAVED / MISS feedback readable
  - [ ] Replay works
  - [ ] Back works
  - [ ] 5-shot ending works (final score + rating)
  - [ ] Game feels replayable
  If any visual/feel issue is reported, fix ONLY those targeted issues — no new features.

- [2026-06-07] DONE: Anthony completed the manual mobile phone QA pass for /penalty-shootout (PR #6) — ALL 10 acceptance checks PASS (preview opens on phone, level select readable, all 3 keepers playable, aim targets tappable, no crop/scroll bugs, GOAL/SAVED/MISS readable, Replay works, Back works, 5-shot ending works, feels replayable). PR #6 flipped from draft to READY FOR REVIEW. Build re-verified green; /penalty-shootout prerenders static. NOT merged — awaiting explicit merge approval.

- [2026-06-07] DONE: MERGED PR #6 into main on explicit approval. Merge commit ac6f6cf ("Merge PR #6: Penalty Shootout V1 (Street Shootout)"). Additive only (9 files, 0 deletions); no Client OS / Conquest / Supabase / Stripe / POS files touched. Post-merge build green; Client OS route files (/m/[id], /owner/[id], /customers/[id]) confirmed present on main after merge.

- [2026-06-07] DONE: PRODUCTION VERIFIED by owner in browser after merge — all six routes PASS: finacalleos.com (root), /m/colattao, /owner/colattao, /customers, /penalty-shootout, /rd. No Client OS regression. Penalty Shootout V1 is live in production. (Build env could not perform live checks itself — outbound to finacalleos.com is blocked by env network policy; verification done by owner.)

---

## CHAT HANDOFF — Penalty Shootout V2 (2026-06-07, low-context cutover)

Durable architecture + multi-agent model live in `/CLAUDE.md` — read it first.

**Agents (parallel):** Claude (cloud) = code, PRs/merges, visual recognition (view repo images), SVG alignment/preview mocks, fit tuning; cannot reach local files, generate/edit images, delete branches, or access Vercel. Codex (local) = local files, image copy/convert, branch deletes, web push — **budget ~20% left til the 11th; minimize.** ChatGPT = image gen (PNGs often NOT truly transparent — verify alpha).

**Game on `main`:** engine/input/skin split. Skins: Fina Calle (default primitive), Colattao (café bg), Stadium (`background.webp` 941x1672, `backgroundFit {scrim:0.25,scale:1.3,offsetX:0,offsetY:0.13}`). Input: tap (default)/swipe toggle. Asset slots (gated, primitive fallback, no-404): background(+backgroundFit), logo, ball(spins), kicker(+kickerFit, leans). Chrome flags: hideGoalArt, hideTitle, adBanner (+ scoreBug, ledBanner in PR #22). Geometry: goal mouth x 13-87%, y 14-42%; spot 50%/82%.

**Open PRs:**
- #22 `claude/stadium-broadcast-hud` — Stadium broadcast HUD (top scorebug L-score/R-promo + LED banner behind keeper). Draft, CI green, needs phone-QA. CONFLICTS with #21 on skins.ts Stadium skin — combine both when merging (keep chrome + assets.ball/kicker + kickerFit).
- #21 `codex/stadium-ball-kicker-art` — ball+kicker art. BLOCKED: PNGs not transparent (checkerboard baked into opaque pixels). Do not merge until clean transparent art committed.
- #17 `codex/colattanini-campaign-plan` — Colattanini docs (manual MVP). Draft, awaiting merge.
- #5 `claude/news-content-generation-test-G7HWE` — "Marbel admin" Supabase migration (Client OS). Open, awaiting Anthony: close 5 / keep 5.

**Merged recently:** #18 (Stadium bg), #19 (ball/kicker infra + CLAUDE.md), #20 (chrome flags). Closed: #1.

**Pending chores:** delete 13 merged branches via Codex (one `git push origin --delete ...`; Claude can't delete from here).

**Next actions (priority):**
1. Get TRUE transparent ball+kicker PNGs -> recommit to `APP/web/public/assets/stadium/penalty/{ball,kicker}.png` -> Claude views, tunes kickerFit (from-behind, feet at bottom), wires, resolves #21/#22 conflict.
2. Phone-QA + merge #22.
3. Decide #5 (Client OS — close/keep).
4. Merge #17.
5. Codex deletes the 13 stale branches.

**Guardrails:** never touch Client OS (`/m/[id]`,`/owner/[id]`,`/customers`)/Supabase/Stripe/POS/secrets/customer data. Game art: non-human mascots only, no FIFA/World-Cup/club/real-face branding, client approves before publish, primitive fallback/no-404. One concern per commit; build must pass.

**Claude method:** view repo images via Read; build SVG previews (embed image base64 + draw goal frame/zones/keeper/ball at geometry %s) and SendUserFile; tune backgroundFit/kickerFit from actual image dims.

---

## 2026-06-07 — Penalty Shootout Campaign Pack: FREEZE (supersedes the stale lists above)

**Project parked, stable.** The earlier "Next actions"/"Merged recently" lists in this file are
**outdated** (they predate the Campaign Pack work). For the authoritative state see
**`GAME_LIBRARY/PENALTY_SHOOTOUT_CAMPAIGN_PACK_STATUS.md`**.

**Live on `main` (@ `229ce76`):** fixed Stadium Shell · Campaign Pack model · 941×1672 background
template + fit solver · gated behind-goal ad-zone renderer · Colattao coffee/pastry ad image ·
Colattao green keeper kit (owner-approved) · Fina Calle/Stadium controls · tap+swipe · no-404 fallback.
Live demo: https://finacalleos.com/penalty-shootout

**Parked:** PR #24 (Stadium broadcast HUD + ball/kicker art — superseded; don't merge as-is, art may be
salvaged later) · PR #17 (Colattanini docs-only manual MVP). Client-OS PRs #29/#5 are separate.

**Resume sequence:** (1) player layered kit spec/art → (2) campaign-on-Stadium-Shell binding →
(3) true transparent mascot/ball assets if wanted → (4) Colattanini printable campaign (#17) →
(5) approved logo overlay registry (`ASSET_REGISTRY/APPROVED_LOGOS.md` is empty — no in-game logos until filed).

**Known minor:** Colattao keeper lower-body green `0x14332A` ≈ grass `0x14331A` (legs can blend);
one-line kit tweak if wanted. Ad image is 1080px long edge (spec rec ≥1600) — fine at display size.
