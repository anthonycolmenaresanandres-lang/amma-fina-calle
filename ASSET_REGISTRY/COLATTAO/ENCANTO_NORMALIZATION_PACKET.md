# Colattao Encanto Normalization Packet

## Purpose

This packet defines the campaign-ready normalization plan for the Colattao Encanto launch asset set. It is documentation only: no image processing, asset editing, API calls, app changes, or approvals are performed by this file.

## Source Documents Reviewed

- `ASSET_REGISTRY/COLATTAO/EXISTING_ASSET_INVENTORY.md`
- `ASSET_REGISTRY/COLATTAO/ENCANTO_ASSET_CLASSIFICATION.md`
- `ASSET_REGISTRY/COLATTAO/DATASET_CREATION_GATE_001.md`
- `SKILLS/PREMIUM_VENUE_TRANSLATION_SYSTEM/`

## Hard Rules

- No AI-generated logos.
- No AI-generated QR codes.
- No AI-generated CTA text.
- No AI-generated menu words.
- No AI-generated Digital Menu copy.
- No AI-generated pricing.
- No AI-generated legal text.
- Logos, QR codes, CTA text, Digital Menu copy, menu copy, and pricing remain overlays or approved screenshots only.
- Owner identity is not approved yet.
- Cafe environment is not approved yet.
- Missing owner/cafe/QR/mobile Digital Menu screenshot assets are blocking items unless explicitly waived.

## Target Export Naming Convention

Use deterministic export names:

```txt
colattao-encanto-<asset-class>-<source-slug>-<ratio-or-role>-v001.<ext>
```

Preferred campaign export folder once processing is approved:

```txt
ASSET_REGISTRY/COLATTAO/normalized/encanto/
```

No folder or processed image is created by this packet.

## 9:16 Backgrounds

| Source filename/path | Target export name | Target format | Target size/aspect ratio | Intended use | Required normalization | Status before processing | Risk notes |
|---|---|---|---|---|---|---|---|
| `colattao-bg.png` / `Colattao Rush/public/assets/colattao/backgrounds/colattao-bg.png` | `colattao-encanto-bg-primary-9x16-v001.webp` | WebP | 1080x1920 or source-preserving 9:16 | Primary Encanto story/reel background | Resize/export to 9:16 WebP, mobile contrast QA, confirm no baked forbidden text/logo/QR. | candidate-approved | Strong direct 9:16 candidate, but final brand approval still required. |
| `colattao-bg-summer.png` / `Colattao Rush/public/assets/colattao/backgrounds/colattao-bg-summer.png` | `colattao-encanto-bg-summer-9x16-v001.webp` | WebP | 1080x1920 or source-preserving 9:16 | Seasonal drink launch background | Compress/export to WebP, color consistency check, mobile contrast QA. | candidate-approved | Large source; must be optimized before mobile campaign use. |
| `real-lounge-fireplace-vertical.png` / `Colattao Rush/public/assets/colattao/website-concept/real-lounge-fireplace-vertical.png` | `colattao-encanto-bg-lounge-9x16-v001.webp` | WebP | 1080x1920 with safe extension/crop | Optional lounge atmosphere background | Extend/crop to 9:16, remove or avoid any generated text, environment-source review. | needs-normalization | Cafe environment is not approved; use as mood/reference only until approved or waived. |
| `background-texture-colattao.png` / `Colattao Rush/public/assets/colattao/website-concept/background-texture-colattao.png` | `colattao-encanto-texture-fill-9x16-v001.webp` | WebP | 1080x1920 background fill | Safe background extension/fill layer | Crop/extend texture to vertical, compress, ensure no readable generated elements. | needs-normalization | Texture only, not a cafe environment lock. |

## 4:5 Social Crops

