# AMMA Ventures — Client Acquisition Loop

_The repeatable top-of-funnel engine that turns local restaurants/cafés into
signed Fina Calle clients. It **orchestrates the existing sales assets** (it does
not replace them) and adds the conversion differentiator: a tailored,
prospect-branded demo produced in minutes off the frozen Campaign Pack +
prompt libraries._

> **Lever:** Client Acquisition (chosen first). **Cadence:** weekly loop (below).
> Claude prepares materials and tracks the pipeline; the **owner does all
> outreach, calls, and closing** (and anything touching billing/Client OS).

## Where this sits in the flywheel
**Acquire (this doc)** → Build (Campaign Pack production line) → Activate (game +
Colattanini print drive foot traffic/loyalty) → Monetize (Client OS subscription
+ campaign refreshes) → Expand (case study → referrals) → **Acquire**. Each
signed client lowers the cost of the next: more case studies, more referrals,
more reusable art. Acquisition is the lever we crank first because the rest of
the flywheel is already built.

## Assets this loop orchestrates (use these — don't duplicate)
- **Live proof:** `finacalleos.com`, `/m/colattao` (hero — real live client menu),
  `/penalty-shootout` (engagement). Talk track: `SALES_DEMO_PACKAGE/DEMO_URLS_AND_TALK_TRACK.md`
- **Pipeline store:** `SALES_DEMO_PACKAGE/LEAD_TRACKER_TEMPLATE.csv`
- **Messaging:** `CASE_STUDIES/COLATTAO/DOCS/OUTREACH_MESSAGE_PACK.md`,
  `SALES_DEMO_PACKAGE/FINA_CALLE_SALES_DEMO_SCRIPT.md`,
  `SALES_DEMO_PACKAGE/OBJECTION_HANDLING_RESTAURANTS.md`
- **Leave-behinds:** `SALES_DEMO_PACKAGE/PRINTABLE_FLYER_BILINGUAL.md`, `REP_FIELD_CARD_ES.md`
- **Proof of delivery:** `CASE_STUDIES/COLATTAO`
- **Tailored-demo production:** `PROMPTS/PENALTY_ASSET_PROMPTS.md`,
  `PROMPTS/COLATTANINI_PRINT_PROMPTS.md`, `PRODUCT_MODULES/GAME_CUSTOMIZATION_PROTOCOL.md`

## The differentiator — the Tailored Demo Hook
Generic demos *tell*; a tailored demo *shows them their own brand*. For each
priority prospect, **before** outreach, Claude produces a ~10-minute teaser:
1. **Recolor** the Penalty Shootout behind-goal **ad zone + player/keeper kit** to
   the prospect's brand colors (Campaign Pack variables only — engine frozen).
2. **Generate ONE sample collectible card** featuring the prospect's signature
   product as a non-human mascot (Colattanini style) via `COLATTANINI_PRINT_PROMPTS.md`.
3. Capture a phone screenshot / 20-sec clip of the branded game + the card image.

Outreach then opens with: _"Made a 20-second mock of [Business] in our game —
here's your [signature item] as a collectible card. Want the 2-minute demo?"_

Rules: **real/approved logos only (never AI-generated)**, **non-human mascots
only**, client approves before any public use. Claude builds the recolor + card;
the **owner sends**.

## The loop (stages)
1. **Source** — add prospects to the tracker (local independents, loyalty-minded,
   active on IG). Target: a set number/week.
2. **Qualify** — fast fit check (foot traffic, owner reachable, no existing
   system); set `lead_temp`.
3. **Tailor** — for HOT/priority prospects, build the Tailored Demo Hook.
4. **Reach** — owner sends outreach (message pack) with the tailored teaser; log `demo_shown`.
5. **Demo** — 2-minute live demo (hand them the phone on `/penalty-shootout`,
   show `/m/colattao`); use the script + objection handling.
6. **Close** — scope the Campaign Pack tier → agreement. _(Owner-driven; billing
   off-limits to Claude.)_
7. **Onboard** — hand to the **Production loop** (Campaign Pack assembly).
8. **Expand** — new client → write a case study + ask for 2 referrals → feed Source.

## Field channels — go where owners already gather
The cheapest "Source" step is a place that pre-filters for restaurant owners.
- **Restaurant Depot (field channel).** A members-only wholesale supplier — almost
  everyone walking in **owns/runs a food business**, so it's a dense, pre-qualified
  prospecting spot. Tactic: stand near the entrance (public sidewalk / with permission),
  hand out the **bilingual flyer** (`SALES_DEMO_PACKAGE/restaurant-depot-flyer-letter.pdf`)
  whose **QR opens the live demo** (`/penalty-shootout`); for anyone who stops, run the
  2-minute demo on the phone and log them in the lead tracker (HOT/WARM). The flyer's
  hook — _"then we put YOUR brand in it"_ — sets up the Tailored Demo follow-up.
  - Print the flyer on a quick-print/Office-Depot run (Letter, color). Keep contact
    line current before printing. Respect the property's solicitation rules (sidewalk /
    ask management); this is owner-run outreach, not Claude.
- Other natural gathers to reuse the same flyer + QR: local farmers/markets, small-biz
  meetups, chambers of commerce, Latino business associations.

## Weekly Acquisition Loop — the `/loop` runbook
Run once a week. Claude does the repo-side steps; the owner does outreach/calls.
1. Read the lead tracker; summarize the pipeline by `lead_temp` and stage.
2. Flag **stale leads** (`followup_date` passed with no completed `next_action`).
3. For each new HOT/priority prospect lacking a tailored demo: **produce or queue**
   the Tailored Demo Hook assets (or list the exact prompts ready to paste).
4. Surface **this week's next actions** per lead (who to follow up, what to send).
5. Note any new **case-study-worthy wins** to write up.
6. Emit a short **digest**: pipeline counts, stale leads, demos to build, next
   actions, KPI snapshot.

_(Owner then sends outreach and updates the tracker. Claude never contacts
prospects directly.)_

## KPIs (track weekly)
Prospects sourced · tailored demos built · demos shown · demo→call rate · close
rate · avg cycle time (source→close) · referrals generated. A simple trend on
these tells you whether the loop is accelerating.

## Guardrails
- Claude **prepares materials and tracks pipeline only** — it does **not** send
  outreach to real people, make calls, or touch billing/Stripe/Client OS
  (`/m/[id]`, `/owner/[id]`, `/customers`, Supabase, POS).
- **No PII in the public repo.** Keep real contact data in a private/owner-held
  copy of the tracker (or gitignored); the in-repo CSV stays example-only.
- Logos are **approved overlays only** (never AI-generated); game art is
  **non-human mascots**; the client approves all assets before they're sent/published.

## How to run it
- **On demand:** open a session and say _"run the weekly acquisition loop."_
- **Scheduled (durable):** a weekly Claude Code (web) trigger is the reliable way
  to fire it, since the remote container is ephemeral and won't hold a multi-day
  in-session timer. `/loop` works for self-paced runs while a session is alive.
