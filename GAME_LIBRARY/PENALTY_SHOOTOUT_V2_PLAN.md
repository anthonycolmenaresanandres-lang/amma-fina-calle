# Penalty Shootout V2 — Reusable Client-Customizable Game (Plan)

> **Status: PLAN ONLY. Not implemented.** V1 is live in production (`/penalty-shootout`,
> merged PR #6). Preserve V1 stability first; this document is the design we refactor toward.
> Reuse anchor: the repo already has a per-client brand layer — `getBrandAssets(id)` in
> `src/lib/brand.ts` (id-keyed, assets in `/public/assets/{id}/`, render-only-if-present).
> V2's skin system extends that, it does not reinvent it.

---

## 1. Current architecture summary

**Files:** `src/penalty/{types,config,PenaltyScene}.ts` + `src/app/penalty-shootout/{PenaltyClient,page}.tsx`.

- **`types.ts` / `config.ts`** — data: 6 `PENALTY_ZONES`, `baseColors`, `baseRules`, 3
  `PENALTY_LEVELS` (difficulty = keepers). Balance + colors already centralized here. Good base.
- **`PenaltyScene.ts`** — **monolithic** Phaser class owning *everything*: match state machine
  (`aim→shooting→result→gameover`), layout (`getLayout` from `gameSize`, resize-aware), **input**
  (`pointerdown→zoneNearest→takeShot`, `pointermove` hover), **shot resolution** (keeper read +
  save model + miss), **animation** (delta-accumulator tweening in `update()`), and **all
  rendering** (pure graphics primitives — asset-free).
- **`PenaltyClient.tsx`** — React mount, level-select, Back/Replay, dynamic Phaser import, `Scale.RESIZE`.

**Facts that shape V2:**
- Input is **tap-only** (nearest of 6 zones). No swipe, no power.
- The **only skin hook today is `colors`** (numeric Phaser colors). No images/kicker/background.
- Rendering and logic are **fused** — can't reskin or change input without touching the engine. Main thing to fix.
- It is **asset-free / no-404** by design — preserve this as the fallback.

## 2. Recommended customization architecture (engine / input / skin)

Split the monolith into three contracts; one-way dependency (`skin → engine`, `input → engine`;
engine depends on neither):

**A. Core gameplay engine** — `src/penalty/engine/`, **pure TS, no Phaser, no DOM.**
- Owns the state machine, score, keeper-read + save + miss model, ratings.
- API: `resolveShot(intent: ShotIntent, level) → ShotResult` + a `MatchState` reducer.
- `ShotIntent = { column, row, power }` (power 0–1). Deterministic + unit-testable.
- **Frozen contract** — skins/inputs never modify it (mirrors old Colattao Rush "What Not To Touch" discipline).

**B. Input system** — `src/penalty/input/`, interchangeable, emits a normalized `ShotIntent`.
- `TapInput` (today) and `SwipeInput` (new), chosen by `inputMode: "swipe" | "tap" | "auto"`.
- Input never resolves outcomes — only emits intent. Change input without risking balance.

**C. Visual skin layer** — `src/penalty/skin/` + a `PenaltyRenderer` that reads a `PenaltySkin`.
- Draws **sprites when assets present, primitives when not** (fallback = today's look → no-404 preserved).
- `PenaltySkin` is **data keyed by restaurant id**, loaded through a registry that **extends `brand.ts`**
  (same `/public/assets/{id}/` convention).
- `PenaltyScene` becomes a thin orchestrator: `engine + chosen input + renderer(skin)`.

Result: gameplay stays stable because **only the engine touches rules**, and that's the one piece that
doesn't change per client.

## 3. Swipe-shot system (assisted, stable — NOT raw physics)

A **smart assisted swipe** that resolves to the existing zone+power model (keeper AI/balance untouched):

- **touchstart** — record origin + timestamp anywhere in the lower play area; enter `aiming`; ball "loaded."
- **drag** — compute drag vector `(dx, dy)`; render live **aim arrow + power meter**. Up-swipe = higher;
  left/right angle = horizontal aim; length = power.
- **release** — fire.
- **Assisted mapping (stability layer):**
  - **Direction:** drag angle → aim point across the goal mouth, then **magnetize to the nearest of the 6
    zone centers** within tolerance. Clamp extreme angles so a wild flick still lands on-goal (demo-safe).
  - **Power:** drag length → clamped power band (floor prevents dead flicks; ceiling prevents launches).
    Feeds `ShotIntent.power`: low power → keeper reaches more easily; max power into a top corner → reuse
    existing `missChance` for risk/reward. Skill, not chaos.
  - Resolution still flows through `resolveShot` → **identical save model**, plus a power modifier.
- **Fallback tap mode** — drag distance < threshold (a tap) → today's nearest-zone tap. `inputMode: "auto"`
  = swipe-with-tap-fallback (mixed devices + accessibility). Ship default `tap` until swipe passes device
  QA, then flip default — zero-risk rollout.

## 4. Asset requirements (skin schema + intake)

**`PenaltySkin` schema (all art optional; primitive fallback per item):**
- `id`, `displayName`, `brandName`, `skinName`
- `palette: PenaltyColors` (exists — drives primitives + sprite tints)
- `assets?`:
  - `kicker` — sprite (idle + kick pose, 2–3 frames), anchor + scale
  - `keeperOutfit` — branded shirt/jersey sprite **or** color overlay + logo decal
  - `logo` — restaurant logo (shirt decal / corner watermark / on ball)
  - `background` — restaurant interior image behind the goal (renderer applies a dark contrast scrim)
  - `ball` — product-themed ball/prop (e.g., coffee cup) + optional spin frames
  - `props?` — sideline banners/signage
- `layout?` — optional offsets/scales so a client photo/character fits the goal placement
- **Hard rule:** a skin may NOT change `zones`/`rules`/engine. Missing asset → primitive fallback (no 404).
  Budget: transparent WebP/PNG, **< 1–2 MB total** (per existing Conquest/penalty asset note).

**Minimum asset intake checklist per restaurant:**
- ✅ Logo — transparent PNG/SVG, light variant for dark bg, ≥ 512px
- ✅ Brand palette — 2–4 hex (primary / accent / dark)
- ✅ Business name + game title/skin name + short copy (EN/ES)
- ➕ *Branded tier:* kicker reference + keeper shirt color & logo placement
- ➕ *Immersive tier:* restaurant interior photo — landscape, high-res, **owner has rights**, uncluttered behind goal
- ➕ *Optional:* product-themed ball reference (signature item)
- ✅ All assets optimized, transparent where needed, ownership/license confirmed

## 5. Product tiers

| Tier | Name | Includes | Art effort | Package |
|---|---|---|---|---|
| 1 | **Quick Skin** | Palette + logo + custom title/copy; primitives otherwise | None (config only) | Starter |
| 2 | **Branded Character** | Quick Skin + custom kicker and/or keeper jersey w/ logo + product-themed ball | Medium | Premium |
| 3 | **Immersive Restaurant** | Branded Character + restaurant interior background + props + bespoke copy/SFX | High | Custom |

(Aligns with Starter/Premium/Custom in `CASE_STUDIES/COLATTAO/DOCS/PRICING_AND_OFFER.md`.)

## 6. Safest build order (stability-first; each step ships + is reversible)

1. **Pure refactor, zero behavior change** — extract `engine` + `renderer` + `input` (`TapInput`) out of
   `PenaltyScene`; keep primitives + tap. Baseline = merged V1; verify identical. *De-risks everything.*
2. **Skin data layer (colors only)** — add `PenaltySkin` + id-keyed registry extending `brand.ts`; ship the
   **Colattao palette skin** (Quick Skin tier). Asset-free.
3. **Asset-capable renderer** — optional sprites (background, ball, logo) with primitive fallback; ship the
   **Immersive background** as the visible win. Still tap input.
4. **Assisted swipe input** — additive, behind `inputMode` (default stays `tap`); QA on real devices, then
   flip default to `auto`.
5. **Character/keeper sprites** — kicker + branded keeper (Branded tier). Most art-dependent → last.
6. **Packaging** — per-tier skin matrix, intake checklist wiring, demo skins for sales.

Engine contract is frozen after step 1, so steps 2–5 are additive with fallbacks — the game can't regress
for existing demos.

## 7. Next implementation prompt (Step 1 only — when explicitly approved)

> **Scope:** Refactor Penalty Shootout into engine/input/renderer with **zero gameplay or visual change.**
> Do not add swipe, skins, or assets.
> **Do:** Extract a pure `src/penalty/engine/` (state machine, `resolveShot`, save/miss model, scoring — no
> Phaser); a `src/penalty/input/TapInput`; and a `src/penalty/skin/PenaltyRenderer` (current primitives).
> `PenaltyScene` becomes a thin orchestrator wiring engine + TapInput + renderer. Keep `types.ts`/`config.ts`
> as the data source. **Don't touch** Client OS, Conquest, Supabase, etc.
> **Verify:** `npm run build` green; `/penalty-shootout` behaves byte-identically to V1 (same tap flow, 3
> keepers, 5 shots, score/rating); route still prerenders static; mobile behavior identical before any V2 feature.

---

### One-line recap
Current = capable but **monolithic + tap-only + colors-only skin** · Recommended = **engine / input / skin split**
reusing `brand.ts` · Swipe = **assisted swipe → zone+power intent with tap fallback** · Assets = **optional
`PenaltySkin` with primitive fallback + intake checklist** · Tiers = **Quick Skin / Branded Character /
Immersive** · Order = **refactor → color skins → asset renderer → swipe → characters**.
