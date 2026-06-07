# Penalty Shootout — Campaign Pack Status Snapshot

_AMMA Ventures LLC DBA Fina Calle_
_Snapshot date: 2026-06-07 | Branch of record: `main` @ `229ce76`_
_Companion docs: `GAME_LIBRARY/PENALTY_SHOOTOUT.md`, `PRODUCT_MODULES/GAME_CUSTOMIZATION_PROTOCOL.md`,
`ASSET_SPECS/PENALTY_BACKGROUND_TEMPLATE.md`, `ASSET_SPECS/PENALTY_AD_ZONE_SPEC.md`, `ASSET_SPECS/PENALTY_KIT_SPEC.md`._

> **Project state: PARKED (stable).** The live Colattao Campaign Pack reads well on phone.
> This is the freeze/handoff snapshot — what's live, what's sellable, what must not be
> promised, what's parked, and the exact resume sequence. **No new feature work is pending.**

---

## TL;DR

Penalty Shootout is a **fixed game shell** with a small **Campaign Pack** layered on top.
The only per-client variables that are **built and live** are the **behind-goal ad zone**
and the **keeper shirt (kit)**. Live demo: **https://finacalleos.com/penalty-shootout**.

---

## 1. What is LIVE on `main`

| Capability | State | Where |
|---|---|---|
| **Fixed Stadium Shell** (engine, geometry, 6 aim zones, field, scoreboard, score placement) | ✅ Live, frozen | `src/penalty/engine/`, `geometry.ts`, `config.ts` |
| **Campaign Pack model** (typed `PenaltyCampaign`: `adZone`, `kit`, `menu`) | ✅ Live | `src/penalty/skin/campaigns.ts`, `types.ts` |
| **941×1672 background template + fit solver** | ✅ Live | `ASSET_SPECS/PENALTY_BACKGROUND_TEMPLATE.md`, `src/penalty/skin/backgroundTemplate.ts` |
| **Behind-goal ad-zone renderer** (gated; cover-fit + geometry-mask clip + readability scrim + grass feather; goal/net/keeper/ball/targets render in front) | ✅ Live, gated | `src/penalty/skin/PenaltyRenderer.ts` (`drawAdZone`) |
| **Colattao coffee/pastry ad image** (1080×810, logo-free, guardrail-clean) | ✅ Live | `public/assets/colattao/penalty/adzone-coffee-pastry-v1.webp` |
| **Colattao keeper green kit** (`primary 0x2E8B6B`, `secondary 0x14332A`) | ✅ Live, owner-approved | `campaigns.ts` → `COLATTAO_CAMPAIGN.kit.keeper` |
| **Skins:** Fina Calle (primitive default), Colattao (café bg + warm palette + ad + green keeper), Stadium (941×1672 photo bg) | ✅ Live | `src/penalty/skin/skins.ts` |
| **Input:** Tap (default) + assisted Swipe (selectable) | ✅ Live | `src/penalty/input/` |
| **Primitive fallback / no-404** for every optional asset | ✅ Live | renderer-wide |
| **Route** `/penalty-shootout` (mobile-first, prerendered static) | ✅ Live | `src/app/penalty-shootout/` |

**Binding note (important):** a campaign is currently resolved **by skin id**
(`getCampaign(skin.id)`). So "Colattao" today is a **standalone skin** that carries the
Colattao ad + keeper kit — **not** yet "the Stadium Shell with a Colattao campaign applied."
That decoupling (campaign-on-Stadium-Shell) is **parked** (see §6).

**Merged PRs behind this state:** #6 (V1), #25 (Campaign Pack model docs), #26 (Step 1 plumbing),
#27 (Step 2 ad-zone renderer), #28/#30 (Colattao ad asset + wiring, by Codex), #31 (background
template + fit solver), #32 (Step 3a keeper kit).

---

## 2. What Anthony phone-QA'd (PASS)

