# Uploaded Asset Batch 001 Correction

## Purpose

This correction records the targeted search and registry update for Asset Intake Batch 001 after two newly downloaded Colattao files were identified on the Desktop.

This is documentation only. No image processing, file copying, app code, routes, deployments, configs, package files, secrets, or Colattao Rush code were modified by this correction.

## Existing Registry Documents Reviewed

- `ASSET_REGISTRY/COLATTAO/ASSET_INTAKE_BATCH_001.md`
- `ASSET_REGISTRY/COLATTAO/ASSET_PROCESSING_QUEUE_001.md`
- `ASSET_REGISTRY/COLATTAO/EXISTING_ASSET_INVENTORY.md`
- `ASSET_REGISTRY/COLATTAO/ENCANTO_ASSET_CLASSIFICATION.md`
- `ASSET_REGISTRY/COLATTAO/ENCANTO_NORMALIZATION_PACKET.md`

## Targeted Filename Search

Search roots used:

- `C:/Users/antho/OneDrive/Desktop/AMMA Ventures LLC DBA Fina Calle`
- `C:/Users/antho/OneDrive/Desktop/Fina Calle Brand images CODEX`
- `C:/Users/antho/Downloads`
- `C:/Users/antho/Documents/Codex`
- `C:/Users/antho/OneDrive/Desktop`

Search terms and results:

| Searched filename / pattern | Result | Action |
|---|---|---|
| `colattaao owner.PNG` | Not found | Treat as typo/alternate spelling; no registry path invented. |
| `colattao owner.PNG` | Found | Registered as `B001-A12`. |
| `Atmosphere fogata colattao` | Found through extension match | Registered exact file as `B001-A13`. |
| `Atmosphere fogata colattao.png` | Found as uppercase `.PNG` | Registered exact file as `Atmosphere fogata colattao.PNG`. |
| `Atmosphere fogata colattao.jpg` | Not found | No JPG path invented. |

## Found Files

| Asset ID | Exact filename | Relative path | Dimensions | Size | Asset class | Status | Intended use | Target formats | Cleanup required | Risk notes |
|---|---|---|---:|---:|---|---|---|---|---|---|
| B001-A12 | `colattao owner.PNG` | `../colattao owner.PNG` relative to the AMMA workspace folder; full source path `C:/Users/antho/OneDrive/Desktop/colattao owner.PNG` | 248x588 | 339.5 KB | Owner / spokesperson reference | usable with cleanup | 9:16 spokesperson cutout, 4:5 premium portrait, optional 1:1 crop | Transparent PNG, 9:16 WebP, 4:5 WebP, optional 1:1 WebP | Background removal, edge cleanup, quality/upscale review, safe crop review | Not enough for full identity lock without front and 3/4 portraits or an explicit waiver. |
| B001-A13 | `Atmosphere fogata colattao.PNG` | `../Atmosphere fogata colattao.PNG` relative to the AMMA workspace folder; full source path `C:/Users/antho/OneDrive/Desktop/Atmosphere fogata colattao.PNG` | 369x647 | 584.1 KB | Cafe environment atmosphere / fireplace shot | usable with cleanup | 9:16 environment insert, 4:5 premium still, atmosphere establishing visual | 9:16 WebP, 4:5 WebP | Remove or crop baked visible text, mobile readability QA, preserve fireplace/chandelier atmosphere | Current file contains visible baked text, so it is not a clean final environment insert until cleanup. |

## Already Listed Batch Assets Reconfirmed

These assets were already registered in `ASSET_INTAKE_BATCH_001.md` and remain correctly classified:

| Existing asset ID | Asset | Exact filename | Status | Intended use |
|---|---|---|---|---|
| B001-A01 | Coffee + pastry product still | `ChatGPT Image 28 may 2026, 07_15_17 a.m. (1).png` | approved / strong | 4:5 product hero, optional 9:16 teaser, 1:1 product card. |
| B001-A04 | Hanging plant detail | `ChatGPT Image 28 may 2026, 07_15_19 a.m. (5).png` | approved / strong | 9:16 insert, premium texture/detail shot. |
| B001-A05 | Shelf decor / in-store branding detail | `ChatGPT Image 28 may 2026, 07_15_19 a.m. (6).png` | approved / strong | 9:16 insert, 4:5 detail crop, brand texture reference. |