| Source filename/path | Target export name | Target format | Target size/aspect ratio | Intended use | Required normalization | Status before processing | Risk notes |
|---|---|---|---|---|---|---|---|
| `menu-eldorado-01.png` / `Colattao Rush/public/assets/colattao/menu/menu-eldorado-01.png` | `colattao-encanto-digital-menu-eldorado-01-4x5-v001.webp` | WebP | 1080x1350 / 4:5 | Social feed Digital Menu proof | Crop with full menu board safe, text readability QA, compress. | candidate-approved | Treat as approved visual/screenshot only after human review; do not regenerate menu copy. |
| `menu-eldorado-02.png` / `Colattao Rush/public/assets/colattao/menu/menu-eldorado-02.png` | `colattao-encanto-digital-menu-eldorado-02-4x5-v001.webp` | WebP | 1080x1350 / 4:5 | Social feed Digital Menu proof | Crop with full menu board safe, text readability QA, compress. | candidate-approved | Needs Digital Menu proof approval before campaign generation. |
| `menu-eldorado-03.png` / `Colattao Rush/public/assets/colattao/menu/menu-eldorado-03.png` | `colattao-encanto-digital-menu-eldorado-03-4x5-v001.webp` | WebP | 1080x1350 / 4:5 | Social feed Digital Menu proof | Crop with full menu board safe, text readability QA, compress. | candidate-approved | Needs Digital Menu proof approval before campaign generation. |
| `menu-eldorado-04.png` / `Colattao Rush/public/assets/colattao/menu/menu-eldorado-04.png` | `colattao-encanto-digital-menu-eldorado-04-4x5-v001.webp` | WebP | 1080x1350 / 4:5 | Social feed Digital Menu proof | Crop with full menu board safe, text readability QA, compress. | candidate-approved | Needs Digital Menu proof approval before campaign generation. |
| `matcha-lemonade-mango-poster.png` / `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-lemonade-mango-poster.png` | `colattao-encanto-matcha-mango-poster-4x5-v001.webp` | WebP | 1080x1350 / 4:5 | Product feed post | Crop/scale preserving product, verify text/overlay rules, compress. | pending-owner-approval | If baked text appears, use as reference or approved poster only; CTA text remains overlay. |
| `matcha-lemonade-strawberry-poster.png` / `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-lemonade-strawberry-poster.png` | `colattao-encanto-matcha-strawberry-poster-4x5-v001.webp` | WebP | 1080x1350 / 4:5 | Product feed post | Crop/scale preserving product, verify text/overlay rules, compress. | pending-owner-approval | Needs product/source approval. |
| `matcha-lemonade-original-poster.png` / `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-lemonade-original-poster.png` | `colattao-encanto-matcha-original-poster-4x5-v001.webp` | WebP | 1080x1350 / 4:5 | Product feed post | Crop/scale preserving product, verify text/overlay rules, compress. | pending-owner-approval | Needs product/source approval. |

## Square Sticker / Product Crops

