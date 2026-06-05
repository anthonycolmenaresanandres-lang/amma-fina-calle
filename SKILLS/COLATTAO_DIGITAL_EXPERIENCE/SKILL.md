---
name: colattao-digital-experience
description: Fina Calle OS strict brand-consistency workflow for Colattao as the flagship digital storefront case study. Use when planning or reviewing Colattao Digital Menu campaigns, Cafe Rush assets, owner/spokesperson video, QR overlays, logo overlays, cafe environment locks, menu visual approval, signage, or campaign handoff work.
---

# Colattao Digital Experience

## Purpose

Keep Colattao as the flagship proof of Fina Calle OS while preventing brand drift, terminology drift, fake menu assets, fake logos, and unsafe AI text generation.

## Encanto Fina Calle Digital Menu Launch Protocol

The campaign direction is `Encanto Fina Calle Digital Menu Launch`.

Strategic intent:

- Move away from generic Head of Household promo logic.
- Use owner authority and cafe identity as the trust anchor.
- Use Colattao warmth, espresso/gold visual language, Digital Menu, Cafe Rush, and QR behavior as separate production layers.
- Make the launch feel sophisticated, welcoming, and mobile-first.

## Owner As Authority/Spokesperson

The owner is the authority/spokesperson. The owner's identity lock must be approved before generating any campaign video.

Use `CHARACTER_LIBRARY/COLATTAO_OWNER_IDENTITY_LOCK_TEMPLATE.md` before rendering any owner-led video or image sequence.

## Digital Menu Terminology Rule

Use Digital Menu, never website, in campaign language.

Preferred:

- Digital Menu
- Colattao Digital Menu
- Interactive Digital Menu
- Mobile-first Digital Menu

Do not use:

- Website
- Ordering system
- POS system
- Checkout
- Payment app

## No Website Terminology Rule

Do not say `website` when the campaign is about the Digital Menu. If a route happens to be web-hosted, that is implementation detail, not campaign language.

## Logo Overlay Protocol

Logos, text, QR codes, menu words, and brand marks must be added as static PNG/vector overlays in final editing. Never ask image or video models to generate readable brand text.

AI-generated scenes should leave safe negative space for final logo/text overlays.

## QR Overlay Protocol

QR codes must be generated or supplied separately and composited as a static overlay. Do not ask an AI image/video model to generate a working QR code.

## Menu Asset Approval Rule

Approved menu visuals must come from approved assets only. Do not let AI invent menu layouts.

Use approved Digital Menu screenshots, exported menu panels, or manually composed overlays.

## Cafe Environment Lock Workflow

Before generating campaign video inside Colattao:

1. Collect approved interior references.
2. Fill `SKILLS/COLATTAO_DIGITAL_EXPERIENCE/CAFE_ENVIRONMENT_LOCK_TEMPLATE.md`.
3. Lock counter layout, wall materials, lighting temperature, menu placement, owner position, customer position, props, and approved angles.
4. Reject renders where the cafe becomes a different space.

## Separation Of Concerns

Background, owner, logo/text, QR, and Digital Menu visuals are separate production layers.

Layer model:

1. Cafe background/environment.
2. Owner/spokesperson or customer action.
3. Digital Menu visual asset.
4. Logo/text overlay.
5. QR overlay.
6. Final edit and export.

Do not force all layers to be generated inside one AI image/video prompt.

## Guardrails

- Do not modify Colattao Rush from the AMMA parent repo unless explicitly scoped.
- Do not change menu prices/items without approval.
- Do not add backend/auth/payment logic.
- Do not call the Digital Menu an ordering or POS system unless that feature exists.
- Do not generate readable brand text, logos, QR codes, or menu words through AI image/video models.
