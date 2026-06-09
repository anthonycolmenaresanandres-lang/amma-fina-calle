# AMMA Ventures — Business Plan & Operating Picture

_AMMA Ventures LLC (DBA Fina Calle), Virginia Beach / Hampton Roads, VA._
_Working document. Owner runs on intuition + relationships; this is the analysis
layer — the things that are hard to see from inside the day-to-day._

---

## 0. The thesis — "The Managerial Factory"

Service and studio businesses usually **don't scale** because every client is
**bespoke craft labor**: cost grows linearly with clients, quality depends on the
founder's hands, and the founder *is* the bottleneck. You can only sell as many
hours as you have.

AMMA's bet is to apply **factory principles to the managerial and creative
process itself**, with **code + AI as the machinery**:

| Factory concept | AMMA equivalent |
|---|---|
| Interchangeable parts / standardization | **Frozen Stadium Shell + Campaign Pack** — the engine never changes; only per-client variables do (ad zone, player/keeper kit, menu, print campaign) |
| Assembly line / flow | The **loops**: Acquire → Build → Activate → Monetize → Expand, each a station |
| Machines / robots on the line | **Claude** (process, wire, QA, analysis), **ChatGPT** (art generation), **Codex** (local file ops/builds), and **code** (the game engine, CI, Vercel deploy) |
| Jigs & dies (what makes output repeatable) | **Prompt libraries, asset specs, dossier templates, playbooks** |
| Quality control / jidoka (stop-the-line) | **Verification gates**: typecheck, composite previews, phone QA, no-404 primitive fallback, brand-fidelity rules (approved logos only) |
| Bill of materials / SKUs | **Campaign Pack tiers** + Client OS subscription + print campaigns |
| Kaizen / the learning curve | Each client **adds to the asset library + templates**, so the next client is cheaper and faster |
| Theory of Constraints | Find the current bottleneck and automate/relieve it (today: founder sales time + art fidelity) |

**Implication:** the founder's job is **designing and tuning the factory** (the
products, the jigs, the quality gates, the sales motion) — *not* doing the line
labor. The moment the founder is pulled back into bespoke production, the factory
stops being a factory. Everything below serves that thesis.

---

## 1. What AMMA sells

**Fina Calle OS** — a done-for-you customer-engagement + digital-presence system
for local restaurants/cafés. Components (already built or productized):
- **Digital menu** (`/m/[id]`) + **owner dashboard** + QR signage + simple update workflow.
- **Branded mini-game** — Penalty Shootout, recolored per client (the engagement hook).
- **Collectible loyalty** — Colattanini sticker album + giveaway stickers (repeat-visit driver).
- **Website generation** (Web Studio) and a content/asset pipeline.

First live client: **Colattao** (café) — real, live, with a case study. The whole
stack is proven end-to-end on one client; the job now is to **turn the crank**.

---

## 2. Market & opportunity (grounded)

**Local density (the beachhead).** Virginia Beach alone has on the order of
**~350 single-owner (independent) restaurants** (≈61% of ~574 counted), within a
broader count up to ~1,500 food establishments; **Hampton Roads** multiplies this
across Norfolk, Chesapeake, Newport News, Portsmouth, Suffolk, Hampton. A
founder-led, **locally dense** motion only needs a few dozen clients to be a real
business — the TAM is not the constraint; throughput is.

**The economic argument that sells the product (retention):**
- A **5% increase in retention → 25–95% more profit**; **~65% of restaurant
  revenue** comes from repeat customers; retained customers are worth ~1.7×, highly
  engaged loyalty members ~3.4×.
- Loyalty members **spend 18–30% more per visit** and generate **12–18% more annual
  revenue**; acquiring a new customer costs **5–25× more** than retaining one.
- **Gamified** loyalty shows **~37% higher active participation** and **~22% higher
  app/engagement retention** than flat points; case studies (e.g. KFC Rewards
  Arcade) report 26–44% lifts in active use. Gen Z expects gamified, mobile-first
  experiences.

This is AMMA's wedge in one sentence: **"You lose money chasing new customers;
we make the ones you have come back — with a game and a collectible, not a boring
punch card."**

**Competitor pricing context (what the market pays per month):**
- Budget QR/stamp tools: **$29–69/mo** (BonusQR ~$29, Square Loyalty ~$45, SpotOn ~$65).
- Mid-tier: **$59–299/mo** (Kangaroo, etc.).
- POS-integrated: **Toast Marketing ~$185/mo**, effectively **$254–379/mo** all-in.
- Enterprise (Punchh/Paytronix): **$500–2,000+/mo**.

**Positioning:** AMMA is **not** a $29 commodity QR menu. It bundles menu + game +
collectible loyalty + website + done-for-you service for the **independent** who
will never buy/operate Toast-tier tooling. Price in the **$59–149/mo** band where
it undercuts POS-integrated loyalty while delivering more (and more *fun*), with a
**setup fee** that funds the Campaign Pack production.

---

## 3. Product line / SKUs

1. **Setup / Campaign Pack** (one-time): production of the client's skin (ad zone +
   kits), menu, QR signage, and starter collectible campaign. Tiered (Basic /
   Signature / Seasonal).
2. **Fina Calle OS subscription** (monthly recurring): hosting, digital menu,
   dashboard, game layer, light updates. The compounding revenue.
3. **Campaign refreshes** (recurring à la carte): seasonal collectible sets, new
   game skins, holiday promos — repeatable high-margin add-ons (Colattanini-style).

The subscription compounds; the refreshes are the **factory's repeat orders**.

---

## 4. The factory (how the work actually gets done)

