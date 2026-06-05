# Colattao Existing Asset Inventory

## Purpose

This inventory records Colattao-related assets already found on the local machine before new campaign ingestion or AI generation. It is a working classification document only. It does not approve assets by itself.

## Inspection Scope

Targeted inspection only. No app code was modified.

Sources reviewed:

- `ASSET_REGISTRY/`
- `ASSET_REGISTRY/COLATTAO/`
- `ASSET_REGISTRY/COLATTAO/DATASET_CREATION_GATE_001.md`
- `APP/web/public/assets/`
- `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/`
- `C:/Users/antho/OneDrive/Desktop/Colattao Rush/public/assets/colattao/`
- `C:/Users/antho/Downloads/` for targeted Fina Calle/logo matches only

Status language:

- `approved`: only use if approval is explicit in the registry or by Anthony.
- `pending`: known or likely useful, but not approved yet.
- `needs review`: likely useful and already deployed/generated, but needs visual, ownership, and campaign-fit review.
- `rejected`: visibly unsuitable or violates registry rules.

## Brand Assets Found

| Filename | Relative path | Probable asset class | Status suggestion | Intended use | 9:16 campaign suitability notes |
|---|---|---|---|---|---|
| `colattao-logo.png` | `Colattao Rush/public/assets/colattao/logo/colattao-logo.png` | Colattao logo | needs review | Brand/logo overlay after approval | Logo is horizontal `1024x341`; usable as overlay, not full-frame 9:16. Needs transparent/background QA. |
| `fina-calle-os-logo.png` | `APP/web/public/assets/fina-calle-os-logo.png` | Fina Calle OS logo | needs review | Fina Calle OS overlay or internal brand mark | Square `1254x1254`; usable as badge/overlay after approval, should not be regenerated. |
| `fina-calle-os-emblem.webp` | `Colattao Rush/public/assets/colattao/ui/fina-calle-os-emblem.webp` | Fina Calle emblem | needs review | Small footer/signature overlay | Existing optimized WebP, good candidate for secondary branding if approved. |
| `fina-calle-wordmark.webp` | `Colattao Rush/public/assets/colattao/ui/fina-calle-wordmark.webp` | Fina Calle wordmark | needs review | Footer or producer-credit overlay | Small optimized WebP; verify legibility before campaign use. |
| `LOGO_FINA.png` | `Fina Calle Brand images CODEX/logos/LOGO_FINA.png` | Fina Calle logo candidate | pending | Reference/source candidate for Fina Calle overlay | Small `398x361`; likely needs source approval and transparency QA. |
| `FINA_logo_cropped.svg` | `Fina Calle Brand images CODEX/logos/FINA_logo_cropped.svg` | Fina Calle logo candidate | pending | Vector logo candidate | SVG is potentially useful, but source file must be reviewed before approval. |
| `fina_calle_logo_transparent.png` | `Downloads/fina_calle_logo_transparent.png` | Fina Calle logo candidate | pending | Overlay candidate | Square `1024x1024`; verify source/ownership and transparent edges. |

## Digital Menu Assets Found

| Filename | Relative path | Probable asset class | Status suggestion | Intended use | 9:16 campaign suitability notes |
|---|---|---|---|---|---|
| `menu-eldorado-01.png` | `Colattao Rush/public/assets/colattao/menu/menu-eldorado-01.png` | Digital Menu board artwork | needs review | Digital Menu visual/campaign insert | Vertical `1055x1491`, close to 4:5; can be cropped or placed inside 9:16 frame. |
| `menu-eldorado-02.png` | `Colattao Rush/public/assets/colattao/menu/menu-eldorado-02.png` | Digital Menu board artwork | needs review | Digital Menu visual/campaign insert | Vertical `1055x1491`, strong candidate for 9:16 composition with safe background. |
| `menu-eldorado-03.png` | `Colattao Rush/public/assets/colattao/menu/menu-eldorado-03.png` | Digital Menu board artwork | needs review | Digital Menu visual/campaign insert | Vertical `1055x1491`; needs text/readability QA. |
| `menu-eldorado-04.png` | `Colattao Rush/public/assets/colattao/menu/menu-eldorado-04.png` | Digital Menu board artwork | needs review | Digital Menu visual/campaign insert | Vertical `1055x1491`; needs text/readability QA. |
| `menu-coffee-feature.png` | `Colattao Rush/public/assets/colattao/menu/menu-coffee-feature.png` | Digital Menu feature visual | needs review | Coffee category promo | Vertical `1122x1402`; good 4:5 candidate, can be nested in 9:16. |
| `menu-dessert-feature.png` | `Colattao Rush/public/assets/colattao/menu/menu-dessert-feature.png` | Digital Menu feature visual | needs review | Dessert category promo | Vertical `1122x1402`; good 4:5 candidate, needs overlay-safe crop. |
| `menu-food-feature.png` | `Colattao Rush/public/assets/colattao/menu/menu-food-feature.png` | Digital Menu feature visual | needs review | Food category promo | Vertical `1122x1402`; good 4:5 candidate. |
| `menu-origin-milk-header.webp` | `Colattao Rush/public/assets/colattao/ui/menu-origin-milk-header.webp` | Digital Menu header plaque | needs review | Header/supporting overlay in Digital Menu campaigns | Wide banner; useful as overlay, not 9:16 full-frame. |
| `menu-origin-milk-header.png` | `Colattao Rush/public/assets/colattao/ui/menu-origin-milk-header.png` | Digital Menu header plaque fallback | needs review | Source/fallback for header plaque | Wide `1200x519`; keep as source/fallback if approved. |

