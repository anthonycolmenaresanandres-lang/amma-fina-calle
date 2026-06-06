# Colattao Static Mockup Assembly Plan 001

## Purpose

This document defines the exact static assembly blueprint for Variant A: Product-first Digital Menu Encanto Launch.

This is documentation only for mockup assembly. It references locally recovered overlay candidates but does not create mockup image outputs, modify app code, call APIs, add routes, deploy, change configs, modify packages, add secrets, or touch Colattao Rush code.

## Source Documents Reviewed

- `ASSET_REGISTRY/COLATTAO/MOCKUP_DIRECTION_PACKET_001.md`
- `ASSET_REGISTRY/COLATTAO/PRE_RENDER_PACKET_001.md`
- `ASSET_REGISTRY/COLATTAO/PREMIUM_VISUAL_MOOD_BOARD_PACKET_001.md`
- `ASSET_REGISTRY/COLATTAO/PRODUCTION_BLOCKERS_AND_NEXT_UPLOADS.md`
- `ASSET_REGISTRY/COLATTAO/normalized/`

## Assembly Decision

Recommended first static mockup composition:

```txt
VARIANT:
A - Product-first

PRIMARY FORMAT:
9:16 story/reel/poster

PRIMARY BASE ASSET:
ASSET_REGISTRY/COLATTAO/normalized/environment_product_v1/colattao-b001-product-coffee-pastry-9x16-v001.webp

SUPPORT ASSETS:
ASSET_REGISTRY/COLATTAO/normalized/environment_product_v1/colattao-b001-environment-plant-detail-9x16-v001.webp
ASSET_REGISTRY/COLATTAO/normalized/environment_product_v1/colattao-b001-environment-shelf-decor-9x16-v001.webp

FINAL RENDER STATUS:
Blocked until approved overlays are supplied.
```

## 1. Final Format Plan

### 9:16 Story / Reel / Poster

```txt
Canvas: 1080x1920
Use: first mobile story/reel/poster mockup
Priority: primary
Base: coffee + pastry 9:16 product hero
Status: ready for assembly planning, not final rendering
```

Purpose:

- Show product appetite first.
- Preserve premium cafe mood.
- Reserve clean overlay space for logo, Digital Menu CTA, and QR.

### 4:5 Feed Post

```txt
Canvas: 1080x1350
Use: premium feed post / carousel opener
Priority: secondary
Base: coffee + pastry 4:5 product hero
Status: ready for assembly planning, not final rendering
```

Purpose:

- Create a calmer feed-ready still.
- Use product as the hero.
- Leave top/bottom zones clean for approved overlay elements.

### Optional 1:1 QR / Product Tile

```txt
Canvas: 1080x1080
Use: QR/product tile or carousel support frame
Priority: optional
Base: product crop or solid espresso/parchment layout once QR is approved
Status: QR source normalized; blocked until phone scan-test confirms destination
```

Purpose:

- Provide a square scan card if needed.
- Keep QR isolated and scan-safe.
- Avoid placing QR over busy food texture.

## 2. Layer Stack

### 9:16 Product-First Layer Stack

| Order | Layer | Asset / placeholder | Status | Notes |
|---:|---|---|---|---|
| 1 | Background asset | `ASSET_REGISTRY/COLATTAO/normalized/environment_product_v1/colattao-b001-product-coffee-pastry-9x16-v001.webp` | approved | Use as full-canvas base. Product remains the hero. |
| 2 | Product hero asset | Same as background/base | approved | Do not duplicate or over-sharpen. Keep cup and pastry unobstructed. |
| 3 | Shelf / plant detail asset | Optional supporting frame: `colattao-b001-environment-plant-detail-9x16-v001.webp` or `colattao-b001-environment-shelf-decor-9x16-v001.webp` | approved | Use as alternate frame or subtle supporting panel only if the layout remains quiet. |
| 4 | Logo overlay candidate | `ASSET_REGISTRY/COLATTAO/normalized/overlays_v1/colattao_logo_cream_transparent_1600px.png` or `ASSET_REGISTRY/COLATTAO/normalized/overlays_v1/colattao_logo_white_transparent_1600px.png` | recovered candidate / approval required | Top safe zone only. Recovered from source visual; verify edge quality before final use. |
| 5 | Digital Menu proof placeholder | `MISSING: approved mobile Digital Menu screenshot/proof` | blocking | Use only approved screenshot/proof crop. Do not invent a Digital Menu screen. |
| 6 | QR overlay placeholder | `ASSET_REGISTRY/COLATTAO/normalized/qr_v1/colattao_qr_scan_tile_1x1.png` | scan-test required | Bottom safe zone only. Source QR is normalized, but local decode was unavailable and phone scan-test is required. |
| 7 | CTA text overlay placeholder | `Scan. Play Cafe Rush. Discover Colattao.` | candidate registered | Editable overlay candidate only. Needs Anthony/client approval before final use. |