- **V1 mobile pass** (PR #6) — tap flow, 3 keepers, 5 shots, score/rating. PASS.
- **Step 1 plumbing** (PR #26) — Fina Calle / Colattao / Stadium unchanged, gameplay, no crop. PASS.
- **Step 2 ad-zone renderer** (PR #27) — Fina Calle layering, Colattao over café bg, Stadium no-ad
  control, goal/net/keeper/ball/targets in front, no crop/scroll, gameplay unchanged. PASS.
- **Step 3a keeper kit** (PR #32) — Colattao green keeper; Fina Calle / Stadium keepers unchanged;
  gameplay unchanged. PASS. **Owner approved keeping the green kit.**
- **Live Colattao Campaign Pack on phone** — "reads well." (This freeze.)

**Visual-review note (Claude, from the committed image):** the Colattao ad is **well-composed**
for the panel — latte-art sits above the crossbar, the dark top band gives the score good
contrast, side-crop touches only decorative edges. One **known minor** (not yet addressed):
the keeper's **lower-body green `0x14332A` is very close to the Colattao grass `0x14331A`**, so
the keeper's legs can blend into the grass/feather. Cosmetic; a one-line kit tweak if desired (§6).

---

## 3. Safe to SHOW / SELL today

- **Live, playable demo:** https://finacalleos.com/penalty-shootout (mobile-first).
- **Fixed game shell + Campaign Pack** as a repeatable model — the shell never changes per client.
- **Behind-goal ad zone** — one high-impact, swappable campaign placement (live: Colattao coffee/pastry).
- **Keeper shirt customization** — recolor the keeper mascot kit per brand (live: Colattao green).
- **Multiple looks** — Fina Calle (clean), Colattao (café), Stadium (photo).
- **Tap or assisted swipe** controls; runs on any phone; never shows a broken/404 visual.
- **Original, non-human mascots only**; no club/FIFA/real-face branding — legally clean for sales.

---

## 4. Sales-ready wording

- **Main product:** **Colattao QR digital menu.**
- **Add-on:** **Penalty Shootout Campaign Pack.**
- **Current live demo:** **https://finacalleos.com/penalty-shootout**
- **Campaign value (one line):** _a fixed branded game shell with a swappable behind-goal
  campaign ad and keeper-shirt customization — change the promo, not the game._
- **Pitch frame:** "One game shell, run a new campaign anytime — swap the behind-goal ad and the
  keeper's colors per season or promotion; the gameplay and field stay identical and proven."

---

## 5. Do NOT promise yet (not built)

- ❌ **Player / kicker shirt (layered tintable kit)** — not built. Keeper kit is live; the *player*
  kit needs the layered mascot art + renderer (spec exists, art does not).
- ❌ **Campaign-on-Stadium-Shell binding** — not built. Campaigns bind to skin id today; we cannot
  yet say "any client runs on the one Stadium Shell" as a turnkey switch.
- ❌ **Backend loyalty / sticker tracking** — not built. The Colattanini collectible idea (PR #17)
  is a **manual, docs-only MVP** (staff shows-and-gives) — no accounts, no DB, no auto-validation.
- ❌ **POS / payments / AI automation** — **not part of this game.** Do not bundle into the game pitch.
- ❌ **In-game logos** — only after an **approved overlay is registered** in
  `ASSET_REGISTRY/APPROVED_LOGOS.md` (currently **"No logo assets are registered yet"**). Logos are
  **approved overlays only, never AI-generated.**
- ❌ **Sentinel Keeper sprite / product ball / kicker mascot art in production** — the Stadium
  ball+kicker art and broadcast HUD live only in **parked PR #24** (never merged; superseded).

---

## 6. Parked items & known risks

| Item | Status / note |
|---|---|
| **PR #24** — Stadium broadcast HUD (top scorebug + LED board) + ball/kicker mascot art | **Parked, do NOT merge as-is.** The LED/scoreBug ad idea is **superseded** by the behind-goal ad zone. The **ball/kicker mascot art** may be salvaged later for the product (re-evaluate against the Campaign Pack model first). |
| **PR #17** — Colattanini collectible campaign (docs-only manual MVP) | **Parked, open draft.** No backend; mergeable as docs when desired. |
| **Keeper green-vs-grass contrast** (Colattao) | **Known minor.** `kit.keeper.secondary 0x14332A` ≈ grass `0x14331A`. One-line fix if QA wants it (lighten secondary or match primary). |
| **Colattao ad-zone fit** | Reads well; an optional `adZone.fit.offsetYPct ≈ -0.04` could lift the cup higher if ever wanted. No change needed now. |
| **Ad image resolution** | `adzone-coffee-pastry-v1.webp` long edge is **1080px** (spec recommends ≥1600). Fine at display size; re-export larger for future re-use. |
| **Unregistered Colattao logo** | `public/assets/colattao/penalty/logo.png` + `ASSET_REGISTRY/.../overlays_v1/*` exist but are **NOT registered/approved** — do not treat as approved for in-game use. |
| **Legacy** `colattao/penalty/background.webp` (1080×1350) | Unused by any skin; harmless. |
| Client-OS PRs **#29** (AI Request Desk) / **#5** (Marbel admin) | **Out of scope** for the game; separate owner/Client-OS workstreams. Not part of the Campaign Pack. |

---

## 7. Resume-later sequence (when the project restarts)

1. **Player layered kit** — author the layered tintable mascot (base body + neutral white jersey
   layer per `ASSET_SPECS/PENALTY_KIT_SPEC.md`), then the gated renderer recolor from
   `campaign.kit.player`. (Mirrors the keeper-kit step; needs new art via ChatGPT→Codex first.)
2. **Campaign-on-Stadium-Shell binding** — let a campaign be selected independently of skin
   (`PENALTY_CAMPAIGNS` list + a Campaign selector in `PenaltyClient`; the scene already accepts an
   explicit `campaign`). Decide whether the Colattao café skin stays or folds into "Stadium Shell +
   Colattao campaign."
3. **True transparent mascot/ball assets** (if still wanted) — salvage/redo the parked #24
   ball+kicker art with **verified real alpha**, re-evaluated against the Campaign Pack model.
4. **Colattanini printable campaign** — merge/extend PR #17 (manual collectible MVP) if the owner
   wants the sticker loop.
5. **Approved logo overlay registry** — file a real, owner-approved Colattao logo record in
   `ASSET_REGISTRY/APPROVED_LOGOS.md`, then (only then) allow a logo overlay in-game.

_Optional quick polish whenever convenient:_ the keeper green-vs-grass contrast tweak and the
ad-image re-export at ≥1600px (both §6).

---

## 8. Guardrails (carry forward — always)

- Non-human mascots only; **no FIFA / World Cup / club / real-face branding**.
- Client approves all client-specific assets **in writing before publish**.
- **Logos are approved overlays only — never AI-generated.**
- Every optional asset keeps a **primitive fallback** (no broken/404 visual).
- A campaign/skin may **never** change the engine, geometry, zones, scoring, keeper logic, or routes.
- Never touch Client OS routes (`/m/[id]`, `/owner/[id]`, `/customers`), Supabase, Stripe, POS,
  secrets, or customer data.
