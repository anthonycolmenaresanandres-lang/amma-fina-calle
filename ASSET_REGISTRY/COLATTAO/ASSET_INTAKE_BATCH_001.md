# Colattao Asset Intake Batch 001

## Purpose

This document ingests the exact Colattao asset batch provided for Asset Intake Batch 001 and classifies each file for future campaign normalization.

This is documentation and asset intake only. No image processing, asset editing, app code, routes, deployments, API calls, secrets, package changes, or Colattao Rush code changes are performed by this file.

## Source Documents Reviewed

- `ASSET_REGISTRY/COLATTAO/DATASET_CREATION_GATE_001.md`
- `ASSET_REGISTRY/COLATTAO/EXISTING_ASSET_INVENTORY.md`
- `ASSET_REGISTRY/COLATTAO/ENCANTO_ASSET_CLASSIFICATION.md`
- `ASSET_REGISTRY/COLATTAO/ENCANTO_NORMALIZATION_PACKET.md`
- `SKILLS/PREMIUM_VENUE_TRANSLATION_SYSTEM/`

## Batch Source

Provided file locations:

- `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/actual cola/`
- `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/ai-generations/`
- `C:/Users/antho/OneDrive/Desktop/`

## Batch Correction 001

Additional exact filename search found two new Desktop assets after the original intake commit:

| Correction asset | Exact filename confirmed | Result | Registry action |
|---|---|---|---|
| Owner / spokesperson reference | `colattao owner.PNG` | Found at `C:/Users/antho/OneDrive/Desktop/colattao owner.PNG` | Added as `B001-A12`. |
| Cafe fireplace atmosphere | `Atmosphere fogata colattao.PNG` | Found at `C:/Users/antho/OneDrive/Desktop/Atmosphere fogata colattao.PNG` | Added as `B001-A13`. |

Search notes:

- `colattaao owner.PNG` was searched as written and not found.
- `colattao owner.PNG` was found.
- `Atmosphere fogata colattao` and `Atmosphere fogata colattao.PNG` were found as `Atmosphere fogata colattao.PNG`.
- `Atmosphere fogata colattao.jpg` was not found.

## Intake Rules Applied

- Use `Digital Menu`, never `website`, for Colattao campaign language.
- Logos, QR codes, CTA text, Digital Menu copy, menu copy, pricing, and legal text remain overlays or approved screenshots only.
- AI-generated logos, AI-generated QR codes, and AI-generated readable campaign text are rejected for final overlay use.
- Owner identity is not approved from this batch because no owner/spokesperson reference was provided in this batch.
- Cafe environment lock is not fully approved from this batch; the environment images can enter normalization review, but must still be explicitly approved or waived before environment-specific generation.
- Sticker/cutout files with checkerboard-looking backgrounds must be treated as needing cleanup until true transparency is confirmed.

## Batch Files Received

| Batch ID | Filename | Source path | Dimensions | Size | Intake interpretation |
|---|---|---|---:|---:|---|
| B001-A01 | `ChatGPT Image 28 may 2026, 07_15_17 a.m. (1).png` | `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/actual cola/ChatGPT Image 28 may 2026, 07_15_17 a.m. (1).png` | 1122x1402 | 2303.9 KB | Coffee and pastry/product hero still. |
| B001-A02 | `ChatGPT Image 28 may 2026, 07_15_18 a.m. (2).png` | `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/actual cola/ChatGPT Image 28 may 2026, 07_15_18 a.m. (2).png` | 1122x1402 | 2100.8 KB | Pistachio tres leches and coffee product hero with cafe background. |
| B001-A03 | `ChatGPT Image 28 may 2026, 07_15_18 a.m. (3).png` | `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/actual cola/ChatGPT Image 28 may 2026, 07_15_18 a.m. (3).png` | 1122x1402 | 2388.9 KB | Cafe environment group seating / fireplace shot. |
| B001-A04 | `ChatGPT Image 28 may 2026, 07_15_19 a.m. (5).png` | `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/actual cola/ChatGPT Image 28 may 2026, 07_15_19 a.m. (5).png` | 1122x1402 | 2246.2 KB | Hanging plant detail shot. |
| B001-A05 | `ChatGPT Image 28 may 2026, 07_15_19 a.m. (6).png` | `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/actual cola/ChatGPT Image 28 may 2026, 07_15_19 a.m. (6).png` | 1122x1402 | 2045.5 KB | Shelf decor / in-store branding detail shot. |
| B001-A06 | `ai_20260523-145024_1.png` | `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/ai-generations/ai_20260523-145024_1.png` | 1254x1254 | 1776.6 KB | Coffee cup sticker/cutout candidate. No alpha detected. |
| B001-A07 | `ai_20260523-145024_2.png` | `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/ai-generations/ai_20260523-145024_2.png` | 1254x1254 | 1674.9 KB | Croissant / pastry sticker candidate. No alpha detected. |
| B001-A08 | `ai_20260523-145024_3.png` | `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/ai-generations/ai_20260523-145024_3.png` | 1254x1254 | 1400.3 KB | Matcha drink sticker candidate. No alpha detected. |
| B001-A09 | `ai_20260523-145024_4.png` | `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/ai-generations/ai_20260523-145024_4.png` | 1254x1254 | 2256.7 KB | Sea Farer's Coffee crossed-out fake/competitor-style mark. Rejected. |
| B001-A10 | `ai_20260523-152258_2.png` | `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/ai-generations/ai_20260523-152258_2.png` | 1254x1254 | 1246.2 KB | Smaller croissant / pastry sticker candidate. No alpha detected. |
| B001-A11 | `ai_20260523-152258_3.png` | `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/ai-generations/ai_20260523-152258_3.png` | 1254x1254 | 1297.6 KB | Smaller matcha drink sticker candidate. No alpha detected. |
| B001-A12 | `colattao owner.PNG` | `C:/Users/antho/OneDrive/Desktop/colattao owner.PNG` | 248x588 | 339.5 KB | Owner / spokesperson full-body reference, narrow crop. |
| B001-A13 | `Atmosphere fogata colattao.PNG` | `C:/Users/antho/OneDrive/Desktop/Atmosphere fogata colattao.PNG` | 369x647 | 584.1 KB | Cafe fireplace atmosphere shot with baked visible text. |

