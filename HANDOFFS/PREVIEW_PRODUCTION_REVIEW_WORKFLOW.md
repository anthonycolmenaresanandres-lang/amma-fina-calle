# Preview / Production Review Workflow

## Purpose

Protect client trust and production stability by separating idea generation from production changes.

## Stages

1. Preview concept
   - No app code changes unless explicitly requested.
   - No public claims treated as final.
   - No deployment.

2. Review packet
   - Include source assets, prompt notes, shot matrix, intended placements, and unresolved questions.
   - Mark all client facts as approved, pending, or unknown.

3. Production task
   - Only starts after approval.
   - Has explicit file scope.
   - Has protected files.
   - Has build/QA requirements.

4. Production verification
   - Run the required build or local QA.
   - Report what was verified and what was not.
   - Do not claim browser/live verification unless actually performed.

## Stop Conditions

Stop and report if:

- A requested asset would create a fake logo.
- A prompt would invent prices, hours, services, offers, legal claims, or payment behavior.
- Scope crosses into auth, payments, backend, database, or deployments without approval.
- Colattao source files would be modified from the AMMA parent repo by accident.
