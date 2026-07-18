---
name: amma-sales-conversion
description: Improve AMMA Ventures and Fina Calle sales materials, pitches, demos, flyers, follow-ups, offers, objection handling, landing journeys, and experiments using verified customer evidence and ethical behavioral design. Use for restaurant-owner customer profiles, sales batting average, conversion audits, persuasion, influence, messaging, CTAs, proof, pilot framing, behavioral patterns, or Revenue Power Hour preparation, especially when a small model needs guardrails against unsupported claims, dark patterns, or invented customer psychology.
---

# AMMA Sales Conversion

Increase the percentage of qualified prospects who take a dated next action. Reduce cognitive load and buyer risk; never bypass informed choice.

## Evidence first

Read these sources before revising an asset:

1. `SALES_DEMO_PACKAGE/FEATURE_STATUS_TABLE.md` for what is live, demo-only, coming soon, future, or unknown.
2. `references/restaurant-owner-model.md` for known, inferred, and missing customer evidence.
3. The exact asset or product surface being changed.
4. The private lead/call evidence when available. Do not put real PII in the repo.

Read `references/behavioral-design.md` when choosing a persuasion principle, experiment, or safety boundary.

## Build one decision path

Use this sequence:

1. **Recognition:** reflect one observed owner priority or workflow problem.
2. **Outcome:** state one practical improvement without guaranteeing results.
3. **Proof:** show the narrowest verified proof that supports the claim.
4. **Friction reduction:** explain what the owner does not have to install, manage, or risk.
5. **Offer:** present one reversible, clearly scoped pilot.
6. **Action:** request one specific next step with a date or simple choice.

Do not infer personality, fear, income, protected traits, or vulnerability. Use language preference only to communicate clearly. Use an owner priority only when the owner states it or behavior directly supports it.

## Match proof to the stated priority

- `time / simplicity` -> owner control plus AMMA-handled setup.
- `brand / differentiation` -> tailored visual demo, clearly labeled as a mock until approved.
- `engagement / experience` -> playable game demo, labeled as engine/demo rather than a promised result.
- `trust / skepticism` -> Colattao live menu, honest feature-status boundaries, and written scope.
- `price / risk` -> bounded pilot, exact inclusions, fixed written pricing, and no hidden commitment.

If no priority is known, ask one discovery question instead of choosing a psychological angle.

## Score before field use

Run:

```powershell
python scripts/score_sales_asset.py --file "<asset>" --mode field --json
```

Treat every `blocking_issue` as a stop. A high score does not override the feature table, customer evidence, approval rules, or human judgment.

## Learn through experiments

Assign one `hook_id`, one `proof_id`, and one `cta_id` per exposure. Change one material variable at a time. Log the observed response and next action in the private tracker; use the repo templates only as schemas.

Do not declare a winning pattern from anecdotes or examples. Report sample size, exposure count, conversions, objections, losses, and evidence gaps. Use call transcripts or notes for verbatim customer language; never invent quotes.

## Prohibited tactics

Reject fabricated scarcity, fake testimonials or activity, disguised ads, hidden pricing or recurring terms, preselected consent, obstruction, shame, fear exaggeration, bait-and-switch offers, confusing cancellation, and claims that a feature or result is live when it is not. Never target protected traits or exploit children, illness, financial distress, or cognitive vulnerability.

## Output contract

Return:

- customer evidence posture: known, inferred, missing;
- chosen owner priority and supporting observation;
- one recognition -> outcome -> proof -> pilot -> action path;
- exact revised copy or product recommendation;
- one experiment with IDs, primary metric, guardrail metric, and stop rule;
- unsupported claims, dark-pattern risks, and approval gates.
