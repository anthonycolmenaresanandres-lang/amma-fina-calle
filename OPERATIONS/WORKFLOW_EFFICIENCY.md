# Workflow efficiency - local implementation

Owner: Anthony, Delivery Owner. Bottleneck: repeated setup, overlapping guidance and repeated manual verification. Scope authorized 2026-09-10; queue item 23. This is local tooling, not a production release or a claim of company-wide savings.

## Implemented workflow

1. Read the latest relevant queue/handoff state, then the shared `OPERATIONS/SKILL_ROUTING.md`. Both Codex and Claude entrypoints reference it. Repository mirrors remain available; installed vendor plugins and global settings are not modified.
2. Run the dependency-free audit and tests from the repository root:

   ```powershell
   node tools/workflow/skill-audit.mjs
   node --test tools/workflow/skill-audit.test.mjs
   & ./tools/workflow/verify-local.ps1 -SelfTest
   ```

   The audit compares normalized `SKILL.md` text, not supporting scripts. Identical mirrors are informational; differing text needs review, not automatic deletion. Optional positional arguments limit inventory to explicitly selected roots.

3. For a running **local production-mode** Penalty Shootout preview:

   ```powershell
   & ./tools/workflow/verify-local.ps1 -BaseUrl http://127.0.0.1:3127 -Skin laspalmas
   ```

   The script launches an isolated headless browser session with loopback-only network domains, checks all three keeper selections at 320x740 and 390x844, records JSON plus six screenshots, and closes only its own session. It rejects production URLs and does not log in, submit forms, or make purchases. Use `-RequireNoindex` only when the route's acceptance contract requires it; the current penalty route does not emit that directive, so this script records rather than silently changes its indexing policy. Review the screenshots; automated canvas/DOM checks cannot establish visual correctness, texture quality or gameplay. Keep full tap/swipe, fallback, resize and scoring checks when those behaviors change.

## Dependency-install pilot

```powershell
& ./tools/workflow/benchmark-installs.ps1
```

- Defaults to a no-install notice. Pass `-RunPilot` only in an idle workstation window, with no concurrent install or browser verification. This pilot is opt-in because the first trial affected local responsiveness.
- Uses the app's existing package manifest and npm lockfile; copies only those two files into new task-owned directories under `C:\Dev\amma\evidence\workflow-efficiency`.
- No source lockfile, app package manager, global config, CI or Vercel change. No dependency-version upgrade is requested.
- npm and pnpm run sequentially with scripts disabled, dedicated caches and a fresh project directory for each sample. First sample is cold; later samples reuse that manager's cache. pnpm import time is reported separately.
- This downloads public package-registry data. It never copies `.env` or repository registry credentials; it uses the workstation's existing package-manager configuration. No paid service is invoked. At least 10 GiB free is required initially; stop below 4 GiB.
- Install-only comparisons do not certify a lockfile migration. Before adoption, confirm dependency-version parity, required lifecycle scripts, production build and application tests, Node/CI/Vercel compatibility and rollback. Do not extrapolate one workstation result into company-wide savings.
- Evidence directories are retained deliberately; no automatic recursive cleanup. Remove only exact task-owned fixture directories after evidence review and explicit cleanup authorization.

### First trial result

Verified npm 11.11.0 / Node 24.14.1 measurements: cold install 160.46 seconds; warm-cache install into another fresh directory 179.23 seconds. Both used `--ignore-scripts` and exited 0. The separately reported five-minute earlier install used different conditions and is not a comparable baseline.

pnpm 11.19.0 import resolved the lockfile, but the trial was interrupted after local browser/shell responsiveness degraded; no completed pnpm installation timing was collected. Contention is a possible confounder, not a proven diagnosis. No speed improvement or pnpm adoption is claimed. Fixture evidence: `C:\Dev\amma\evidence\workflow-efficiency\installs-20260910-195009-bc8249\results.json`.

## API cost opportunity - held, not enabled

Official OpenAI documentation currently offers a 50% Batch discount for supported nonurgent API jobs with a 24-hour completion window. Supported endpoints include text, image generation/editing and video; verify the selected model before use. Jobs can expire with only partial results, so a future integration needs idempotent IDs, result reconciliation and retry handling.

No Batch client, credentials, request upload, schedule, live integration or model migration was added. Before implementation: Anthony chooses the approved API project and reuse/new-key route, authorizes eligible non-sensitive data and a spending cap, and accepts the latency. The `openai-platform-api-key` skill requires that credential decision before API-calling code is built, even for a dry-run-first integration. Never convert the existing disabled AI-media scaffold into live execution implicitly.

For a later cache-cost audit: current GPT-5.6+ documentation prices cache writes at 1.25x ordinary input and reads at 0.1x. Reuse must justify writes; do not assume every prompt automatically saves money. These are API rates, not Codex subscription discounts.

## Validation and adoption gate

Local verification completed: four Node audit tests, 14 PowerShell local-origin/fail-closed cases, script parsing, unchanged source package/lock hashes, and six browser smoke cases (three keepers x two mobile widths). Representative 320px/390px screenshots were visually inspected. Browser evidence: `C:\Dev\amma\evidence\workflow-efficiency\browser-20260910-200453-359606`. The existing game preview was left running; its source was not modified in this workflow pass.

Windows verifier implementation note: bootstrap the isolated CLI session before capturing command JSON, encode JavaScript arguments, and use condition/network waits instead of fixed sleeps. Early attempts failed and are retained as failed evidence; only the final `passed-smoke` run above is acceptance evidence. No unrelated app rebuild was needed for these operations-only changes.

One-week pilot: compare the next five similar accepted changes with five comparable baseline changes. Primary KPI: median active minutes per accepted change; target 20% reduction. Record setup, implementation and verification separately, preserve the same acceptance checks, and count reopens. Time consumed by required approvals is separate. Target is unverified until measured; if baseline tasks are unavailable, first collect them rather than inventing a baseline.

No scheduled automation is installed. Actual invoices, API usage, Remotion team size/project ownership and company-level savings remain unknown. See the corrected license gate in `OPERATIONS/VIDEO_GAME_VISUAL_TOOLKIT.md`.

## Sources checked 2026-09-10

- [Codex skill discovery](https://learn.chatgpt.com/docs/build-skills)
- [OpenAI instruction-following guidance](https://developers.openai.com/api/docs/guides/latest-model)
- [pnpm shared dependency store](https://pnpm.io/motivation)
- [OpenAI Batch API](https://developers.openai.com/api/docs/guides/batch)
- [OpenAI prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching)
- [Remotion license FAQ](https://www.remotion.dev/docs/license/faq)
