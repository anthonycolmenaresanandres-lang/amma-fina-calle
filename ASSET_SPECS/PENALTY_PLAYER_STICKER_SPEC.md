# Penalty Shootout — Player & Keeper Die-Cut Sticker Spec

_AMMA Ventures LLC DBA Fina Calle_
_Created: 2026-06-08 | Version: 1.0_
_Governed by `PRODUCT_MODULES/GAME_CUSTOMIZATION_PROTOCOL.md` → Campaign Pack tier._
_Companion: `ASSET_SPECS/PENALTY_KIT_SPEC.md` (kit recolor), `ASSET_SPECS/PENALTY_BACKGROUND_TEMPLATE.md`._

---

## Purpose

Replace the two **primitive on-field characters** in the Penalty Shootout — the
stick-figure **keeper** and the (currently absent) **kicker** — with original
**die-cut mascot stickers** in the Colattao collector-sticker style. This is the
"sticker of the game" idea (Panini-album *format* inspiration) **molded to our
methodology**: the format is borrowed, the characters are our own non-human
mascots.

The renderer slots are already wired (`PenaltySkinAssets.kicker`,
`PenaltySkinAssets.keeper`, with `kickerFit`/`keeperFit`); both fall back to the
primitive look when the file is absent, so nothing breaks before the art lands.

---

## Non-negotiable guardrails (absolute, inherited from the protocol)

- **Non-human mascots only.** The kicker is an original Colattao product-mascot
  character; the keeper is the company-owned **Sentinel Keeper**. Never a real
  person, never a real-player likeness.
- **No FIFA / World Cup / federation / club marks, crests, or kits.** The Panini
  album is a *format reference only*. Do **not** carry the "World Cup
  Remembrance" wording from the earlier Colattao collector card onto in-game art
  — drop it.
- **Logos are approved overlays only — never AI-generated.** If the Colattao
  wordmark appears on a sticker, it must be the client's real approved logo file,
  composited in — not generated.
- **Client approves** both stickers before publish.

---

## What "die-cut sticker" means here

A **transparent-background PNG** of the character with the glossy white **die-cut
sticker border** (like the Churro Latte die-cut), **no trading-card frame** and
**no number/crest panel** (that "full collector card" treatment was considered
and declined for the in-game actor — it reads as a card, not a player). The
character stands on the pitch and composites cleanly over the goal/field.

| Property | Value |
|----------|-------|
| Format (delivery) | PNG with real alpha (transparent outside the die-cut) → Codex converts to `.webp` |
| Border | Thin glossy white die-cut outline hugging the silhouette; soft drop shadow optional |
| Frame / number / crest | **None** (no card frame, no "#10", no "Colattao FC" panel) |
| Background | Fully transparent — **no** box, halo, or checkerboard baked in |
| Pose | Full-body, facing the camera/forward; readable at small phone size |

---

## The two characters

### 1. Kicker (foreground shooter)

- Original **Colattao product mascot** (e.g. a friendly café-product character —
  coffee cup / churro-latte motif with simple limbs), in a Colattao kit.
- **Upright, forward-facing** neutral stance. The renderer applies a small **lean
  pulse** on the shot (`kickLean`), so author it standing straight — the engine
  adds the motion.
- Anchored **bottom-center**; it sits at the lower foreground framing the shot and
  may crop off the bottom of the canvas. Default size ≈ 1.5× keeper height.

### 2. Keeper (Sentinel Keeper, in goal)

- The company-owned **Sentinel Keeper** mascot, gloves up, **ready/goalkeeper
  stance**, arms slightly out (it reads as a keeper even when static — the engine
  slides it across the goal and **tilts** it toward the dive; it does not stretch
  limbs).
- Anchored **bottom-center on the goal line**. Default render height ≈ 1.7× the
  layout `keeperHeight` (tunable via `keeperFit.scale`).
- Authored in the **Colattao keeper kit** colors (the live green:
  `primary #2E8B6B`, `secondary #14332A`). Note: with an image keeper, the
  primitive kit-recolor is a no-op — colors are baked into the sticker. Layered
  tintable kit (per `PENALTY_KIT_SPEC.md`) remains the documented future.

---

## Canvas, anchor & sizing (authoring)

| Requirement | Why |
|-------------|-----|
| Each sticker its **own file**, character centered horizontally, **feet at the bottom edge** | Renderer origin is bottom-center (0.5, 1); feet land on the goal line / foreground |
| Generous transparent headroom, **no clipping** of gloves/head | Tilt rotation on the dive must not crop the silhouette |
| High enough resolution to be crisp at ~1.7× keeperHeight on a 2–3× phone | Avoid soft upscaling |
| Distinct **kicker vs keeper** silhouettes & kit colors | The two must never be confused on the pitch |

---

## File names & placement (pipeline)

ChatGPT generates → Codex commits + converts to `.webp` →
`APP/web/public/assets/colattao/penalty/`:

- `kicker-colattao-v1.webp`
- `keeper-colattao-v1.webp`

Then Claude flips the paths on in `src/penalty/skin/skins.ts`
(`COLATTAO_PENALTY_SKIN.assets.kicker` / `.keeper`) and tunes `kickerFit` /
`keeperFit` against the real art via the preview tool. Phone QA → merge.

---

## Acceptance checklist

- [ ] Transparent PNG, no baked box/halo/checkerboard; clean die-cut edge.
- [ ] Non-human mascots; Sentinel Keeper for the keeper; no real-person likeness.
- [ ] No FIFA/World Cup/federation/club marks; no "World Cup" wording; logo (if
      any) is the approved file, not generated.
- [ ] Feet at bottom edge, centered, headroom for dive tilt.
- [ ] Reads clearly at phone size; kicker and keeper visually distinct.
- [ ] Client-approved before publish.
