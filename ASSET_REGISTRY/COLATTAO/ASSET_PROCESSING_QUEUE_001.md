# Colattao Asset Processing Queue 001

## Purpose

This queue defines the first processing order for Asset Intake Batch 001. It is documentation only. No image processing, file copying, asset editing, API calls, app code changes, deployment changes, secrets, or package changes are performed by this file.

## Source Intake

Primary intake document:

- `ASSET_REGISTRY/COLATTAO/ASSET_INTAKE_BATCH_001.md`

Batch source folders:

- `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/actual cola/`
- `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/ai-generations/`

## Queue Rules

- Do not process images until Anthony explicitly approves a processing pass.
- Do not generate logos with AI.
- Do not generate QR codes with AI.
- Do not generate CTA text with AI.
- Do not generate menu words, Digital Menu copy, pricing, or legal text with AI.
- Logos, QR codes, CTA text, menu copy, and Digital Menu proof remain overlays or approved screenshots only.
- Do not approve owner identity lock from this batch; no owner image was provided.
- Do not approve full cafe environment lock from this batch without explicit Anthony/client approval or waiver.
- Do not process rejected assets.

## Priority 1 - Required Core Assets

The requested Priority 1 items are the correct production order, but the exact current batch is missing several of those inputs. The queue therefore records blocked Priority 1 work before listing processable batch assets.

### Q001-P1-A - Owner Image

```txt
SOURCE: missing from this exact batch
CURRENT STATUS: missing / blocking
REQUESTED OUTPUTS:
- colattao-b001-owner-fullbody-cutout-v001.png
- colattao-b001-owner-fullbody-9x16-v001.webp
- colattao-b001-owner-portrait-4x5-v001.webp
- colattao-b001-owner-secondary-1x1-v001.webp, optional
TARGET FORMATS:
- transparent PNG cutout
- 9:16 campaign/spokesperson asset
- 4:5 premium campaign portrait
- optional 1:1 secondary crop
REQUIRED ACTION BEFORE PROCESSING:
- Upload owner full-body image.
- Upload owner front portrait.
- Upload owner 3/4 portrait.
- Confirm approval or waiver before owner identity lock.
```

### Q001-P1-B - Colattao Logo

```txt
SOURCE: missing as standalone logo in this exact batch
CURRENT STATUS: missing / blocking for new-batch logo processing
REQUESTED OUTPUTS:
- colattao-b001-logo-horizontal-transparent-v001.png
- colattao-b001-logo-horizontal-master-v001.webp
- colattao-b001-logo-icon-1x1-v001.png, optional
TARGET FORMATS:
- transparent PNG overlay
- source-safe horizontal master
- optional 1:1 icon crop
REQUIRED ACTION BEFORE PROCESSING:
- Provide cleaner official Colattao logo source, or explicitly approve a previously registered logo source.
- Do not extract the logo from blurred background marks or shelf decor.
- Do not AI-generate or mutate the logo.
```

### Q001-P1-C - Fina Calle QR / Branded QR

```txt
SOURCE: missing from this exact batch
CURRENT STATUS: missing / blocking
REQUESTED OUTPUTS:
- colattao-b001-qr-fina-calle-master-1x1-v001.png
- colattao-b001-qr-fina-calle-overlay-safe-v001.png
- colattao-b001-qr-fina-calle-poster-4x5-v001.webp
- colattao-b001-qr-fina-calle-story-9x16-v001.webp
TARGET FORMATS:
- 1:1 master PNG
- overlay-safe PNG
- 4:5 poster placement
- 9:16 safe-area overlay version
REQUIRED ACTION BEFORE PROCESSING:
- Provide approved QR PNG or verified destination for non-AI QR generation.
- Scan-test before approval.
- Record destination beside the QR asset.
```

### Q001-P1-D - Digital Menu Screenshot

```txt
SOURCE: missing from this exact batch
CURRENT STATUS: missing / blocking for new-batch Digital Menu proof
REQUESTED OUTPUTS:
- colattao-b001-digital-menu-proof-9x16-v001.webp
- colattao-b001-digital-menu-proof-4x5-v001.webp
- colattao-b001-digital-menu-ui-crop-v001.webp, optional
TARGET FORMATS:
- 9:16 Digital Menu proof crop
- 4:5 Digital Menu proof crop
- optional UI proof crop
REQUIRED ACTION BEFORE PROCESSING:
- Provide clean mobile Digital Menu screenshot.
- Avoid browser clutter if possible.
- Confirm approved route/destination.
```

