# Fina Calle OS Skill Library Maintenance Guide

## Maintenance Cadence

Review the Skill Library after every real client campaign, website build, Colattao update, or reusable asset workflow.

## What To Update

- Add proven prompts to `PROMPTS/`.
- Add reusable shot structures to `SHOT_MATRICES/`.
- Add recurring character identity notes to `CHARACTER_LIBRARY/`.
- Add campaign handoff patterns to `HANDOFFS/`.
- Update only the module that actually changed.

## What Not To Do

- Do not turn temporary experiments into permanent rules too early.
- Do not copy production code into the skill docs.
- Do not store secrets, API keys, tokens, env files, or private credentials.
- Do not claim integrations are live unless they are built and verified.
- Do not bury Colattao proof protocols inside generic agency language.

## Review Questions

Before changing a skill, ask:

1. Did this rule improve a real workflow?
2. Is this already covered by an existing rule?
3. Does this belong in a module, prompt, handoff, character packet, storyboard, or shot matrix?
4. Will another AI/operator understand when to use it?
5. Does it protect production behavior and client liability?

## Versioning Practice

Use small doc commits. One concern per commit. Avoid bundling skill library edits with app code or deployment changes.
