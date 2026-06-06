# Colattao Overlay Asset Registration 001

## Purpose

Register the newly located Colattao overlay-related assets and metadata for the Encanto Digital Menu Launch static mockup workflow.

This registration includes local-only logo cleanup outputs plus documentation. No API calls, app code changes, routes, deployments, configs, package files, secrets, or Colattao Rush code changes were made.

## Targeted Search Scope

Searched locations:

- `C:/Users/antho/Downloads`
- `C:/Users/antho/OneDrive/Desktop`
- `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX`
- `ASSET_REGISTRY/COLATTAO/`
- `ASSET_REGISTRY/COLATTAO/normalized/`

Search notes:

- `README_colattao_overlay_assets.txt` was found.
- The original README-listed transparent logo and Cafe Rush QR filenames were not found in targeted checks; a new attached `Full Menu` QR poster was later found and normalized in QR Processing Pass 001.
- The transparent logo files were locally recovered from the found logo visual reference and saved as recovered transparent candidates in `ASSET_REGISTRY/COLATTAO/normalized/overlays_v1/`.
- A recent Colattao logo visual file was found, but it is not a confirmed transparent overlay export.
- A recent citrus/coffee vertical visual was found, but it is not an overlay asset for this registration pass.
- One broad Desktop exact-name search timed out; no matching overlay image files were found before the timeout. To avoid endless retries, missing image files are marked as missing pending user confirmation or re-upload.

## Files Found

| Asset ID | Found file | Path | Dimensions | Size | Registration class | Status | Notes |
|---|---|---|---:|---:|---|---|---|
| OVR-001-README | `README_colattao_overlay_assets.txt` | `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/README_colattao_overlay_assets.txt` | n/a | 739 bytes | Overlay asset README / metadata | found | Lists intended logo and QR outputs and confirms local QR decode destination. |
| OVR-001-LOGO-REF | `ChatGPT Image 5 jun 2026, 11_17_44 p.m..png` | `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/ChatGPT Image 5 jun 2026, 11_17_44 p.m..png` | 1536x1024 | 2213486 bytes | Colattao logo visual reference | reference only | Cream/white Colattao logo on gray background. Not a confirmed transparent PNG overlay file. Verify visually before any cleanup/export. |
| OVR-001-NONOVERLAY-REF | `ChatGPT Image 5 jun 2026, 07_23_25 a.m..png` | `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/ChatGPT Image 5 jun 2026, 07_23_25 a.m..png` | 941x1672 | 2556818 bytes | Visual background reference | not overlay | Citrus/coffee vertical visual. Not registered as a logo, QR, or CTA overlay. |

## README-Listed Outputs Not Found As Files

The README lists these outputs, but the corresponding files were not found in the targeted checks:

- `colattao_logo_cream_transparent_master.png`
- `colattao_logo_cream_transparent_1600px.png`
- `colattao_logo_cream_transparent_1200px.png`
- `colattao_logo_cream_transparent_800px.png`
- `colattao_logo_white_transparent_master.png`
- `colattao_logo_white_transparent_1600px.png`
- `colattao_logo_white_transparent_1200px.png`
- `colattao_logo_white_transparent_800px.png`
- `colattao_cafe_rush_qr_poster_master.png`
- `colattao_cafe_rush_qr_scan_tile_1x1.png`
- `colattao_cafe_rush_qr_poster_4x5.png`
- `colattao_cafe_rush_qr_poster_9x16.png`

## Registered Overlay Items

### 1. Colattao Logo Overlay

```txt
REGISTRY ID:
OVR-001-LOGO

INTENDED USE:
Top/corner Colattao logo overlay for 9:16 and 4:5 static mockups.

EXPECTED FORMATS:
Transparent PNG.

STATUS:
Recovered transparent candidate available. Final visual approval required.

CURRENT EVIDENCE:
README lists cream and white transparent logo exports, but the original README-listed files were not found. A separate logo visual reference was found and used for local transparent PNG recovery.

NOTES:
Recovered candidates preserve the original source mark and proportions, but edge quality inherits roughness from the source image. Verify visually before final export. Do not treat recovered candidates as final official logos until approved.
```

### 2. Cafe Rush QR Scan Tile

```txt
REGISTRY ID:
OVR-001-QR-TILE

EXPECTED FILENAME:
colattao_cafe_rush_qr_scan_tile_1x1.png

DESTINATION:
https://colattao-cafe-rush.vercel.app/

INTENDED USE:
QR overlay or square QR tile for Cafe Rush interaction.

STATUS:
New attached `Full Menu` QR source normalized; local decode unavailable; phone scan-test required.

NOTES:
A new attached `Full Menu` QR poster was used as the authoritative QR source for QR Processing Pass 001. Local decode tools were unavailable; phone scan-test is required before printing or posting.
```

### 3. QR Poster 4x5 And 9x16

```txt
REGISTRY ID:
OVR-001-QR-POSTERS

EXPECTED FILENAMES:
colattao_cafe_rush_qr_poster_4x5.png
colattao_cafe_rush_qr_poster_9x16.png
colattao_cafe_rush_qr_poster_master.png

INTENDED USE:
Supporting Cafe Rush promo/poster formats.

STATUS:
New QR poster variants created from the attached `Full Menu` QR source. Local decode unavailable; phone scan-test required.

NOTES:
Do not use until files are recovered and phone scan-tested.
```