### 4:5 Feed Layer Stack

| Order | Layer | Asset / placeholder | Status | Notes |
|---:|---|---|---|---|
| 1 | Background asset | `ASSET_REGISTRY/COLATTAO/normalized/environment_product_v1/colattao-b001-product-coffee-pastry-4x5-v001.webp` | approved | Use as full-canvas feed base. |
| 2 | Product hero asset | Same as background/base | approved | Product remains central and readable. |
| 3 | Shelf / plant detail asset | Optional carousel support: `colattao-b001-environment-shelf-decor-4x5-v001.webp` or `colattao-b001-environment-plant-detail-4x5-v001.webp` | approved | Better as separate carousel frame than cluttered overlay. |
| 4 | Logo overlay candidate | `ASSET_REGISTRY/COLATTAO/normalized/overlays_v1/colattao_logo_cream_transparent_1600px.png` or `ASSET_REGISTRY/COLATTAO/normalized/overlays_v1/colattao_logo_white_transparent_1600px.png` | recovered candidate / approval required | Top margin only. Recovered from source visual; verify edge quality before final use. |
| 5 | Digital Menu proof placeholder | `MISSING: approved Digital Menu proof crop/screenshot` | blocking | Prefer separate carousel frame if text is small. |
| 6 | QR overlay placeholder | `ASSET_REGISTRY/COLATTAO/normalized/qr_v1/colattao_qr_scan_tile_1x1.png` | scan-test required | Source QR is normalized, but local decode was unavailable and phone scan-test is required. |
| 7 | CTA text overlay placeholder | `Scan. Play Cafe Rush. Discover Colattao.` | candidate registered | Editable overlay candidate only. Needs Anthony/client approval before final use. |

### Optional 1:1 QR / Product Tile Layer Stack

| Order | Layer | Asset / placeholder | Status | Notes |
|---:|---|---|---|---|
| 1 | Background | Solid espresso, parchment, or product-safe crop from `colattao-b001-product-coffee-pastry-4x5-v001.webp` | planning only | Use clean negative space; no new image processing in this packet. |
| 2 | Product accent | Optional coffee/pastry crop | planning only | Use only if QR remains highly scannable. |
| 3 | QR overlay placeholder | `ASSET_REGISTRY/COLATTAO/normalized/qr_v1/colattao_qr_scan_tile_1x1.png` | scan-test required | Source QR is normalized, but local decode was unavailable and phone scan-test is required. |
| 4 | CTA text overlay placeholder | `Scan. Play Cafe Rush. Discover Colattao.` | candidate registered | Editable overlay candidate only. Needs Anthony/client approval before final use. |
| 5 | Logo overlay candidate | `ASSET_REGISTRY/COLATTAO/normalized/overlays_v1/colattao_logo_cream_transparent_master.png` or `ASSET_REGISTRY/COLATTAO/normalized/overlays_v1/colattao_logo_white_transparent_master.png` | recovered candidate / approval required | Optional; do not crowd QR. |

## 3. Composition

### 9:16 Safe Zones

```txt
Canvas: 1080x1920
Top safe zone: y=0 to y=230
Center hero zone: y=230 to y=1480
Bottom CTA/QR zone: y=1480 to y=1920
Left/right readability margin: 72px minimum
```

Top safe zone:

- Use only approved logo overlay or short approved campaign mark.
- Keep 72px minimum side margin.
- Do not place QR in the top zone.

Center hero zone:

- Preserve cup, pastry, ceramic, and warm table texture.
- Do not cover the hero product with CTA, QR, or Digital Menu proof.
- If a Digital Menu proof appears, use it as a separate frame or a small approved inset only after approval.

Bottom CTA/QR zone:

- Reserve for scan-tested QR and final editable CTA text.
- Use a restrained espresso or parchment panel only if needed for readability.
- QR should sit on clean high-contrast background, not directly over busy product texture.

### 4:5 Safe Zones

```txt
Canvas: 1080x1350
Top safe zone: y=0 to y=150
Center hero zone: y=150 to y=1080
Bottom CTA/QR zone: y=1080 to y=1350
Left/right readability margin: 64px minimum
```

Top safe zone:

- Optional approved logo overlay.
- Keep treatment quiet.

Center hero zone:

- Product should dominate the frame.
- Avoid placing Digital Menu proof over the product hero if it reduces readability.

