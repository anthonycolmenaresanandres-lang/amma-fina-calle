# Owner Processing Pass 001 Outputs

## Purpose

This document records Owner Cutout + Campaign Crop Pass 001 for the Colattao owner/spokesperson references.

This pass used local image processing only. No OpenAI calls, API calls, app code changes, routes, deployments, package changes, configs, secrets, or Colattao Rush code changes were used.

## Source Documents Reviewed

- `ASSET_REGISTRY/COLATTAO/OWNER_REFERENCE_PACKET_V1.md`
- `CHARACTER_LIBRARY/COLATTAO_OWNER_IDENTITY_LOCK_V1.md`
- `ASSET_REGISTRY/COLATTAO/ASSET_PROCESSING_QUEUE_001.md`

## Output Folder

```txt
ASSET_REGISTRY/COLATTAO/normalized/owner_v1/
```

## Processing Method

- Crops were created locally with Pillow.
- Subject appearance was preserved; no stylization, face alteration, body alteration, text, logos, QR codes, or menu copy were added.
- Ratio crops use source-derived matte padding where needed so missing body/face details are not invented.
- Transparent cutout was not considered reliable with the available local tooling because `rembg` and OpenCV were unavailable.
- `owner_full_body_cutout_v1.png` is therefore a non-transparent fallback clean source crop, not a finished transparent cutout.

## Output Inventory

| Source filename/path | Output filename/path | Dimensions | Format | Intended use | Quality status | Limitations |
|---|---|---:|---|---|---|---|
| `colattao owner.PNG` / `C:/Users/antho/OneDrive/Desktop/colattao owner.PNG` | `owner_full_body_cutout_v1.png` / `C:/Users/antho/OneDrive/Desktop/AMMA Ventures LLC DBA Fina Calle/ASSET_REGISTRY/COLATTAO/normalized/owner_v1/owner_full_body_cutout_v1.png` | 248x588 | PNG | Fallback full-body owner reference for manual/API cutout cleanup planning. | fallback non-transparent clean crop; transparent cutout not reliable locally | No alpha channel. Use as source-safe fallback only; requires manual/API background removal for true transparent cutout. |
| `colattao owner.PNG` / `C:/Users/antho/OneDrive/Desktop/colattao owner.PNG` | `owner_full_body_9x16_v1.png` / `C:/Users/antho/OneDrive/Desktop/AMMA Ventures LLC DBA Fina Calle/ASSET_REGISTRY/COLATTAO/normalized/owner_v1/owner_full_body_9x16_v1.png` | 331x588 | PNG | 9:16 full-body spokesperson campaign reference crop. | usable reference crop; subject preserved with source-derived matte padding | Low source resolution and narrow crop; face remains small; identity lock remains V1 partial. |
| `colattao owner.PNG` / `C:/Users/antho/OneDrive/Desktop/colattao owner.PNG` | `owner_full_body_4x5_v1.png` / `C:/Users/antho/OneDrive/Desktop/AMMA Ventures LLC DBA Fina Calle/ASSET_REGISTRY/COLATTAO/normalized/owner_v1/owner_full_body_4x5_v1.png` | 471x588 | PNG | 4:5 premium owner/spokesperson portrait crop. | usable reference crop; subject preserved with source-derived matte padding | Low source resolution and narrow crop; not a controlled front portrait. |
| `i think profile owner.PNG` / `C:/Users/antho/OneDrive/Desktop/i think profile owner.PNG` | `owner_three_quarter_reference_4x5_v1.png` / `C:/Users/antho/OneDrive/Desktop/AMMA Ventures LLC DBA Fina Calle/ASSET_REGISTRY/COLATTAO/normalized/owner_v1/owner_three_quarter_reference_4x5_v1.png` | 249x311 | PNG | 4:5 supplemental 3/4-to-side owner lifestyle reference. | usable reference crop; subject preserved | Outdoor lifestyle shot, not a controlled 3/4 portrait; face is small. |
| `i think profile owner.PNG` / `C:/Users/antho/OneDrive/Desktop/i think profile owner.PNG` | `owner_three_quarter_reference_square_v1.png` / `C:/Users/antho/OneDrive/Desktop/AMMA Ventures LLC DBA Fina Calle/ASSET_REGISTRY/COLATTAO/normalized/owner_v1/owner_three_quarter_reference_square_v1.png` | 311x311 | PNG | Square supplemental owner lifestyle reference. | usable reference crop; subject preserved with source-derived matte padding | Face remains partial/small; use only as supplemental reference. |
| `side profile of the owner.PNG` / `C:/Users/antho/OneDrive/Desktop/side profile of the owner.PNG` | `owner_side_profile_reference_4x5_v1.png` / `C:/Users/antho/OneDrive/Desktop/AMMA Ventures LLC DBA Fina Calle/ASSET_REGISTRY/COLATTAO/normalized/owner_v1/owner_side_profile_reference_4x5_v1.png` | 300x374 | PNG | 4:5 side-profile facial reference crop. | usable side-profile reference crop | Screenshot edges/adjacent partial figures may remain; side profile only, not front view. |
| `side profile of the owner.PNG` / `C:/Users/antho/OneDrive/Desktop/side profile of the owner.PNG` | `owner_side_profile_reference_square_v1.png` / `C:/Users/antho/OneDrive/Desktop/AMMA Ventures LLC DBA Fina Calle/ASSET_REGISTRY/COLATTAO/normalized/owner_v1/owner_side_profile_reference_square_v1.png` | 374x374 | PNG | Square side-profile facial reference crop. | usable side-profile reference crop with source-derived matte padding | Side profile only; identity lock remains partial. |
| `another of owner.PNG` / `C:/Users/antho/OneDrive/Desktop/another of owner.PNG` | `owner_frontish_reference_4x5_v1.png` / `C:/Users/antho/OneDrive/Desktop/AMMA Ventures LLC DBA Fina Calle/ASSET_REGISTRY/COLATTAO/normalized/owner_v1/owner_frontish_reference_4x5_v1.png` | 194x243 | PNG | 4:5 supplemental front-ish seated owner reference. | usable supplemental reference crop | Very small source; front-ish but not a clean controlled front portrait. |
| `another of owner.PNG` / `C:/Users/antho/OneDrive/Desktop/another of owner.PNG` | `owner_frontish_reference_square_v1.png` / `C:/Users/antho/OneDrive/Desktop/AMMA Ventures LLC DBA Fina Calle/ASSET_REGISTRY/COLATTAO/normalized/owner_v1/owner_frontish_reference_square_v1.png` | 207x207 | PNG | Square supplemental front-ish owner reference. | usable supplemental reference crop with source-derived matte padding | Very small source; use as supplementary expression/posture reference only. |