| Source filename/path | Target export name | Target format | Target size/aspect ratio | Intended use | Required normalization | Status before processing | Risk notes |
|---|---|---|---|---|---|---|---|
| `mango-sticker.png` / `Colattao Rush/public/assets/colattao/game/stickers/mango-sticker.png` | `colattao-encanto-sticker-mango-square-v001.webp` | WebP or PNG if transparency requires | 512x512 / 1:1 | Product sticker accent | Transparency/edge QA, optional 512px upscale only if clean, compress. | candidate-approved | Source is 256x256; do not over-enlarge for hero use. |
| `strawberry-sticker.png` / `Colattao Rush/public/assets/colattao/game/stickers/strawberry-sticker.png` | `colattao-encanto-sticker-strawberry-square-v001.webp` | WebP or PNG if transparency requires | 512x512 / 1:1 | Product sticker accent | Transparency/edge QA, optional 512px upscale only if clean, compress. | candidate-approved | Source is 256x256; overlay only. |
| `original-sticker.png` / `Colattao Rush/public/assets/colattao/game/stickers/original-sticker.png` | `colattao-encanto-sticker-original-square-v001.webp` | WebP or PNG if transparency requires | 512x512 / 1:1 | Product sticker accent | Transparency/edge QA, optional 512px upscale only if clean, compress. | candidate-approved | Source is 256x256; overlay only. |
| `chocolate-croissant-sticker.webp` / `Colattao Rush/public/assets/colattao/menu-items/chocolate-croissant-sticker.webp` | `colattao-encanto-sticker-chocolate-croissant-square-v001.webp` | WebP | 512x512 or source-safe 1:1 | Food product sticker | Confirm exact item match, transparent edge QA, campaign-size export. | needs-normalization | Use only if featured item is in approved campaign. |
| `pan-de-bono-sticker.webp` / `Colattao Rush/public/assets/colattao/menu-items/pan-de-bono-sticker.webp` | `colattao-encanto-sticker-pan-de-bono-square-v001.webp` | WebP | 512x512 or source-safe 1:1 | Food product sticker | Confirm exact item match, transparent edge QA, campaign-size export. | needs-normalization | Use only if featured item is in approved campaign. |
| `almond-croissant-sticker.webp` / `Colattao Rush/public/assets/colattao/menu-items/almond-croissant-sticker.webp` | `colattao-encanto-sticker-almond-croissant-square-v001.webp` | WebP | 512x512 or source-safe 1:1 | Food product sticker | Confirm exact item match, transparent edge QA, campaign-size export. | needs-normalization | Use only if featured item is in approved campaign. |
| `empanada-sticker.webp` / `Colattao Rush/public/assets/colattao/menu-items/empanada-sticker.webp` | `colattao-encanto-sticker-empanada-square-v001.webp` | WebP | 512x512 or source-safe 1:1 | Food product sticker | Confirm exact item match, transparent edge QA, campaign-size export. | needs-normalization | Use only if featured item is in approved campaign. |
| `chocolate-chip-cookie-sticker.webp` / `Colattao Rush/public/assets/colattao/menu-items/chocolate-chip-cookie-sticker.webp` | `colattao-encanto-sticker-cookie-square-v001.webp` | WebP | 512x512 or source-safe 1:1 | Food product sticker | Confirm exact item match, transparent edge QA, campaign-size export. | needs-normalization | Use only if featured item is in approved campaign. |

## Transparent PNG Overlays

| Source filename/path | Target export name | Target format | Target size/aspect ratio | Intended use | Required normalization | Status before processing | Risk notes |
|---|---|---|---|---|---|---|---|
| `colattao-logo.png` / `Colattao Rush/public/assets/colattao/logo/colattao-logo.png` | `colattao-encanto-overlay-colattao-logo-transparent-v001.png` | PNG with transparency | Source-safe width, plus 2x and 1x variants if needed | Primary Colattao logo overlay | Background/edge QA, transparent export if needed, do not alter mark. | pending-owner-approval | Must be approved as real brand logo before use; never regenerate. |
| `fina-calle-os-logo.png` / `APP/web/public/assets/fina-calle-os-logo.png` | `colattao-encanto-overlay-fina-calle-os-logo-transparent-v001.png` | PNG with transparency | Square badge source-safe | Optional Fina Calle OS badge overlay | Transparent export, color/edge QA, mobile legibility check. | pending-owner-approval | Confirm whether Fina Calle OS mark should appear in client-facing campaign. |
| `fina-calle-os-emblem.webp` / `Colattao Rush/public/assets/colattao/ui/fina-calle-os-emblem.webp` | `colattao-encanto-overlay-fina-calle-emblem-transparent-v001.png` | PNG with transparency | Source-safe badge | Optional footer/emblem overlay | Convert to PNG only if transparency/assembly requires; legibility QA. | pending-owner-approval | Needs brand approval if visible. |
| `colattao-fina-calle-footer-banner.webp` / `Colattao Rush/public/assets/colattao/ui/colattao-fina-calle-footer-banner.webp` | `colattao-encanto-overlay-footer-signature-v001.png` | PNG with transparency or WebP if supported | Width-safe lower-third | End-card/footer signature | Transparent/matte edge QA, mobile legibility check. | candidate-approved | Contains logos/text/signature; use only as approved overlay. |

