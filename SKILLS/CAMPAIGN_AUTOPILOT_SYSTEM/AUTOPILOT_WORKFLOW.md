# Campaign Autopilot Workflow

## Objective

Process a new restaurant/client campaign asset folder through the Fina Calle OS campaign system with the least user intervention possible while preserving approval gates and brand safety.

## Automated Sequence

### 1. Detect New Asset Folder

Input:

- Dropzone root.
- Client folder name.
- Optional campaign name.

Actions:

- Identify new folder.
- Record exact path.
- Record detection timestamp.
- Refuse to proceed if the folder path is unclear or outside approved scope.

Output:

- Dropzone detection note.

### 2. Inventory Files

Actions:

- List filenames, extensions, sizes, modified dates, and dimensions for images when safe.
- Do not open unrelated folders.
- Do not scan app code.
- Do not read secrets or env files.

Output:

- `EXISTING_ASSET_INVENTORY` style document.

### 3. Classify Assets

Classes:

- Brand logo.
- QR overlay.
- Digital Menu proof.
- Owner reference.
- Venue environment.
- Product/food/drink hero.
- Product sticker/cutout.
- Campaign background.
- CTA/text overlay source.
- Source reference.
- Unknown/unrelated.

Output:

- Classification table with status suggestions.

### 4. Register Assets

For every usable or pending asset, record:

- Source.
- Date added.
- Status.
- Intended use.
- Forbidden use.
- Replacement rule.
- Risk notes.

Output:

- Client asset packet under `ASSET_REGISTRY/<CLIENT>/`.

### 5. Identify Missing Blockers

Check for:

- Approved logo overlay.
- Scan-tested QR.
- Digital Menu screenshot/proof.
- Owner reference packet if owner appears.
- Venue/environment references.
- Product hero images.
- Final CTA text.
- Required legal/safety copy if applicable.

Output:

- Production blockers and next uploads document.

### 6. Normalize Safe Assets

Allowed only after dry-run review.

Safe local operations:

- Resize.
- Crop for 9:16, 4:5, 1:1.
- Convert to WebP/PNG.
- Preserve transparency.
- Extract QR from real source without redrawing.
- Prepare overlay-safe copies.

Forbidden:

- AI-generated logo or QR.
- AI-generated readable text/menu copy/prices.
- Owner identity generation without approval.
- Paid provider calls.

Output:

- Normalized asset output folder plus processing pass document.

### 7. Build Mockup Direction Packet

Include:

- Campaign objective.
- Target formats.
- Asset stack.
- Recommended composition.
- Overlay zones.
- Mobile readability rules.
- QA checklist.
- Missing blockers.
- Variant options.

Output:

- `MOCKUP_DIRECTION_PACKET_001.md`.

### 8. Build Pre-Render Packet

Include:

- Selected variant recommendation.
- Exact approved assets.
- Missing overlays.
- Proposed layer stack.
- Output naming convention.
- QA acceptance checklist.
- Stop rule before final render.

Output:

- `PRE_RENDER_PACKET_001.md`.

### 9. Create Static Mockup Plan

Include:

- Format plan.
- Layer stack.
- Safe zones.
- Composition rules.
- Acceptance checklist.
- Final blockers.

Output:

- `STATIC_MOCKUP_ASSEMBLY_PLAN_001.md`.

### 10. Stop For Human Approval

Hard stop before:

- Final render.
- Client-facing file delivery.
- Publishing.
- Deployment.
- Paid provider call.
- Owner identity finalization.

Output:

- Approval gate report.

## Dry-Run First Rule

Every Autopilot run starts with a dry-run report showing:

- Files detected.
- Classifications that would be applied.
- Documents that would be created.
- Safe normalizations that would be proposed.
- Blockers that would stop production.
- Any approval required before execution.

Dry-run must not mutate source assets or call providers.
