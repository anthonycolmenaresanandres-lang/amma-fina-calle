---
name: amma-business-intelligence
description: Deterministically route AMMA Ventures and Fina Calle operating work to Anthony's current role, factory stage, evidence sources, KPI, and best installed specialist skill, while learning from verified outcomes through an auditable local feedback log. Use for Morning Command, Revenue Power Hour, Daily Closeout, lead research, sales, client onboarding, delivery, campaigns, billing review, KPI review, business bottlenecks, automation improvement, or other AMMA management decisions, especially with Haiku-class or smaller models.
---

# AMMA Business Intelligence

Run AMMA as a managerial factory. Select one role and one bottleneck from verified evidence; never turn routing confidence into permission to act.

## Route the work

Run the deterministic router on the exact request:

```powershell
python scripts/route_business_work.py route --query "<exact request>" --json
```

From outside this folder, use the absolute script path. Read `references/operating-map.json` only when changing or auditing the route definitions.

Use the result as follows:

- `high`: use the returned workflow, Anthony role, and `primary_skill`.
- `medium`: compare the returned primary and alternate against the exact requested action; keep only the narrower match.
- `low`: inspect the canonical sources listed below. Ask one question only if the missing fact changes the operating role or approval boundary.
- `missing_skills`: report the capability gap. Do not invent a connector, account, lead, metric, or completed action.

Load at most one returned specialist skill. This AMMA skill remains the operating orchestrator; the specialist performs the narrow work.

## Evidence order

Use current evidence in this order:

1. `OPERATIONS/HANDOFF_LOG.md` and `OPERATIONS/CODEX_QUEUE.md`.
2. Live product, deployment, billing, or client status when connected and in scope.
3. Connected Gmail, Calendar, Drive, CRM, ledger, or analytics data required by the workflow.
4. Current primary-source web research only when the decision depends on changing outside facts.
5. `BUSINESS/AMMA_VENTURES_BUSINESS_PLAN.md` for durable strategy, never for current results.

Label material facts `verified`, `unknown`, or `inference`. Never convert an unknown into a zero or a completed result.

## Operating output

Return exactly:

- one Anthony role: CEO/Strategist, Revenue Producer, Delivery Owner, or Finance/Admin;
- one bottleneck and one measurable outcome;
- three actions with exact tools, files, links, scripts, or templates;
- one KPI and a time-boxed finish line;
- evidence gaps and approval/stop conditions.

For revenue work, use grounded leads when available. Otherwise provide prospect criteria and research steps without inventing businesses or contacts.

## Learn from verified outcomes

Record an outcome only after evidence confirms what happened:

```powershell
python scripts/route_business_work.py record --workflow "<workflow>" --recommended-skill "<skill>" --actual-skill "<skill>" --success yes --kpi-result "<non-PII result>" --lesson "<short verified lesson>"
```

Review accumulated evidence with:

```powershell
python scripts/route_business_work.py report --json
```

The log defaults to `~/.codex/state/amma-business-intelligence/outcomes.jsonl`. Never record names, emails, phone numbers, customer data, secrets, credentials, or unverified claims. The report may recommend review; it never edits the operating map, skills, prompts, or automations. Apply learning changes only through a reviewed file change and the existing approval process.

## Safety boundary

Honor every returned approval gate. Stop before contacting prospects, sending messages, spending money, changing access, entering secrets, merging, deploying, or touching production unless Anthony explicitly approves that exact action. Verify current state again immediately before any approved external action.
