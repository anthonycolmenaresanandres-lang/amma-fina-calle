# Campaign Autopilot Failure Rules

## Purpose

Define deterministic failure behavior for Campaign Autopilot so it stops safely instead of guessing.

## Hard Failures

Stop immediately if:

- Source folder is missing.
- File path cannot be verified.
- A required asset is referenced but not present.
- A file appears to contain secrets or credentials.
- A requested action would modify app code, routes, deployments, configs, package files, or secrets.
- A paid API/provider call would be required.
- A QR code cannot be traced to a real source.
- A logo would need to be generated or redesigned.
- Owner identity would be finalized without sufficient references.

## Soft Failures

Continue with blockers documented if:

- Some optional assets are missing.
- QR exists but is not scan-tested.
- Logo exists but is candidate-quality.
- Owner references exist but identity lock remains partial.
- Digital Menu proof is missing but the mockup can be planned without proof frame.
- Environment assets are usable-review only.

## No-Invention Rule

Never invent:

- File paths.
- Asset existence.
- Approval status.
- QR destination.
- Logo ownership.
- Menu copy.
- Prices.
- Owner identity details.
- Client deployment status.

If unknown, mark as `missing`, `pending`, `needs review`, or `blocked`.

## Source Preservation Rule

- Never overwrite original assets.
- Copy originals into an `originals/` or registry source folder if needed.
- Write normalized outputs to a separate `normalized/` folder.
- Document every output with source, dimensions, format, intended use, limitations, and approval requirement.

## Dry-Run Failure Behavior

Dry-run must report:

- What failed.
- Why it failed.
- What would have been created if unblocked.
- Exact next user upload or approval needed.

Dry-run must not partially execute normalization or provider work.

## Recovery Behavior

When a failure is resolved:

1. Re-run dry-run.
2. Confirm the blocker is closed.
3. Update registry status.
4. Proceed only to the next safe stage.
5. Stop at the next approval gate.
