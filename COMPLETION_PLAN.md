# COMPLETION PLAN — autonomous backlog (cloud Claude, `amma-fina-calle`)

> **Why this exists.** A durable, resumable plan so cloud Claude can drive the in-scope
> work toward "finished" **without per-step prompting**. Any session (or a `/loop`)
> reads this, works the next unchecked item, verifies, self-merges, checks it off, and
> repeats — stopping when the backlog is done or it hits an **owner-gated** blocker.
>
> Last updated: 2026-06-10.

## Operating rules (the autonomy contract)
- **Scope:** `amma-fina-calle` only (this repo). Never touch Client OS routes
  (`/m/[id]`, `/owner/[id]`, `/customers`), Supabase, Stripe, secrets, or customer data.
  Honor all guardrails in `CLAUDE.md` / `FOUNDATION.md`.
- **WIP = 1.** One item at a time, in order. Don't invent scope beyond this list.
- **Verify before merge:** `tsc --noEmit` + (for `services/voice-gateway`) `npm run simulate`;
  for app changes, wait for the Vercel preview to go **Ready**. Then squash-merge.
- **Check it off here** (same PR or the next) so state is visible and resumable.
- **Stop + report** when: an item is **owner-gated** (needs a key/account/decision/field
  work), the backlog is complete, or an item would require a large refactor / risky change.
- Each item must be **verifiable without external keys** (keyless simulator / OSM defaults),
  or it's owner-gated.

## Autonomous backlog (in order)
- [x] **1. Lead engine — Batch 2 (groomers + salons).** Research real, independent
      Hampton Roads pet groomers + salons/barbers/spas; add to `starter-packs.ts` so they
      join the default board + the Load-starter button. Verify build. ✅ +17 (6 groomers
      HOT, 11 salons/barbers/spas) → 43 total in the default Hampton Roads pack.
- [x] **2. Lead engine — multi-territory packs.** Give the Richmond + Norfolk territories
      their own real starter packs (today only Hampton Roads has leads), so switching
      boards is immediately useful. ✅ RICHMOND_STARTER (11) + NORFOLK_STARTER (10);
      STARTER_EVENTS now spans all three territories (ids territory-prefixed).
- [x] **3. Lead engine — outreach export.** A "Export pipeline (CSV)" action so leads +
      stage + contact can leave the arcade for outreach (complements the JSON log export).
- [x] **4. Lead engine — enrichment keys doc.** A short `docs/` note + tiny in-app hint:
      how to add the free `YELP_API_KEY` + `FOURSQUARE_API_KEY` in Vercel to lift Survey
      hit-rate. (Adding the keys themselves is owner-gated.)
- [ ] **5. Voice gateway — native MoeGo + Gingr connectors.** Write them against the
      `BookingConnector` contract with simulator stubs (keyless-verifiable), so the
      groomer vertical has first-class connectors beyond the generic webhook bridge.
- [ ] **6. Docs refresh.** Update `FOUNDATION.md`, the Code Atlas, and
      `AI_PHONE_ASSISTANT_PLAN.md` status to reflect the above; ensure
      `SALES_DEMO_PACKAGE/DEMO_URLS_AND_TALK_TRACK.md` lists `/command-center` + `/lead-arcade`.

## Owner-gated — only you can finish these (cloud Claude STOPS and surfaces them)
- **Push VBFH to GitHub** (`gh repo create vbfh-media-engine --private --source . --push`)
  → unblocks cloud productization of the #1 build bet.
- **Voice gateway go-live:** add `OPENAI_API_KEY` + a Twilio number + `PUBLIC_HOST`; make one real call.
- **Survey hit-rate:** add free `YELP_API_KEY` + `FOURSQUARE_API_KEY` in Vercel.
- **The actual outreach** with the lead list (field/sales work) + **client asset approvals**.
- **Decisions:** VBFH trigger 2a vs 2b; next active build after VBFH (Colattao Cafe Rush vs Newsroom).

## Definition of done (this plan)
All backlog items checked, each shipped + verified; owner-gated items collected in one
hand-off message. Then cloud Claude stops and waits for the owner's next direction.
