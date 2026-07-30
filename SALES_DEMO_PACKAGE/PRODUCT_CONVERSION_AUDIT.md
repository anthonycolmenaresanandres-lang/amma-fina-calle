# Product Conversion Audit — 2026-07-18

## Scope and evidence

Reviewed the live mobile journey at 390 × 844: home, Colattao case study, and contact. Screenshots are stored in the local audit workspace and are not field collateral. The capture looked horizontally clipped, but DOM width checks did not show overflow; recheck on a physical phone before treating it as a code defect.

## Findings

### Home — needs work

- The opening copy is credible but broad; it does not immediately name one restaurant-owner problem.
- Multiple navigation choices compete with the main “Request a Build” action.
- The product proof is separated from the first decision point.

### Colattao case study — honest, under-leveraged

- Strongest asset: a real live example with explicit limits and no invented metrics.
- The page explains the system but does not turn the proof into one low-risk next action.
- Keep “not claimed” language; add a single written-pilot CTA after a visual direction is selected.

### Contact — trusted, generic

- “Reply within one day,” “no spam,” and separate billing reduce uncertainty.
- The page does not preserve the prospect's stated priority or explain what happens after submission.

## Prioritized product fixes

1. Put one restaurant-owner recognition statement beside the strongest live proof.
2. Use one primary CTA per surface and state the next step in plain language.
3. Carry `hook_id`, `proof_id`, `cta_id`, and stated priority into anonymous funnel measurement only when privacy scope is approved.
4. Preserve honest feature-status boundaries and clearly label mockups, R&D, and coming-soon capabilities.

## Design gate

No live UI changes were made. Before implementation, create and select a visual direction that reduces card outlines and hierarchy clutter while preserving accessibility, responsive behavior, and the approved copy. Then test the selected direction on a physical phone and the production viewport.
