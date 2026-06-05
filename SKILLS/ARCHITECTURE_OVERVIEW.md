# Fina Calle OS Skill Library Architecture Overview

## Purpose

The Fina Calle OS Skill Library is the reusable operating layer for AMMA/Fina Calle creative, web, campaign, and Colattao digital experience work. It is documentation-only: it defines protocols, review gates, asset registry rules, and handoff standards without changing production application behavior.

## Library Model

The library is organized as five executable-thinking modules:

| Skill Module | Purpose | Primary Output |
|---|---|---|
| CHARACTER_CONSISTENCY_ENGINE | Keep recurring people, mascots, owner figures, and brand characters visually stable. | Character lock packets and negative identity rules. |
| CINEMATIC_STUDIO | Produce cinematic scenes, shot sequences, and motion guidance without chaotic AI drift. | Storyboards, shot matrices, motion rules. |
| COLATTAO_DIGITAL_EXPERIENCE | Preserve Colattao as the flagship proof system for digital menu, game, QR, owner, and campaign work. | Colattao-specific QA and campaign protocols. |
| WEB_STUDIO | Convert approved visual concepts into production-ready client websites without inventing facts. | Build packets, overlay maps, review checklists. |
| CAMPAIGN_LAUNCH_SYSTEM | Plan lightweight campaigns from concept through preview, production, and post-launch notes. | Campaign launch packets and handoffs. |

## Asset Registry Gate

`ASSET_REGISTRY/` is the single source of truth for approved campaign assets before AI generation. It sits after character/environment locks and before storyboards, shot matrices, prompt packets, render batches, edit assembly, brand overlays, and final export.

Asset registry doctrine:

- Logos, QR codes, text, and menu copy are overlays only.
- AI-generated text, logos, QR codes, and menu copy are rejected.
- Owner references must be approved before owner identity lock.
- Cafe references must be approved before environment lock.
- Every asset needs source, date added, status, intended use, forbidden use, and replacement rule.
- Status values are `approved`, `pending`, `rejected`, and `deprecated`.

## Required Operating Boundary

- Do not modify application code from this library.
- Do not modify routes, deployments, backend logic, auth, payments, or secrets.
- Treat this library as source-of-truth planning and production discipline.
- Use preview review before production changes.
- Keep Colattao as the case study and AMMA/Fina Calle as the parent operating system.

## Folder Roles

- `SKILLS/`: reusable AI/operator skill modules.
- `ASSET_REGISTRY/`: approved logos, QR codes, Digital Menu assets, owner references, cafe references, overlays, and asset QA status definitions.
- `CHARACTER_LIBRARY/`: identity locks, negative identity references, character packets.
- `STORYBOARDS/`: scene-by-scene sequence planning and motion rules.
- `SHOT_MATRICES/`: shot coverage tables, camera/motion constraints, asset request matrices.
- `PROMPTS/`: reusable prompt templates and generation constraints.
- `HANDOFFS/`: preview/production review checklists and session transfer templates.
