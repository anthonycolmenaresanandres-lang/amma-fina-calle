# Colattao Reference Asset Types

## Purpose

Define the approved Colattao reference asset categories used for AI-ready image and video consistency.

Reference assets are not all equal. Each type has a specific purpose and should be kept separate unless a campaign packet explicitly combines them.

## Character Reference Assets

### Front Portrait

Purpose:

- Primary face identity reference.
- Used for owner/spokesperson consistency.

Required qualities:

- Face visible.
- Good lighting.
- Neutral or warm expression.
- No heavy filters.
- No sunglasses.
- Minimal background distraction.

Status rule:

- If face is unclear, mark `usable with cleanup` or `rejected`.

### 3/4 Portrait

Purpose:

- Cinematic angle consistency.
- Helps preserve face shape, nose, cheeks, jawline, and hairstyle across generated angles.

Required qualities:

- Face turned slightly.
- Eyes visible.
- Hair and profile structure readable.

### Side Profile

Purpose:

- Profile accuracy.
- Useful for turnarounds, motion planning, and identity lock support.

Required qualities:

- Clear nose, lips, chin, jawline, and hairstyle silhouette.

### Full Body

Purpose:

- Body proportion, outfit, posture, stance, and presence.

Required qualities:

- Full figure visible.
- Outfit clear.
- Feet/body not severely cropped if used for cutout planning.

### Expression Variants

Purpose:

- Optional support for warm owner, neutral owner, focused owner, or welcoming owner expressions.

Rule:

- Expression variants must not replace identity references.

## Product Reference Assets

### Hero Product Isolated

Purpose:

- Clean product generation and overlay reference.
- Product card, sticker, poster, or campaign hero support.

Required qualities:

- Product is the subject.
- Shape, color, texture, garnish, cup/plate, and scale are clear.
- Background is removed or non-distracting.

### Lifestyle Product

Purpose:

- Product in Colattao atmosphere.
- Best for premium campaign stills and motion references.

Required qualities:

- Product remains clearly identifiable.
- Surrounding table/cafe elements support the mood instead of distracting.

## Environment Reference Assets

### Clean Wide Mood Shot

Purpose:

- Venue atmosphere.
- Background reference for video, poster, and story concepts.

Required qualities:

- Wider cafe context.
- Strong lighting and material cues.
- No dominant unapproved text.
- No distracting crowds unless the scene is intentionally social.

### Decor Detail Shot

Purpose:

- Premium texture and world-building.
- Plant, shelf, brick, fireplace, ceramics, signage detail, or lighting cue.

Required qualities:

- Clear focal subject.
- Strong Colattao mood.
- Low text risk.

## Overlay Reference Assets

### Logo Overlay

Purpose:

- Exact brand mark placement.

Rule:

- Logos remain overlays only.
- Do not generate or redraw logo in AI tools.

### QR Overlay

Purpose:

- Exact scan destination.

Rule:

- QR remains overlay only.
- Do not generate, redraw, stylize, or warp QR.

### CTA Text Overlay

Purpose:

- Campaign instruction or call to action.

Rule:

- CTA text remains editable overlay.
- Do not generate CTA text into AI imagery.

## Digital Menu Proof Assets

Purpose:

- Show the Digital Menu experience as proof.

Rule:

- Use `Digital Menu`, never `website`, for Colattao campaign language.
- Do not invent menu screenshots, menu copy, or pricing.

## Status Definitions For This Workflow

| Status | Meaning |
|---|---|
| `approved` | Ready for stated use. |
| `usable with cleanup` | Strong enough after crop, background removal, or distraction cleanup. |
| `pending` | Awaiting source confirmation, approval, or missing metadata. |
| `rejected` | Not safe or useful for the intended asset lane. |

## Separation Rules

- Separate character references from environment references.
- Separate product references from character references.
- Separate overlays from all generated or animated imagery.
- Use distilled references first, not raw seller photos.
