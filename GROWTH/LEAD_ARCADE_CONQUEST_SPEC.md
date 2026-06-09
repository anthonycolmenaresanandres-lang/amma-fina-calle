# Lead Arcade — "Fina Calle Conquest" (build spec, for review)

_The owner's lead-review tab, reimagined as a **territory-conquest / idle-tycoon
game** (Age-of-Empires / idle-clicker feel): the local market is a map, every
business is a tile you **click to work**, and the ones you convert become
**buildings that generate income**. Playing the map *is* running the acquisition
factory. Ties to the repo's existing "Fina Calle Conquest" theme._

> **The core idea that makes it more than a toy:** the game state **mirrors the real
> pipeline**, and the money is **real MRR**, not invented. Clicking a business does a
> real pipeline action (or collects its real recurring revenue). So it's a
> management *tool* wearing a game's skin — exactly "bring the factory to the
> managerial process."

## Core loop (game verb = business action)
| Game | Business reality |
|---|---|
| **Scout** a new tile | add a prospect to the list |
| **Survey** the tile | run the Client Dossier (auto-fill the building's info) |
| **Pitch** (deploy banner) | stamp the lean demo + send outreach |
| **Convert** (capture the tile) | close the deal → tile becomes a built shop |
| **Hold / collect** | client pays MRR → click the building to "collect" + it ticks income |
| **Upgrade** | refresh campaign / upsell → building tiers up, income rises |

## The map & buildings
- **Territory map** (start: Virginia Beach / Hampton Roads) dotted with **business
  tiles** placed by real location.
- **State-based building tiers** (visual progression = pipeline stage):
  `Prospect (tent/marker)` → `Surveyed (info flag)` → `Pitched (banner)` →
  `Client (shop)` → `Flagship (landmark, top tier)`.
- **Click a tile → side panel**: the **stamped demo preview**, dossier summary
  (rating, signature item, fit score HOT/WARM/COLD), MRR if a client, and a single
  **next-action button** ("Survey" / "Generate demo" / "Mark contacted" / "Mark
  closed" / "Collect"). One click = one real step forward.

## Economy & HUD (real numbers, game presentation)
- **Treasury / income:** total **MRR** = "gold per month"; HUD shows MRR, # clients,
  cumulative revenue. *(Sourced from the lead/client data — real, not fake.)*
- **Funnel as territory control:** counts of Prospect/Surveyed/Pitched/Client shown
  as "tiles held."
- **Juice (the fun):** coin-pop on collect, capture fanfare (reuse the penalty
  **"GOAL!"**), building upgrade animation, subtle ambient map. Optional sound.
- **No vanity inflation:** idle "income" reflects actual MRR cadence; the game never
  invents money, so the HUD doubles as your real revenue dashboard.

## Data model (seed; PII stays private)
A `leads` array, each: `id · name · type · lat/lng (or grid x/y) · dossier{rating,
signature, fit} · stage · mockupPath · mrr`. v1 reads a **sample seed JSON** (no real
contact data in the repo); real lists live in a private/owner store or are pasted in.

## Tech approach
- **Reuse Phaser** (already in the stack for the penalty game) for the map canvas,
  tiles, click handling, and animations — same engine, consistent feel, no new dep.
- **Standalone page/route**, **outside Client OS routes** (`/m/[id]`, `/owner/[id]`,
  `/customers`) and touching **no Supabase/Stripe/customer data**.
- **v1 = static + seeded**, state in `localStorage` (or the seed JSON); deployable on
  Vercel so it opens on your phone. No backend required to start.

## MVP (v1) scope
1. Map with business tiles from the seed JSON.
2. Click tile → panel (stamped mockup + dossier + stage-advance button).
3. HUD: total MRR, clients, funnel counts.
4. Capture/collect feedback (coin pop + GOAL fanfare), building tiers by stage.
5. Add-a-lead (manual) that drops a new Prospect tile.

## Roadmap
- **v2:** wire to the live lead list (dossier output) so Survey auto-fills.
- **v3:** sync real MRR (owner-entered or, later, read-only from billing — owner-driven).
- **v4:** multiple territories / neighborhoods; leaderboards vs goals.

## Guardrails
- Standalone internal page; **never** touches Client OS routes, Supabase, Stripe, or
  customer data. **No PII in the repo** (seed data is fictional/sample). Approved
  logos only in any stamped previews. Honest economy (real MRR, no fake numbers).

---
_Status: SPEC for owner review. On approval, build v1 (Phaser map + seed + panel +
HUD) and deploy to Vercel for phone QA._