### 4. Editable CTA Candidate

```txt
REGISTRY ID:
OVR-001-CTA

CTA TEXT:
Scan. Play Cafe Rush. Discover Colattao.

INTENDED USE:
Editable CTA overlay candidate for Cafe Rush / Colattao campaign frames.

STATUS:
Editable CTA candidate registered. Needs Anthony/client approval before final use.

RULES:
CTA text stays editable overlay, never AI-generated inside image. No discounts, rewards, coupons, percentages, pricing, or legal language are included.
```

## Blocker Impact

Reduced:

- Cafe Rush QR destination is now README-confirmed as `https://colattao-cafe-rush.vercel.app/`.
- First editable CTA candidate is now registered.

Still blocking:

- Original downloaded transparent logo PNG files were not found; recovered transparent candidates now exist but need visual approval.
- QR scan tile candidate now exists at `ASSET_REGISTRY/COLATTAO/normalized/qr_v1/colattao_qr_scan_tile_1x1.png`; phone scan-test still required.
- QR poster candidates now exist in `ASSET_REGISTRY/COLATTAO/normalized/qr_v1/`; final destination must be verified.
- Phone scan-test remains required before print or posting.
- Mobile Digital Menu screenshot/proof remains required for Digital Menu proof frame.

## Recommended Next Step

Review recovered logo candidates, then phone scan-test the normalized QR tile and confirm destination before final static mockup publishing.

## Overlay Recovery Pass 001 Outputs

Output folder:

`ASSET_REGISTRY/COLATTAO/normalized/overlays_v1/`

| Registry ID | Source file | Output path | Dimensions | Format | Status | Intended use | Limitations | Approval required |
|---|---|---|---:|---|---|---|---|---|
| OVR-001-LOGO-CREAM-MASTER | `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/ChatGPT Image 5 jun 2026, 11_17_44 p.m..png` | `ASSET_REGISTRY/COLATTAO/normalized/overlays_v1/colattao_logo_cream_transparent_master.png` | 928x513 | PNG RGBA | recovered-transparent-candidate | Cream Colattao logo overlay master for premium dark backgrounds. | Source has rough/speckled edge texture; not a verified official source file. | yes |
| OVR-001-LOGO-CREAM-1600 | `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/ChatGPT Image 5 jun 2026, 11_17_44 p.m..png` | `ASSET_REGISTRY/COLATTAO/normalized/overlays_v1/colattao_logo_cream_transparent_1600px.png` | 1600x884 | PNG RGBA | recovered-transparent-candidate | Large cream Colattao logo overlay for 9:16 and 4:5 compositions. | Upscaled from local recovery; edge quality needs review. | yes |
| OVR-001-LOGO-WHITE-MASTER | `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/ChatGPT Image 5 jun 2026, 11_17_44 p.m..png` | `ASSET_REGISTRY/COLATTAO/normalized/overlays_v1/colattao_logo_white_transparent_master.png` | 928x513 | PNG RGBA | recovered-transparent-candidate | White Colattao logo overlay master for dark or image backgrounds. | Source has rough/speckled edge texture; not a verified official source file. | yes |
| OVR-001-LOGO-WHITE-1600 | `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/ChatGPT Image 5 jun 2026, 11_17_44 p.m..png` | `ASSET_REGISTRY/COLATTAO/normalized/overlays_v1/colattao_logo_white_transparent_1600px.png` | 1600x884 | PNG RGBA | recovered-transparent-candidate | Large white Colattao logo overlay for high-contrast placements. | Upscaled from local recovery; edge quality needs review. | yes |

QR Processing Pass 001 created normalized QR candidates from the attached `Full Menu` QR poster. Local decode was unavailable because `cv2`, `pyzbar`, and `zbarimg` were not installed; phone scan-test remains mandatory.

## QR Processing Pass 001 Update

Authoritative QR source:

`C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX/ChatGPT Image 6 jun 2026, 05_00_25 a.m..png`

Source type: designed QR poster with a `Full Menu` label.

Decode result: Local decode not completed: `cv2`, `pyzbar`, and `zbarimg` were not available in the local environment. Source label reads `Full Menu`; final destination must be phone scan-tested before publishing.

Created QR outputs:

| Output path | Dimensions | Format | Status | Approval required |
|---|---:|---|---|---|
| `ASSET_REGISTRY/COLATTAO/normalized/qr_v1/colattao_qr_source_master.png` | 1254x1254 | PNG RGB | source-master | yes |
| `ASSET_REGISTRY/COLATTAO/normalized/qr_v1/colattao_qr_scan_tile_1x1.png` | 1080x1080 | PNG RGB | scan-tile-candidate | yes, phone scan-test required |
| `ASSET_REGISTRY/COLATTAO/normalized/qr_v1/colattao_qr_poster_4x5.png` | 1080x1350 | PNG RGB | concept-poster-candidate | yes |
| `ASSET_REGISTRY/COLATTAO/normalized/qr_v1/colattao_qr_poster_9x16.png` | 1080x1920 | PNG RGB | concept-poster-candidate | yes |

CTA candidate for this pass:

```txt
Scan for Full Menu
View the menu while you wait.
```

The QR pattern was not generated, redrawn, or AI-recreated.