## Expected Asset Crosswalk

The prompt listed nine expected asset classes. After Batch Correction 001, the registered files cover owner reference, product, environment, detail, and sticker assets. They still do not include QR, Digital Menu screenshot, or standalone logo assets.

| Expected asset | Covered by this batch? | Notes |
|---|---|---|
| Owner / spokesperson full-body lifestyle image | Yes | `B001-A12`; usable with cleanup, but still not enough for full identity lock without front and 3/4 portraits. |
| Colattao logo image | No standalone logo | A blurred/background Colattao mark appears in B001-A02 and a small in-scene mark appears in B001-A05, but neither is a clean logo source. |
| Fina Calle QR / branded QR image | No | No QR asset is present. QR remains blocking. |
| Colattao mobile Digital Menu / app screenshot | No | No mobile Digital Menu screenshot is present in this exact batch. |
| Cafe environment group seating / fireplace shot | Yes | B001-A03. |
| Cafe environment family seating / fireplace shot | Yes | `B001-A13` supports family/fireplace atmosphere after cleanup; `B001-A03` remains the stronger wide group seating asset. |
| Hanging plant detail shot | Yes | B001-A04. |
| Pistachio tres leches product hero image | Yes | B001-A02, with B001-A01 as an additional coffee/pastry product still. |
| Colattao shelf decor / in-store branding detail shot | Yes | B001-A05. |

## Asset Records

### B001-A01 - Coffee And Pastry Product Still

```txt
ASSET NAME: Coffee and pastry product still
ASSET CLASS: Product / drink hero asset
CURRENT STATUS: approved
WHY: Strong premium coffee-and-dessert composition, warm espresso lighting, clear product focus, and good 4:5 source ratio.
INTENDED CAMPAIGN USE: Coffee pairing hero, product mood still, 4:5 feed post, optional 9:16 product teaser with safe background extension.
BEST TARGET FORMATS: 4:5 WebP product hero, 9:16 WebP story crop, 1:1 product card crop.
NOTES / RISKS: Treat as campaign visual, not proof of real menu/pricing. Do not add or infer menu copy from the image.
```

### B001-A02 - Pistachio Tres Leches Product Hero

```txt
ASSET NAME: Pistachio tres leches with coffee hero
ASSET CLASS: Product hero asset
CURRENT STATUS: approved
WHY: Strong product hierarchy, clear pistachio tres leches presentation, coffee pairing context, and premium Colattao atmosphere.
INTENDED CAMPAIGN USE: Primary pistachio tres leches product hero, 4:5 premium feed post, 1:1 product card, optional 9:16 teaser.
BEST TARGET FORMATS: 4:5 WebP hero, 1:1 WebP product card, optional 9:16 WebP story crop.
NOTES / RISKS: The blurred Colattao mark in the background is not a logo source and must not replace an approved overlay logo.
```

