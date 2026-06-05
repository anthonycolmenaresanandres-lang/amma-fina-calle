---
name: character-consistency-engine
description: Fina Calle OS strict identity-preservation workflow for AI image/video character production. Use when creating, versioning, testing, or QA-reviewing character identity locks, owner/spokesperson locks, mascot locks, negative identity blocks, micro-motion tests, or any multi-shot campaign where face, body silhouette, costume, expression, and personality must remain consistent.
---

# Character Consistency Engine

## Purpose

Preserve character continuity across AI images, AI video, campaign assets, storyboards, digital menu visuals, game skins, and brand films.

Reference images support consistency, but the locked text block is the primary continuity DNA. If the wording drifts, the face drifts. If body, costume, expression, or personality wording drifts, the character becomes a different character.

## When To Use This Skill

Use this skill before any task involving:

- A recurring owner, spokesperson, mascot, villain, hero, customer, or fictional character.
- Multi-shot AI image or video generation.
- Brand campaigns where a person must look identical across assets.
- Character QA after render batches.
- Any request to improve or rewrite an approved identity lock.

## Face Identity Lock Methodology

Capture the face in stable, non-poetic descriptors:

- Apparent ethnicity or cultural read when approved.
- Age range.
- Face shape.
- Jawline.
- Cheekbones.
- Nose shape.
- Eye shape, color, spacing, and expression angle.
- Eyebrows.
- Mouth/lips.
- Facial marks, scars, wrinkles, asymmetries.
- Skin texture.
- Facial hair.
- Ears or other unique anchors.

Do not use synonyms for approved facial descriptors unless a new version is created. Synonym drift is identity drift.

## Build Identity Lock Methodology

Capture the body silhouette:

- Height or frame impression.
- Build: lean, broad, soft, muscular, compact, slender, etc.
- Shoulder shape.
- Posture.
- Weight distribution.
- Movement energy.

A face can remain stable while the body drifts. Reject any render where the build/body silhouette no longer matches the approved lock.

## Costume Identity Lock Methodology

Capture costume/material identity:

- Wardrobe pieces.
- Fabric, metal, leather, linen, jewelry, armor, apron, uniform, etc.
- Wear level: clean, polished, torn, weathered, practical.
- Color family.
- Accessories.
- Forbidden costume substitutions.

Costume identity is part of character identity. Do not redesign wardrobe during render iteration unless the shot explicitly permits a wardrobe variant.

## Expression Identity Lock Methodology

Capture the character's default emotional language:

- Resting expression.
- Eye emotion.
- Mouth behavior.
- Tension level.
- Personality signal.
- What expressions are forbidden.

Expression drift changes story meaning. A restrained survivor cannot become a smiling superhero. An anxious innocent cannot become a hardened villain.

## Negative Identity Block Methodology

Every character lock must include a negative identity block. It defines what the character must not become.

Include:

- Wrong age.
- Wrong build.
- Wrong grooming.
- Wrong costume.
- Wrong genre.
- Wrong lighting style if it changes identity.
- Wrong skin texture.
- Wrong emotional energy.
- Wrong cultural/era read.

## Micro-Motion Stress Test Protocol

Before using a lock in a full campaign, run a short stress test:

```txt
[SUBJECT: approved identity lock] + [ACTION: slow push-in camera, subject slowly blinks, subtle breathing] + [CAMERA: static facial framing or slow push-in only] + [FORMAT: 9:16, cinematic realism, human skin texture]
```

Pass only if:

- Face remains stable.
- Build does not drift.
- Costume remains stable.
- Skin stays realistic.
- Unique marks remain in correct location.
- Expression/personality remains aligned.

## Identity Drift Failure Modes

Reject or revise when:

- Face changes shape.
- Eyes change shape/color/spacing.
- Scar, mark, or unique feature moves or disappears.
- Body silhouette changes.
- Costume material changes.
- Character becomes more beautiful, younger, cleaner, richer, or more generic than approved.
- Skin becomes plastic or over-smoothed.
- Expression/personality no longer matches.
- AI adds fake logos, fake readable text, or invented brand marks.

## Character QA Checklist

- Face identity preserved.
- Build/body silhouette preserved.
- Costume/material identity preserved.
- Expression/personality identity preserved.
- Negative identity avoided.
- Unique marks stable.
- Human skin texture preserved.
- No AI-generated logos or readable text.
- Mobile 9:16 readability preserved when applicable.

## Versioning Rules

Every approved lock must include:

- Project.
- Version.
- Approval status.
- Approval note.
- Change reason when updated.

An approved Identity Lock is treated like a casting contract. It may not be rewritten casually. Any change requires a new version number, reason for change, and approval note.

## Absolute Rule

Never rewrite, summarize, shorten, beautify, or casually improve an identity lock once approved. Copy the approved text exactly into prompts and packets unless a new version is explicitly created and approved.