## Transparent Cutout Result

```txt
TRANSPARENT CUTOUT SUCCEEDED:
No.

REASON:
Reliable local background removal was not available in this pass. Pillow/NumPy alone would risk damaging hair, face, outfit edges, or body silhouette.

FALLBACK CREATED:
owner_full_body_cutout_v1.png

FALLBACK STATUS:
Non-transparent clean crop. Use as a manual/API cutout source, not as final transparent overlay.
```

## Owner Identity Lock Status

The owner identity lock remains `V1 partial`.

Reasons:

- A clean controlled front portrait is still missing.
- A clean controlled 3/4 portrait is still missing.
- The side-profile reference is useful but cannot lock a full front-facing identity by itself.
- Several sources are low resolution or screenshot-like.

## Files Created

- `ASSET_REGISTRY/COLATTAO/normalized/owner_v1/owner_full_body_cutout_v1.png`
- `ASSET_REGISTRY/COLATTAO/normalized/owner_v1/owner_full_body_9x16_v1.png`
- `ASSET_REGISTRY/COLATTAO/normalized/owner_v1/owner_full_body_4x5_v1.png`
- `ASSET_REGISTRY/COLATTAO/normalized/owner_v1/owner_three_quarter_reference_4x5_v1.png`
- `ASSET_REGISTRY/COLATTAO/normalized/owner_v1/owner_three_quarter_reference_square_v1.png`
- `ASSET_REGISTRY/COLATTAO/normalized/owner_v1/owner_side_profile_reference_4x5_v1.png`
- `ASSET_REGISTRY/COLATTAO/normalized/owner_v1/owner_side_profile_reference_square_v1.png`
- `ASSET_REGISTRY/COLATTAO/normalized/owner_v1/owner_frontish_reference_4x5_v1.png`
- `ASSET_REGISTRY/COLATTAO/normalized/owner_v1/owner_frontish_reference_square_v1.png`

## Next Recommended Step

If a true transparent owner cutout is needed, run a dedicated manual cutout or approved API/manual background-removal pass, then review the result against `CHARACTER_LIBRARY/COLATTAO_OWNER_IDENTITY_LOCK_V1.md` before campaign use.