## Digital Menu Proof Crops

| Source filename/path | Target export name | Target format | Target size/aspect ratio | Intended use | Required normalization | Status before processing | Risk notes |
|---|---|---|---|---|---|---|---|
| `menu-eldorado-01.png` / `Colattao Rush/public/assets/colattao/menu/menu-eldorado-01.png` | `colattao-encanto-digital-menu-proof-01-9x16-v001.webp` | WebP | 1080x1920 with safe board placement | Story/reel Digital Menu proof frame | Place/crop inside vertical background, preserve readability, no AI text edits. | candidate-approved | Board art is not a live mobile screenshot unless approved as such. |
| `menu-eldorado-02.png` / `Colattao Rush/public/assets/colattao/menu/menu-eldorado-02.png` | `colattao-encanto-digital-menu-proof-02-9x16-v001.webp` | WebP | 1080x1920 with safe board placement | Story/reel Digital Menu proof frame | Place/crop inside vertical background, preserve readability, no AI text edits. | candidate-approved | Needs review for small text readability. |
| `menu-eldorado-03.png` / `Colattao Rush/public/assets/colattao/menu/menu-eldorado-03.png` | `colattao-encanto-digital-menu-proof-03-9x16-v001.webp` | WebP | 1080x1920 with safe board placement | Story/reel Digital Menu proof frame | Place/crop inside vertical background, preserve readability, no AI text edits. | candidate-approved | Needs review for small text readability. |
| `menu-eldorado-04.png` / `Colattao Rush/public/assets/colattao/menu/menu-eldorado-04.png` | `colattao-encanto-digital-menu-proof-04-9x16-v001.webp` | WebP | 1080x1920 with safe board placement | Story/reel Digital Menu proof frame | Place/crop inside vertical background, preserve readability, no AI text edits. | candidate-approved | Needs review for small text readability. |
| `MISSING: mobile Digital Menu screenshot` | `colattao-encanto-digital-menu-mobile-screenshot-9x16-v001.webp` | WebP | 1080x1920 or clean phone mockup crop | Live Digital Menu proof | Capture real mobile screenshot, clean browser clutter, register source. | missing / blocking | Required if campaign claims live mobile Digital Menu proof. |

## Cafe Rush CTA Overlays

| Source filename/path | Target export name | Target format | Target size/aspect ratio | Intended use | Required normalization | Status before processing | Risk notes |
|---|---|---|---|---|---|---|---|
| `play-colattao-cafe-rush-banner.webp` / `Colattao Rush/public/assets/colattao/ui/play-colattao-cafe-rush-banner.webp` | `colattao-encanto-overlay-play-cafe-rush-v001.webp` | WebP or PNG if transparency requires | Lower-third/top CTA, source-safe ratio | Cafe Rush CTA overlay | Matte/edge QA, mobile legibility check, safe-area placement map. | candidate-approved | Contains CTA text; do not regenerate. If copy changes, rebuild as editable overlay. |
| `play-colattao-cafe-rush-banner.png` / `Colattao Rush/public/assets/colattao/ui/play-colattao-cafe-rush-banner.png` | `colattao-encanto-overlay-play-cafe-rush-source-v001.png` | PNG | Source-safe ratio | Source/fallback for Cafe Rush CTA | Preserve original; export smaller overlay variants if approved. | needs-normalization | Large source; optimize before campaign assembly. |
| `view-our-menu-banner.webp` / `Colattao Rush/public/assets/colattao/ui/view-our-menu-banner.webp` | `colattao-encanto-overlay-view-digital-menu-v001.webp` | WebP or PNG if transparency requires | Lower-third/top CTA, source-safe ratio | Digital Menu CTA overlay | Matte/edge QA, mobile legibility check, safe-area placement map. | candidate-approved | Existing text says view our menu; ensure final campaign copy aligns with Digital Menu terminology. |

