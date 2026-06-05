# Colattao Encanto Asset Classification

## Purpose

This document classifies the strongest existing Colattao assets for the Encanto Fina Calle Digital Menu Launch. It is a campaign readiness layer built from the existing inventory and gate documents.

This document does not grant final production approval by itself. `candidate-approved` means the asset is strong enough to move into Anthony/client review and normalization, not that it is approved for final campaign generation.

## Source Documents Reviewed

- `ASSET_REGISTRY/COLATTAO/EXISTING_ASSET_INVENTORY.md`
- `ASSET_REGISTRY/COLATTAO/DATASET_CREATION_GATE_001.md`
- `ASSET_REGISTRY/COLATTAO/ENCANTO_LAUNCH_ASSET_PACKET.md`

## Status Definitions For This Classification

- `candidate-approved`: strongest known candidate for campaign use, pending final Anthony/client approval and any required normalization.
- `pending-owner-approval`: requires owner/client approval, identity confirmation, source confirmation, route verification, or brand signoff.
- `needs-normalization`: useful asset, but must be cleaned, cropped, optimized, transparent-exported, or converted to overlay before use.
- `rejected`: should not be used for campaign output based on registry rules or obvious mismatch.
- `missing`: required asset has not been found or registered.

## Critical Owner Identity Boundary

No owner/spokesperson identity is approved yet.

Any current uploaded owner image outside the repo or outside the registered asset folders is only pending external input until it is placed into an approved repo or asset folder, documented with source/date/status, and reviewed against `DATASET_CREATION_GATE_001.md`.

Do not begin owner identity lock from chat uploads, screenshots, memory, or unregistered local files.

## Candidate-Approved Assets

These are the strongest existing candidates for Encanto Launch review. They still require final approval before production use.

| Filename | Path | Class | Proposed status | Intended use | 9:16 suitability | Normalization needed | Risk notes |
|---|---|---|---|---|---|---|---|
| `colattao-bg.png` | `Colattao Rush/public/assets/colattao/backgrounds/colattao-bg.png` | Campaign background | candidate-approved | Main vertical Encanto background | Strong. `941x1672` is direct 9:16. | Optimize to WebP campaign export; verify color consistency. | Must confirm it is brand-safe and not a final AI render with forbidden baked text/logos. |
| `colattao-bg-summer.png` | `Colattao Rush/public/assets/colattao/backgrounds/colattao-bg-summer.png` | Seasonal campaign background | candidate-approved | Seasonal / summer Encanto background | Strong. `941x1672` is direct 9:16. | Compress and export campaign WebP; check mobile contrast. | Large file; must not slow campaign delivery. |
| `play-colattao-cafe-rush-banner.webp` | `Colattao Rush/public/assets/colattao/ui/play-colattao-cafe-rush-banner.webp` | CTA overlay | candidate-approved | Cafe Rush CTA overlay | Good as top/bottom overlay inside 9:16, not full-frame. | Verify transparent/matte edges; keep as overlay only. | Contains text, so do not regenerate; if text is wrong, rebuild as editable overlay. |
| `view-our-menu-banner.webp` | `Colattao Rush/public/assets/colattao/ui/view-our-menu-banner.webp` | CTA overlay | candidate-approved | Digital Menu CTA overlay | Good as top/bottom overlay inside 9:16, not full-frame. | Verify transparent/matte edges; keep as overlay only. | Contains text, so do not regenerate; ensure terminology remains Digital Menu where needed. |
| `colattao-fina-calle-footer-banner.webp` | `Colattao Rush/public/assets/colattao/ui/colattao-fina-calle-footer-banner.webp` | Footer/signature overlay | candidate-approved | End-card or footer signature | Good as lower-third/footer overlay in 9:16. | Verify legibility at mobile size; export transparent if needed. | Contains logos/text/signature; final use requires overlay approval. |
| `menu-eldorado-01.png` | `Colattao Rush/public/assets/colattao/menu/menu-eldorado-01.png` | Digital Menu board | candidate-approved | Digital Menu proof visual | Good vertical candidate; best inside 9:16 with safe margins. | Create campaign crop/export; text readability QA. | If menu copy is baked into image, final campaign must use as approved screenshot/visual only. |
| `menu-eldorado-02.png` | `Colattao Rush/public/assets/colattao/menu/menu-eldorado-02.png` | Digital Menu board | candidate-approved | Digital Menu proof visual | Good vertical candidate; best inside 9:16 with safe margins. | Create campaign crop/export; text readability QA. | Needs approval as Digital Menu visual before generation. |
| `menu-eldorado-03.png` | `Colattao Rush/public/assets/colattao/menu/menu-eldorado-03.png` | Digital Menu board | candidate-approved | Digital Menu proof visual | Good vertical candidate; best inside 9:16 with safe margins. | Create campaign crop/export; text readability QA. | Needs approval as Digital Menu visual before generation. |
| `menu-eldorado-04.png` | `Colattao Rush/public/assets/colattao/menu/menu-eldorado-04.png` | Digital Menu board | candidate-approved | Digital Menu proof visual | Good vertical candidate; best inside 9:16 with safe margins. | Create campaign crop/export; text readability QA. | Needs approval as Digital Menu visual before generation. |
| `mango-sticker.png` | `Colattao Rush/public/assets/colattao/game/stickers/mango-sticker.png` | Seasonal drink sticker | candidate-approved | Lightweight product sticker / motion accent | Overlay only; small but useful in 9:16. | Verify transparent edges; optionally export normalized WebP/PNG. | Small `256x256`; do not enlarge too far. |
| `strawberry-sticker.png` | `Colattao Rush/public/assets/colattao/game/stickers/strawberry-sticker.png` | Seasonal drink sticker | candidate-approved | Lightweight product sticker / motion accent | Overlay only; small but useful in 9:16. | Verify transparent edges; optionally export normalized WebP/PNG. | Small `256x256`; do not enlarge too far. |
| `original-sticker.png` | `Colattao Rush/public/assets/colattao/game/stickers/original-sticker.png` | Seasonal drink sticker | candidate-approved | Lightweight product sticker / motion accent | Overlay only; small but useful in 9:16. | Verify transparent edges; optionally export normalized WebP/PNG. | Small `256x256`; do not enlarge too far. |