### B001-A03 - Cafe Fireplace Group Environment

```txt
ASSET NAME: Cafe fireplace group seating environment
ASSET CLASS: Cafe environment / hospitality scene
CURRENT STATUS: approved
WHY: Strong cinematic environment, visible fireplace, seating, guests, warm lighting, and premium hospitality mood.
INTENDED CAMPAIGN USE: 9:16 environment insert, 4:5 premium still, atmosphere reference for Colattao campaign, background for overlay-safe CTA assembly.
BEST TARGET FORMATS: 9:16 WebP environment insert, 4:5 WebP still, optional background-safe crop.
NOTES / RISKS: This can enter normalization as a campaign environment asset, but cafe environment lock still requires explicit Anthony/client approval or waiver before generation.
```

### B001-A04 - Hanging Plant Detail

```txt
ASSET NAME: Hanging plant detail
ASSET CLASS: Cafe environment detail / insert shot
CURRENT STATUS: approved
WHY: Clean vertical detail, warm lighting, premium texture, and useful cutaway subject for story pacing.
INTENDED CAMPAIGN USE: 9:16 detail insert, transition shot, texture/background accent, environment continuity cue.
BEST TARGET FORMATS: 9:16 WebP insert, 4:5 WebP detail crop if needed.
NOTES / RISKS: Detail reference only. It does not satisfy the full cafe environment lock by itself.
```

### B001-A05 - Shelf Decor And In-Store Branding Detail

```txt
ASSET NAME: Colattao shelf decor / in-store branding detail
ASSET CLASS: Cafe environment detail / brand atmosphere
CURRENT STATUS: approved
WHY: Strong shelf styling, blue/white decor continuity, small Colattao in-scene mark, and premium texture.
INTENDED CAMPAIGN USE: 9:16 detail insert, 4:5 decor still, brand atmosphere cutaway, transition texture.
BEST TARGET FORMATS: 9:16 WebP insert, 4:5 WebP detail, optional 1:1 decor crop.
NOTES / RISKS: The small Colattao plate mark is in-scene decor, not an approved standalone logo overlay.
```

### B001-A06 - Coffee Cup Sticker Candidate

```txt
ASSET NAME: Coffee cup sticker candidate
ASSET CLASS: Sticker / product cutout candidate
CURRENT STATUS: usable with cleanup
WHY: Strong Colattao-style cup visual, but the PNG has no detected alpha channel and appears to include a checkerboard-style background.
INTENDED CAMPAIGN USE: Product sticker accent, 1:1 product card, small motion sticker after background cleanup.
BEST TARGET FORMATS: Transparent PNG cutout, transparent WebP if supported cleanly, 1:1 sticker export.
NOTES / RISKS: Do not treat current file as final transparent overlay. Background removal and edge QA are required.
```

### B001-A07 - Croissant Sticker Candidate

```txt
ASSET NAME: Croissant / pastry sticker candidate
ASSET CLASS: Sticker / product cutout candidate
CURRENT STATUS: usable with cleanup
WHY: Strong pastry sticker form, but no alpha channel was detected and checkerboard-style background cleanup is required.
INTENDED CAMPAIGN USE: Pastry sticker accent, menu/product card, 1:1 motion sticker if exact item is approved.
BEST TARGET FORMATS: Transparent PNG cutout, transparent WebP if supported cleanly, 1:1 sticker export.
NOTES / RISKS: Use only as a generic pastry/croissant visual unless an exact menu item match is confirmed. Do not invent product name or ingredients.
```

### B001-A08 - Matcha Drink Sticker Candidate

```txt
ASSET NAME: Matcha drink sticker candidate
ASSET CLASS: Sticker / drink cutout candidate
CURRENT STATUS: usable with cleanup
WHY: Strong drink sticker silhouette, but no alpha channel was detected and checkerboard-style background cleanup is required.
INTENDED CAMPAIGN USE: Matcha product sticker, seasonal drink accent, 1:1 product card.
BEST TARGET FORMATS: Transparent PNG cutout, transparent WebP if supported cleanly, 1:1 sticker export.
NOTES / RISKS: Do not claim flavor, price, or menu availability from the image alone.
```

### B001-A09 - Sea Farer's Coffee Crossed-Out Mark

```txt
ASSET NAME: Sea Farer's Coffee crossed-out mark
ASSET CLASS: Rejected competitor/fake-logo style asset
CURRENT STATUS: rejected
WHY: Contains generated readable logo-style text for a non-Colattao brand and a large red X. This violates no-AI-generated-logo discipline and is off-brand for Colattao premium output.
INTENDED CAMPAIGN USE: None.
BEST TARGET FORMATS: None.
NOTES / RISKS: Do not process, normalize, or use in campaign. Keep only as rejected intake evidence if needed.
```

