# Colattao Production Blockers And Next Uploads

## Purpose

This document lists the remaining blockers before Colattao Encanto Digital Menu Launch assets can move from mockup planning into final rendering or video generation.

## Production Blockers

### 1. Approved Logo Overlay Needed

Status: reduced to approval blocker.

Current evidence:

- `README_colattao_overlay_assets.txt` lists transparent logo output filenames.
- A separate Colattao logo visual reference was found and used to create local transparent PNG recovery candidates.
- Recovered candidates are available in `ASSET_REGISTRY/COLATTAO/normalized/overlays_v1/`.

Required:

- Visual approval of the recovered transparent candidates, or replacement with a cleaner official Colattao logo PNG/SVG.
- Confirmation that it is the official approved mark.

Rule:

- Do not use blurred or in-scene Colattao marks as final logo overlays.
- Do not generate a logo.

### 2. Scan-Tested QR PNG Needed

Status: reduced to scan-test and destination-confirmation blocker.

Current evidence:

- `README_colattao_overlay_assets.txt` confirms local decode destination for Cafe Rush: `https://colattao-cafe-rush.vercel.app/`.
- A real attached `Full Menu` QR poster was found and normalized into QR candidates in `ASSET_REGISTRY/COLATTAO/normalized/qr_v1/`.

Required:

- Confirm whether the normalized `Full Menu` QR decodes to the Digital Menu route.
- If the QR decodes to Cafe Rush/root instead, approve revised CTA/destination alignment.
- The QR pattern was not AI-generated; it was cropped from the attached source and still must be phone scan-tested.
- Destination must be written clearly in the registry.

Rule:

- AI-generated QR codes are rejected.
- QR remains overlay only.

### 3. Mobile Digital Menu Screenshot Needed

Status: blocking for live proof frame.

Required:

- Clean mobile screenshot or approved Digital Menu proof crop.
- Browser chrome removed if possible.
- Route/destination recorded in the registry.
- Menu copy and pricing must remain approved source content only.

Rule:

- Do not invent a Digital Menu screen.
- Do not generate menu copy or pricing.

### 4. Final CTA Text Needed

Status: reduced to approval blocker.

Current CTA candidate:

- `Scan. Play Cafe Rush. Discover Colattao.`

Required:

- Final approval of editable CTA copy.
- Intended placement: 9:16 bottom safe area or 4:5 bottom safe area.
- Confirmation of whether CTA points to Digital Menu, Cafe Rush, QR scan, or both.

Rule:

- CTA text remains overlay only.
- Do not generate CTA text into image or video frames.

### 5. True Transparent Owner Cutout Needed If Owner Appears Prominently

Status: blocking for owner-prominent layout.

Current state:

- `ASSET_REGISTRY/COLATTAO/normalized/owner_v1/owner_full_body_cutout_v1.png` is a non-transparent fallback.

Required:

- True transparent PNG cutout after manual/API cleanup and QA.
- Edge check around hair, face, outfit, and body silhouette.
- Review against `CHARACTER_LIBRARY/COLATTAO_OWNER_IDENTITY_LOCK_V1.md`.

Rule:

- Do not use fallback as final transparent overlay.

### 6. Cleaner Owner Front / 3/4 Portraits Needed

Status: blocking for final spokesperson generation.

Required:

- Clean front portrait.
- Clean 3/4 portrait.
- Consistent outfit if possible.
- Good lighting.
- No filters.
- Approval or documented waiver.

Current state:

- Owner identity lock remains V1 partial.
- Current references are enough for internal prompt consistency planning only.

## Review-Only Asset Warning

B001-A13 fogata remains usable-review only.

Reason:

- Original source is low resolution.
- Baked visible text was removed by cropping.
- It should not be used as a final hero without human review.

## Next Uploads Needed From Anthony

