# Asset QA Checklist

## Purpose

Use this checklist before any asset is approved for storyboard, prompt packet, render batch, edit assembly, or final export.

## Required Checks

- Source is known.
- Date added is recorded.
- Status is one of: approved, pending, rejected, deprecated.
- Intended use is specific.
- Forbidden use is specific.
- Replacement rule is defined.
- Owner/approver is listed or marked pending.
- File path/location is listed when available.
- Asset does not contain generated/warped brand text unless explicitly a rejected example.
- Asset does not contain generated/warped logo unless explicitly a rejected example.
- QR codes are scan-tested before approval.
- Digital Menu assets are client-approved before campaign use.
- Owner references are approved before identity lock.
- Cafe references are approved before environment lock.
- Mobile readability is checked for overlays.

## Automatic Rejection

Reject if:

- Logo is AI-generated.
- QR code is AI-generated.
- Text/menu copy is AI-generated inside an image/video model output.
- Menu layout is invented by AI.
- Source is unknown.
- Intended use is unclear.
- Asset is outdated but not marked deprecated.
- Asset conflicts with approved identity or environment locks.

## Approval Output

```txt
ASSET QA RESULT:
Asset ID:
Result: approved / pending / rejected / deprecated
Reason:
Reviewer:
Date:
Next action:
```
