# Fina Calle Game Customization — Company Operating Protocol
_AMMA Ventures LLC DBA Fina Calle_
_Created: 2026-06-07 | Version: 1.0_

---

## Purpose

Define the repeatable, quality-controlled, legally-safe process by which Fina Calle
turns a **reusable game engine** into a **client-branded mini-game** for a restaurant.
Every game customization follows this protocol so gameplay stability, brand
consistency, and legal compliance are guaranteed regardless of who executes it.

**Stable engine. Layered skin. Approval always.**

---

## Core Idea

Fina Calle games are built so that **gameplay never changes per client** — only the
**look** changes. A frozen core engine drives the rules; interchangeable layers
(input, color skin, image assets) sit on top. A client gets a branded experience by
swapping data and art, never by editing game logic. Every client-specific asset is
**approved in writing before it is published.**

---

## Registered Game Packages

### 1. Penalty Shootout — *first reusable customizable game package* ✅

| Field | Value |
|-------|-------|
| Route | `/penalty-shootout` (live in production) |
| Engine | Phaser, mobile-first, asset-free by default (no-404) |
| Status | V1 live; V2 Step 1 (engine/input/skin split), Step 2 (color skins), Step 3 (asset renderer) merged |
| Code | `APP/web/src/penalty/` (`engine/`, `input/`, `skin/`, `geometry.ts`) |
| Skins shipped | **Fina Calle** (default), **Colattao** (color + immersive café background) |
| Pending | Step 4 assisted swipe input; Step 5 kicker/keeper character sprites; product ball |
| Specs | `GAME_LIBRARY/PENALTY_SHOOTOUT.md`, `GAME_LIBRARY/PENALTY_SHOOTOUT_V2_PLAN.md` |

Future game packages (Conquest, and catalog ideas in
`GAME_LIBRARY/GAME_PACKAGE_LIBRARY.md`) adopt this same protocol when productized.

---

## Customization Layers

A client build touches only the upper layers. Lower layers are **frozen**.

| Layer | What it is | Customizable? | Code seam |
|-------|------------|---------------|-----------|
| **1. Core engine** | Rules, scoring, keeper AI, match state. Pure, deterministic, no rendering. | ❌ **Frozen** — never edited per client | `src/penalty/engine/` |
| **2. Input system** | How the player aims/shoots (tap today; assisted swipe pending). Emits a normalized intent only. | ⚙️ Mode toggle only (`inputMode`), not per-client art | `src/penalty/input/` |
| **3. Skin / color layer** | Brand identity + canvas palette (`PenaltySkin.colors`). | ✅ Per client | `src/penalty/skin/skins.ts` |
| **4. Asset renderer** | Optional images: background, logo watermark, ball, (future) characters. **Primitive fallback for every missing asset.** | ✅ Per client | `src/penalty/skin/PenaltyRenderer.ts` + `PenaltySkin.assets` |
| **5. Client approval** | Written sign-off on all client-specific colors and assets before publish. | ✅ Required gate | This protocol + case-study folder |

**Rule:** a skin or asset may never change the engine, the zones, or the rules.
Missing asset → primitive fallback. Asset files live under `/public/assets/{id}/penalty/`,
mirroring the per-client brand convention in `src/lib/brand.ts`.

---

## Registered Default Character: **Fina Calle Sentinel Keeper**

| Field | Value |
|-------|-------|
| Name | **Fina Calle Sentinel Keeper** |
| Role | Recurring company-owned **mascot keeper / boss character** — the default opponent in Penalty Shootout |
| Human? | **Not a real human by default.** A stylized, **faceless** mascot figure. The current in-game keeper (primitive shapes) is the V1 embodiment of the Sentinel. |
| Difficulty variants | **Street** / **Club** / **Pro** (mapped to the 3 keeper levels in `config.ts`; Pro is tinted red as a menace cue) |
| Ownership | Company-owned IP. Reusable across clients; not client-specific. |
| Art rule | Any future Sentinel sprite must remain a **non-human mascot** (mask/helmet/abstract), never a real person's face, unless written approval + rights exist (see Guardrails). |

The Sentinel Keeper is the **default** so no client face or real person is ever
required to ship a game. Clients may commission a **Custom Mascot Keeper** (top tier)
that still must be non-human unless approved.

---

## Registered Ball Direction: **Fina Calle Match Ball**

| Variant | Description | Notes |
|---------|-------------|-------|
| **Fina Calle Match Ball** | Default company ball identity. The current primitive ball is its V1 embodiment. | Company-owned. |
| **Championship-style ball** | A premium, generic "championship" look. | **Generic style only** — never a replica of a trademarked official ball. |
| **Global tournament-style ball** | A "world tournament" feel. | **Generic evocation only** — no official competition marks, names, or replica designs. |
| **Client product-ball** | The ball reskinned as the client's signature product (e.g., a coffee cup). | Client-approved product art; optional `PenaltySkin.assets.ball`. |

Ball art is optional. When no ball asset is supplied, the game uses the primitive
Fina Calle Match Ball (no-404).

---

## Legal / Brand Guardrails (absolute)

> These rules are non-negotiable. When in doubt, default to the generic, company-owned, primitive look.

1. **No unlicensed FIFA / World Cup branding.** Never use FIFA, World Cup, UEFA,
   Champions League, or any federation/tournament name, logo, trophy, or mark.
2. **No official tournament logos or replica official balls.** "Championship-style"
   and "tournament-style" art must be **original/generic** — evoking a style, never
   copying a trademarked design or competition identity.