1. Approval of recovered Colattao logo candidates, or official Colattao logo source file.
2. Phone scan-test and destination confirmation for `ASSET_REGISTRY/COLATTAO/normalized/qr_v1/colattao_qr_scan_tile_1x1.png`.
3. Revised QR/CTA alignment approval if scan result is not the Digital Menu route.
4. Clean mobile Digital Menu screenshot/proof.
5. Final approval of CTA candidate: `Scan. Play Cafe Rush. Discover Colattao.`
6. Owner front portrait.
7. Owner 3/4 portrait.
8. Manual/API transparent owner cutout if owner appears prominently.

## Recommended Next Task

Review Static Mockup Outputs 001, then phone scan-test the QR and approve CTA/destination alignment before publishing.


## Overlay Registration 001 Update

Registered in `ASSET_REGISTRY/COLATTAO/OVERLAY_ASSET_REGISTRATION_001.md`:

- README metadata for intended Colattao transparent logo and Cafe Rush QR outputs.
- Cafe Rush QR destination: `https://colattao-cafe-rush.vercel.app/`.
- Editable CTA candidate: `Scan. Play Cafe Rush. Discover Colattao.`

Still required:

- Recover or re-upload the actual transparent logo PNG files.
- Review recovered transparent logo candidates in `ASSET_REGISTRY/COLATTAO/normalized/overlays_v1/`.
- Phone scan-test the normalized attached QR tile.
- Phone scan-test every QR before posting or printing.
- Approve the CTA candidate before final use.

## Overlay Recovery Pass 001 Update

Created recovered transparent logo candidates:

| Output path | Dimensions | Format | Status | Limitation |
|---|---:|---|---|---|
| `ASSET_REGISTRY/COLATTAO/normalized/overlays_v1/colattao_logo_cream_transparent_master.png` | 928x513 | PNG RGBA | recovered candidate | Edge quality inherits rough/speckled source texture; final approval required. |
| `ASSET_REGISTRY/COLATTAO/normalized/overlays_v1/colattao_logo_cream_transparent_1600px.png` | 1600x884 | PNG RGBA | recovered candidate | Upscaled from local recovery; final approval required. |
| `ASSET_REGISTRY/COLATTAO/normalized/overlays_v1/colattao_logo_white_transparent_master.png` | 928x513 | PNG RGBA | recovered candidate | Edge quality inherits rough/speckled source texture; final approval required. |
| `ASSET_REGISTRY/COLATTAO/normalized/overlays_v1/colattao_logo_white_transparent_1600px.png` | 1600x884 | PNG RGBA | recovered candidate | Upscaled from local recovery; final approval required. |

QR status remains blocking:

- A real attached `Full Menu` QR poster source was found and normalized.
- QR files were created by cropping/preserving the real source QR; the QR pattern was not generated or recreated.
- Local decode was unavailable because `cv2`, `pyzbar`, and `zbarimg` were not installed.
- Phone scan-test remains required before posting or printing.

## QR Processing Pass 001 Update

Created QR candidates from the attached `Full Menu` source image:

- `ASSET_REGISTRY/COLATTAO/normalized/qr_v1/colattao_qr_source_master.png`
- `ASSET_REGISTRY/COLATTAO/normalized/qr_v1/colattao_qr_scan_tile_1x1.png`
- `ASSET_REGISTRY/COLATTAO/normalized/qr_v1/colattao_qr_poster_4x5.png`
- `ASSET_REGISTRY/COLATTAO/normalized/qr_v1/colattao_qr_poster_9x16.png`

Created static mockup candidates:

- `ASSET_REGISTRY/COLATTAO/normalized/mockups_v1/colattao-encanto-static-concept-a-9x16-v001.png`
- `ASSET_REGISTRY/COLATTAO/normalized/mockups_v1/colattao-encanto-static-concept-a-4x5-v001.png`

Remaining blocker is not file availability; it is verification:

- Local decode was unavailable.
- Phone scan-test is required.
- Decoded destination must be recorded.
- CTA/destination alignment must be approved before publishing.