## QR Overlays

| Source filename/path | Target export name | Target format | Target size/aspect ratio | Intended use | Required normalization | Status before processing | Risk notes |
|---|---|---|---|---|---|---|---|
| `MISSING: approved Digital Menu QR PNG` | `colattao-encanto-qr-digital-menu-v001.png` | PNG | Square, scan-safe, high contrast | Scan to Digital Menu | Generate/export QR from verified URL outside AI generation, scan-test, register. | missing / blocking | AI-generated QR is rejected. Must scan-test before use. |
| `MISSING: approved Cafe Rush QR PNG` | `colattao-encanto-qr-cafe-rush-v001.png` | PNG | Square, scan-safe, high contrast | Scan to Cafe Rush game | Generate/export QR from verified URL outside AI generation, scan-test, register. | missing / blocking | AI-generated QR is rejected. Must scan-test before use. |
| `signage-qr-menu-poster.png` / `Colattao Rush/public/assets/colattao/stickers/signage-qr-menu-poster.png` | `colattao-encanto-qr-signage-reference-v001.webp` | WebP reference only | 9:16 or 4:5 poster reference | QR signage concept/reference | Do not use baked QR until scan-tested; replace QR with approved overlay. | pending-owner-approval | Not approved as final QR. Treat as reference until verified. |

## Product / Drink Hero Assets

| Source filename/path | Target export name | Target format | Target size/aspect ratio | Intended use | Required normalization | Status before processing | Risk notes |
|---|---|---|---|---|---|---|---|
| `mango-drink-source.png` / `Fina Calle Brand images CODEX/colattao-drinks/mango-drink-source.png` | `colattao-encanto-hero-drink-mango-9x16-v001.webp` | WebP | 1080x1920 or product-safe vertical crop | Mango drink hero frame | Crop or isolate product, preserve product shape, compress, source approval. | needs-normalization | Source needs owner/client approval before campaign use. |
| `strawberry-drink-source.png` / `Fina Calle Brand images CODEX/colattao-drinks/strawberry-drink-source.png` | `colattao-encanto-hero-drink-strawberry-9x16-v001.webp` | WebP | 1080x1920 or product-safe vertical crop | Strawberry drink hero frame | Crop or isolate product, preserve product shape, compress, source approval. | needs-normalization | Source needs owner/client approval before campaign use. |
| `original-drink-source.png` / `Fina Calle Brand images CODEX/colattao-drinks/original-drink-source.png` | `colattao-encanto-hero-drink-original-9x16-v001.webp` | WebP | 1080x1920 or product-safe vertical crop | Original drink hero frame | Crop or isolate product, preserve product shape, compress, source approval. | needs-normalization | Source needs owner/client approval before campaign use. |
| `matcha-lemonade-mango-poster.png` / `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-lemonade-mango-poster.png` | `colattao-encanto-hero-matcha-mango-9x16-v001.webp` | WebP | 1080x1920 with safe product placement | Mango seasonal hero | Extend/crop to 9:16, remove reliance on baked CTA text, compress. | pending-owner-approval | Use as visual only unless poster itself is approved. |
| `matcha-lemonade-strawberry-poster.png` / `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-lemonade-strawberry-poster.png` | `colattao-encanto-hero-matcha-strawberry-9x16-v001.webp` | WebP | 1080x1920 with safe product placement | Strawberry seasonal hero | Extend/crop to 9:16, remove reliance on baked CTA text, compress. | pending-owner-approval | Use as visual only unless poster itself is approved. |
| `matcha-lemonade-original-poster.png` / `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-lemonade-original-poster.png` | `colattao-encanto-hero-matcha-original-9x16-v001.webp` | WebP | 1080x1920 with safe product placement | Original seasonal hero | Extend/crop to 9:16, remove reliance on baked CTA text, compress. | pending-owner-approval | Use as visual only unless poster itself is approved. |
| `coffee-pairing.webp` / `Colattao Rush/public/assets/colattao/real-go/coffee-pairing.webp` | `colattao-encanto-hero-coffee-pairing-4x5-v001.webp` | WebP | 1080x1350 / 4:5 | Coffee/product supporting post | Verify dimensions/source, crop, mobile product clarity check. | needs-normalization | Product/cafe source approval needed. |
| `raspberry-cheesecake.webp` / `Colattao Rush/public/assets/colattao/real-go/raspberry-cheesecake.webp` | `colattao-encanto-hero-raspberry-cheesecake-4x5-v001.webp` | WebP | 1080x1350 / 4:5 | Dessert supporting post | Verify dimensions/source, crop, mobile product clarity check. | needs-normalization | Product/cafe source approval needed. |
| `pistachio-tres-leches.webp` / `Colattao Rush/public/assets/colattao/real-go/pistachio-tres-leches.webp` | `colattao-encanto-hero-pistachio-tres-leches-4x5-v001.webp` | WebP | 1080x1350 / 4:5 | Dessert supporting post | Verify dimensions/source, crop, mobile product clarity check. | needs-normalization | Product/cafe source approval needed. |

