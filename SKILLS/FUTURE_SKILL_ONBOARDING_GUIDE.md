# Future Skill Onboarding Guide

## Purpose

Use this guide when adding a new Fina Calle OS skill module. The goal is consistency, not volume.

## Required Steps

1. Define the business use case.
2. Confirm the module does not duplicate an existing skill.
3. Create `SKILLS/[MODULE_NAME]/SKILL.md`.
4. Create `SKILLS/[MODULE_NAME]/STARTER_PROTOCOL.md`.
5. Link any shared rules from `CHARACTER_LIBRARY/`, `STORYBOARDS/`, `SHOT_MATRICES/`, `PROMPTS/`, or `HANDOFFS/`.
6. Add the module to `SKILLS/DEPENDENCY_MAP.md` if it becomes a core dependency.
7. Keep the skill documentation short enough for another AI/operator to load quickly.

## Naming Standard

- Folder names: uppercase snake case for business modules, for example `MENU_PHOTO_SYSTEM`.
- Skill frontmatter names: lowercase hyphen case, for example `menu-photo-system`.
- Protocol files: uppercase descriptive names, for example `STARTER_PROTOCOL.md` or `ASSET_QA_PROTOCOL.md`.

## Required Guardrails

Every future skill must state:

- No secrets.
- No payment/auth/backend/database work unless explicitly approved.
- No production deployment changes from planning docs.
- No AI-generated logos.
- No public factual claims without approval.
- Preview before production.

## Minimum Viable Skill

A valid Fina Calle OS skill needs only:

- `SKILL.md`
- `STARTER_PROTOCOL.md`
- Links to shared rule docs
- Clear output format

Do not create large manuals unless repeated work proves the need.