- **Stations (loops):** Acquisition loop (`GROWTH/AMMA_CLIENT_ACQUISITION_LOOP.md`),
  Production loop (Campaign Pack assembly), Activation/onboarding, Refresh loop.
- **Machines:** Claude (wiring/QA/analysis/PRs), ChatGPT (art), Codex (local), the
  game engine + CI + Vercel.
- **Jigs:** `PROMPTS/` libraries, `ASSET_SPECS/`, `PRODUCT_MODULES/GAME_CUSTOMIZATION_PROTOCOL.md`,
  dossier templates, sales playbooks.
- **Quality gates:** typecheck, composite preview, phone QA, no-404 fallback,
  **brand-fidelity rules** (approved logos only — the AI-logo/low-res issues we hit
  are exactly the QC that must be a hard station at scale).
- **Marginal cost per client → near zero:** production is AI+code, so COGS is mostly
  hosting (Vercel/Supabase) + minor compute. The constraint is **acquisition and
  brand-QC throughput**, not production capacity.

---

## 5. Go-to-market

The **client-acquisition loop** (already shipped) is the GTM engine: Source →
Qualify → **Tailored Demo Hook** (recolor the game to their brand + a sample
collectible of their signature item) → Reach → Demo → Close → Onboard → Expand
(case study → referrals). Local, in-person + Instagram, bilingual. The tailored
demo is the differentiator: prospects see **their own brand** in the product
before they pay a cent.

---

## 6. Unit economics (illustrative — validate with real deals)

Assume: subscription **$99/mo**, setup **$300–600**, hosting/compute **~$10/client/mo**.
- **Gross margin ≈ 85–90%** on subscription (AI+code production, near-zero COGS).
- **LTV** (e.g. 18-mo retention): setup + 18×$99 + refreshes ≈ **$2,000–3,000+**.
- **CAC**: mostly **founder time** — which the acquisition loop + dossier bot
  compress. Keep CAC honest by tracking demo→close and hours-per-close.
- **Break-even** is a small number of clients because fixed costs are low; the
  early constraint is **cash timing** (setup fees fund production; subscription
  compounds slowly) and **founder hours**, not unit profitability.

---

## 7. Competitive landscape & moat

**Field:** Square/SpotOn/Toast loyalty (commodity, self-serve, no done-for-you
local service, no bespoke game), generic QR-menu vendors (no engagement), agencies
(bespoke, expensive, don't scale).

**AMMA's moat is *not* the game** (copyable). It's the **compounding system**:
- **Local density + relationships** (hard to displace once you own a neighborhood).
- **Asset/template library** that makes each client cheaper than the last (learning curve).
- **Integrated stack** (menu + game + collectible + site + service) no single
  competitor bundles for the indie segment.
- **Speed** (factory throughput): tailored demo in minutes, launch in days.

Defensibility grows with **client count and library depth**, not features.

---

## 8. Risks & blind spots (the part that's hard to see)

1. **Founder is the single point of failure** — designer + closer + QC all in one.
   The factory thesis collapses if you get sucked into line labor. *Mitigation:*
   guard your time religiously; push every repeatable task into a jig/loop/agent.
2. **Prove ROI or it's a "gimmick."** Retention stats are industry-wide; *your*
   client needs to *see* their own lift. **Instrument every client** (QR scans,
   game plays, sticker redemptions, repeat-visit proxy) — without per-client proof,
   churn and price resistance rise. **This is the most important missing piece.**
3. **Churn / fragility of small indies** — restaurants close, owners are
   distracted and price-sensitive. Expect higher churn than SaaS norms; price the
   setup fee to de-risk, and concentrate on operators with foot traffic.
4. **Brand-fidelity QC at scale** — the AI-logo / low-res issues we just hit will
   recur. Make "approved logo overlay + resolution gate" a hard, non-skippable
   station, or quality drifts as volume grows.
5. **Platform dependency** — Supabase, Stripe, Vercel, OpenAI, Anthropic: cost
   creep, ToS, and outages are existential to a one-person shop. Watch spend; have
   fallbacks documented.
6. **Privacy/PII** — Client OS holds customer data; keep prospect/customer PII out
   of the repo, get marketing consent, and stay clear of regulated handling.
7. **Cash flow timing** — front-loaded production cost, slow-compounding MRR. Pace
   intake to capacity; use setup fees as the working-capital bridge.
8. **Segment concentration** — the bilingual/local wedge is excellent for density
   but exposed to local/economic shocks. Great to start; diversify deliberately later.

---

## 9. Roadmap & KPIs

**Next 90 days (suggested):**
1. **Instrumentation** — per-client engagement dashboard (scans/plays/redemptions)
   so ROI is provable. *(Highest-leverage missing piece.)*
2. **Client Dossier system** — automate prospect research → faster tailored demos (next deliverable).
3. **Run the acquisition loop weekly** against a real lead list; target first 3–5 paying clients.
4. **Harden the brand-QC station** (logo/resolution gates) and the Campaign Pack tiers + price sheet.

**KPIs to watch:** clients signed · MRR · setup revenue · gross margin · CAC
(hours/close) · demo→close rate · per-client engagement lift · churn · refresh
attach rate · **hours of founder bespoke labor (drive toward zero)**.

---

## Sources (market data)
- Loyalty pricing: voucherify.io, geekyants.com, spoton.com, bonusqr.com, medium.com/@hello_44288
- VA Beach / Hampton Roads counts: oysterlink.com, rentechdigital.com, city-data.com
- Retention economics: restroworks.com, fishbowl.com, nory.ai, marketingltb.com
- Gamification lift: loyaltyplant.com, foodinstitute.com, oracle.com, openloyalty.io

_Figures are directional, drawn from public 2025–2026 sources; validate against
your own closed deals before treating any as fixed._