## QR / Sticker Assets Found

| Filename | Relative path | Probable asset class | Status suggestion | Intended use | 9:16 campaign suitability notes |
|---|---|---|---|---|---|
| `signage-qr-menu-poster.png` | `Colattao Rush/public/assets/colattao/stickers/signage-qr-menu-poster.png` | QR/signage poster candidate | pending | QR signage concept or poster reference | Vertical `1103x1426`; needs QR scan verification before any campaign use. |
| `sticker-colattao-sombrero-01.png` | `Colattao Rush/public/assets/colattao/stickers/sticker-colattao-sombrero-01.png` | Colattao sticker asset | needs review | Sticker/overlay candidate | Square `1254x1254`; crop as floating sticker/badge, not full 9:16. |
| `sticker-colattao-sombrero-02.png` | `Colattao Rush/public/assets/colattao/stickers/sticker-colattao-sombrero-02.png` | Colattao sticker asset | needs review | Sticker/overlay candidate | Square; needs background removal or transparency QA. |
| `sticker-colattao-mountain-01.png` | `Colattao Rush/public/assets/colattao/stickers/sticker-colattao-mountain-01.png` | Colattao sticker asset | needs review | Cultural/location sticker overlay | Square; usable as campaign accent after QA. |
| `sticker-colattao-vinyl-01.png` | `Colattao Rush/public/assets/colattao/stickers/sticker-colattao-vinyl-01.png` | Colattao sticker asset | needs review | Sticker overlay | Square; likely overlay use only. |
| `sticker-colattao-vinyl-02.png` | `Colattao Rush/public/assets/colattao/stickers/sticker-colattao-vinyl-02.png` | Colattao sticker asset | needs review | Sticker overlay | Square; likely overlay use only. |
| `sticker-heritage-cup-01.png` | `Colattao Rush/public/assets/colattao/stickers/sticker-heritage-cup-01.png` | Product sticker | needs review | Cup/product sticker overlay | Square; crop/transparent export recommended. |
| `sticker-heritage-cup-02.png` | `Colattao Rush/public/assets/colattao/stickers/sticker-heritage-cup-02.png` | Product sticker | needs review | Cup/product sticker overlay | Square; crop/transparent export recommended. |
| `sticker-heritage-mug-01.png` | `Colattao Rush/public/assets/colattao/stickers/sticker-heritage-mug-01.png` | Product sticker | needs review | Mug/product sticker overlay | Square; crop/transparent export recommended. |

## Drink / Product Assets Found

