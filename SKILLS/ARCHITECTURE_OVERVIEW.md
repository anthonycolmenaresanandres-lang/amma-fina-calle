# Fina Calle OS Skill Library Architecture Overview

## Purpose

The Fina Calle OS Skill Library is the reusable operating layer for AMMA/Fina Calle creative, web, campaign, and Colattao digital experience work. It is documentation-only: it defines protocols, review gates, asset rules, and handoff standards without changing production application behavior.

## Library Model

The library is organized as five executable-thinking modules:

| Skill Module | Purpose | Primary Output |
|---|---|---|
| CHARACTER_CONSISTENCY_ENGINE | Keep recurring people, mascots, owner figures, and brand characters visually stable. | Character lock packets and negative identity rules. |
| CINEMATIC_STUDIO | Produce cinematic scenes, shot sequences, and motion guidance without chaotic AI drift. | Storyboards, shot matrices, motion rules. |
| COLATTAO_DIGITAL_EXPERIENCE | Preserve Colattao as the flagship proof system for digital menu, game, QR, owner, and campaign work. | Colattao-specific QA and campaign protocols. |
| WEB_STUDIO | Convert approved visual concepts into production-ready client websites without inventing facts. | Build packets, overlay maps, review checklists. |
| CAMPAIGN_LAUNCH_SYSTEM | Plan lightweight campaigns from concept through preview, production, and post-launch notes. | Campaign launch packets and handoffs. |

## Required Operating Boundary

- Do not modify application code from this library.
- Do not modify routes, deployments, backend logic, auth, payments, or secrets.
- Treat this library as source-of-truth planning and production discipline.
- Use preview review before production changes.
- Keep Colattao as the case study and AMMA/Fina Calle as the parent operating system.

## Folder Roles

- `SKILLS/`: reusable AI/operator skill modules.
- `CHARACTER_LIBRARY/`: identity locks, negative identity references, character packets.
- `STORYBOARDS/`: scene-by-scene sequence planning and motion rules.
- `SHOT_MATRICES/`: shot coverage tables, camera/motion constraints, asset request matrices.
- `PROMPTS/`: reusable prompt templates and generation constraints.
- `HANDOFFS/`: preview/production review checklists and session transfer templates.
