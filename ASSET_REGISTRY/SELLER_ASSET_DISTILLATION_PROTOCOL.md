# Seller Asset Distillation Protocol

## Purpose

Define how Fina Calle OS turns raw seller/client photos into AI-ready reference assets for consistent image and video generation.

The goal is to reduce hallucination by feeding models clean, separated, approved references instead of raw, cluttered seller photos.

Standard recommendation:

> For movie/project integration, always feed the model distilled assets first, not raw seller photos.

## Core Principle

Prioritize preserving identity over beautification.

Distillation should clarify the source asset, not redesign the client, product, venue, logo, menu, or campaign message.

## Stage 1: Asset Intake

Record every received file before processing.

Required intake fields:

- Source filename.
- Source path.
- Date received.
- Seller/client name.
- Asset class guess.
- Current status.
- Intended use.
- Forbidden use.
- Replacement rule.
- Notes on consent, ownership, and approval state if known.

Default status values:

- `approved`
- `usable with cleanup`
- `pending`
- `rejected`

If approval is unclear, mark the asset `pending`.

## Stage 2: Asset Classification

Classify each image into one primary type. Do not mix identity, product, and environment references unless the campaign explicitly needs a lifestyle composite.

### Character

Required outputs:

- Front portrait.
- 3/4 portrait.
- Side profile.
- Full body.
- Optional expression variants.

Use character references for owner, staff, spokesperson, or recurring campaign personas.

### Product

Required outputs:

- Hero product isolated.
- Lifestyle product.

Use product references for drinks, food items, packaging, table setups, seasonal items, and sticker/product cards.

### Environment

Required outputs:

- Clean wide mood shot.
- Decor detail shot.

Use environment references for venue atmosphere, lighting, seating, counters, shelves, plants, signage, and architectural cues.

## Stage 3: Distraction Detection

Flag distractions that could confuse image or video generation.

Common distractions:

- Extra people.
- Text overlays.
- Posters or signs with readable text.
- QR codes inside raw photos.
- Menu boards with unapproved copy or prices.
- Cluttered backgrounds.
- Strong reflections.
- Motion blur.
- Low-light noise.
- Filters.
- Cropped faces or bodies.
- Mixed brands.
- Unapproved logos.

Decision rule:

- If the distraction affects identity, product recognition, brand safety, or text accuracy, remove it, crop it out, or reject the asset.
- If the distraction is harmless atmosphere, document it and keep the asset as environment reference only.

## Stage 4: Isolation Strategy

Separate asset references before feeding any generation model.

### Character Isolation

- Remove extra people.
- Remove cluttered backgrounds when they distract.
- Keep face, hair, posture, outfit, and body proportions intact.
- Do not smooth or alter facial features.
- Preserve skin tone, body impression, and expression.
- Export character references separately from product and environment references.

### Product Isolation

- Remove unrelated hands, faces, labels, and table clutter when they distract.
- Preserve product shape, color, texture, portion size, cup/plate style, and garnish.
- Export isolated product hero and lifestyle product versions separately.

### Environment Isolation

- Remove text overlays and distracting posters when possible.
- Preserve lighting, materials, furniture, decor, and spatial mood.
- Do not use environment shots as owner identity references unless a person is clearly the subject and approved.

## Stage 5: Regeneration Strategy

Use crop/cleanup only when the asset is already strong enough.

Use regeneration only when a clean reference asset cannot be produced by cropping or local cleanup without losing the intended subject.

### Crop/Cleanup Only

Use when:

- Identity is already clear.
- Product is already recognizable.
- Environment mood is already strong.
- Distractions can be removed by crop, background removal, or simple cleanup.
- Text, logo, and QR overlays can remain separate.

### Regeneration

Use only as a controlled candidate when:

- The raw image contains useful concept information but cannot be safely cleaned.
- The output is explicitly marked `recreated-candidate`, `style-reference`, or `generation-reference`.
- Logos, QR codes, CTA text, menu copy, pricing, and legal text remain overlays and are not generated.

Do not use regeneration to:

- Invent a new owner identity.
- Invent official logos.
- Invent QR patterns.
- Invent menu items, prices, legal text, or claims.
- Replace approved brand assets.

## Stage 6: Export Targets

### Character Exports

| Output | Recommended format | Intended use |
|---|---|---|
| Front portrait | PNG or WebP | Identity lock, face reference, spokesperson consistency. |
| 3/4 portrait | PNG or WebP | Cinematic angle consistency. |
| Side profile | PNG or WebP | Profile consistency and motion planning. |
| Full body | PNG or WebP | Outfit, posture, body proportions, cutout planning. |
| Expression variants | PNG or WebP | Optional emotion/mood consistency. |

### Product Exports

| Output | Recommended format | Intended use |
|---|---|---|
| Hero product isolated | Transparent PNG or WebP | Product card, sticker, overlay, prompt reference. |
| Lifestyle product | PNG or WebP | Campaign still, product mood, scene reference. |

### Environment Exports

| Output | Recommended format | Intended use |
|---|---|---|
| Clean wide mood shot | PNG, JPG, or WebP | Background, atmosphere, cinematic scene reference. |
| Decor detail shot | PNG, JPG, or WebP | Texture, cutaway, brand-world details. |

### Aspect Ratios

- `9:16` for story, reel, vertical video, poster, and animation reference.
- `4:5` for premium feed posts and carousel frames.
- `1:1` for product cards, QR tiles, icons, and compact reference assets.
- Transparent PNG for isolated logos, product cutouts, and character cutouts when quality is reliable.

## Stage 7: Approval Gate

No asset moves into final campaign generation until it has a documented approval state.

Approval checks:

- Identity preserved.
- Product preserved.
- Environment accurately represents the venue.
- Distractions removed or documented.
- No AI-generated logo, QR, menu copy, CTA, pricing, or legal text.
- Output path recorded.
- Intended use and forbidden use recorded.
- Reviewer decision recorded.

## Rejection Rules

Reject assets that are:

- Blurry beyond cleanup.
- Heavily filtered.
- Low-light and identity/product unclear.
- Distorted.
- Mixed with unapproved branding.
- Dominated by unapproved readable text.
- Cropped so severely that identity or product cannot be preserved.
- AI-generated when the asset is supposed to be an official logo, QR, menu, price, or legal reference.

## Final Rule

Distilled references are the model input. Raw seller photos are evidence and backup, not the primary generation input.