## Blocking Missing Assets

These block owner-led or cafe-specific campaign generation until approved or intentionally waived:

| Missing asset | Blocks | Required action |
|---|---|---|
| Owner front portrait | Owner identity lock and owner-led shots | Capture/import, register, approve. |
| Owner 3/4 portrait | Owner identity lock and owner-led shots | Capture/import, register, approve. |
| Owner profile references | Higher-consistency owner generation | Capture/import or document waiver. |
| Owner full-body standing | Full-body owner/counter shots | Capture/import, register, approve. |
| Warm owner/spokesperson expression | Warm spokesperson campaign beats | Capture/import, register, approve. |
| Counter reference | Cafe environment lock | Capture/import, register, approve. |
| Interior wide shot | Cafe environment lock and background continuity | Capture/import, register, approve. |
| Menu/display area | Cafe environment and Digital Menu proof | Capture/import, register, approve. |
| Lighting reference | Visual consistency | Capture/import, register, approve. |
| Owner/customer standing positions | Blocking map and believable people shots | Capture/import, register, approve. |
| Approved Digital Menu QR PNG | QR overlay | Generate outside AI, verify destination, scan-test, register. |
| Approved Cafe Rush QR PNG | QR overlay | Generate outside AI, verify destination, scan-test, register. |
| Clean mobile Digital Menu screenshot | Live Digital Menu proof | Capture real mobile screenshot, clean crop, register. |
| Instagram destination if used | Optional social CTA | Provide exact URL/handle; do not invent. |
| Editable campaign CTA text | Overlay assembly | Approve final copy as editable overlay. |

## Processing Order Recommendation

1. Human-approve or reject source assets listed as `candidate-approved`.
2. Create 9:16 WebP background exports.
3. Create transparent overlay exports for approved logo/CTA/footer assets.
4. Create Digital Menu proof crops from approved board assets.
5. Generate or export QR PNGs outside AI, scan-test, and register.
6. Create square sticker/product crops.
7. Create product/drink hero crops.
8. Stop before owner/cafe generation until missing identity/environment assets are approved or waived.

## QA Checklist Before Processing

- Source asset is registered.
- Source asset status is not rejected.
- Intended use is documented.
- Forbidden use is documented.
- Target export name is deterministic.
- Target ratio is defined.
- No AI text/logo/QR/menu generation is requested.
- Owner identity is not assumed.
- Cafe environment is not assumed.
- QR is scan-tested before use.
- Digital Menu proof is approved before campaign use.