| Filename | Relative path | Probable asset class | Status suggestion | Intended use | 9:16 campaign suitability notes |
|---|---|---|---|---|---|
| `mango-drink-source.png` | `Fina Calle Brand images CODEX/colattao-drinks/mango-drink-source.png` | Seasonal drink source | pending | Source reference for mango matcha/lemonade campaign | Horizontal `1672x941`; crop or isolate product for 9:16. |
| `strawberry-drink-source.png` | `Fina Calle Brand images CODEX/colattao-drinks/strawberry-drink-source.png` | Seasonal drink source | pending | Source reference for strawberry matcha/lemonade campaign | Horizontal; needs crop/product extraction. |
| `original-drink-source.png` | `Fina Calle Brand images CODEX/colattao-drinks/original-drink-source.png` | Seasonal drink source | pending | Source reference for original matcha/lemonade campaign | Horizontal; needs crop/product extraction. |
| `matcha-mango-thumb.png` | `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-mango-thumb.png` | Seasonal drink thumbnail | needs review | Digital Menu thumbnail/sticker | `256x256`; usable as small overlay, too small for full 9:16. |
| `matcha-strawberry-thumb.png` | `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-strawberry-thumb.png` | Seasonal drink thumbnail | needs review | Digital Menu thumbnail/sticker | `256x256`; overlay only. |
| `matcha-original-thumb.png` | `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-original-thumb.png` | Seasonal drink thumbnail | needs review | Digital Menu thumbnail/sticker | `256x256`; overlay only. |
| `mango-sticker.png` | `Colattao Rush/public/assets/colattao/game/stickers/mango-sticker.png` | Game/product sticker | needs review | Game and campaign sticker overlay | `256x256`; good lightweight badge after approval. |
| `strawberry-sticker.png` | `Colattao Rush/public/assets/colattao/game/stickers/strawberry-sticker.png` | Game/product sticker | needs review | Game and campaign sticker overlay | `256x256`; good lightweight badge after approval. |
| `original-sticker.png` | `Colattao Rush/public/assets/colattao/game/stickers/original-sticker.png` | Game/product sticker | needs review | Game and campaign sticker overlay | `256x256`; good lightweight badge after approval. |
| `matcha-lemonade-mango-poster.png` | `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-lemonade-mango-poster.png` | Seasonal drink poster | needs review | 4:5/vertical campaign source | `1122x1402`; can be adapted into 9:16 with background extension. |
| `matcha-lemonade-strawberry-poster.png` | `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-lemonade-strawberry-poster.png` | Seasonal drink poster | needs review | 4:5/vertical campaign source | `1122x1402`; good vertical campaign candidate after text/overlay QA. |
| `matcha-lemonade-original-poster.png` | `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-lemonade-original-poster.png` | Seasonal drink poster | needs review | 4:5/vertical campaign source | `1122x1402`; good vertical campaign candidate after text/overlay QA. |
| `matcha-lemonade-mango-card.webp` | `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-lemonade-mango-card.webp` | Optimized seasonal card | needs review | Digital Menu card/compact promo | Optimized WebP; likely good for web, not full-frame 9:16. |
| `matcha-lemonade-strawberry-card.webp` | `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-lemonade-strawberry-card.webp` | Optimized seasonal card | needs review | Digital Menu card/compact promo | Optimized WebP; likely good for web, not full-frame 9:16. |
| `matcha-lemonade-original-card.webp` | `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-lemonade-original-card.webp` | Optimized seasonal card | needs review | Digital Menu card/compact promo | Optimized WebP; likely good for web, not full-frame 9:16. |
| `raspberry-cheesecake.webp` | `Colattao Rush/public/assets/colattao/real-go/raspberry-cheesecake.webp` | Product/cafe visual | needs review | Dessert product campaign insert | Optimized WebP; verify dimensions visually before 9:16 use. |
| `pistachio-tres-leches.webp` | `Colattao Rush/public/assets/colattao/real-go/pistachio-tres-leches.webp` | Product/cafe visual | needs review | Dessert product campaign insert | Optimized WebP; good candidate after crop/ownership review. |
| `coffee-pairing.webp` | `Colattao Rush/public/assets/colattao/real-go/coffee-pairing.webp` | Product/cafe visual | needs review | Coffee pairing campaign insert | Optimized WebP; likely useful for 9:16 if composition allows. |
| `croissant.png` | `Colattao Rush/public/assets/colattao/items/croissant.png` | Menu item icon | needs review | Lightweight item sticker/icon | `256x256`; overlay only. |
| `coffee-cup.png` | `Colattao Rush/public/assets/colattao/items/coffee-cup.png` | Menu item icon | needs review | Lightweight item sticker/icon | `256x256`; overlay only. |
| `matcha-iced.png` | `Colattao Rush/public/assets/colattao/items/matcha-iced.png` | Menu item icon | needs review | Lightweight item sticker/icon | `256x256`; overlay only. |

## Food Sticker Assets Found

