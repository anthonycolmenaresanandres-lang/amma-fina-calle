# AI Worker Contract

Applies to every AMMA / Fina Calle AI worker.

## Before work
1. Read the current shared state and relevant SOP when accessible.
2. Check whether another worker already owns the item.
3. Check for newer evidence before acting on stale state.
4. Define the exact output and definition of done.

## Evidence standard
- Every factual status change needs source evidence.
- Gmail sent/reply state comes from Gmail evidence, not draft intent.
- Product health comes from repository/workflow evidence.
- Client/payment status comes from verified client/financial records.
- Unknown stays UNKNOWN; never convert missing data to zero.

## Definition of done
A task is DONE only when objective completion evidence exists.
Examples:
- Draft prepared = DRAFT_READY, not CONTACTED.
- Meeting scheduled = DEMO_SCHEDULED, not DEMO_HELD.
- Workflow scheduled = SCHEDULED, not SUCCESS.
- PR opened = REVIEW_READY, not MERGED.
- Payment reminder drafted = DRAFT_READY, not COLLECTED.

## Duplicate-control
- One canonical owner per work item.
- Warm/due work beats new cold work.
- If another worker already produced a valid artifact, reuse it.
- Never create a second draft when one current draft already exists unless materially different.

## Output contract
Every material result should include:
STATUS: green / yellow / red
OWNER:
OBJECTIVE:
COMPLETED:
EVIDENCE:
NEXT ACTION:
DUE / TRIGGER:
BLOCKER:
APPROVAL REQUIRED:
CONFIDENCE: high / medium / low

## Silence rule
Condition-watch workers do not notify on healthy/unchanged state.
Workers should prefer one useful alert over several low-value observations.

## Escalation
Escalate only when:
- Anthony must approve a RED action;
- a deadline is near and blocked;
- evidence conflicts;
- a revenue/client risk has no owner;
- a worker cannot safely proceed.