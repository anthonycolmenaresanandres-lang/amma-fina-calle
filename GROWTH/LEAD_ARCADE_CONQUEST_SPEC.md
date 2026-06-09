# Lead Arcade — "Fina Calle Conquest" (build spec v2)

_The owner's lead-review tab as a **territory-conquest / idle-tycoon** (Age-of-
Empires feel): the local market is a board, every business is a tile you **click to
work**, and converted ones become **buildings that show real income**. Playing the
board *is* running the acquisition factory._

> **v2 status: conditionally approved.** This revision folds in a deep design review
> (gamification / self-determination theory + Phaser/Next.js/maps/persistence/
> accessibility realities). The five required changes are marked **[GATE]** below.

> **What makes it more than a toy:** game state **mirrors the real pipeline**, the
> money is **real MRR** (never invented), and **every click emits exactly one business
> event**. It's a management console wearing a game's skin.

## Core loop (game verb = one business event)
| Game | Business action | Event emitted |
|---|---|---|
| **Scout** a tile | add a prospect | `SCOUTED` |
| **Survey** | run the Client Dossier (fills the tile) | `SURVEYED` |
| **Pitch** | stamp the lean demo + send outreach | `PITCHED` |
| **Convert** | close the deal → built shop | `CLOSED` (records `mrr`) |
| **Collect** | acknowledge a confirmed payment | `COLLECTED` (amount tied to a real/recorded payment) |
| **Upgrade** | refresh/upsell → building tiers up | `UPGRADED` |

## Architecture **[GATE 1: split canvas vs UI]**
- **Phaser = the world only:** illustrated board, tiles/sprites, capture animation,
  camera focus. (Reuses the engine already in the stack; no new dep.)
- **HTML/React = the management UI:** HUD bar + lead side-panel (mockup, dossier, CTA,
  states) — for density, accessibility, and future controls. Phaser DOM elements share
  one container/camera and are wrong for a dense panel, so the panel is native UI.
- **Route group + feature folder** (keeps it fully isolated from Client OS):
```
APP/web/src/app/(internal)/lead-arcade/page.tsx   # client component shell
APP/web/src/features/lead-arcade/phaser/WorldScene.ts
APP/web/src/features/lead-arcade/ui/HudBar.tsx
APP/web/src/features/lead-arcade/ui/LeadPanel.tsx
APP/web/src/features/lead-arcade/state/reducer.ts  # event-sourced
APP/web/src/features/lead-arcade/data/seed.json    # fictional, no PII
APP/web/src/features/lead-arcade/lib/selectors.ts  # derive HUD/funnel/MRR
```

## Event-sourced state (the real product)
Persist the **event log**, derive everything else.
- `event`: `{ leadId, action, at, fromStage?, toStage?, amount?, note? }`
  where `action ∈ {SCOUTED,SURVEYED,PITCHED,CLOSED,COLLECTED,UPGRADED}`.
- `lead` (derived/snapshot): `{ id, name, businessType, position{x,y}, dossierSnapshot,
  stage, mockupPath, mrr, tier }`.
- Selectors compute HUD (total MRR, clients, cumulative revenue), funnel counts, and
  recent activity from the log. One click → one event → state re-derives.

## Map strategy **[GATE 2: illustrated board, not GIS]**
- v1 renders a **stylized illustrated Hampton Roads board**; tiles placed by authored
  `position{x,y}`. `lat/lng` may ride along as **optional future metadata**.
- Real cartography (Leaflet/MapLibre, clustering, `fitBounds`, sidebar padding) is a
  **separate later product**, not v1.

## Economy honesty **[GATE 4: Collect = real income only]**
Separate three things, never conflate:
1. **Run-rate** — sum of active clients' monthly `mrr` (HUD's "gold/month"; real).
2. **Recorded payment** — an owner-confirmed payment (manual entry today; billing
   stays owner-driven, no Stripe hookup).
3. **Collect animation** — coin-pop *visualizing* a recorded payment. It **never**
   mints money or fakes an idle tick. The HUD always reflects truth.

## Progression without leaderboards **[GATE 3: no public ranking]**
- Drop competitive leaderboards from the early roadmap.
- "Score" = **territorial control %** (converted / total in territory) + **private
  goals** + operational **streaks**. Empire fantasy, SDT-safe (supports autonomy/
  competence instead of eroding them).

## Persistence **[GATE 5]**
- v1: **`localStorage`** for the small seed + event log (client-only access — guard
  behind `useEffect` / client components; static export has no server).
- Prepared migration to **IndexedDB** if the dataset/write-frequency grows.
- Deploy as a **protected Vercel preview** (password/auth) for internal phone QA.

## Mobile / audio / accessibility
- **Input/scale:** Phaser unifies mouse+touch; Scale Manager `FIT`/`RESIZE`. If pan/
  zoom is added later, set explicit `touch-action` to avoid `pointercancel` from
  browser gestures; use the native camera for "focus the captured tile."
- **Audio:** no autoplay — the "GOAL!" fanfare arms **after the first tap** or via a
  sound on/off toggle.
- **A11y:** because HUD/panel are real HTML — honor `prefers-reduced-motion` (tone down
  fanfare) and announce "tile captured / demo generated / payment recorded" via an
  `aria-live`/`status` region without stealing focus.

## v1 cut line (ruthless)
**In:** illustrated board + seed tiles, click→panel (stamped mockup + dossier + one
next-action button), HUD (MRR / clients / funnel / territory %), event log +
localStorage, one capture animation, manual add-a-lead, manual MRR on close.
**Out (defer to v1.1+):** audio, pan/zoom, upgrade juice, IndexedDB, any live sync,
real maps, multi-territory.

## Roadmap
- **v1.1:** audio toggle, building-upgrade animations, reduced-motion polish.
- **v2:** wire Survey to the live dossier output; IndexedDB if needed.
- **v3:** owner-entered payment ledger → real recorded-payment history (still no Stripe).
- **v4:** multiple territories; private seasonal goals (still no public leaderboard).

## Guardrails
Standalone internal page; **never** touches Client OS routes (`/m/[id]`,`/owner/[id]`,
`/customers`), Supabase, Stripe, or customer data. **No PII in the repo** (seed is
fictional). Approved logos only in stamped previews. **Honest economy** (real MRR,
no minted money).

---
_Review incorporated (2026-06-09). On your green light, build v1 to the cut line and
deploy a protected Vercel preview for phone QA._
