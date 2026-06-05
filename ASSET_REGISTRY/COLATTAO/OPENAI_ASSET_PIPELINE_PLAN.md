# Colattao OpenAI Asset Pipeline Plan

## Purpose

This plan defines how Fina Calle OS can use OpenAI image tools for controlled Colattao Encanto Launch asset normalization and approved still generation without risking brand, QR, menu, or CTA integrity.

This is a planning document only. No live API calls are authorized by this file.

## Source Of Truth

Inputs must come from the Colattao asset registry:

- `ASSET_REGISTRY/COLATTAO/EXISTING_ASSET_INVENTORY.md`
- `ASSET_REGISTRY/COLATTAO/ENCANTO_ASSET_CLASSIFICATION.md`
- `ASSET_REGISTRY/COLATTAO/DATASET_CREATION_GATE_001.md`
- `ASSET_REGISTRY/COLATTAO/ENCANTO_LAUNCH_ASSET_PACKET.md`

No asset outside the registry can be used for campaign generation until it has a source, date added, status, intended use, forbidden use, and replacement rule.

## Non-Negotiable Overlay Rules

- Logos are never AI-generated.
- QR codes are never AI-generated.
- Digital Menu text is never AI-generated.
- CTA text is never AI-generated.
- Menu copy is never AI-generated.
- Logos, QR codes, CTA text, Digital Menu text, and menu copy are overlay assets only.
- Outputs must be registered in `ASSET_REGISTRY/` before campaign use.

## OpenAI Image Tool Uses

OpenAI image tools may be used for:

1. Owner background removal after owner references are approved.
2. Transparent PNG cutouts of approved owner or product assets.
3. 9:16 spokesperson crops from approved owner inputs.
4. 4:5 social crops from approved product and Digital Menu visuals.
5. Square sticker/product crops.
6. Product/sticker cleanup.
7. Hero still generation where no logo, QR, CTA, or Digital Menu text is baked in.
8. Approved visual variants using registered references.

OpenAI image tools must not be used to invent:

- Colattao logo marks.
- Fina Calle logo marks.
- QR codes.
- Readable Digital Menu copy.
- Readable CTA buttons.
- Owner identity before owner approval.
- Cafe environment lock before environment approval.

## Recommended Image Normalization Workflow

### Stage 1 - Asset Selection

- Read registry records with status `candidate-approved`, `pending-owner-approval`, or `needs-normalization`.
- Reject anything marked `rejected` or missing required source data.
- Require human confirmation before selecting owner/cafe assets.

### Stage 2 - Dry-Run Estimate

Before any paid generation or edit:

- Count source assets.
- Count requested output variants.
- Estimate low/high cost range.
- List output dimensions and formats.
- Produce a pre-render packet.
- Stop for human approval.

### Stage 3 - Normalization Outputs

Allowed output targets:

- 9:16 campaign background stills.
- 4:5 social crops.
- 1:1 product/sticker crops.
- Transparent owner cutouts after owner approval.
- Transparent product/sticker cutouts.
- Clean background-fill variants without baked text.

### Stage 4 - Registry Writeback

Every output must be recorded before use:

- Source input asset.
- Generated output filename.
- Provider/tool used.
- Date generated.
- Prompt packet id.
- Status.
- Intended use.
- Forbidden use.
- Replacement rule.
- Human reviewer.

## Colattao Encanto First Batch Recommendation

Start with non-identity assets only:

- `colattao-bg.png`
- `colattao-bg-summer.png`
- `menu-eldorado-01.png` through `menu-eldorado-04.png`
- `play-colattao-cafe-rush-banner.webp`
- `view-our-menu-banner.webp`
- `colattao-fina-calle-footer-banner.webp`
- seasonal product stickers

Do not process owner identity or cafe environment lock until required references are registered and approved.

## Approval Stop Points

Stop and ask for approval before:

- Any paid OpenAI image operation.
- Any owner/spokesperson edit.
- Any cafe environment lock.
- Any generation with more than 3 variants.
- Any output that includes readable text, QR, logo, or Digital Menu visuals.

## Output Naming Convention

Use deterministic filenames:

```txt
colattao-encanto-<asset-class>-<source-slug>-<format>-v001.<ext>
```

Examples:

```txt
colattao-encanto-bg-colattao-bg-9x16-v001.webp
colattao-encanto-menu-eldorado-01-4x5-v001.webp
colattao-encanto-sticker-mango-square-v001.png
```
