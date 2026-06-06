# Free Tooling Layer

## Purpose

Add a free/open-source local processing layer to the Fina Calle Campaign Autopilot before any paid AI provider is considered.

This layer is for planning, local verification, and safe first-pass asset preparation. It does not authorize paid API calls, publishing, app code changes, deployment changes, or final client-facing output.

## Why This Layer Exists

Seller/client assets usually arrive as raw phone photos, screenshots, mixed folders, or exported images. The Campaign Autopilot should first use local/free tooling to create cleaner reference assets before spending money or sending assets to paid tools.

The goal is:

- Reduce hallucination.
- Preserve client identity.
- Preserve product shape and texture.
- Preserve venue atmosphere.
- Keep logo, QR, CTA, menu copy, pricing, and legal text controlled as overlays.
- Escalate to paid/API tools only after local options are exhausted and approved.

## Tool Registry

### 1. rembg

Purpose:

- Background removal.
- Subject cutout.
- First-pass owner, product, and object isolation.

Use before:

- Paid image cleanup.
- Manual retouching.
- API-based background removal.

Safe uses:

- Owner cutout draft.
- Product cutout draft.
- Simple foreground/background separation.

Forbidden uses:

- Altering facial features.
- Inventing missing body, hair, or product areas.
- Treating poor cutouts as final approval.

Fallback if unavailable:

- Mark cutout as `needs-manual/API-cleanup`.
- Do not pretend the cutout is finished.

### 2. ImageMagick

Purpose:

- Crop.
- Resize.
- Convert.
- Batch export.
- Transparent PNG and WebP generation.
- Format normalization.

Safe uses:

- 9:16, 4:5, and 1:1 exports.
- PNG/WebP conversion.
- Controlled crop/resize.
- Adding safe padding or transparent canvas.

Forbidden uses:

- Recreating logos.
- Recreating QR codes.
- Baking in unapproved CTA/menu text.
- Destructive edits without source preservation.

Fallback if unavailable:

- Use Pillow or another approved local utility if already available.
- Otherwise mark export as `blocked: ImageMagick missing`.

### 3. SAM 2

Purpose:

- Stronger segmentation for difficult owner, product, or environment isolation.

Use when:

- rembg fails.
- Hair, hands, glassware, plants, or pastries have complex edges.
- Subject boundaries are hard to separate.

Status:

- Optional advanced tool.
- Not required for first pass.

Forbidden uses:

- Final owner identity approval.
- Creating new subject details.
- Replacing official source references.

Fallback if unavailable:

- Mark segmentation as `needs-manual/API-cleanup`.
- Continue with crop-only references when safe.

### 4. Upscayl

Purpose:

- Free AI upscaling for low-resolution assets.

Use when:

- Seller image is too small for mockup or video reference.
- Existing asset is promising but resolution is weak.

Safe uses:

- Low-resolution product/environment upscaling.
- Internal-preview enhancement.

Forbidden uses:

- Altering owner identity.
- Treating upscaled detail as verified source truth.
- Upscaling QR codes as final scan assets unless scan-tested after export.

Fallback if unavailable:

- Mark asset as `low-resolution`.
- Use only for small internal reference or request better source.

### 5. FFmpeg

Purpose:

- Video trimming.
- Frame extraction.
- Compression.
- Format conversion.
- Assembly prep for future video passes.

Use when:

- Seller provides video clips.
- A future video pass needs source frames or compressed review files.

Status:

- Future video pass tool.
- Not required for static mockups.

Forbidden uses:

- Publishing.
- Final video generation without approval.
- Editing legal/menu/CTA text into video without approval.

Fallback if unavailable:

- Mark video processing as blocked.
- Request still images or approved video tooling.

## Preferred Processing Order

1. Local crop, resize, and export.
2. rembg background removal.
3. ImageMagick batch normalization.
4. Upscayl if the image is low-resolution.
5. SAM 2 if segmentation is difficult.
6. Only then consider paid/API tools after explicit approval.

## Hard Rules

- No paid API calls without approval.
- No AI-generated QR patterns.
- No AI-generated logos.
- No baked-in CTA/menu text unless explicitly approved as editable design output.
- Preserve original seller/client asset identity.
- If local tools are unavailable, document the missing dependency and stop safely.
- Do not invent file paths.
- Do not install tools unless explicitly instructed.
- Do not publish, deploy, or modify app code from this layer.

## Output Statuses

Use these statuses for locally processed outputs:

- `approved`
- `usable with cleanup`
- `needs-manual/API-cleanup`
- `low-resolution`
- `blocked: missing dependency`
- `rejected`

## Recommended Next Step

Run an install/availability verification pass only when Anthony explicitly asks. Use `PROMPTS/FREE_TOOLING_INSTALL_AND_VERIFY_PROMPT.md` and report missing tools without installing anything unless approved.