| Filename | Relative path | Probable asset class | Status suggestion | Intended use | 9:16 campaign suitability notes |
|---|---|---|---|---|---|
| `spinach-feta-pastry-sticker.webp` | `Colattao Rush/public/assets/colattao/menu-items/spinach-feta-pastry-sticker.webp` | Food sticker | needs review | Food item dropdown/campaign sticker | Optimized WebP; overlay only. |
| `jalapeno-cheddar-pretzel-sticker.webp` | `Colattao Rush/public/assets/colattao/menu-items/jalapeno-cheddar-pretzel-sticker.webp` | Food sticker | needs review | Food item sticker | Optimized WebP; overlay only. |
| `chocolate-croissant-sticker.webp` | `Colattao Rush/public/assets/colattao/menu-items/chocolate-croissant-sticker.webp` | Food sticker | needs review | Food item sticker | Optimized WebP; overlay only. |
| `pan-de-bono-sticker.webp` | `Colattao Rush/public/assets/colattao/menu-items/pan-de-bono-sticker.webp` | Food sticker | needs review | Food item sticker | Optimized WebP; overlay only. |
| `almond-croissant-sticker.webp` | `Colattao Rush/public/assets/colattao/menu-items/almond-croissant-sticker.webp` | Food sticker | needs review | Food item sticker | Optimized WebP; overlay only. |
| `chocolate-chip-cookie-sticker.webp` | `Colattao Rush/public/assets/colattao/menu-items/chocolate-chip-cookie-sticker.webp` | Food sticker | needs review | Food item sticker | Optimized WebP; overlay only. |
| `empanada-sticker.webp` | `Colattao Rush/public/assets/colattao/menu-items/empanada-sticker.webp` | Food sticker | needs review | Food item sticker | Optimized WebP; overlay only. |
| `berry-galette-sticker.webp` | `Colattao Rush/public/assets/colattao/menu-items/berry-galette-sticker.webp` | Food sticker | needs review | Food item sticker | Optimized WebP; overlay only. |

## Overlay Assets Found

| Filename | Relative path | Probable asset class | Status suggestion | Intended use | 9:16 campaign suitability notes |
|---|---|---|---|---|---|
| `play-colattao-cafe-rush-banner.webp` | `Colattao Rush/public/assets/colattao/ui/play-colattao-cafe-rush-banner.webp` | CTA banner overlay | needs review | Play CTA overlay/button | Wide banner; use as overlay, not generated text. |
| `play-colattao-cafe-rush-banner.png` | `Colattao Rush/public/assets/colattao/ui/play-colattao-cafe-rush-banner.png` | CTA banner source/fallback | needs review | Source/fallback for Play CTA | Wide `2172x514`; crop/scale for composition. |
| `view-our-menu-banner.webp` | `Colattao Rush/public/assets/colattao/ui/view-our-menu-banner.webp` | CTA banner overlay | needs review | Digital Menu CTA overlay/button | Wide banner; use as overlay, not generated text. |
| `view-our-menu-banner.png` | `Colattao Rush/public/assets/colattao/ui/view-our-menu-banner.png` | CTA banner source/fallback | needs review | Source/fallback for Digital Menu CTA | Wide `2172x514`; crop/scale for composition. |
| `colattao-fina-calle-footer-banner.webp` | `Colattao Rush/public/assets/colattao/ui/colattao-fina-calle-footer-banner.webp` | Footer/signature overlay | needs review | Brand signature/footer overlay | Wide footer banner; suitable as bottom overlay in 9:16 if scaled. |
| `colattao-fina-calle-footer-banner.png` | `Colattao Rush/public/assets/colattao/ui/colattao-fina-calle-footer-banner.png` | Footer/signature source/fallback | needs review | Source/fallback for signature overlay | Wide `2872x547`; not full-frame. |
| `tap-to-explore.png` | `Colattao Rush/public/assets/colattao/rnd/tap-to-explore.png` | CTA/interaction overlay | pending | Experimental interaction CTA | Wide `2172x724`; needs campaign fit review. |
| `featured-seasonal-plates-banner.png` | `Colattao Rush/public/assets/colattao/menu/seasonal/featured-seasonal-plates-banner.png` | Seasonal banner | needs review | Seasonal Digital Menu/campaign overlay | Horizontal `1672x941`; can be adapted to story with crop. |
| `matcha-lemonade-mango-banner.png` | `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-lemonade-mango-banner.png` | Seasonal product banner | needs review | Product campaign banner | Horizontal `1200x675`; needs 9:16 adaptation. |
| `matcha-lemonade-strawberry-banner.png` | `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-lemonade-strawberry-banner.png` | Seasonal product banner | needs review | Product campaign banner | Horizontal `1200x675`; needs 9:16 adaptation. |
| `matcha-lemonade-original-banner.png` | `Colattao Rush/public/assets/colattao/menu/seasonal/matcha-lemonade-original-banner.png` | Seasonal product banner | needs review | Product campaign banner | Horizontal `1200x675`; needs 9:16 adaptation. |

