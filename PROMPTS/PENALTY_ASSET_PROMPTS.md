# Penalty Shootout — Standard Image-Generation Prompt Library

_AMMA Ventures LLC DBA Fina Calle_
_Created: 2026-06-09 | Version: 1.0_
_Use with ChatGPT (image generation). Codex commits/converts; Claude keys, sizes, wires._
_Specs this enforces: `ASSET_SPECS/PENALTY_PLAYER_STICKER_SPEC.md`,
`ASSET_SPECS/PENALTY_BACKGROUND_TEMPLATE.md`, `ASSET_SPECS/PENALTY_KIT_SPEC.md`,
`ASSET_SPECS/PENALTY_AD_ZONE_SPEC.md`._

---

## How to use this library

1. Pick the template for the asset you need (Character / Component / Background).
2. Replace every `{{VARIABLE}}`.
3. The template already includes **Block G (global rules)** inline, so each one is
   copy-paste-ready on its own — you don't need to paste anything else.
4. Generate, then hand the file to the pipeline (ChatGPT → Codex commit/convert →
   Claude key + size + wire → phone QA → merge).

**Golden rules that never change** (encoded in every template):

- **Style DNA:** stylized **illustrated cartoon**, soft cel shading, bold clean
  shapes, glossy highlights — one cohesive "world" with the existing mascots.
- **Guardrails (absolute):** original **non-human mascots only**; **no** real
  people / real-person likeness, **no** FIFA / World Cup / federation / club
  marks, crests, or real team kits, **no** real advertising brands, **no** baked
  text or numbers (a brand wordmark is added later from the **approved logo file**,
  never generated).
- **Transparency (characters & components):** **real alpha** — corners fully
  transparent. **Never** a painted checkerboard. If true alpha isn't available,
  render on a **flat pure-magenta `#FF00FF`** background for clean keying.
- **Backgrounds are the exception:** the stadium shell is a **solid** opaque image
  (no transparency), and it is **brand-neutral** (reused across all restaurants).

---

## Block G — paste-in global rules (reference)

> Style: stylized illustrated cartoon, soft cel shading, bold clean outlines,
> glossy highlights, premium and friendly. STRICT: original non-human character,
> no real person or likeness, no FIFA/World Cup/federation/club/team marks or
> crests, no real brands, no baked text or numbers. Transparent background with
> REAL alpha (corners fully transparent), NOT a painted checkerboard; if true
> transparency isn't possible, use a FLAT pure-magenta #FF00FF background. High
> resolution, crisp edges.

---

# CHARACTERS

## 1. Kicker (player) — die-cut mascot sticker

```
A die-cut sticker of an original, friendly NON-HUMAN mascot for "{{BRAND}}": a
{{PRODUCT_MASCOT — e.g. anthropomorphic churro-latte cup}} character with big
round cartoon eyes, simple stick arms and legs wearing soccer cleats, in a
confident forward-facing striker pose (seen from BEHIND if it will frame the shot
from the foreground). It wears a plain soccer jersey + shorts in {{KIT_COLORS —
e.g. cream and caramel brown}}; leave the jersey back/chest clear (a logo is added
later). Stylized illustrated cartoon style, soft cel shading, bold clean outline,
glossy highlights, premium and friendly.

Presented as a glossy DIE-CUT STICKER: thin white sticker border hugging the
silhouette. FULL BODY, centered, FEET AT THE VERY BOTTOM EDGE, empty headroom
above the head. TRANSPARENT BACKGROUND (real alpha, corners fully transparent) —
NOT a painted checkerboard; if unavailable use FLAT pure-magenta #FF00FF.
No card frame, no number, no crest, NO TEXT, no real person. Square, high-res.
```

## 2. Keeper (Sentinel Keeper) — die-cut mascot sticker

```
A die-cut sticker of the original NON-HUMAN goalkeeper mascot "Sentinel Keeper"
for "{{BRAND}}": a sturdy {{KEEPER_MASCOT — e.g. coffee-bean / espresso guardian}}
character with big round eyes, oversized goalkeeper gloves, in a wide READY
goalkeeper stance with arms spread slightly out, alert and protective. Goalkeeper
jersey + shorts in {{KEEPER_KIT_COLORS — e.g. deep green #2E8B6B with #14332A
trim}}. Clearly DISTINCT in silhouette and color from the kicker mascot. Stylized
illustrated cartoon style, soft cel shading, bold clean outline, glossy highlights.

Presented as a glossy DIE-CUT STICKER: thin white sticker border hugging the
silhouette. FULL BODY, centered, FEET AT THE VERY BOTTOM EDGE, headroom above the
gloves/head. TRANSPARENT BACKGROUND (real alpha, corners fully transparent) — NOT
a painted checkerboard; if unavailable use FLAT pure-magenta #FF00FF. No card
frame, no number, no crest, NO TEXT, no real person. Square, high-res.
```

