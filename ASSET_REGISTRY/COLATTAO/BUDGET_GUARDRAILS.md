# Colattao Media Budget Guardrails

## Purpose

This document defines first-pass budget policy for Colattao Encanto Launch media production and future Fina Calle OS campaigns.

No paid action is authorized by this document.

## Budget Phases

| Phase | Purpose | First-pass cap | Approval required |
|---|---|---:|---|
| Phase 0 | Documentation, registry, prompt packets, dry-run estimates | $0 | No paid tools. |
| Phase 1 | Image normalization | $5 to $15 | Anthony approval required before spend. |
| Phase 2 | Still generation and visual variants | $10 to $25 | Anthony approval required before spend. |
| Phase 3 | Video micro-motion tests | User-approved only | Explicit approval with estimate required. |
| Phase 4 | Video batch generation | User-approved only | Explicit approval with output count and estimate required. |
| Phase 5 | Final assembly/export | Tool-dependent | Explicit approval if paid tools are used. |

## Paid Action Rules

- No paid action without a dry-run estimate.
- Every paid batch must list expected output count.
- Every paid batch must list estimated cost range.
- Every paid batch must list selected provider.
- Every paid batch must list source assets.
- Every paid batch must list intended output dimensions.
- Every paid batch must have human approval before execution.

## Stop Conditions

Stop before spend if:

- Owner identity is not approved for owner-led shots.
- Cafe environment is not approved for real cafe shots.
- QR destination is not scan-tested.
- Logo overlay is not approved.
- Digital Menu proof is not approved.
- Prompt packet includes generated readable text.
- Estimated cost exceeds the phase cap.
- The user has not explicitly approved the run.

## Dry-Run Estimate Fields

Every pre-render packet must include:

```txt
RUN ID:
CAMPAIGN:
PHASE:
PROVIDER:
MODEL / TOOL:
SOURCE ASSETS:
OUTPUT COUNT:
OUTPUT TYPES:
DIMENSIONS:
ESTIMATED LOW COST:
ESTIMATED HIGH COST:
BUDGET CAP:
APPROVAL REQUIRED: yes
APPROVER:
NOTES:
```

## Cost-Control Strategy

1. Normalize assets before generating variants.
2. Generate stills before video.
3. Test one micro-motion before batching.
4. Keep batches small.
5. Use overlays for text/logos/QR instead of regenerating full frames.
6. Reuse approved backgrounds and product stickers.
7. Stop failed provider directions early.

## No-Secret Rule

Never store API keys, access tokens, provider secrets, billing identifiers, or private credentials in the repository.

Use `.env.example` only for blank variable names.
