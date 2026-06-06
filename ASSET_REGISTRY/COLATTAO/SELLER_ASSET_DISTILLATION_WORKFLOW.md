# Colattao Seller Asset Distillation Workflow

## Purpose

Apply the reusable Seller Asset Distillation Protocol to Colattao campaign assets.

This workflow protects Colattao identity, product accuracy, venue atmosphere, and Digital Menu campaign consistency before image or video generation.

## Standard Recommendation

For movie/project integration, always feed the model distilled assets first, not raw seller photos.

## Stage 1: Asset Intake

When Colattao seller/client images are received, register them before processing.

Required registry fields:

- Asset ID.
- Exact filename.
- Source path.
- Date received.
- Source owner/provider if known.
- Asset class.
- Status: `approved`, `usable with cleanup`, `pending`, or `rejected`.
- Intended use.
- Forbidden use.
- Replacement rule.
- Risk notes.

## Stage 2: Asset Classification

Classify each asset into one primary lane:

- Character / owner / spokesperson.
- Product / drink / food.
- Environment / cafe / decor.
- Overlay / logo / QR / CTA.
- Digital Menu proof.
- Unknown / pending review.

Do not blend owner, product, and environment into one prompt input when a cleaner separated reference exists.

## Stage 3: Distraction Detection

For Colattao, flag:

- Extra people in owner references.
- Text overlays inside product or environment photos.
- Menu boards with prices or unapproved menu wording.
- In-scene logos that are not approved overlays.
- QR codes embedded in photos.
- Clutter that distracts from coffee, pastries, plants, shelf decor, fireplace, or Colattao mood.
- Raw screenshots with browser clutter.

## Stage 4: Isolation Strategy

### Owner / Character

- Keep owner identity lock V1 partial until stronger references are approved.
- Separate owner references from environment/product references.
- Remove extra people if owner is the subject.
- Preserve face, hair, skin tone, outfit, posture, and body proportions.
- Do not beautify in ways that change identity.

### Product

- Create product-first references from coffee, pastry, drink, and food assets.
- Keep product color, texture, cup/plate styling, garnish, and portion scale.
- Remove distracting background when product hero isolation is required.
- Keep lifestyle versions when the table/cafe context improves premium mood.

### Environment

- Preserve warm espresso, cream, antique-gold, brick, plant, shelf, fireplace, and cafe atmosphere cues.
- Create clean wide mood shots and decor detail shots.
- Do not use environment shots as owner identity references unless owner is clearly the subject and approved.

### Overlays

- Logo, QR, CTA text, Digital Menu copy, menu words, pricing, and legal text remain overlays only.
- Use `overlays_v1` and `qr_v1` as preservation references, not generation targets.

## Stage 5: Regeneration Strategy

Use crop/cleanup only when the existing Colattao asset is strong enough.

Use regeneration only for:

- Background extension candidates.
- Atmosphere candidate scenes.
- Product mood candidates that still use approved product references.
- Internal-preview concept frames.

Never regenerate:

- Colattao logo.
- QR code pattern.
- CTA text.
- Digital Menu text.
- Menu copy.
- Pricing.
- Legal language.
- Final owner identity.

## Stage 6: Export Targets

### Character Outputs

- `owner_front_portrait_v#`
- `owner_three_quarter_portrait_v#`
- `owner_side_profile_v#`
- `owner_full_body_v#`
- `owner_expression_variant_<expression>_v#`

### Product Outputs

- `colattao_product_hero_isolated_<item>_v#`
- `colattao_lifestyle_product_<item>_v#`

### Environment Outputs

- `colattao_environment_wide_mood_<location>_v#`
- `colattao_decor_detail_<subject>_v#`

### Recommended Formats

- `9:16` for vertical campaign/video reference.
- `4:5` for premium feed reference.
- `1:1` for product cards and QR tiles.
- Transparent PNG for reliable cutouts.
- WebP for lightweight reference delivery where transparency and quality hold.

## Stage 7: Approval Gate

No Colattao asset is ready for final generation until:

- It has a registry entry.
- It has a status.
- It has intended use and forbidden use.
- Distractions are removed or documented.
- The output path is recorded.
- Human approval is recorded for campaign-facing use.

## Current Colattao Notes

- Owner identity remains V1 partial.
- Owner should not be hero until stronger owner references are approved.
- Product-first Digital Menu Encanto Launch direction is active.
- Mockups v2 are the first Runway upload target for static poster animation.
- QR is approved-candidate with phone scan-test passed, pending final visual/client approval.
- Recovered Colattao logo is internal-preview only until final visual/client approval.

## Output Discipline

Always feed distilled Colattao assets first:

- `normalized/mockups_v2` for poster animation.
- `normalized/environment_product_v1` for product and venue support.
- `normalized/overlays_v1` for logo preservation reference only.
- `normalized/qr_v1` for QR preservation reference only.
- `normalized/owner_v1` only when owner support is explicitly approved.
