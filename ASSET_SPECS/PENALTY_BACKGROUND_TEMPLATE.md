# Penalty Shootout — Background Authoring Template

_AMMA Ventures LLC DBA Fina Calle_
_Created: 2026-06-07 | Version: 1.0_
_Governed by `PRODUCT_MODULES/GAME_CUSTOMIZATION_PROTOCOL.md` (Campaign Pack)._
_Machine-readable mirror: `APP/web/src/penalty/skin/backgroundTemplate.ts`._

---

## Purpose

Lock **how every Penalty Shootout background is composed** so any background —
Stadium Shell, café, seasonal, future client — **fits the fixed game geometry on
every phone**. This is the "Colattao Rush" mobile-background discipline applied to
Penalty: one **authoring canvas**, fixed **zones**, **safe lanes**, and **negative
(croppable) space**, plus a deterministic **fit solver** so alignment is math, not
guesswork.

> The game geometry is **frozen** (fixed Stadium Shell). Backgrounds adapt to it;
> it never adapts to a background. This template does **not** change gameplay,
> scoring, keeper logic, or input.

---

## Authoring canvas (locked)

| | Value |
|---|---|
| **Canvas** | **941 × 1672 px** (portrait) |
| Aspect | 0.5628 (≈ 9:16-ish, matches the supported phone band) |
| Format | optimized **WebP**, verified (no fake/baked-in transparency) |
| Budget | ≤ ~1–2 MB per skin (backgrounds typically 120–260 KB) |

Both shipped backgrounds already conform: `stadium/penalty/background.webp` and
`colattao/penalty/background-cafe-stadium-winner-v1.webp` are **941 × 1672**.

---

## Fixed geometry (mirror of `geometry.ts` → `computeLayout`)

These are fractions of the **live device canvas**, reproduced on the authoring
canvas as pixels. **Keep in sync with `geometry.ts` if it ever changes.**

| Anchor | Fraction | px @ 941×1672 |
|---|---|---|
| Goal left | x 0.13 | 122 |
| Goal right | x 0.87 | 819 |
| Goal top (crossbar) | y 0.14 | 234 |
| Goal bottom (line) | y 0.42 | 702 |
| Penalty spot | x 0.50, y 0.82 | 471, 1371 |
| Keeper rest line | y 0.42 | 702 |

---

## Zones (exact % + px @ 941×1672)

| # | Zone | x range | y range | px (x) | px (y) | Authoring rule |
|---|------|---------|---------|--------|--------|----------------|
| 1 | **Fixed top strip** | full | 0–8% | 0–941 | 0–134 | Reserved shell chrome (scoreboard/menu). **Negative** — keep calm; chrome overlays it. |
| 2 | **Crowd / header** | full | 8–14% | 0–941 | 134–234 | Above the crossbar: crowd/sky/atmosphere. Hosts the ad-zone **hero band**. |
| 3 | **Behind-goal ad zone** | 6–94% | 5–42% | 56–885 | 84–702 | The one dynamic ad panel (renders behind the goal). Hero/product in the **upper** part; lower part sits behind the net. |
| 4 | **Goal frame zone** | 13–87% | 14–42% | 122–819 | 234–702 | The drawn goal mouth/net. Present a clean goal/neutral backdrop; the ad shows through here. |
| 5 | **Keeper lane** | 30–70% | 29–42% | 282–659 | 485–702 | Keeper stands here (dives span the full goal width). **Negative** — keeper overlays it. |
| 6 | **Ball path lane** | 35–65% | 42–82% | 329–612 | 702–1371 | Ball flies spot→goal (fans to corners above 42%). Keep uncluttered so the ball reads. |
| 7 | **Lower interaction** | full | 82–100% | 0–941 | 1371–1672 | Spot, kicker, power meter, hint, swipe area (foreground turf). Keep simple. |

### Negative / no-detail zones (must stay free of critical content)

- **Side crop lanes:** x **0–12%** and **88–100%** (0–113 px and 828–941 px). Cover-fit
  center-crops the sides on tall phones (up to ~12% per side). Anything critical
  here will be clipped on some devices.
- **Top strip:** y 0–8% (chrome reservation).
- **Extreme bottom:** below ~95% can be covered by the hint/UI.

### Horizontal safe lane

Keep **all critical content within x 12–88%** (113–828 px). The goal posts (13% /
87%) sit just inside this lane, so a template-aligned goal survives the crop on
every supported portrait phone.

---