## Cafe / Environment Assets Found

| Filename | Relative path | Probable asset class | Status suggestion | Intended use | 9:16 campaign suitability notes |
|---|---|---|---|---|---|
| `hero-brand-lounge.webp` | `Colattao Rush/public/assets/colattao/real-go/hero-brand-lounge.webp` | Cafe/lounge environment | needs review | Campaign background/reference | Optimized WebP; likely strong environment candidate after approval. |
| `lounge-fireside.webp` | `Colattao Rush/public/assets/colattao/real-go/lounge-fireside.webp` | Cafe/lounge environment | needs review | Campaign background/reference | Optimized WebP; verify if real cafe or generated reference before environment lock. |
| `heritage-ceramics.webp` | `Colattao Rush/public/assets/colattao/real-go/heritage-ceramics.webp` | Cafe detail/reference | needs review | Environment detail insert | Good supporting texture/reference, not complete environment lock. |
| `real-lounge-fireplace-vertical.png` | `Colattao Rush/public/assets/colattao/website-concept/real-lounge-fireplace-vertical.png` | Cafe/lounge environment | needs review | Vertical campaign background/reference | `1122x1402`; close to 4:5, can be adapted to 9:16 with extension. |
| `real-lounge-fireplace-wide.png` | `Colattao Rush/public/assets/colattao/website-concept/real-lounge-fireplace-wide.png` | Cafe/lounge environment | needs review | Hero/background reference | Listed as wide but dimensions read `1122x1402`; verify visually before campaign use. |
| `hero-interior.png` | `Colattao Rush/public/assets/colattao/website-concept/hero-interior.png` | Cafe interior concept/reference | pending | Environment inspiration only unless approved | Horizontal `1672x941`; not enough for environment lock by itself. |
| `community-cafe.png` | `Colattao Rush/public/assets/colattao/website-concept/community-cafe.png` | Cafe/community scene reference | pending | Campaign mood/reference | Horizontal `1672x941`; needs source/approval. |
| `barista-craft.png` | `Colattao Rush/public/assets/colattao/website-concept/barista-craft.png` | Barista/craft reference | pending | Campaign mood/reference | Vertical `1122x1402`; should not be treated as owner reference. |
| `background-texture-colattao.png` | `Colattao Rush/public/assets/colattao/website-concept/background-texture-colattao.png` | Background texture | needs review | Texture/background layer | Horizontal `1672x941`; can be used as background fill, not identity/environment lock. |
| `colattao-bg.png` | `Colattao Rush/public/assets/colattao/backgrounds/colattao-bg.png` | Campaign background | needs review | 9:16 background | `941x1672`, direct 9:16 candidate after approval. |
| `colattao-bg-summer.png` | `Colattao Rush/public/assets/colattao/backgrounds/colattao-bg-summer.png` | Seasonal campaign background | needs review | 9:16 seasonal background | `941x1672`, direct 9:16 candidate after approval; large file should be optimized. |

## Missing Owner Reference Assets

No approved owner/spokesperson reference packet was found in the reviewed locations.

Still required:

- Front portrait.
- 3/4 portrait.
- Left/right profile if possible.
- Full-body standing.
- Neutral expression.
- Warm owner/spokesperson expression.
- Same outfit across all shots.
- Good lighting, no filters, no sunglasses, no heavy background clutter.

Current status: `pending`.

## Missing Cafe Environment Assets

Several cafe-like/generated/reference assets were found, but no clearly approved real-world cafe environment capture packet was found.

Still required:

- Counter reference.
- Interior wide shot.
- Menu/display area.
- Lighting reference.
- Owner standing position.
- Customer standing position.
- Approved vertical 9:16 camera angles.

Current status: `pending` until Anthony marks found assets as real/approved or uploads real references.

## Missing QR / Destination Assets

A possible `signage-qr-menu-poster.png` was found, but no final approved standalone QR PNG was confirmed.

Still required:

