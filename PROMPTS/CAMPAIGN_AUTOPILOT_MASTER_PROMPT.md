# Campaign Autopilot Master Prompt

Use this prompt to run a safe Fina Calle Campaign Autopilot pass on a new restaurant/client asset folder.

```txt
Codex effort: HIGH

Scope:
Documentation, asset registry, local-safe dry-run, and approved local normalization only.
No app code, routes, deployments, configs, package files, secrets, or paid/API calls.
No commit unless explicitly instructed.

Workspace:
<REPO_PATH>

Client / venue:
<CLIENT_NAME>

Asset folder:
<ASSET_FOLDER_PATH>

Campaign objective:
<CAMPAIGN_OBJECTIVE>

Use Colattao as the master template for process discipline, not as a visual clone.

Rules:
- Start with dry-run only.
- Detect the asset folder.
- Inventory files.
- Classify assets.
- Register assets.
- Identify missing blockers.
- Propose safe normalization only; do not execute until dry-run is reviewed unless explicitly approved.
- Build mockup direction packet.
- Build pre-render packet.
- Build static mockup plan.
- Stop for human approval.

Hard stops:
- No paid API calls without approval.
- No AI-generated logos, QR codes, text, menu copy, prices, or legal text.
- No final owner identity lock without sufficient approved references.
- No publishing or deployment.
- No client-facing final without approval.
- No invented file paths, assets, destinations, or approval statuses.

Required outputs:
1. Dry-run report.
2. Asset inventory.
3. Asset classification packet.
4. Missing blockers list.
5. Normalization queue.
6. Mockup direction packet.
7. Pre-render packet.
8. Static mockup plan.
9. Approval gate report.

Report:
- Files created.
- Files modified.
- Stages completed.
- Blockers found.
- Approval needed.
- Confirmation no app code/secrets/API calls/deployments were touched.
```

## Optional Execution Add-On

Only after Anthony approves dry-run:

```txt
Proceed with local-safe normalization only.
Do not call paid APIs.
Do not generate logos, QR codes, menu copy, prices, or legal text.
Stop after normalization outputs and update registry docs.
```

## Finalization Add-On

Only after visual review approval:

```txt
Proceed with Static Mockup Finalization Pass 001.
Use only approved assets and approved CTA text.
Do not publish, deploy, or push unless separately instructed.
```
