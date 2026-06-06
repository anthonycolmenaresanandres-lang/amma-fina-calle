# Colattao QR Processing Pass 001 Outputs

## Purpose

Normalize the attached Colattao `Full Menu` QR image as the authoritative QR source for the first Product-first Digital Menu Encanto Launch concept.

No app code, routes, deployments, configs, package files, secrets, API calls, or Colattao Rush code were touched.

## Source

| Field | Value |
|---|---|
| Source type | Designed QR poster with QR plus `Full Menu` label |
| Source file | `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/ChatGPT Image 6 jun 2026, 05_00_25 a.m..png` |
| Source dimensions | 1254x1254 |
| Source format | PNG RGB |
| Source status | Authoritative source for this pass |
| QR classification | Probable Digital Menu / Full Menu QR, pending scan verification |
| Decode result | Phone scan-test passed. Destination confirmed by Anthony: Colattao Digital Menu. |

## Extraction Method

- Preserved the real QR image from the source poster.
- Did not generate, redraw, or AI-recreate any QR module pattern.
- Detected the dark QR region locally and cropped only the QR area above the `Full Menu` label.
- Added a white 1:1 scan-safe quiet-zone tile around the extracted QR crop.
- Built poster variants from the real QR tile plus editable text overlays.

Detected QR bounds in source pixels:

```txt
QR dark bbox: x=252, y=208, x2=1003, y2=969
Extraction crop: x=174, y=136, x2=1080, y2=1042
```

## Outputs

| Output path | Dimensions | Format | Size | Purpose | Status | Limitations |
|---|---:|---|---:|---|---|---|
| `ASSET_REGISTRY/COLATTAO/normalized/qr_v1/colattao_qr_source_master.png` | 1254x1254 | PNG `RGB` | 722612 bytes | Registry copy of the full attached QR poster source. | source-master | Includes original `Full Menu` label; not a cropped scan tile. |
| `ASSET_REGISTRY/COLATTAO/normalized/qr_v1/colattao_qr_scan_tile_1x1.png` | 1080x1080 | PNG `RGB` | 410753 bytes | 1:1 QR scan tile with added white quiet zone. | scan-tile-candidate | Phone scan-test passed; destination confirmed by Anthony as Colattao Digital Menu. |
| `ASSET_REGISTRY/COLATTAO/normalized/qr_v1/colattao_qr_poster_4x5.png` | 1080x1350 | PNG `RGB` | 217600 bytes | 4:5 QR poster for feed or carousel support. | concept-poster-candidate | Uses editable text rendered into this local concept output; approve final copy before publishing. |
| `ASSET_REGISTRY/COLATTAO/normalized/qr_v1/colattao_qr_poster_9x16.png` | 1080x1920 | PNG `RGB` | 252191 bytes | 9:16 QR poster for story/reel support. | concept-poster-candidate | Uses editable text rendered into this local concept output; approve final copy before publishing. |

## CTA Copy Used

Primary CTA:

```txt
Scan for Full Menu
```

Secondary supporting line:

```txt
View the menu while you wait.
```

Rules:

- CTA remains editable overlay copy for production.
- No discounts, rewards, percentages, coupons, pricing, or legal text were added.
- Use `Digital Menu` terminology in campaign context.

## Approval Requirements

- Phone scan-test passed for `colattao_qr_scan_tile_1x1.png`.
- Destination confirmed by Anthony: Colattao Digital Menu.
- Approve CTA copy and placement.
- Confirm whether the QR should be labeled as Digital Menu QR after scan verification.

## Scan-Test Status Update

- QR phone scan-test: passed.
- Destination confirmed by Anthony: Colattao Digital Menu.
- QR status: approved-candidate, pending final visual/client approval.
- Active blocker removed: QR not scan-tested.