## Why vertical is reliable and horizontal needs a safe lane

The renderer **cover-fits** the background to the device canvas
(`scale = max(W/iw, H/ih)`, centered) — see `PenaltyRenderer.positionAssets`.

- For **portrait phones**, the fit is **height-driven**: the image fills the
  canvas height exactly, so **vertical fractions map 1:1** (a goal painted at
  14–42% lands at 14–42%). This is why the vertical zones above are dependable.
- **Horizontally** the image is wider than the canvas after height-fill, so the
  **sides are cropped** (up to ~12% per side on the tallest supported aspect).
  Hence the side **negative lanes** and the **12–88% safe lane**.
- **Landscape / very wide** canvases flip to width-driven (vertical crop). These
  are a non-primary orientation (consistent with the existing mobile-QA note) and
  out of scope for guaranteed alignment.

---

## Fit solver (deterministic alignment)

When a background's goal is **not** painted exactly at 14–42% (e.g. a stock photo),
align it with a per-skin `backgroundFit { scale, offsetYPct }` instead of editing
the art. Measure where the goal sits in the **image** (top/bottom as fractions of
image height) and compute:

```
scale      = 0.28 / (goalBottomFrac − goalTopFrac)
offsetYPct = 0.14 − 0.5 − (goalTopFrac − 0.5) × scale
```

`0.28 = goal height (0.42 − 0.14)`. Implemented as
`backgroundFitForMeasuredGoal()` in `backgroundTemplate.ts`.

**Validation:** the Stadium photo's goal sits at ~**0.11–0.33** (documented in
`skins.ts`). The solver returns **{ scale 1.27, offsetY 0.136 }**, matching the
shipped, phone-QA-approved **{ 1.3, 0.13 }**. → Stadium is **on-template**; no
retune. An on-template image (goal 0.14–0.42) returns **{ scale 1, offsetY 0 }**,
which is the default — so a template-built background needs **no fit at all**.

---

## Current skins vs. the template

| Skin | Background | Dims | Fit | Status |
|------|-----------|------|-----|--------|
| **Stadium** | `stadium/penalty/background.webp` | 941×1672 ✅ | `{scrim 0.25, scale 1.3, offsetY 0.13}` | **On-template** — solver reproduces these values from the photo's goal at 0.11–0.33. No change. |
| **Colattao** | `colattao/penalty/background-cafe-stadium-winner-v1.webp` | 941×1672 ✅ | default `{scrim 0.45}` (scale 1, offset 0) | Default fit **assumes** the goal is authored at 14–42%. Not re-measured here (no rasteriser in the build container) — **verify by phone-QA or a measured pass**; retune with the solver only if off. |

No fit values were changed by this template (the solver **confirms** Stadium; the
renderer's ad-panel constants were centralized into `backgroundTemplate.ts`
value-for-value, so rendering is unchanged).

---

## Authoring checklist (per background)

1. Compose at **941 × 1672**.
2. Put the **goal mouth at x 13–87%, y 14–42%** (so default fit needs no nudge),
   **or** note where the goal lands and apply the **fit solver**.
3. Keep the **penalty spot region (≈ 50%, 82%)** and the **ball path corridor**
   (x 35–65%, y 42–82%) clean.
4. Keep **critical content within x 12–88%**; leave the outer 12% per side as
   croppable negative space.
5. Keep the **top strip (0–8%)** and **keeper lane** calm (chrome/keeper overlay).
6. **No readable logos/text** baked into the art (logos are approved overlays only —
   never AI-generated; see the protocol). No FIFA/World Cup/club/real-face.
7. Export optimized **WebP**, verify real alpha, ≤ ~1–2 MB.
8. Wire the skin's `background` + (if needed) `backgroundFit`; **phone-QA** the goal
   alignment, ball path, and side crop on a real device.

---

## Cross-references

- `APP/web/src/penalty/skin/backgroundTemplate.ts` — machine-readable constants + fit solver
- `APP/web/src/penalty/geometry.ts` — runtime goal/spot geometry (source of truth)
- `ASSET_SPECS/PENALTY_AD_ZONE_SPEC.md` — behind-goal ad-zone creative spec
- `ASSET_SPECS/PENALTY_KIT_SPEC.md` — player/keeper kit spec
- `PRODUCT_MODULES/GAME_CUSTOMIZATION_PROTOCOL.md` — Campaign Pack governance
- `GAME_LIBRARY/PENALTY_SHOOTOUT.md` — package spec + lineage