## Pending Owner Approval / Brand Approval Assets

These assets are useful but need explicit owner/client or brand approval before use.

| Filename | Path | Class | Proposed status | Intended use | 9:16 suitability | Normalization needed | Risk notes |
|---|---|---|---|---|---|---|---|
| `colattao-logo.png` | `Colattao Rush/public/assets/colattao/logo/colattao-logo.png` | Colattao logo | pending-owner-approval | Primary Colattao logo overlay | Overlay only; not full-frame. | Transparent PNG/SVG export if needed; edge/background QA. | Must be approved as real Colattao logo before campaign use. No AI-generated logo replacement. |
| `fina-calle-os-logo.png` | `APP/web/public/assets/fina-calle-os-logo.png` | Fina Calle OS logo | pending-owner-approval | Fina Calle system/producer mark | Badge overlay; not full-frame. | Transparent export; size variants for footer/end-card. | Must confirm whether Fina Calle OS mark belongs in Colattao-facing launch. |
| `fina-calle-os-emblem.webp` | `Colattao Rush/public/assets/colattao/ui/fina-calle-os-emblem.webp` | Fina Calle emblem | pending-owner-approval | Footer badge / system credit | Good as small overlay. | Legibility QA; transparent/matte check. | Needs brand approval if visible in client campaign. |
| `fina-calle-wordmark.webp` | `Colattao Rush/public/assets/colattao/ui/fina-calle-wordmark.webp` | Fina Calle wordmark | pending-owner-approval | Producer credit overlay | Good as small overlay. | Legibility QA; transparent/matte check. | Use only if Fina Calle credit is desired. |
| `signage-qr-menu-poster.png` | `Colattao Rush/public/assets/colattao/stickers/signage-qr-menu-poster.png` | QR/signage concept | pending-owner-approval | QR signage reference or poster concept | Vertical-ish; can support 9:16 composition. | QR scan test; replace QR with approved QR overlay. | Any baked QR must be treated as pending until scanned and verified. |
| `matcha-lemonade-mango-poster.png` | `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-lemonade-mango-poster.png` | Seasonal drink poster | pending-owner-approval | Mango product campaign visual | Good 4:5/vertical source; adaptable to 9:16. | Crop/extend to 9:16; text/overlay QA. | If text is baked, do not treat as editable CTA. |
| `matcha-lemonade-strawberry-poster.png` | `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-lemonade-strawberry-poster.png` | Seasonal drink poster | pending-owner-approval | Strawberry product campaign visual | Good 4:5/vertical source; adaptable to 9:16. | Crop/extend to 9:16; text/overlay QA. | If text is baked, do not treat as editable CTA. |
| `matcha-lemonade-original-poster.png` | `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-lemonade-original-poster.png` | Seasonal drink poster | pending-owner-approval | Original product campaign visual | Good 4:5/vertical source; adaptable to 9:16. | Crop/extend to 9:16; text/overlay QA. | If text is baked, do not treat as editable CTA. |

## Needs Normalization Assets

These assets should be normalized before production review or campaign assembly.