### B001-A10 - Smaller Croissant Sticker Candidate

```txt
ASSET NAME: Smaller croissant / pastry sticker candidate
ASSET CLASS: Sticker / product cutout candidate
CURRENT STATUS: usable with cleanup
WHY: Similar to B001-A07 with more surrounding canvas. It may be easier to normalize into a 1:1 sticker, but no alpha channel was detected.
INTENDED CAMPAIGN USE: Pastry sticker accent, 1:1 product card, motion sticker if exact product use is approved.
BEST TARGET FORMATS: Transparent PNG cutout, transparent WebP if supported cleanly, 1:1 sticker export.
NOTES / RISKS: Likely duplicate family with B001-A07. Choose one after visual QA to avoid redundant sticker exports.
```

### B001-A11 - Smaller Matcha Drink Sticker Candidate

```txt
ASSET NAME: Smaller matcha drink sticker candidate
ASSET CLASS: Sticker / drink cutout candidate
CURRENT STATUS: usable with cleanup
WHY: Similar to B001-A08 with more surrounding canvas. It may be easier to normalize into a 1:1 sticker, but no alpha channel was detected.
INTENDED CAMPAIGN USE: Matcha product sticker, 1:1 product card, seasonal drink motion accent.
BEST TARGET FORMATS: Transparent PNG cutout, transparent WebP if supported cleanly, 1:1 sticker export.
NOTES / RISKS: Likely duplicate family with B001-A08. Choose one after visual QA to avoid redundant sticker exports.
```

### B001-A12 - Owner / Spokesperson Full-Body Reference

```txt
ASSET ID: B001-A12
ASSET NAME: Colattao owner / spokesperson full-body reference
EXACT FILENAME: colattao owner.PNG
RELATIVE PATH: ../colattao owner.PNG relative to the AMMA workspace folder; full source path is C:/Users/antho/OneDrive/Desktop/colattao owner.PNG
ASSET CLASS: Owner / spokesperson reference
CURRENT STATUS: usable with cleanup
WHY: The image shows a clear full-body spokesperson reference and can support cutout/portrait processing, but it is a narrow crop and does not satisfy the full owner identity lock requirements by itself.
INTENDED CAMPAIGN USE: 9:16 spokesperson cutout, 4:5 premium portrait, optional 1:1 secondary crop.
TARGET FORMATS: Transparent PNG cutout; 9:16 WebP spokesperson asset; 4:5 WebP premium portrait; optional 1:1 WebP crop.
CLEANUP REQUIRED: Background removal, edge cleanup, upscale/quality QA if needed, safe crop review.
NOTES / RISKS: Still missing front portrait and 3/4 portrait for true identity lock. Do not begin owner identity generation without approval or waiver.
```

### B001-A13 - Atmosphere Fogata Colattao

```txt
ASSET ID: B001-A13
ASSET NAME: Atmosphere fogata Colattao
EXACT FILENAME: Atmosphere fogata colattao.PNG
RELATIVE PATH: ../Atmosphere fogata colattao.PNG relative to the AMMA workspace folder; full source path is C:/Users/antho/OneDrive/Desktop/Atmosphere fogata colattao.PNG
ASSET CLASS: Cafe environment atmosphere / fireplace shot
CURRENT STATUS: usable with cleanup
WHY: The image has strong fireplace, chandelier, brick, and lounge atmosphere, but it contains baked visible text and should not be used as a clean final environment insert until that text is removed or cropped away.
INTENDED CAMPAIGN USE: 9:16 environment insert, 4:5 premium still, atmosphere establishing visual.
TARGET FORMATS: 9:16 WebP atmosphere export; 4:5 WebP premium still; optional clean background/reference crop.
CLEANUP REQUIRED: Remove or crop out baked text, check mobile readability, confirm no final AI-generated text remains, preserve fireplace/chandelier atmosphere.
NOTES / RISKS: Useful as a fogata/fireplace atmosphere asset after cleanup. Cafe environment lock still requires explicit approval or waiver.
```

## Approved / Strong Assets

These assets are strong enough to enter a future normalization queue. This does not bypass final campaign approval.