## Priority 1A - Processable Strong Product Assets From This Batch

These are the strongest assets actually present and can move first after Anthony approves image processing.

### Q001-P1A-A - Pistachio Tres Leches Product Hero

```txt
SOURCE: B001-A02
SOURCE PATH: C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/actual cola/ChatGPT Image 28 may 2026, 07_15_18 a.m. (2).png
CURRENT STATUS: approved
PROCESSING OUTPUTS:
- colattao-b001-product-pistachio-tres-leches-4x5-v001.webp
- colattao-b001-product-pistachio-tres-leches-1x1-v001.webp
- colattao-b001-product-pistachio-tres-leches-9x16-v001.webp, optional
TARGET FORMATS:
- 4:5 product hero
- 1:1 product card
- optional 9:16 teaser
REQUIRED CHECKS:
- Preserve product clarity.
- Do not invent menu copy, price, or ingredients.
- Treat background logo blur as atmosphere only, not a logo source.
```

### Q001-P1A-B - Coffee And Pastry Product Still

```txt
SOURCE: B001-A01
SOURCE PATH: C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/actual cola/ChatGPT Image 28 may 2026, 07_15_17 a.m. (1).png
CURRENT STATUS: approved
PROCESSING OUTPUTS:
- colattao-b001-product-coffee-pastry-4x5-v001.webp
- colattao-b001-product-coffee-pastry-1x1-v001.webp
- colattao-b001-product-coffee-pastry-9x16-v001.webp, optional
TARGET FORMATS:
- 4:5 product hero
- 1:1 product card
- optional 9:16 story crop
REQUIRED CHECKS:
- Preserve product hierarchy.
- Do not crop the cup or pastry awkwardly.
- Do not add text inside the image.
```

## Priority 2 - Environment And Detail Assets

### Q001-P2-A - Cafe Fireplace Group Seating

```txt
SOURCE: B001-A03
SOURCE PATH: C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/actual cola/ChatGPT Image 28 may 2026, 07_15_18 a.m. (3).png
CURRENT STATUS: approved
PROCESSING OUTPUTS:
- colattao-b001-environment-fireplace-group-9x16-v001.webp
- colattao-b001-environment-fireplace-group-4x5-v001.webp
TARGET FORMATS:
- 9:16 environment insert
- 4:5 premium still
REQUIRED CHECKS:
- Preserve fireplace and group seating context.
- Keep safe space for overlay logo/CTA if used.
- Mark environment lock incomplete until explicitly approved or waived.
```

### Q001-P2-B - Hanging Plant Detail

```txt
SOURCE: B001-A04
SOURCE PATH: C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/actual cola/ChatGPT Image 28 may 2026, 07_15_19 a.m. (5).png
CURRENT STATUS: approved
PROCESSING OUTPUTS:
- colattao-b001-environment-plant-detail-9x16-v001.webp
- colattao-b001-environment-plant-detail-4x5-v001.webp, optional
TARGET FORMATS:
- 9:16 insert
- optional 4:5 detail
REQUIRED CHECKS:
- Preserve plant shape and warm brick texture.
- Do not over-sharpen or distort.
```

### Q001-P2-C - Shelf Decor / In-Store Branding Detail

```txt
SOURCE: B001-A05
SOURCE PATH: C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/actual cola/ChatGPT Image 28 may 2026, 07_15_19 a.m. (6).png
CURRENT STATUS: approved
PROCESSING OUTPUTS:
- colattao-b001-environment-shelf-decor-9x16-v001.webp
- colattao-b001-environment-shelf-decor-4x5-v001.webp
- colattao-b001-environment-shelf-decor-1x1-v001.webp, optional
TARGET FORMATS:
- 9:16 insert
- 4:5 detail
- optional 1:1 decor crop
REQUIRED CHECKS:
- Preserve shelf/decor composition.
- Do not treat the in-scene Colattao mark as approved logo overlay.
```

## Priority 3 - Sticker / Cutout Cleanup Candidates

These files currently have no detected alpha channel. They should be background-removed and QA checked before any overlay use.

### Q001-P3-A - Coffee Cup Sticker