| Filename | Path | Class | Proposed status | Intended use | 9:16 suitability | Normalization needed | Risk notes |
|---|---|---|---|---|---|---|---|
| `matcha-lemonade-mango-banner.png` | `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-lemonade-mango-banner.png` | Seasonal drink banner | needs-normalization | Product banner insert | Horizontal; not direct 9:16. | Crop, scale, or rebuild as 9:16/4:5 composition. | May lose product/text if cropped aggressively. |
| `matcha-lemonade-strawberry-banner.png` | `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-lemonade-strawberry-banner.png` | Seasonal drink banner | needs-normalization | Product banner insert | Horizontal; not direct 9:16. | Crop, scale, or rebuild as 9:16/4:5 composition. | May lose product/text if cropped aggressively. |
| `matcha-lemonade-original-banner.png` | `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-lemonade-original-banner.png` | Seasonal drink banner | needs-normalization | Product banner insert | Horizontal; not direct 9:16. | Crop, scale, or rebuild as 9:16/4:5 composition. | May lose product/text if cropped aggressively. |
| `matcha-lemonade-mango-card.webp` | `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-lemonade-mango-card.webp` | Seasonal drink card | needs-normalization | Digital Menu/card insert | Good as card overlay, not full-frame. | Export campaign-size still/card variant if needed. | Too small/compact for standalone story frame. |
| `matcha-lemonade-strawberry-card.webp` | `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-lemonade-strawberry-card.webp` | Seasonal drink card | needs-normalization | Digital Menu/card insert | Good as card overlay, not full-frame. | Export campaign-size still/card variant if needed. | Too small/compact for standalone story frame. |
| `matcha-lemonade-original-card.webp` | `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-lemonade-original-card.webp` | Seasonal drink card | needs-normalization | Digital Menu/card insert | Good as card overlay, not full-frame. | Export campaign-size still/card variant if needed. | Too small/compact for standalone story frame. |
| `spinach-feta-pastry-sticker.webp` | `Colattao Rush/public/assets/colattao/menu-items/spinach-feta-pastry-sticker.webp` | Food sticker | needs-normalization | Food sticker overlay | Overlay only. | Confirm item match; transparent edge QA; campaign-size export. | Should not be used unless item/category is part of shot. |
| `jalapeno-cheddar-pretzel-sticker.webp` | `Colattao Rush/public/assets/colattao/menu-items/jalapeno-cheddar-pretzel-sticker.webp` | Food sticker | needs-normalization | Food sticker overlay | Overlay only. | Confirm item match; transparent edge QA; campaign-size export. | May not match current menu if not explicitly present. |
| `chocolate-croissant-sticker.webp` | `Colattao Rush/public/assets/colattao/menu-items/chocolate-croissant-sticker.webp` | Food sticker | needs-normalization | Food sticker overlay | Overlay only. | Transparent edge QA; campaign-size export. | Use only if exact item is featured. |
| `pan-de-bono-sticker.webp` | `Colattao Rush/public/assets/colattao/menu-items/pan-de-bono-sticker.webp` | Food sticker | needs-normalization | Food sticker overlay | Overlay only. | Transparent edge QA; campaign-size export. | Use only if exact item is featured. |
| `almond-croissant-sticker.webp` | `Colattao Rush/public/assets/colattao/menu-items/almond-croissant-sticker.webp` | Food sticker | needs-normalization | Food sticker overlay | Overlay only. | Transparent edge QA; campaign-size export. | Use only if exact item is featured. |
| `chocolate-chip-cookie-sticker.webp` | `Colattao Rush/public/assets/colattao/menu-items/chocolate-chip-cookie-sticker.webp` | Food sticker | needs-normalization | Food sticker overlay | Overlay only. | Transparent edge QA; campaign-size export. | Use only if exact item is featured. |
| `empanada-sticker.webp` | `Colattao Rush/public/assets/colattao/menu-items/empanada-sticker.webp` | Food sticker | needs-normalization | Food sticker overlay | Overlay only. | Transparent edge QA; campaign-size export. | Use only if exact item is featured. |
| `berry-galette-sticker.webp` | `Colattao Rush/public/assets/colattao/menu-items/berry-galette-sticker.webp` | Food sticker | needs-normalization | Food sticker overlay | Overlay only. | Confirm item match; transparent edge QA; campaign-size export. | Should not be used if item is not currently offered. |
| `mango-drink-source.png` | `Fina Calle Brand images CODEX/colattao-drinks/mango-drink-source.png` | Seasonal drink source | needs-normalization | Product source/reference | Horizontal; needs 9:16 crop or product cutout. | Product isolation; crop to 9:16/4:5; optimized export. | Source status needs owner/client approval. |
| `strawberry-drink-source.png` | `Fina Calle Brand images CODEX/colattao-drinks/strawberry-drink-source.png` | Seasonal drink source | needs-normalization | Product source/reference | Horizontal; needs 9:16 crop or product cutout. | Product isolation; crop to 9:16/4:5; optimized export. | Source status needs owner/client approval. |
| `original-drink-source.png` | `Fina Calle Brand images CODEX/colattao-drinks/original-drink-source.png` | Seasonal drink source | needs-normalization | Product source/reference | Horizontal; needs 9:16 crop or product cutout. | Product isolation; crop to 9:16/4:5; optimized export. | Source status needs owner/client approval. |