3. **No real human faces** as keeper or kicker (players, celebrities, owners, staff)
   **unless written approval and likeness rights exist** and are on file.
4. **Client must approve all client-specific assets in writing before publishing**
   (logo, interior photo, product art, colors). Self-collected or AI-generated art is
   marked **PENDING CLIENT APPROVAL** until confirmed — consistent with the Web Studio
   legal rule and `ASSET_REGISTRY/` approval flow.
5. **Only owned, licensed, or client-approved imagery.** No scraped, watermarked, or
   third-party imagery without rights.
6. **No unverified factual claims** in game copy (prices, offers, "official", etc.).

A customization that cannot satisfy these guardrails ships with the **default
company-owned skin** instead.

---

## Customization Tiers

| Tier | What the client gets | Layer(s) | Asset need | V2 step | Sales package |
|------|----------------------|----------|------------|---------|---------------|
| **1. Quick Skin** | Palette + brand/skin name + copy | Color layer | None (config only) | Step 2 ✅ | Starter |
| **2. Color + Logo** | Quick Skin + corner logo watermark | Color + asset | Logo | Step 3 ✅ | Starter/Premium |
| **3. Immersive Background** | Restaurant interior photo behind the goal (+ scrim) | Asset renderer | Interior photo | Step 3 ✅ | Premium |
| **4. Product Ball** | Ball reskinned as the client's product | Asset renderer | Product/ball art | Pending | Premium |
| **5. Custom Kicker** | Branded kicker character | Asset renderer (chars) | Kicker art + rights | Step 5 (pending) | Custom |
| **6. Custom Mascot Keeper** | Bespoke non-human mascot keeper | Asset renderer (chars) | Mascot art | Step 5 (pending) | Custom |

Tiers are additive and map to the Starter / Premium / Custom pricing in
`CASE_STUDIES/COLATTAO/DOCS/PRICING_AND_OFFER.md` and the sales tiers in
`SALES_DEMO_PACKAGE/FEATURE_STATUS_TABLE.md`.

---

## Asset Intake Checklist (per restaurant)

Collected before any client-specific build. All assets land in the client's
`ASSET_REGISTRY/{CLIENT}/` folder and are confirmed via the existing
`ASSET_REGISTRY/ASSET_QA_CHECKLIST.md` / `RESTAURANT_ONBOARDING_PACKET_TEMPLATE.md`.

| Item | Required for tier | Spec |
|------|-------------------|------|
| **Logo** | 2+ | Transparent PNG/SVG, light variant for dark bg, ≥ 512px |
| **Brand colors** | 1+ | 2–4 hex (primary / accent / dark) |
| **Restaurant interior photo** | 3 (Immersive) | Landscape or 4:5, high-res, uncluttered behind goal area |
| **Product reference** | 4 (Product Ball) | Clear shot of the signature item |
| **Uniform / shirt reference** | 5–6 (Characters) | For kicker/keeper outfit branding |
| **Written approval / rights confirmation** | **All** | Client sign-off that Fina Calle may use each asset; likeness rights if any human appears |

- Total optimized art budget per skin: **< 1–2 MB** (transparent WebP/PNG).
- Missing optional asset → primitive fallback (never a 404).

---

## Customization Workflow

1. **Intake** — collect assets + written approval (checklist above).
2. **Skin config** — add the client `PenaltySkin` (colors, brand/skin name) in `skins.ts`.
3. **Asset prep** — optimize art; drop files in `/public/assets/{id}/penalty/`.
4. **Wire assets** — set `PenaltySkin.assets` paths (renderer gates on load, falls back to primitive).
5. **Preview** — build, then phone-QA both the client skin and the default (regression).
6. **Client approval** — written sign-off on the previewed skin before publish.
7. **Publish** — merge to `main` (production deploy) only after approval.

---

## "Clone-of-Anthony" Execution Rules (game customization)

1. **Never edit the engine for a client.** Customization is colors + assets only.
2. **Primitive fallback always.** Every asset is optional; a missing file must never break the scene or 404.
3. **Default skin stays unchanged.** The Fina Calle skin (and the Sentinel Keeper / Match Ball) must render identically to baseline.
4. **No unlicensed sports/tournament branding. No real faces without written rights.** (See Guardrails.)
5. **Approval before publish.** Client-specific colors/assets are PENDING until written sign-off; do not deploy to production without it.
6. **Use verified, owned art.** Pull from the client's `ASSET_REGISTRY/` folder; never invent or scrape client imagery.
7. **One concern per commit; build passes before commit.** Run `npm run build` clean; keep changes scoped to `src/penalty/` + that client's `/public/assets/{id}/`.
8. **Log every decision** (DONE/NEXT/NOTE) in the handoff.

---

## Cross-References

- `GAME_LIBRARY/PENALTY_SHOOTOUT.md` — package spec + lineage
- `GAME_LIBRARY/PENALTY_SHOOTOUT_V2_PLAN.md` — engine/input/skin architecture + build order
- `SALES_DEMO_PACKAGE/FEATURE_STATUS_TABLE.md` — tier ↔ sales positioning
- `CASE_STUDIES/COLATTAO/DOCS/PRICING_AND_OFFER.md` — pricing
- `ASSET_REGISTRY/ASSET_QA_CHECKLIST.md`, `RESTAURANT_ONBOARDING_PACKET_TEMPLATE.md` — asset approval flow
- `src/lib/brand.ts` — per-client asset registry pattern the skin system mirrors
