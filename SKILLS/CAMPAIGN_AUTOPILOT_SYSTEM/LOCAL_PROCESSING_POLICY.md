# Local Processing Policy

## Purpose

Define when the Fina Calle Campaign Autopilot may use local/free tools and when it must stop for approval.

This policy protects client assets, brand truth, and budget discipline.

## Local-First Rule

Before any paid AI provider, use local/free processing where possible:

1. Crop and resize.
2. Normalize format.
3. Remove backgrounds when safe.
4. Upscale low-resolution references when safe.
5. Segment difficult subjects only with approved local tools.
6. Escalate to paid/API tooling only after approval.

## Allowed Local Actions

Allowed when requested by Anthony or specified in a scoped task:

- Read source image metadata.
- Create non-destructive crops.
- Resize to `9:16`, `4:5`, and `1:1`.
- Convert PNG, JPG, WebP, and transparent PNG when quality is preserved.
- Remove backgrounds using local tools.
- Extract frames from supplied video with FFmpeg.
- Compress review copies.
- Create documentation for each output.

## Disallowed Local Actions

Do not:

- Install tools unless explicitly approved.
- Call paid APIs.
- Generate or redraw QR patterns.
- Generate or redraw logos.
- Bake unapproved CTA/menu/pricing/legal text into assets.
- Alter owner identity.
- Beautify in ways that change the person, product, or venue.
- Treat local cleanup output as final without approval.
- Publish or deploy.
- Modify app code, routes, configs, package files, secrets, or production systems.

## Missing Dependency Rule

If a tool is unavailable:

1. Record the missing dependency.
2. Record the intended operation.
3. Mark the output as blocked or needing manual/API cleanup.
4. Stop that operation.
5. Do not install the missing tool unless Anthony approves installation.

## Identity Preservation Rule

For owner, staff, spokesperson, and character references:

- Preserve face structure.
- Preserve skin tone.
- Preserve hair shape and texture.
- Preserve body impression and posture.
- Preserve outfit.
- Do not reshape, smooth, redraw, or invent missing details.

## Product Preservation Rule

For drinks, food, pastries, stickers, and product stills:

- Preserve product shape.
- Preserve color.
- Preserve texture.
- Preserve garnish, cup, plate, and portion scale.
- Do not invent ingredients or menu claims.

## Environment Preservation Rule

For cafe, restaurant, venue, and decor images:

- Preserve real material cues.
- Preserve lighting mood.
- Preserve furniture, decor, plants, counters, shelves, and architecture.
- Remove readable text only when it is distracting or unapproved.

## Overlay Preservation Rule

The following must remain controlled overlays:

- Logos.
- QR codes.
- CTA text.
- Menu copy.
- Pricing.
- Legal text.

AI-generated versions of these are rejected.

## Approval Gate

Local processing outputs can become final campaign references only after:

- Source file is recorded.
- Output file is recorded.
- Tool/method is recorded.
- Dimensions and format are recorded.
- Status is assigned.
- Limitations are documented.
- Human approval is recorded.

## Colattao-Specific Notes

- Use `Digital Menu`, never `website`.
- QR destination and scan status must remain documented.
- Recovered logo candidates are internal-preview only until approved.
- Owner identity remains V1 partial unless upgraded.
- Product-first mockups are the current approved direction for the Encanto Digital Menu Launch.