- Approved QR code PNG.
- Destination written next to each QR asset.
- Scan-test result for each QR.
- Confirmation whether Instagram destination is part of the packet.

Known destinations still needing verification from the registry packet:

- Colattao Cafe Rush production URL.
- Colattao Digital Menu route.
- Cafe Rush game route.
- Instagram destination, if available.

## Recommended Assets For Encanto Launch

Recommended pending review packet:

| Use | Candidate asset | Status suggestion | Why |
|---|---|---|---|
| Main 9:16 background | `Colattao Rush/public/assets/colattao/backgrounds/colattao-bg.png` | needs review | Already vertical `941x1672`; strong story/reel frame candidate. |
| Seasonal 9:16 background | `Colattao Rush/public/assets/colattao/backgrounds/colattao-bg-summer.png` | needs review | Already vertical `941x1672`; likely fits seasonal drink campaign. |
| Digital Menu proof | `Colattao Rush/public/assets/colattao/menu/menu-eldorado-01.png` through `menu-eldorado-04.png` | needs review | Existing vertical Digital Menu boards for visual proof. |
| Product focus | `matcha-lemonade-mango-poster.png`, `matcha-lemonade-strawberry-poster.png`, `matcha-lemonade-original-poster.png` | needs review | Vertical product posters ready for adaptation. |
| Lightweight product stickers | `mango-sticker.png`, `strawberry-sticker.png`, `original-sticker.png` | needs review | Small optimized 256px assets for motion/overlay use. |
| CTA overlay | `view-our-menu-banner.webp` | needs review | Existing optimized Digital Menu CTA; must remain overlay. |
| Game CTA overlay | `play-colattao-cafe-rush-banner.webp` | needs review | Existing optimized Cafe Rush CTA; must remain overlay. |
| Brand signature | `colattao-fina-calle-footer-banner.webp` | needs review | Useful end-card/footer overlay. |
| Colattao logo | `colattao-logo.png` | needs review | Must be approved as static logo overlay before use. |
| Fina Calle logo | `fina-calle-os-emblem.webp` or `fina-calle-wordmark.webp` | needs review | Must be approved if Fina Calle credit appears. |

## Normalization Recommendations

Before campaign generation or video assembly:

- Background remove / transparent export:
  - `colattao-logo.png`
  - `fina-calle-os-logo.png`
  - `LOGO_FINA.png`
  - `fina_calle_logo_transparent.png` after edge QA
  - Colattao sticker files under `Colattao Rush/public/assets/colattao/stickers/`
  - Food sticker WebP assets under `Colattao Rush/public/assets/colattao/menu-items/`

- Export to transparent PNG:
  - Approved logo overlays.
  - Approved CTA overlays if source has unwanted matte/background.
  - Product stickers that need compositing in video.

- Crop to 9:16:
  - `colattao-bg.png`
  - `colattao-bg-summer.png`
  - `matcha-lemonade-mango-poster.png`
  - `matcha-lemonade-strawberry-poster.png`
  - `matcha-lemonade-original-poster.png`
  - `real-lounge-fireplace-vertical.png`

- Crop to 4:5:
  - `menu-eldorado-01.png` through `menu-eldorado-04.png`
  - `menu-coffee-feature.png`
  - `menu-dessert-feature.png`
  - `menu-food-feature.png`
  - `real-pistachio-tres-leches.png`
  - `real-cheesecake.png`
  - `real-cup-lounge-pairing.png`
  - `real-cup-cake-pairing.png`

- Convert to overlay assets:
  - `view-our-menu-banner.webp`
  - `play-colattao-cafe-rush-banner.webp`
  - `colattao-fina-calle-footer-banner.webp`
  - `menu-origin-milk-header.webp`
  - `tap-to-explore.png`
  - `signage-qr-menu-poster.png` only after QR verification

- Optimize for campaign/mobile delivery:
  - Large PNG backgrounds over 1 MB should receive WebP campaign exports.
  - Keep editable text/CTA outside generated imagery whenever possible.
  - Do not use generated text/logo/QR inside AI outputs as final production overlays.

## Review Notes

- This document records assets found; it does not approve them.
- Any AI-generated image containing text, logo, QR, or menu copy must be treated as a visual reference only unless text/logo/QR is removed and replaced with approved overlays.
- Owner identity lock remains blocked until owner references are uploaded or intentionally waived.
- Cafe environment lock remains blocked until real cafe references are uploaded, verified, or intentionally waived.
