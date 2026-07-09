# Game Standardization Plan — multi-tenant & sellable (same model as the menu)

> Goal: sell the **game** to cafés the same way as the **menu** — one engine + per-café
> config in Supabase + served by id at `/play/[id]`. New café = add a config row + their
> ad image; no rebuild. The owner can edit their game branding from the dashboard.

## Where we are (grounded in the code)

- **The engine is already in the Fina Calle app** (`amma-fina-calle`, on `main`):
  - Route: `APP/web/src/app/penalty-shootout/page.tsx` + `PenaltyClient.tsx`.
  - Engine: `src/penalty/` — `PenaltyScene.ts`, `engine/`, `geometry.ts`, `input/`,
    `skin/PenaltyRenderer.ts`, `types.ts`, `config.ts`.
- **Per-café skin = the Campaign Pack** (`src/penalty/skin/campaigns.ts`): `getCampaign(id)`
  returns `{ adZone image, player kit, keeper kit, title }` per skin id (STADIUM / DEFAULT /
  COLATTAO). **Config is already separated from the engine** — this is the whole foundation.
- So the fork ("where does the engine live") is **settled: in the Fina Calle app**, alongside
  the menu, the owner dashboard, and Supabase. No porting needed.

## The standardization (mirror the menu, exactly)

| Menu (done) | Game (this plan) |
|---|---|
| `menu_items` in Supabase per `restaurant_id` | **`game_config` in Supabase per `restaurant_id`** |
| `/m/[id]` renders the café's menu data | **`/play/[id]` runs the engine with the café's config** |
| Owner edits price/photo via the rail | Owner edits ad image / kit colors via the rail |
| New café = add menu rows | New café = add one game_config row + an ad image |

### 1. `game_config` table (Supabase)
Keyed by `restaurant_id`:
`{ restaurant_id, title (skin id), ad_zone_image_url, player_primary, player_secondary,
keeper_primary, keeper_secondary, enabled, updated_at }`. RLS owner-scoped writes;
a public `get_game_config(id)` security-definer read (mirrors `get_public_menu`).

### 2. `/play/[id]` route
Reads the café's `game_config` by id → builds a `PenaltyCampaign` from it (instead of the
hardcoded `getCampaign`) → mounts `PenaltyClient` with that campaign. The café's QR points
here. `/penalty-shootout` stays as the default/demo.

### 3. Owner dashboard — "Your game" card
Upload the behind-goal ad image, pick player/keeper kit colors, toggle enabled — through the
same audited rail as menu edits. The owner brands their own game.

### 4. Multi-tenant by default
One engine, per-café config rows, RLS. Café #2…#500 = a row + an ad asset. No code.

## Colattao
Colattao Rush (the arcade game in the *Colattao Rush* repo) stays the **bespoke flagship**.
The **sellable, standardized** game is the Penalty Shootout at `/play/[id]`. Seed Colattao's
penalty campaign into `game_config` as the first tenant (its existing `COLATTAO_CAMPAIGN`).

## Phasing
- **A — Foundation:** `game_config` table + `get_game_config` + `/play/[id]` loading config
  into the engine. Seed Colattao. Proves the loop (sell a QR → branded game by id).
- **B — Owner editing:** the dashboard "Your game" card (ad upload, kit colors).
- **C — Catalog:** generalize the single title into a registry so each café can get a
  different game (e.g. the soccer Penalty Shootout now; a next title later).

## Caveat
The Penalty engine + Campaign Pack are mature but live on `main` (not the current
`feat/owner-dashboard-premium` branch). The game work starts on a **fresh branch off `main`**.
The protected game internals (engine/geometry/input/renderer) are NOT changed — we only add a
data source for the campaign + a per-id route.