## Registry Updates Made

Updated `ASSET_INTAKE_BATCH_001.md`:

- Added Desktop as a batch source folder.
- Added `Batch Correction 001` search notes.
- Added `B001-A12` for `colattao owner.PNG`.
- Added `B001-A13` for `Atmosphere fogata colattao.PNG`.
- Updated the expected asset crosswalk so owner and fogata/family fireplace are no longer treated as fully missing.
- Updated missing/blocker language to keep owner identity lock blocked until front and 3/4 portraits are supplied or waived.

Updated `ASSET_PROCESSING_QUEUE_001.md`:

- Added Desktop as a source folder.
- Updated Priority 1 to process:
  - `B001-A12` owner cutout / 9:16 / 4:5.
  - `B001-A13` fogata atmosphere 9:16 / 4:5.
- Kept logo, QR, and Digital Menu proof as missing blockers.
- Reordered product/detail assets under Priority 2.

## Remaining Missing Files

Still missing or not found in the targeted search:

- `colattaao owner.PNG` exact typo variant.
- `Atmosphere fogata colattao.jpg`.
- Owner front portrait.
- Owner 3/4 portrait.
- Owner left/right profile if possible.
- Cleaner official Colattao logo source if available.
- Fina Calle QR / branded QR image.
- Standalone approved Colattao QR if needed.
- Mobile Digital Menu screenshot.
- Final editable CTA text.

## Recommended Next Step

If Anthony approves image processing, start with:

1. `B001-A12` owner cutout, 9:16, and 4:5 exports.
2. `B001-A13` fogata atmosphere cleanup, with baked text removed or cropped away.
3. `B001-A01`, `B001-A04`, and `B001-A05` product/detail exports.

Do not begin owner identity lock, QR production, Digital Menu proof production, or final campaign assembly until missing owner/QR/Digital Menu/logo inputs are provided or intentionally waived.

## Owner Reference Discovery Addendum

Additional targeted owner-reference discovery was completed after this correction. It searched exact names first, then close filename variants with spaces, underscores, and hyphens.

Search roots used:

- `C:/Users/antho/OneDrive/Desktop`
- `C:/Users/antho/Documents/Codex`

Found owner-reference files:

| Asset ID | Search target | Exact filename | Result | Dimensions | Size | Likely view type | Registry action |
|---|---|---|---|---:|---:|---|---|
| B001-A12 | `colattao owner` | `colattao owner.PNG` | Found | 248x588 | 339.5 KB | Full-body / lifestyle | Existing registration refined. |
| B001-A14 | `i think profile owner` | `i think profile owner.PNG` | Found | 243x311 | 211.6 KB | 3/4-to-side full-body lifestyle | Added to `ASSET_INTAKE_BATCH_001.md`. |
| B001-A15 | `side profile of the owner` | `side profile of the owner.PNG` | Found | 286x374 | 318.7 KB | Side-profile portrait | Added to `ASSET_INTAKE_BATCH_001.md`. |
| B001-A16 | `another of owner` | `another of owner.PNG` | Found | 194x207 | 116.6 KB | Seated front-ish supplemental reference | Added to `ASSET_INTAKE_BATCH_001.md`. |

Not found:

- `profile owner.png`
- `profile owner.jpg`
- `profile owner.jpeg`
- `profile owner.webp`
- close normalized `profile owner` variants using spaces, underscores, or hyphens

Owner identity note:

- The found owner references are enough to create `CHARACTER_LIBRARY/COLATTAO_OWNER_IDENTITY_LOCK_V1.md` as a V1 draft.
- The owner identity lock remains partial, not final-approved.
- The main gap is a cleaner controlled front portrait and cleaner controlled 3/4 portrait.
