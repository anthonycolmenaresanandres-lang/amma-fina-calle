# Fina Calle OS Asset Registry

## Purpose

The Asset Registry is the single source of truth for approved campaign assets before any AI image, video, brand, or campaign generation begins.

No render batch, storyboard, prompt packet, Digital Menu campaign, owner/spokesperson video, QR campaign, or overlay assembly should proceed until the required assets are registered with source, date added, status, intended use, forbidden use, and replacement rule.

## Core Doctrine

- Logos, QR codes, text, and menu copy are overlays only.
- AI-generated text, logos, QR codes, and menu copy are rejected.
- Owner references must be approved before owner identity lock.
- Cafe references must be approved before environment lock.
- Approved assets must be used as static overlays or references, not regenerated from memory.
- If an asset is not in this registry, treat it as pending.

## Status Values

Use only these status values:

- approved
- pending
- rejected
- deprecated

See `ASSET_STATUS_DEFINITIONS.md` for exact meanings.

## Registry Files

| File | Purpose |
|---|---|
| `APPROVED_LOGOS.md` | Approved logos, brand marks, and usage limits. |
| `APPROVED_QR_CODES.md` | Approved QR code images and destinations. |
| `APPROVED_DIGITAL_MENU_ASSETS.md` | Approved menu screenshots, panels, item images, and menu overlays. |
| `OWNER_REFERENCE_ASSETS.md` | Approved owner photos and references used for identity locks. |
| `CAFE_ENVIRONMENT_REFERENCES.md` | Approved interior/exterior cafe environment references. |
| `OVERLAY_ASSETS.md` | Static overlays for logo, QR, captions, CTA, badges, text, and menu words. |
| `ASSET_QA_CHECKLIST.md` | QA checklist before asset enters prompts or edit assembly. |
| `ASSET_STATUS_DEFINITIONS.md` | Canonical status values and replacement rules. |

## Required Asset Record Fields

Every asset record must include:

```txt
ASSET ID:
ASSET NAME:
SOURCE:
DATE ADDED:
STATUS: approved / pending / rejected / deprecated
INTENDED USE:
FORBIDDEN USE:
REPLACEMENT RULE:
OWNER / APPROVER:
NOTES:
```

## Production Boundary

The Asset Registry is documentation and governance only. It does not process images, store secrets, deploy assets, or modify application code.
