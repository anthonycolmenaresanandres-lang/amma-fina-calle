# Runway Folder Upload Protocol

## Purpose

Define the repeatable ChatGPT, Codex, and Runway workflow for turning approved Fina Calle OS campaign folders into controlled Runway reference uploads.

This protocol is documentation only. It does not authorize app code changes, deployment changes, paid API calls, logo regeneration, QR regeneration, or final publishing.

## Roles

### ChatGPT

ChatGPT helps decide which normalized asset folder should be uploaded first based on campaign status, approval gates, and creative intent.

For Colattao, ChatGPT should prioritize the latest approved internal-preview static mockup folder before lower-level source folders.

### Codex

Codex finds exact Windows paths, confirms folder existence, checks registry status, and reports which files are safe to upload.

Codex must not invent missing paths. If a folder is missing, Codex reports it as missing and stops that path recommendation.

### Runway

Runway can accept whole folders or selected image assets as visual references for animation.

Runway must be treated as a creative animation tool, not as a source of truth for logos, QR codes, menu copy, legal text, or final campaign wording.

## Colattao First Upload Rule

Best first upload folder for static poster animation:

```txt
C:\Users\antho\OneDrive\Desktop\AMMA Ventures LLC DBA Fina Calle\ASSET_REGISTRY\COLATTAO\normalized\mockups_v2
```

Use `mockups_v2` first because it contains the revised 9:16 and 4:5 product-first static mockups with approved internal-preview direction, cleaner QR spacing, and final CTA candidate placement.

## Colattao Normalized Folder Priority

| Folder | Use | Rule |
|---|---|---|
| `normalized\mockups_v2` | First upload for static poster animation. | Primary reference for layout, logo placement, QR panel, color, and CTA hierarchy. |
| `normalized\qr_v1` | QR reference only. | QR pattern must remain unchanged. Do not regenerate or stylize QR. |
| `normalized\overlays_v1` | Logo and overlay reference only. | Use for reference and QA; do not ask Runway to recreate the logo. |
| `normalized\environment_product_v1` | Product and cafe mood support. | Use as secondary reference if the poster needs subtle product or environment motion. |
| `normalized\owner_v1` | Owner reference only. | Owner visuals remain V1 partial unless upgraded with stronger identity references. Do not use owner as hero without approval. |

## Hard Rules

- Use `mockups_v2` first for static poster animation.
- Use `overlays_v1` only for logo and QR reference, not regeneration.
- QR, text, logo, CTA, and menu words must remain unchanged.
- Do not generate new logos.
- Do not generate new QR patterns.
- Do not rewrite or replace the CTA.
- Do not add reward, discount, coupon, win, percentage, pricing, or legal language.
- Use `Digital Menu`, never `website`, for Colattao campaign language.
- Owner visuals remain V1 partial unless upgraded through the owner identity workflow.
- No final client-facing export without human approval.

## Runway Upload Steps

1. Open Runway asset upload or reference panel.
2. Upload the full `normalized\mockups_v2` folder first.
3. Select the 9:16 poster as the primary reference for short-form animation.
4. Use the 4:5 poster only if creating a feed variant.
5. If Runway needs additional visual references, upload selected support files from `environment_product_v1`.
6. Use `overlays_v1` and `qr_v1` only to check preservation of logo and QR, not to regenerate them.
7. Paste the approved Runway static poster animation prompt from `PROMPTS/RUNWAY_STATIC_POSTER_ANIMATION_PROMPT.md`.
8. Review output for logo, QR, CTA, and layout drift before any external use.

## Stop Conditions

Stop and return to registry review if Runway output:

- Warps the Colattao logo.
- Changes the QR pattern.
- Makes the QR unreadable.
- Alters `Scan for Full Menu`.
- Alters `View the menu while you wait.`
- Adds reward, discount, coupon, win, percentage, pricing, or legal language.
- Uses `website` instead of Digital Menu context.
- Changes the premium espresso, cream, and gold visual direction.

## Recommended Next Step

Upload `normalized\mockups_v2` to Runway and run a single static poster animation test using the approved preservation prompt. Treat the result as internal preview only until reviewed.
