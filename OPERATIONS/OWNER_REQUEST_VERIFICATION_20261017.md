# Owner request local verification

Worktree: `C:\dev\amma\worktrees\owner-request-audit-20261017`
Branch: `codex/owner-request-audit-20261017`
Base: `e0b44dd79e53fc45fe1e13d642ec4bb81dfee0f9` (`origin/main` as available locally).

## Passed

From `APP/web`:

```powershell
node --import tsx scripts/owner-request-reliability-selftest.ts
# 31 checks passed
node --import tsx scripts/owner-request-actions-selftest.ts
# 12 checks passed; executes actual server functions with mocked external dependencies
node scripts/owner-request-db-audit.mjs
# 8 diagnostic checks reproduced against existing SQL with synthetic in-memory data
node --import tsx scripts/owner-request-selftest.ts
# owner request intake self-test: PASS
node --import tsx scripts/owner-menu-selftest.ts
# 51 existing owner-menu checks passed
node node_modules/typescript/bin/tsc --noEmit --incremental false
# exit 0, no errors
```

Scoped ESLint passed (exit 0) on all seven changed/new application modules/components and all three new test scripts:

```powershell
node node_modules/eslint/bin/eslint.js src/lib/requests/receipt.ts src/app/api/customer-requests/route.ts src/lib/owner/request-desk/preview.ts src/lib/owner/request-desk/actions.ts src/lib/owner/request-desk/menu.ts src/lib/owner/request-desk/triage.ts 'src/app/owner/[id]/AskBar.tsx' scripts/owner-request-reliability-selftest.ts scripts/owner-request-actions-selftest.ts scripts/owner-request-db-audit.mjs
```

`git diff --check` passed. `package.json`, `package-lock.json`, Supabase migrations, `.github` and `render.yaml` are unchanged. No credentials or production account data were used by tests. The database diagnostic deliberately asserts observed insecure baseline behaviors; it is not a passing production-security assessment. The mock-action test transpiles the actual source and denies unexpected dependency imports, then supplies synthetic authentication, database and mail adapters. It does not prove live Supabase RLS or browser behavior.

## Build blocker

Action: `npm run build -- --webpack` in this isolated `APP/web`. Outcome: **failed**, exit 1.

```text
Creating an optimized production build ...
[webpack.cache.PackFileCacheStrategy] Caching failed for pack:
Error: ENOSPC: no space left on device, write
uncaughtException [Error: ENOSPC: no space left on device, write]
errno: -4055
code: ENOSPC
```

The drive was at zero free bytes. Only this task's verified `.next` directory was removed, reclaiming approximately 363 MB; free space then measured 362,397,696 bytes. Rather than exhaust storage again or delete another task's files, the remaining compile verification used TypeScript with no emit or incremental cache; that passed. Full optimized build success is **not confirmed**. No automatic approval rejection occurred.

The offline locked install (`npm ci --offline --ignore-scripts --no-audit --no-fund`) completed: 415 packages in 7 minutes, without downloading packages or changing the lockfile. Initial lint and localhost-preview attempts occurred during extraction and failed on incomplete Next files; final lint/type checks ran after installation. After all checks, this task's generated dependency directory was removed to return approximately 627 MB of scratch space to the shared computer. Source, lockfile and test scripts remain; use the same offline install to rerun when storage is available.

## Browser blocker

Action: create a separate hidden IAB tab for synthetic localhost request preview, `http://127.0.0.1:3147/pilot/request-audit?before=1`.

Outcome: **unavailable**, `Browser is not available: iab`. `cua.listBrowsers()` returned `[]`. No existing browser tabs were inspected or controlled. Same-viewport before/after screenshots and mobile interaction checks were therefore not performed. The temporary two-file synthetic preview harness was removed. The local Next preview process exited during dependency extraction; no preview server was left running.

## Not attempted by task boundary

Push, deployment, production SQL or migrations, permission changes, credentials, external messages, tenant enrollment and production autonomous execution. There is no pending or uncertain production action. Deployed function/grant/config state and real owner logins remain unverified. Local freshness fingerprints do not provide atomic write conflict protection; durable delivery/retries and rollback remain planned database/runtime work.

## Deliverables

