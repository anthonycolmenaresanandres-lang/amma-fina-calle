# Colattao Production Blockers And Next Uploads

## Purpose

This document lists the remaining blockers before Colattao Encanto Digital Menu Launch assets can move from mockup planning into final rendering or video generation.

## Production Blockers

### 1. Approved Logo Overlay Needed

Status: blocking.

Required:

- Clean approved Colattao logo PNG or SVG.
- Transparent or overlay-safe export.
- Confirmation that it is the official approved mark.

Rule:

- Do not use blurred or in-scene Colattao marks as final logo overlays.
- Do not generate a logo.

### 2. Scan-Tested QR PNG Needed

Status: blocking.

Required:

- Digital Menu QR PNG.
- Cafe Rush QR PNG if campaign includes Cafe Rush.
- Each QR must be generated outside AI and scan-tested.
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

Status: blocking.

Required:

- Final editable CTA copy.
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

1. Official Colattao logo source file.
2. Approved Digital Menu QR PNG.
3. Approved Cafe Rush QR PNG if used.
4. Clean mobile Digital Menu screenshot/proof.
5. Final CTA text.
6. Owner front portrait.
7. Owner 3/4 portrait.
8. Manual/API transparent owner cutout if owner appears prominently.

## Recommended Next Task

Create a no-render static mockup assembly plan for Variant A once logo, QR, Digital Menu proof, and CTA text are approved.
