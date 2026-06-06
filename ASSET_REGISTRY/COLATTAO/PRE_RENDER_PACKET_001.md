# Colattao Pre-Render Packet 001

## Purpose

This packet defines the pre-render requirements for the first Colattao Encanto Digital Menu Launch static mockup. It is a gate document, not a rendering instruction.

No final render should proceed until required overlays and proof assets are approved.

## Selected Variant Recommendation

Recommended variant: Variant A, Product-First.

Reason:

- Uses the strongest current approved product asset.
- Avoids final owner identity risk.
- Supports a clean Digital Menu CTA path.
- Keeps overlays separate and controlled.

## Exact Approved Assets To Use

| Role | Asset path | Status | Notes |
|---|---|---|---|
| Primary 9:16 base | `ASSET_REGISTRY/COLATTAO/normalized/environment_product_v1/colattao-b001-product-coffee-pastry-9x16-v001.webp` | approved | Recommended first vertical base. |
| Primary 4:5 base | `ASSET_REGISTRY/COLATTAO/normalized/environment_product_v1/colattao-b001-product-coffee-pastry-4x5-v001.webp` | approved | Recommended feed base. |
| Support 9:16 detail | `ASSET_REGISTRY/COLATTAO/normalized/environment_product_v1/colattao-b001-environment-plant-detail-9x16-v001.webp` | approved | Environment transition or alternate opening frame. |
| Support 9:16 brand detail | `ASSET_REGISTRY/COLATTAO/normalized/environment_product_v1/colattao-b001-environment-shelf-decor-9x16-v001.webp` | approved | Brand texture/support frame. |
| Support 4:5 detail | `ASSET_REGISTRY/COLATTAO/normalized/environment_product_v1/colattao-b001-environment-shelf-decor-4x5-v001.webp` | approved | Feed support frame. |

## Review-Only Assets

| Asset path | Status | Rule |
|---|---|---|
| `ASSET_REGISTRY/COLATTAO/normalized/environment_product_v1/colattao-b001-atmosphere-fogata-9x16-v001.webp` | usable-review | Do not use as final hero without human review. Low source resolution and cropped baked text. |
| `ASSET_REGISTRY/COLATTAO/normalized/environment_product_v1/colattao-b001-atmosphere-fogata-4x5-v001.webp` | usable-review | Use as mood reference or secondary insert only after review. |
| `ASSET_REGISTRY/COLATTAO/normalized/owner_v1/owner_full_body_9x16_v1.png` | V1 partial | Planning support only. Not final spokesperson approval. |
| `ASSET_REGISTRY/COLATTAO/normalized/owner_v1/owner_full_body_cutout_v1.png` | fallback only | Non-transparent fallback, not final owner overlay. |

## Missing Overlays

These must be approved before final render assembly:

- Colattao logo overlay source.
- Fina Calle mark overlay if used.
- Digital Menu QR PNG, scan-tested.
- Cafe Rush QR PNG, scan-tested, if used.
- Final Digital Menu CTA text.
- Footer/signature overlay if used.
- Any legal/safety copy if required.

## Blocked Items

| Blocker | Blocks | Status |
|---|---|---|
| Approved logo overlay missing | Final brand overlay | blocking |
| Scan-tested QR PNG missing | QR frame and CTA frame | blocking |
| Mobile Digital Menu screenshot/proof missing | Digital Menu proof frame | blocking |
| Final CTA text missing | Final overlay assembly | blocking |
| Owner identity V1 partial | Owner-led final generation | blocking for owner-led final work |
| True transparent owner cutout missing | Owner foreground overlay | blocking for prominent owner use |

## Proposed Static Mockup Dimensions

Primary:

```txt
1080x1920
9:16
WebP or PNG for review export
```

Secondary:

```txt
1080x1350
4:5
WebP or PNG for review export
```

## Proposed Layer Stack

### 9:16 Product-First Mockup

1. Base visual: coffee + pastry 9:16 product hero.
2. Optional soft overlay panel at top: approved logo only.
3. Main subject: product area untouched.
4. Bottom overlay panel: approved Digital Menu CTA and scan-tested QR.
5. Optional footer/signature overlay if approved.

### 4:5 Feed Mockup

1. Base visual: coffee + pastry 4:5 product hero.
2. Top logo overlay if approved.
3. Bottom CTA/QR overlay only if scan-tested.
4. No additional readable copy baked into image.

## Output Naming Convention

Use deterministic names when final static mockup generation is approved:

```txt
colattao-encanto-static-product-first-9x16-v001.png
colattao-encanto-static-product-first-4x5-v001.png
colattao-encanto-static-atmosphere-first-9x16-v001.png
colattao-encanto-static-owner-soft-launch-9x16-v001.png
```

Do not create those outputs until overlays are approved.

## QA Acceptance Checklist

- Product remains readable on mobile.
- No readable generated text appears inside visual base.
- Logo is approved and used as overlay only.
- QR is generated outside AI and scan-tested.
- CTA is editable overlay text only.
- Digital Menu proof uses approved screenshot or approved proof crop only.
- Owner identity remains V1 partial unless separately approved.
- B001-A13 is not used as final hero without review.
- Composition feels premium, quiet, and uncluttered.
- No app code, routing, deployment, config, package, or secret changes are required.

## Final Render Gate

```txt
DO NOT PROCEED TO FINAL RENDER UNTIL OVERLAYS ARE APPROVED.
```