| Batch ID | Asset | Why strong | Recommended exports |
|---|---|---|---|
| B001-A01 | Coffee and pastry product still | Premium coffee/dessert composition. | 4:5, 9:16, 1:1. |
| B001-A02 | Pistachio tres leches with coffee hero | Best product hero in the batch. | 4:5, 1:1, optional 9:16. |
| B001-A03 | Cafe fireplace group environment | Strong hospitality/fireplace mood. | 9:16, 4:5. |
| B001-A04 | Hanging plant detail | Clean premium detail insert. | 9:16, 4:5. |
| B001-A05 | Shelf decor / in-store branding detail | Strong brand atmosphere cutaway. | 9:16, 4:5, optional 1:1. |

## Usable With Cleanup

| Batch ID | Asset | Cleanup needed | Recommended exports |
|---|---|---|---|
| B001-A06 | Coffee cup sticker candidate | Remove checkerboard/background, create true alpha, edge QA. | Transparent PNG, transparent WebP, 1:1. |
| B001-A07 | Croissant / pastry sticker candidate | Remove checkerboard/background, verify exact product use. | Transparent PNG, transparent WebP, 1:1. |
| B001-A08 | Matcha drink sticker candidate | Remove checkerboard/background, verify product use. | Transparent PNG, transparent WebP, 1:1. |
| B001-A10 | Smaller croissant / pastry sticker candidate | Remove checkerboard/background, dedupe against B001-A07. | Transparent PNG, transparent WebP, 1:1. |
| B001-A11 | Smaller matcha drink sticker candidate | Remove checkerboard/background, dedupe against B001-A08. | Transparent PNG, transparent WebP, 1:1. |
| B001-A12 | Owner / spokesperson full-body reference | Background removal, edge cleanup, identity-lock gap review. | Transparent PNG, 9:16, 4:5, optional 1:1. |
| B001-A13 | Atmosphere fogata Colattao | Remove/crop baked text and export clean atmosphere crops. | 9:16, 4:5. |

## Rejected Assets

| Batch ID | Asset | Reason |
|---|---|---|
| B001-A09 | Sea Farer's Coffee crossed-out mark | Fake/competitor-style readable logo text and red-X concept are off-brand and violate no-AI-generated-logo rules. |

## Still Missing

Required assets still missing from this exact batch:

- Owner front portrait.
- Owner 3/4 portrait.
- Owner left/right profile if possible.
- Cleaner official Colattao logo source if available.
- Fina Calle QR / branded QR image.
- Standalone approved Colattao QR if needed.
- Colattao mobile Digital Menu screenshot.
- Separate family seating / fireplace shot if family-specific campaign framing is required.
- Final editable CTA text.

## Immediate Blockers

These block owner-led, QR-led, or Digital Menu proof campaign production until resolved or intentionally waived:

- Owner/spokesperson full-body reference is now registered as `B001-A12`, but owner identity lock remains blocked until front and 3/4 portraits are provided or intentionally waived.
- No QR file in this batch, so QR overlay processing cannot begin.
- No mobile Digital Menu screenshot in this batch, so live Digital Menu proof remains missing for this batch.
- No clean standalone Colattao logo source in this batch, so logo overlay cleanup must use an already registered logo source or wait for official source upload.
- Sticker candidates do not have true alpha; they need background removal before overlay use.

## Recommended Format Map

| Asset group | Source assets | Best target formats | Notes |
|---|---|---|---|
| Product heroes | B001-A01, B001-A02 | 4:5 WebP, 1:1 WebP, optional 9:16 WebP | B001-A02 should be first product hero candidate. |
| Owner / spokesperson | B001-A12 | Transparent PNG, 9:16 WebP, 4:5 WebP, optional 1:1 WebP | Usable with cleanup; not enough for full identity lock by itself. |
| Cafe environment | B001-A03, B001-A13 | 9:16 WebP, 4:5 WebP | B001-A13 needs baked text removed/cropped; environment lock still requires approval or waiver. |
| Cafe detail inserts | B001-A04, B001-A05 | 9:16 WebP, 4:5 WebP, optional 1:1 | Useful for pacing and premium texture. |
| Stickers / cutouts | B001-A06, B001-A07, B001-A08, B001-A10, B001-A11 | Transparent PNG, transparent WebP, 1:1 | Cleanup required because no alpha was detected. |
| Rejected/no-use | B001-A09 | None | Do not process. |
| QR overlays | Missing | 1:1 master PNG, overlay-safe PNG, 4:5 poster placement, 9:16 safe-area version | Must be scan-tested and never AI-generated. |
| Logo overlays | Missing in batch | Transparent PNG, optional SVG recreation from official source | Do not extract from blurred/in-scene marks. |
| Digital Menu proof | Missing in batch | 9:16 WebP proof crop, 4:5 proof crop | Use a clean mobile screenshot when provided. |