- `OPERATIONS/OWNER_PORTAL_AUDIT_20261017.md`: full source-backed assessment, mobile flow, three-phase minimal plan, approved-policy proposal, supported assistant access and spending constraints.
- `OPERATIONS/OWNER_REQUEST_SOURCE_INDEX_20261017.md`: verified paths and line references.
- `OPERATIONS/OWNER_REQUEST_VERIFICATION_20261017.md`: this verification record.
- Local source fixes and three regression/diagnostic scripts in the isolated worktree; preserved in the local commit with follow-up queue work.


## Follow-up: disabled authenticated queue

The follow-up implemented an unapplied SQL proposal outside `supabase/migrations`, four queue application modules and default-off Request Desk wiring. See `OWNER_REQUEST_QUEUE_APPROVAL_20261017.md` for exact permission implications, rollout gates and incomplete production/UI/readback work.

New/updated targeted results:

- `owner-queue-selftest.mjs`: **95 PASS**, including anonymous tenant spoof rejection, verified Auth attribution, owner A/B isolation, reset/unconfirmed users, default-off gates, private RLS/EXECUTE restrictions, idempotent submission, atomic event/outbox persistence, policy/revocation/expiry, competing/stale versions, audit failure rollback, bounded item order/collisions/static source rejection, completion/rollback conflict, lease fencing/recovery, retry cap/dead-letter and provider-deduplication window.
- `owner-queue-client-selftest.ts`: **36 PASS**, including exact flags, payload bounds, no caller identity, truthful receipt failure, static/conditional source assessment, no DB/network when off, one attempt per claimed notice, stable provider key, metadata-only notice, fixed errors, timeout and uncertain acknowledgments. Every fetch/RPC mocked.
- `owner-request-actions-selftest.ts`: **18 PASS**, now also covering queue-mode direct-apply rejection and actual queued action gates/auth/tenant/completion state boundaries.
- Existing 31 reliability checks, request intake self-test and 51 owner-menu checks: **PASS** using the small cached runtime.
- Focused TypeScript for `queue/client.ts`, `queue/notifications.ts`, `queue/sources.ts` and the queue client tests: **PASS**, strict/no emit. This is not a renewed full-app type/build certification.
- Scoped ESLint on all new queue modules, new test scripts, Request Desk actions and AskBar: **PASS**, using existing installed lint tooling read-only. The only warning was that React was absent from this deliberately minimal test runtime and lint assumed the latest React version.

Reproduction with the existing task-specific temporary runtime (normal installed dependencies can also run these scripts directly):

```powershell
$env:OWNER_QUEUE_TEST_RUNTIME='C:\Users\bellmark\AppData\Local\Temp\owner-request-queue-runtime-20261017\package.json'
$env:NODE_PATH='C:\Users\bellmark\AppData\Local\Temp\owner-request-queue-runtime-20261017\node_modules'
node scripts/owner-queue-selftest.mjs
node --import file:///C:/Users/bellmark/AppData/Local/Temp/owner-request-queue-runtime-20261017/node_modules/tsx/dist/loader.mjs scripts/owner-queue-client-selftest.ts
node --import file:///C:/Users/bellmark/AppData/Local/Temp/owner-request-queue-runtime-20261017/node_modules/tsx/dist/loader.mjs scripts/owner-request-actions-selftest.ts
```

The test runtime uses exact cached versions from the existing lockfile: PGlite 0.5.8, tsx 4.22.4, TypeScript 5.9.3 and Node type declarations 20.19.41. Measured size: 63,805,688 bytes. No full app dependency reinstall or new full build was attempted. Free space was approximately 973 MB near completion. Plan for at least 2 GB free before a future full install/build, preferably 3 GB; the observed failed-install/build lower bound was about 990 MB and is not sufficient evidence of a successful threshold.

No live SQL, permission changes, migrations, credentials, enrollment, real mail send, watcher, deployment, push or paid infrastructure. The SQL lives only in `supabase/proposals/owner_request_queue_v1.sql`; each test creates a new synthetic in-memory database. Real multi-connection concurrency, actual Supabase Auth/default privileges/advisors, production menu propagation and browser UI tests remain pending. All gates default false; no tenant enrollment is seeded; every executable request still needs the authority review implemented in the proposal.