## Rejected Assets

No prioritized asset is rejected at this stage based solely on document review.

Automatic rejection rules remain active:

| Asset type | Proposed status | Reason |
|---|---|---|
| AI-generated logos used as final logo | rejected | Registry forbids AI-generated logos as final brand marks. |
| AI-generated QR codes used as final QR | rejected | Registry forbids AI-generated QR codes; QR must be approved and scan-tested. |
| AI-generated CTA/menu copy baked into final campaign output | rejected | CTA text and menu copy must be editable overlays or approved screenshots. |
| Blurry, filtered, low-light, distorted, inconsistent outfit, wrong terminology assets | rejected | Fails dataset creation gate. |

## Missing Assets

| Asset | Class | Proposed status | Intended use | 9:16 suitability | Normalization needed | Risk notes |
|---|---|---|---|---|---|---|
| Owner front portrait | Owner reference | missing | Owner identity lock | Required for owner-led 9:16 campaign | Capture/import and register. | Do not approve owner identity without this or an explicit waiver. |
| Owner 3/4 portrait | Owner reference | missing | Owner identity lock | Required for owner-led 9:16 campaign | Capture/import and register. | Do not infer from unrelated images. |
| Owner left/right profile | Owner reference | missing | Better identity consistency | Useful for generation consistency | Capture/import and register if available. | Can be waived, but waiver must be documented. |
| Owner full-body standing | Owner reference | missing | Full-scene blocking | Required for standing/counter shots | Capture/import and register. | Needed before full-body owner scenes. |
| Warm owner/spokesperson expression | Owner reference | missing | Campaign hero / spoken CTA feel | Useful for 9:16 scenes | Capture/import and register. | Must use same outfit/session as other owner shots if possible. |
| Counter reference | Cafe environment | missing | Cafe environment lock | Important for owner/customer blocking | Capture/import and register. | Do not lock environment from generic cafe art. |
| Interior wide shot | Cafe environment | missing | Cafe environment lock | Important for 9:16 backgrounds | Capture/import and register. | Existing cafe-like assets need source confirmation before use. |
| Menu/display area | Cafe environment | missing | Digital Menu/cafe proof | Useful in 9:16 context | Capture/import and register. | Needs real/approved reference. |
| Lighting reference | Cafe environment | missing | Visual consistency | Useful in every campaign frame | Capture/import and register. | Avoid inconsistent lighting across shots. |
| Owner/customer standing positions | Cafe environment | missing | Blocking reference | Required for believable owner/customer shots | Capture/import and register. | Blocks storyboards involving people. |
| Approved standalone QR PNG | QR overlay | missing | Scan-to-Digital Menu / Cafe Rush CTA | Overlay only | Generate/export from verified destination; scan test. | Do not use baked/unverified QR poster. |
| Instagram destination | QR/destination | missing | Optional social CTA | Not visual until overlay created | Provide exact URL/handle. | Do not invent. |
| Clean mobile Digital Menu screenshot | Digital Menu proof | missing | Live product proof | Strong for 9:16 if cropped cleanly | Capture approved screenshot; remove browser clutter if possible. | Existing board art is useful but not a live screenshot unless approved as such. |
| Editable campaign CTA text | Overlay text | missing | Final CTA overlays | Overlay only | Approve copy and render in composition layer. | Do not bake AI-generated text into final outputs. |

## Recommended Encanto Working Set

Use this as the first review batch:

1. Background: `colattao-bg.png`
2. Seasonal background: `colattao-bg-summer.png`
3. Digital Menu proof: `menu-eldorado-01.png` through `menu-eldorado-04.png`
4. Product accents: `mango-sticker.png`, `strawberry-sticker.png`, `original-sticker.png`
5. CTA overlays: `view-our-menu-banner.webp`, `play-colattao-cafe-rush-banner.webp`
6. Signature overlay: `colattao-fina-calle-footer-banner.webp`
7. Brand overlay candidates: `colattao-logo.png`, `fina-calle-os-emblem.webp`

## Recommended Next Step

Run a human visual approval pass and mark each working-set asset as approved, pending, rejected, or deprecated in the client registry. After approval, create a normalized export packet with:

- 9:16 WebP backgrounds.
- Transparent logo overlays.
- Transparent CTA overlays.
- Campaign-safe Digital Menu proof crops.
- QR PNG after destination verification and scan test.

Do not begin owner identity lock, cafe environment lock, storyboards, or AI generation until owner/cafe/QR/Digital Menu proof assets are approved or intentionally waived.
