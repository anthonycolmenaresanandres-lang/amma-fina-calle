# Fina Calle OS AI Media Tooling

## Purpose

This folder contains documentation and TypeScript scaffolding for future dry-run media planning.

It is intentionally disabled for live provider execution. It does not call OpenAI, Seedance, Vidu, or any paid provider.

## Current Scope

- Read asset-registry-style records in a future pass.
- Map approved assets into media production inputs.
- Estimate dry-run output counts and rough cost ranges.
- Build shot packets for human approval.
- Keep provider integrations stubbed and disabled.

## Non-Goals

- No live API calls.
- No paid operations.
- No secret storage.
- No app route integration.
- No production deployment changes.
- No QR, logo, CTA, or Digital Menu text generation.

## Required Environment

Copy `.env.example` to `.env` only in a local ignored environment when live provider work is explicitly approved later. Do not commit `.env`.

## Planned Commands

The current package is scaffold-only. Future commands may include:

```bash
npm run dry-run
npm run build-shot-packet
npm run estimate
```

Those commands must remain dry-run until separate approval is granted.