Bottom CTA/QR zone:

- Short CTA only unless QR is scan-safe.
- Prefer QR tile as separate frame if bottom zone feels crowded.

### Optional 1:1 Safe Zones

```txt
Canvas: 1080x1080
QR minimum quiet zone: follow QR generator requirements
Minimum side margin: 96px
CTA/logo should not reduce QR scan area
```

Use the 1:1 tile only when QR is approved and scan-tested.

## 4. Premium Spacing Rules

- Keep one primary visual idea per frame.
- Use product hero first; use detail assets as separate support frames rather than stacking too much into one design.
- Keep overlays sparse and high-contrast.
- Preserve the warm espresso/amber mood.
- Avoid hard white boxes unless needed for QR scan reliability.
- Use quiet luxury spacing: fewer elements, wider margins, and no crowded coupon layout.
- Do not cover owner face, product center, QR quiet zone, or Digital Menu proof text.

## 5. Asset Usage

### Primary Product Assets

| Asset | Role | Use |
|---|---|---|
| `ASSET_REGISTRY/COLATTAO/normalized/environment_product_v1/colattao-b001-product-coffee-pastry-9x16-v001.webp` | Primary 9:16 base | First story/reel/poster mockup. |
| `ASSET_REGISTRY/COLATTAO/normalized/environment_product_v1/colattao-b001-product-coffee-pastry-4x5-v001.webp` | Primary 4:5 base | First feed/carousel mockup. |

### Supporting Environment Assets

| Asset | Role | Use |
|---|---|---|
| `ASSET_REGISTRY/COLATTAO/normalized/environment_product_v1/colattao-b001-environment-plant-detail-9x16-v001.webp` | 9:16 atmosphere support | Alternate first frame or transition frame. |
| `ASSET_REGISTRY/COLATTAO/normalized/environment_product_v1/colattao-b001-environment-shelf-decor-9x16-v001.webp` | 9:16 brand texture support | End-card or atmosphere support frame. |
| `ASSET_REGISTRY/COLATTAO/normalized/environment_product_v1/colattao-b001-environment-shelf-decor-4x5-v001.webp` | 4:5 support | Feed carousel support frame. |
| `ASSET_REGISTRY/COLATTAO/normalized/environment_product_v1/colattao-b001-environment-plant-detail-4x5-v001.webp` | 4:5 support | Feed carousel support frame. |

### Review-Only Asset

| Asset | Status | Rule |
|---|---|---|
| `ASSET_REGISTRY/COLATTAO/normalized/environment_product_v1/colattao-b001-atmosphere-fogata-9x16-v001.webp` | usable-review | Do not use as final hero without review because source is low resolution and baked text was cropped out. |
| `ASSET_REGISTRY/COLATTAO/normalized/environment_product_v1/colattao-b001-atmosphere-fogata-4x5-v001.webp` | usable-review | Secondary mood reference only after review. |

## 6. Blockers Preventing Final Render

| Missing asset / approval | Blocks | Required action |
|---|---|---|
| Recovered logo candidate approval | Final brand overlay | Review recovered transparent PNG candidates and approve or replace with official Colattao logo PNG/SVG. |
| Scan-tested QR PNG | QR/CTA frame | Cafe Rush destination is README-confirmed as `https://colattao-cafe-rush.vercel.app/`, but QR PNG file remains missing and must be phone scan-tested. |
| Mobile Digital Menu screenshot/proof | Digital Menu proof frame | Provide clean approved screenshot/proof crop. |
| Final CTA text approval | CTA overlay | CTA candidate registered: `Scan. Play Cafe Rush. Discover Colattao.` Approval still required. |

Additional non-primary blockers:

- Cafe Rush QR if Cafe Rush appears in this specific mockup.
- Fina Calle mark approval if included.
- True transparent owner cutout if owner appears prominently.
- Cleaner owner front and 3/4 portraits before final spokesperson generation.

## 11. Overlay Recovery Pass 001 Update

Logo overlay blocker is reduced but not closed.

Recovered logo candidates now available:

- `ASSET_REGISTRY/COLATTAO/normalized/overlays_v1/colattao_logo_cream_transparent_master.png` - 928x513 PNG RGBA.
- `ASSET_REGISTRY/COLATTAO/normalized/overlays_v1/colattao_logo_cream_transparent_1600px.png` - 1600x884 PNG RGBA.
- `ASSET_REGISTRY/COLATTAO/normalized/overlays_v1/colattao_logo_white_transparent_master.png` - 928x513 PNG RGBA.
- `ASSET_REGISTRY/COLATTAO/normalized/overlays_v1/colattao_logo_white_transparent_1600px.png` - 1600x884 PNG RGBA.

