# Autopilot Dropzone Protocol

## Purpose

Define how Anthony can provide restaurant/client assets so the Fina Calle Campaign Autopilot can inventory, classify, register, and prepare campaign planning packets with minimal back-and-forth.

## Recommended Dropzone Shape

```txt
ASSET_REGISTRY/<CLIENT_NAME>/dropzone/<BATCH_ID>/
  logos/
  qr/
  digital-menu/
  owner/
  environment/
  products/
  overlays/
  notes/
```

If files arrive elsewhere, Autopilot may process them only after the exact source path is verified.

## Batch Naming

Use:

```txt
BATCH_001
BATCH_002
BATCH_003
```

or:

```txt
YYYY-MM-DD_short-description
```

## Required Metadata

Each batch should include a short README or intake note with:

- Client/venue name.
- Campaign objective.
- Intended campaign channels.
- QR destination(s).
- CTA text if known.
- Whether owner/spokesperson appears.
- Any cultural/heritage notes.
- Any assets that are already approved.
- Any assets that are reference-only.

## Accepted Asset Types

- PNG, JPG, JPEG, WebP, SVG for images/logos.
- MP4/MOV only as reference, not required for V1.
- TXT/MD/PDF for notes or approval records.

## Status Defaults

If not explicitly approved:

- Logos default to `pending` or `usable with cleanup`.
- QR defaults to `pending scan-test`.
- Owner references default to `pending-owner-approval`.
- Environment references default to `pending`.
- Product photos default to `needs review`.
- Text/CTA defaults to `pending approval`.

## Hard Rules

- Logos, QR codes, CTA text, menu copy, prices, and legal text are overlays only.
- AI-generated logos are rejected.
- AI-generated QR codes are rejected.
- AI-generated readable menu copy is rejected.
- No Digital Menu proof claim without approved screenshot/proof.
- No owner identity lock without sufficient references and approval.
- No paid provider calls without explicit approval.
- No publishing/deployment from dropzone processing.

## Dry-Run Intake Output

The first pass should produce:

- File inventory.
- Classification table.
- Missing blocker list.
- Suggested processing queue.
- Approval gate report.
- Recommended next user action.

## Colattao Template Note

Colattao is the master template for premium Digital Menu launch discipline, not a design clone. Other restaurants should preserve their own logo, owner identity, food, environment, color, and audience while following the same approval gates.
