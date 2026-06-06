# Campaign Autopilot System Skill

## Purpose

The Campaign Autopilot System turns a provided restaurant/client asset folder into a controlled Fina Calle OS campaign-planning packet with minimal user intervention.

It is an orchestration skill for asset intake, readiness checks, safe normalization planning, mockup direction, and approval gates. It does not publish, deploy, call paid APIs, or generate final client-facing assets without approval.

## Use This Skill When

- A new restaurant/client provides an asset folder for a campaign.
- Anthony asks to process a client dropzone with minimal back-and-forth.
- A Colattao-style Digital Menu launch needs to be translated to another venue.
- Asset readiness needs to be checked before AI/media generation.
- A dry-run report is needed before any file processing or spend.

## Required Inputs

- Client or venue name.
- New asset folder path.
- Campaign objective.
- Target outputs, such as 9:16 story, 4:5 feed, QR poster, or static mockup.
- Approved or pending logo assets.
- QR destinations or QR source images.
- Owner/spokesperson references if owner appears.
- Venue/environment photos.
- Product/food/drink hero assets.
- Digital Menu screenshot/proof if relevant.
- Final CTA copy, or explicit approval to draft editable CTA candidates.

## Core Workflow

1. Read `AUTOPILOT_WORKFLOW.md`.
2. Run dry-run inventory first.
3. Classify assets without inventing missing files.
4. Register assets with source, status, intended use, forbidden use, and replacement rule.
5. Identify blockers before any normalization.
6. Normalize only safe assets after dry-run review.
7. Build mockup direction packet.
8. Build pre-render packet.
9. Build static mockup plan.
10. Stop for human approval.

## Colattao Master Template

Use Colattao as the reference for:

- Product-first Digital Menu launch structure.
- Premium venue translation.
- Overlay discipline.
- QR/logo/CTA as overlays.
- Owner identity lock caution.
- Static mockup review before finalization.

Do not clone Colattao blindly. Translate the structure to the venue identity.

## Hard Rules

- No paid API calls without explicit approval.
- No AI-generated logos, QR codes, text, menu copy, prices, or legal language.
- No final owner identity lock without sufficient approved references.
- No publishing or deployment.
- No client-facing final without approval.
- No invented file paths, asset names, destinations, or approvals.
- Use Digital Menu terminology for Colattao-related campaign language.

## Outputs

- Asset inventory.
- Asset classification packet.
- Missing blocker list.
- Normalization queue.
- Mockup direction packet.
- Pre-render packet.
- Static mockup assembly plan.
- Approval gate report.
- Dry-run report of what would happen before execution.

## Protected Boundaries

This skill can create documentation and dry-run orchestration reports. It must not modify app code, routes, deployments, production configs, secrets, package files, or client production apps unless Anthony explicitly widens scope.
