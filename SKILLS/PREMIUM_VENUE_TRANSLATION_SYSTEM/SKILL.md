# Premium Venue Translation System Skill

## Purpose

The Premium Venue Translation System turns the Colattao campaign framework into a reusable Fina Calle OS method for other restaurants and premium local venues.

The goal is consistency of prestige, not identical design cloning. Each venue keeps its own identity while fitting the Fina Calle premium system.

## Use This Skill When

- Translating a Colattao-style campaign framework to another restaurant.
- Creating a premium Digital Menu launch campaign for a new venue.
- Preparing restaurant onboarding assets before AI image or video generation.
- Reviewing whether a campaign feels high-end, consistent, and brand-safe.
- Building a prompt packet that must preserve overlays, owner identity, and venue environment.

## Required Inputs

- Restaurant onboarding packet.
- Approved logo assets.
- Approved owner photo packet, if owner appears.
- Approved venue/interior environment packet.
- Approved Digital Menu screenshots or proof visuals.
- Product hero images or food/drink references.
- QR/CTA destinations.
- Heritage/cultural notes.
- Target audience notes.
- Premium positioning notes.

## Core Operating Rules

- Preserve prestige constants across every venue.
- Translate venue variables without cloning Colattao blindly.
- Use approved overlays for logos, text, QR codes, and menu copy.
- Do not generate readable logos, QR codes, Digital Menu copy, menu copy, or CTA text with AI.
- Owner identity must be approved before generation.
- Venue environment must be approved before generation.
- For Colattao campaign language, use Digital Menu, never website.

## Workflow

1. Read `PRESTIGE_DNA_RULES.md`.
2. Complete `VENUE_TRANSLATION_TEMPLATE.md` for the venue.
3. Compare against `COLATTAO_AS_MASTER_TEMPLATE.md`.
4. Confirm required assets using `ASSET_REGISTRY/RESTAURANT_ONBOARDING_PACKET_TEMPLATE.md`.
5. Build a prompt packet from `PROMPTS/PREMIUM_CAMPAIGN_TRANSLATION_PROMPT_TEMPLATE.md`.
6. Score with `PREMIUM_QA_RUBRIC.md`.
7. Stop before any generation if owner identity, environment, logo, QR, or Digital Menu proof is missing or unapproved.

## Outputs

- Venue Translation Packet.
- Premium DNA compliance notes.
- Asset readiness gap list.
- Prompt packet draft.
- QA scorecard.
- Recommended generation stop/go decision.

## Protected Boundaries

- This skill is documentation and planning only.
- It does not modify app code.
- It does not modify routes or deployments.
- It does not create live provider calls.
- It does not approve unregistered assets.