Use rules:

- Use cream logo on deep espresso backgrounds when the warmer premium look is desired.
- Use white logo when contrast is the priority.
- Treat all four logo outputs as recovered candidates until final visual approval.
- Do not use the source gray-background logo visual directly in final mockups.

QR remains blocked:

- A real attached `Full Menu` QR poster source was found and normalized in QR Processing Pass 001.
- QR output files were created by cropping/preserving the real QR source; the QR pattern was not generated or recreated.
- Local decode was unavailable because `cv2`, `pyzbar`, and `zbarimg` were not installed.
- Phone scan-test is required before final use.

## 7. Acceptance Checklist

A static mockup is acceptable only if:

- It has a premium look: warm, restrained, uncluttered, and intentional.
- It is readable on phone at 9:16 and 4:5 sizes.
- It uses Digital Menu terminology only.
- It contains no generated text.
- It contains no generated or warped logo.
- It contains no fake QR.
- It contains no generated menu copy, pricing, CTA text, or legal text.
- QR is an approved, scan-tested overlay.
- Logo is an approved overlay.
- CTA text is approved editable overlay copy.
- Product hero remains unobstructed.
- B001-A13 is not used as final hero without review.
- Owner identity is not implied as final; owner lock remains V1 partial.

## 8. Recommended First Static Mockup Composition

### 9:16 Version

```txt
Canvas:
1080x1920

Base:
ASSET_REGISTRY/COLATTAO/normalized/environment_product_v1/colattao-b001-product-coffee-pastry-9x16-v001.webp

Top overlay placeholder:
Approved Colattao logo, centered or upper-left, pending.

Center:
Leave product hero unobstructed.

Bottom overlay placeholder:
Approved Digital Menu CTA text plus phone scan-tested QR, pending.

Support frame options:
Plant detail 9:16 or shelf decor 9:16 as separate frame or carousel/story follow-up.
```

### 4:5 Version

```txt
Canvas:
1080x1350

Base:
ASSET_REGISTRY/COLATTAO/normalized/environment_product_v1/colattao-b001-product-coffee-pastry-4x5-v001.webp

Top overlay placeholder:
Approved Colattao logo, pending.

Center:
Product remains hero.

Bottom overlay placeholder:
Short approved Digital Menu CTA or QR only after phone scan-test, pending.
```

### Optional 1:1 Version

```txt
Canvas:
1080x1080

Use:
QR/product tile can use `normalized/qr_v1/colattao_qr_scan_tile_1x1.png` after phone scan-test.

Base:
Clean espresso/parchment layout or product-safe crop.

Required:
Phone scan-tested QR PNG and final CTA text.
```

## 9. Do Not Proceed Gate

```txt
DO NOT CREATE FINAL STATIC MOCKUP OUTPUTS UNTIL:
1. Approved logo overlay is available.
2. QR tile is phone scan-tested and destination is confirmed.
3. Mobile Digital Menu screenshot/proof is approved.
4. Final CTA text is approved.
```


## 10. Overlay Registration 001 Update

`ASSET_REGISTRY/COLATTAO/OVERLAY_ASSET_REGISTRATION_001.md` adds the current overlay evidence:

- `README_colattao_overlay_assets.txt` was found and lists intended transparent logo and Cafe Rush QR outputs.
- Cafe Rush QR destination is README-confirmed as `https://colattao-cafe-rush.vercel.app/`.
- Logo candidates and attached QR outputs now exist; final publishing remains blocked until visual approval, destination confirmation, and phone scan-test.
- Editable CTA candidate is registered as `Scan. Play Cafe Rush. Discover Colattao.`
- CTA remains overlay-only and needs Anthony/client approval before final use.

## 12. Static Mockup Output Pass 001 Update

Created review candidates:

- `ASSET_REGISTRY/COLATTAO/normalized/mockups_v1/colattao-encanto-static-concept-a-9x16-v001.png`
- `ASSET_REGISTRY/COLATTAO/normalized/mockups_v1/colattao-encanto-static-concept-a-4x5-v001.png`

Composition used:

- Product-first coffee and pastry base image.
- Recovered Colattao cream logo candidate in the top safe area.
- Real attached `Full Menu` QR source normalized into the bottom QR block.
- CTA: `Scan for Full Menu`.
- Supporting line: `View the menu while you wait.`
- `Digital Menu` terminology only.

Approval still required:

- Phone scan-test QR.
- Confirm decoded destination.
- Approve CTA copy.
- Approve recovered logo candidate.
