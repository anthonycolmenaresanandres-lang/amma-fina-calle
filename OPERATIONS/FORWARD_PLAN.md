# Forward Plan — from 2026-06-08

_Two tracks run in parallel: **this window + Anthony = ANALYZE/SELECT** (Colattanini items, character
art review); a **second Claude window = EXECUTE** the sales engine. Codex runs the code queue._

> **Hard rule (Anthony, 2026-06-08):** NEVER assume menu items. Colattanini characters must be REAL
> Colattao menu items, **selected by Anthony**, and named from the real item names only — no invented
> names (e.g. there is no "Cali Croissant"; the real item is "California Sandwich"). Source of truth =
> the seed migration `*_menu_sizes_and_colattao_seed.sql` / Supabase `get_public_menu`.

## Phase 0 — Analyze & select  (NOW · this window + Anthony)
- **Select the Colattanini items** from the real menu (recommend 3). Candidates below.
- Decide character naming convention: use the **exact item name**, or an Anthony-approved nickname
  derived from it. No invented items or names.

**Real-menu candidates (named exactly):**
- Drinks/Favorites: Churro Latte · Dulce de Coco · Dark Chocolate Habanero · Flan Latte · Panela Coffee with Milk
- Seasonal: Coco Beach · Dolce Banana · Cinnamon Horchata
- Matcha: Blue · Matchai · Strawberry Vanilla
- Kitchen: California Sandwich · Cubano · Chicken Apricot · Montecristo
- Pastries: Cruffin · Pan de Bono · Empanadas · Babka

**Recommended trio (iconic, distinct, one drink / one seasonal / one kitchen):**
Churro Latte · Coco Beach · California Sandwich — all real. Anthony confirms or swaps.

## Phase 1 — Colattanini visuals  (after selection · this window)
1. Write 3 image-gen prompts (one per selected item) → ChatGPT generates art → Codex commits to repo.
2. **Anthony reviews the art first** ("see them before creating") → approves.
3. Finalize collector sheet + counter sign with the REAL names + approved art. (Current collector
   sheet = layout template; names are placeholders pending selection — do not print.)

## Phase 2 — Sales engine  (PARALLEL · second Claude window)
- Product one-pager: Anthony sets tier pricing (`from $—`) → finalize.
- Visual sales kit: 5 per-feature value cards (QR Menu, AI Request Desk, Owner Dashboard, Penalty Game, Colattanini) in the Quiet Ember brand.
- Standardized client onboarding template (profile → menu → brand → QR/sign → site starter → checklist).
- Colattao case-study one-pager → outreach asset for café #2.

## Phase 3 — Product/code  (Codex · `CODEX_QUEUE.md`)
- Notifications email (after Anthony adds RESEND_API_KEY).
- Game standardization Phase A (`/play/[id]`) → unlocks the Colattanini game QR (swap collector-sheet QR from `/penalty-shootout` to `/play/colattao`).

## Phase 4 — Decisions  (Anthony gates)
- Ship `/m` menu to prod? · add 2nd admin? · set pricing · Encanto (parked).

## Lanes
Claude designs/decides/drafts · Codex builds · Clone automates · Anthony approves anything public, priced, or secret-bound. All agents check in/out in `HANDOFF_LOG.md`.
