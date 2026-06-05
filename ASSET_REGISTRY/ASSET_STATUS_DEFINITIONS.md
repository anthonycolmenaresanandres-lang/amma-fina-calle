# Asset Status Definitions

## approved

The asset is cleared for the listed intended use. It still cannot be used outside that intended use unless the record is updated.

## pending

The asset exists but cannot be used in production prompts, render batches, overlays, or final exports yet. Pending assets may be used for internal planning only if clearly marked.

## rejected

The asset failed QA or violates a rule. Rejected assets must not be used except as examples of what not to do.

## deprecated

The asset was previously usable but has been replaced, outdated, or retired. Deprecated assets must not be used in new work unless explicitly re-approved.

## Required Replacement Rule

Every asset needs a replacement rule. The rule must explain when the asset must be replaced.

Examples:

- Replace when QR destination changes.
- Replace when menu prices/items change.
- Replace when owner approves a new campaign wardrobe.
- Replace when logo file is superseded.
- Replace when cafe environment references are updated.

## Status Transition Rules

- pending -> approved: requires QA and approval note.
- pending -> rejected: requires rejection reason.
- approved -> deprecated: requires replacement record or retirement reason.
- rejected -> approved: not allowed; create a new asset record instead.
- deprecated -> approved: only allowed with explicit re-approval note.