---

# COMPONENTS

## 3. Match ball

```
A die-cut sticker of a stylized cartoon SOCCER BALL, themed for "{{BRAND}}": a
classic round soccer ball whose panels are tinted in {{BALL_COLORS — e.g. warm
cream and caramel/espresso browns}} with a subtle {{MOTIF — e.g. latte-swirl /
coffee-bean}} worked into a few panels. Stylized illustrated cartoon style, soft
cel shading, bold outline, glossy highlight. It must read INSTANTLY as a round
ball and look good SPINNING — roughly radially balanced, NO single "up"
orientation, NO letters or text baked on.

Centered, ball fills most of a SQUARE frame with a little margin. Thin white
die-cut outline optional. TRANSPARENT BACKGROUND (real alpha, corners fully
transparent) — NOT a painted checkerboard; if unavailable use FLAT pure-magenta
#FF00FF. No text, no logos, no real-team marks. High resolution.
```

## 4. (Reference only) Behind-goal ad zone

The ad zone is **client creative**, governed by `ASSET_SPECS/PENALTY_AD_ZONE_SPEC.md`
— it carries the restaurant's **approved logo** and product photography and is
**not** generated as a mascot. Do not generate brand logos here; composite the
approved logo file. See that spec for panel size (1080×810), safe area, and the
behind-goal placement.

---

# BACKGROUND

## 5. Standard Stadium Shell (shared across ALL restaurants)

> Opaque, brand-neutral, **stylized illustrated**, **clean daylight**. The engine
> draws the goal + the client ad panel on top, so **do not draw goal posts/net**.
> Respect the dead zones (see `ASSET_SPECS/PENALTY_BACKGROUND_TEMPLATE.md`).

```
A stylized, illustrated soccer stadium background, PORTRAIT 941 x 1672, viewed
from behind the penalty taker looking toward the goal end. Clean bright DAYLIGHT,
soft midday sky, vivid but not neon green pitch. Modern flat-illustration / clean
cartoon style with soft cel shading and bold simple shapes — friendly and premium,
designed to sit behind cartoon mascot characters.

COMPOSITION (follow exactly):
- TOP ~8%: quiet open sky / upper stand only, no focal detail (a UI bar covers it).
- About 5%-42% height: generic stadium STANDS with a simple stylized crowd as soft
  colored blocks + sky. Keep it calm and evenly lit — a rectangular ad panel is
  composited over the center of it later.
- DO NOT draw goal posts, crossbar, or net — leave the goal area as open backdrop.
- About 42%-82%: clean green pitch with subtle mowed stripes receding to the goal.
  No logos, no markings clutter, no ad boards with text.
- 82%-100%: simple foreground turf (penalty spot + a character go here).
- Keep ALL important elements within the central 76% width; nothing important in
  the outer ~12% on each side (cropped on tall phones). Floodlights only as soft
  background, never lone side elements.

STRICT: brand-neutral and generic. NO text, NO scoreboard text, NO team names, NO
club crests, NO FIFA/World Cup/federation marks, NO real ad brands, NO real-person
faces (stylized crowd blocks only). Solid opaque image (this is the backdrop).
High resolution, crisp edges.
```

---

## Variable cheat-sheet

| Variable | Example (Colattao) | Notes |
|----------|--------------------|-------|
| `{{BRAND}}` | Colattao | Brand the campaign runs for |
| `{{PRODUCT_MASCOT}}` | anthropomorphic churro-latte cup | Kicker character concept (non-human) |
| `{{KEEPER_MASCOT}}` | coffee-bean / espresso guardian | Sentinel Keeper concept (non-human) |
| `{{KIT_COLORS}}` | cream + caramel brown | Kicker jersey; distinct from keeper |
| `{{KEEPER_KIT_COLORS}}` | green `#2E8B6B` / `#14332A` | Live keeper kit |
| `{{BALL_COLORS}}` / `{{MOTIF}}` | cream + espresso / latte-swirl | Ball theme |

## Post-generation checklist (every asset)

- [ ] Corners verified **`alpha = 0`** (characters/components) — real transparency,
      not a checkerboard. Backgrounds: solid + brand-neutral.
- [ ] Non-human mascot; no real person/team/FIFA/World Cup/brand marks; no baked text.
- [ ] Characters: feet at bottom edge, centered, headroom for motion.
- [ ] Reads clearly at phone size; kicker vs keeper distinct.
- [ ] Client-approved before publish.