```txt
SOURCE: B001-A06
SOURCE PATH: C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/ai-generations/ai_20260523-145024_1.png
CURRENT STATUS: usable with cleanup
PROCESSING OUTPUTS:
- colattao-b001-sticker-coffee-cup-transparent-v001.png
- colattao-b001-sticker-coffee-cup-1x1-v001.webp
TARGET FORMATS:
- transparent PNG
- transparent WebP if transparency survives cleanly
- 1:1 sticker card
REQUIRED CHECKS:
- Remove checkerboard/background.
- Preserve sticker edge.
- Confirm overlay readability at mobile size.
```

### Q001-P3-B - Croissant Sticker Candidate Set

```txt
SOURCES: B001-A07 and B001-A10
SOURCE PATHS:
- C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/ai-generations/ai_20260523-145024_2.png
- C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/ai-generations/ai_20260523-152258_2.png
CURRENT STATUS: usable with cleanup
PROCESSING OUTPUTS:
- colattao-b001-sticker-croissant-selected-transparent-v001.png
- colattao-b001-sticker-croissant-selected-1x1-v001.webp
TARGET FORMATS:
- transparent PNG
- transparent WebP if transparency survives cleanly
- 1:1 sticker card
REQUIRED CHECKS:
- Select the stronger of the two after visual QA.
- Remove checkerboard/background.
- Do not invent exact menu item name, ingredients, or price.
```

### Q001-P3-C - Matcha Drink Sticker Candidate Set

```txt
SOURCES: B001-A08 and B001-A11
SOURCE PATHS:
- C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/ai-generations/ai_20260523-145024_3.png
- C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/ai-generations/ai_20260523-152258_3.png
CURRENT STATUS: usable with cleanup
PROCESSING OUTPUTS:
- colattao-b001-sticker-matcha-drink-selected-transparent-v001.png
- colattao-b001-sticker-matcha-drink-selected-1x1-v001.webp
TARGET FORMATS:
- transparent PNG
- transparent WebP if transparency survives cleanly
- 1:1 sticker card
REQUIRED CHECKS:
- Select the stronger of the two after visual QA.
- Remove checkerboard/background.
- Do not invent exact flavor, price, or menu status.
```

## Rejected / Do Not Process

### Q001-R-A - Sea Farer's Coffee Crossed-Out Mark

```txt
SOURCE: B001-A09
SOURCE PATH: C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/ai-generations/ai_20260523-145024_4.png
CURRENT STATUS: rejected
PROCESSING OUTPUTS: none
REASON:
- Contains fake/competitor-style readable logo text.
- Violates no-AI-generated-logo rule for campaign identity artifacts.
- Off-brand for premium Colattao output.
ACTION:
- Do not normalize.
- Do not use in campaign.
- Keep only as rejected intake evidence if needed.
```

## Still-Missing Required Assets

- Owner front portrait.
- Owner 3/4 portrait.
- Owner full-body standing / lifestyle image.
- Cleaner official Colattao logo source if available.
- Fina Calle QR / branded QR image.
- Standalone approved Colattao QR if needed.
- Mobile Digital Menu screenshot.
- Final editable CTA text.

## Recommended Processing Order After Approval

1. Resolve missing Priority 1 blockers if the campaign requires owner, QR, logo, or Digital Menu proof.
2. Normalize B001-A02 as the first product hero.
3. Normalize B001-A01 as the secondary coffee/pastry hero.
4. Normalize B001-A03 as the primary environment/fireplace asset.
5. Normalize B001-A04 and B001-A05 as detail inserts.
6. Clean and export sticker candidates from B001-A06, B001-A07/B001-A10, and B001-A08/B001-A11.
7. Exclude B001-A09 from all production work.
8. Run mobile readability, overlay safety, and source-status QA before campaign assembly.

## QA Checklist Before Any Processing

- Anthony explicitly approves processing.
- Source file is registered in `ASSET_INTAKE_BATCH_001.md`.
- Source status is not rejected.
- Intended use is documented.
- Target format is documented.
- No AI-generated logo, QR, CTA text, menu copy, pricing, or legal text is requested.
- Owner identity is not assumed.
- Cafe environment lock is not assumed.
- QR is scan-tested before use.
- Digital Menu proof uses an approved screenshot or approved proof visual.
