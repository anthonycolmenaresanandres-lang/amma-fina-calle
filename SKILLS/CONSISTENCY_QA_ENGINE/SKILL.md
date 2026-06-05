---
name: consistency-qa-engine
description: Fina Calle OS documentation-only QA workflow for enforcing character, environment, brand, logo/text, mobile readability, motion, human skin realism, and prompt compliance across AI image/video/campaign production. Use when reviewing render batches, pre-render packets, shot matrices, Colattao Digital Menu campaigns, owner/spokesperson videos, or final export readiness.
---

# Consistency QA Engine

## Purpose

Reject inconsistent AI production before it reaches edit assembly or client review.

## Acceptance Levels

### PASS

The asset matches all required locks and can proceed.

### PASS WITH CAUTION

The asset is usable only with edits, overlays, cropping, or limited placement. Record the risk.

### REJECT

The asset fails a core identity, brand, safety, or production rule.

## Character Consistency Scorecard

| Check | PASS | PASS WITH CAUTION | REJECT |
|---|---|---|---|
| Face identity | Same face | Slight angle/lighting risk | Face changes |
| Unique marks | Stable | Partially obscured | Scar/mark moves or disappears |
| Body silhouette | Stable | Minor pose ambiguity | Build changes |
| Costume/material | Stable | Minor texture issue | Costume redesigns |
| Expression/personality | Stable | Slight mismatch | Different personality |

## Environment Consistency Scorecard

| Check | PASS | PASS WITH CAUTION | REJECT |
|---|---|---|---|
| Cafe/interior layout | Matches lock | Slight crop ambiguity | Cafe changes without approval |
| Lighting | Matches direction | Direction unclear | Lighting contradicts lock |
| Props | Approved only | Extra harmless props | Invented brand/menu props |
| Camera angle | Approved | Similar but not listed | Unapproved angle changes identity |

## Logo/Text Safety Scorecard

Reject if:

- Logo/text is AI-generated or warped.
- QR code is AI-generated.
- Menu copy is AI-generated.
- Brand mark is invented.
- Readable words are misspelled or distorted.

All logos, text, QR codes, menu words, and brand marks must be static PNG/vector overlays in final editing.

## Mobile Readability Scorecard

Check:

- 9:16 output.
- Subject readable on phone.
- Face not too small.
- QR/text overlay space exists.
- Main action moves toward/away from lens when possible.
- No critical detail hidden at mobile crop.

## Brand Language Scorecard

Reject if:

- Digital Menu is called website.
- Colattao terminology drifts.
- Campaign uses generic agency language.
- Product claims are invented.
- Payment, ordering, POS, auth, or analytics claims appear without approval.

## Motion Stability Scorecard

Reject if:

- Camera and subject both move in a risky shot.
- Motion has more than one primary action.
- Identity drifts during motion.
- Hands deform in a hero shot.
- Monster or complex subject becomes visibly broken.

## Human Skin Realism Scorecard

Reject if:

- Skin looks plastic.
- Face is over-smoothed.
- Eyes look anime/artificial.
- Hands deform in a hero shot.
- Character becomes fashion/editorial when gritty realism is required.

## Prompt Compliance Scorecard

Check:

- Identity lock first.
- Wardrobe/prop lock included.
- Subject action included.
- Z-axis placement included.
- Camera included.
- Lighting source included.
- Atmosphere included.
- Style/texture included.
- Format/aspect ratio included.
- Negative block included.

## Hard Reject Rules

Reject if:

- Face changes.
- Scar/unique facial marks move or disappear.
- Body silhouette changes.
- Owner looks like a different person.
- Logo/text is AI-generated or warped.
- Digital Menu is called website.
- Camera and subject both move in a risky shot.
- Skin looks plastic.
- Hands deform in a hero shot.
- Cafe environment changes without approval.
