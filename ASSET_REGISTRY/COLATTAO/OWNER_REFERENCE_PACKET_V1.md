# Colattao Owner Reference Packet V1

## Purpose

This packet registers the available Colattao owner/spokesperson image references found during targeted owner-reference discovery. It is an intake and profiling document only.

No image processing, exporting, AI generation, app code changes, routes, deployments, package changes, configs, secrets, or Colattao Rush code changes are performed by this file.

## Search Scope

Targeted search only.

Inspected areas:

- `ASSET_REGISTRY/COLATTAO/`
- `CHARACTER_LIBRARY/`
- `C:/Users/antho/OneDrive/Desktop`
- `C:/Users/antho/Documents/Codex`

Expected owner-reference filename bases searched case-insensitively with `.png`, `.jpg`, `.jpeg`, and `.webp` variants:

- `colattao owner`
- `i think profile owner`
- `profile owner`
- `side profile of the owner`
- `another of owner`

Close filename variants with spaces, underscores, and hyphens were also checked by normalized filename comparison.

## Found Owner Reference Files

| Asset ID | Exact filename | Absolute path | Dimensions | File size | Likely view type | Quality notes | Face sufficiently visible for identity profiling? |
|---|---|---|---:|---:|---|---|---|
| B001-A12 | `colattao owner.PNG` | `C:/Users/antho/OneDrive/Desktop/colattao owner.PNG` | 248x588 | 339.5 KB | Full-body / lifestyle | Clear full-body outfit and posture reference; narrow crop; face is small and slightly soft. | Partial yes. Useful for body, posture, styling, and general facial continuity, not enough alone for face lock. |
| B001-A14 | `i think profile owner.PNG` | `C:/Users/antho/OneDrive/Desktop/i think profile owner.PNG` | 243x311 | 211.6 KB | 3/4-to-side full-body lifestyle | Outdoor full-body image with side-facing pose; face is small but visible; lighting is strong and background is busy. | Partial yes. Useful for side angle, posture, and body silhouette; not a clean front/3/4 portrait. |
| B001-A15 | `side profile of the owner.PNG` | `C:/Users/antho/OneDrive/Desktop/side profile of the owner.PNG` | 286x374 | 318.7 KB | Side-profile portrait | Strongest facial reference; close side profile; screenshot edges and nearby partial figures should be cropped before use. | Yes for side profile. Strong facial feature reference, but not a front portrait. |
| B001-A16 | `another of owner.PNG` | `C:/Users/antho/OneDrive/Desktop/another of owner.PNG` | 194x207 | 116.6 KB | Seated lifestyle / front-ish portrait | Small image with front-ish seated pose; face visible but low-detail; useful as supplemental expression/posture reference. | Partial yes. Helpful for front-ish look, but too small to carry identity lock by itself. |

## Not Found

The following expected owner-reference file was not found in exact or normalized close-variant search:

- `profile owner.png`
- `profile owner.jpg`
- `profile owner.jpeg`
- `profile owner.webp`
- `profile_owner.*`
- `profile-owner.*`

## Registry Mapping

| Asset ID | Registry location | Classification | Current status | Intended use | Target formats | Cleanup required | Risk notes |
|---|---|---|---|---|---|---|---|
| B001-A12 | `ASSET_INTAKE_BATCH_001.md` | Owner / spokesperson reference | usable with cleanup | 9:16 spokesperson cutout, 4:5 premium portrait, optional 1:1 crop | Transparent PNG cutout, 9:16 WebP, 4:5 WebP, optional 1:1 WebP | Background removal, edge cleanup, quality/upscale QA, safe crop review | Narrow crop and small face; not enough for full identity lock alone. |
| B001-A14 | `ASSET_INTAKE_BATCH_001.md` | Owner / spokesperson reference | usable with cleanup | 9:16 lifestyle reference, posture/presence reference, optional 4:5 crop | 9:16 WebP, 4:5 WebP, optional 1:1 reference crop | Crop/quality QA, avoid using as front identity reference | Good body/posture cue; face angle is not controlled front/3/4. |
| B001-A15 | `ASSET_INTAKE_BATCH_001.md` | Owner / spokesperson reference | usable with cleanup | Side-profile identity reference, facial feature consistency draft | Reference crop, optional 4:5 profile crop | Crop screenshot edges, remove nearby partial figures if processed, approval check | Strong side-profile face data; still missing direct front view. |
| B001-A16 | `ASSET_INTAKE_BATCH_001.md` | Owner / spokesperson reference | usable with cleanup | Supplemental front-ish reference, expression/posture reference | Reference crop, optional 4:5 or 1:1 crop | Crop/quality QA, do not overfit due to low resolution | Helpful but small and low-detail. |

## View Coverage

| Required / useful view | Current coverage | Source assets | Status |
|---|---|---|---|
| Full-body standing | Covered | B001-A12, B001-A14 | Usable with cleanup. |
| Front portrait | Partial only | B001-A16 | Still weak; cleaner front portrait recommended. |
| 3/4 portrait | Partial only | B001-A14 | Still weak; cleaner 3/4 portrait recommended. |
| Side profile | Covered | B001-A15 | Strong side-profile reference after crop cleanup. |
| Seated lifestyle | Covered | B001-A16 | Supplemental. |
| Warm owner/spokesperson expression | Partial | B001-A12, B001-A16 | Needs approval; expressions vary. |
| Same outfit across all shots | Not covered | Mixed wardrobe across references | Identity lock risk; use outfit-specific prompt instructions if needed. |

## Approval Status

Current packet status: `usable with cleanup / V1 draft only`.

This packet is enough to draft an owner visual profile. It is not enough to declare a final approved owner identity lock because:

- The clean front portrait is weak and low-resolution.
- The 3/4 reference is a lifestyle image, not a controlled portrait.
- Wardrobe changes across references.
- All references require approval before owner-led generation.

## Recommended Next User Uploads

- Clean front portrait, same outfit if possible.
- Clean 3/4 portrait, same outfit if possible.
- Left/right profile if available.
- Higher-resolution full-body standing image if available.
- Approval note confirming these references can be used for owner/spokesperson campaign development.

## Processing Deferral

Do not process or export these images until Anthony explicitly approves an image-processing pass.

Do not generate owner images or videos until the identity lock is approved or the missing-reference waiver is documented.
