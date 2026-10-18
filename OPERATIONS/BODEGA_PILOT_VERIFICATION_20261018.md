# Bodega pilot: local verification

Date: 2026-10-18 UTC. Isolated worktree: `C:\dev\amma\worktrees\owner-request-audit-20261017`; branch: `codex/owner-request-audit-20261017`. This verifies local prepared code, not deployed schema, owner identity, credentials or production behavior. See [release packet](BODEGA_OWNER_PILOT_20261018.md) and earlier [portal audit](OWNER_PORTAL_AUDIT_20261017.md).

## Final checks

Run from `APP/web` using the existing locked dependencies. No production fetch, database, mail or message was used. The local server was built with provider variables/release flags cleared and no dotenv file present other than `.env.example`.

| Command | Result |
|---|---|
| `node --import tsx scripts/bodega-controls-selftest.ts` | 69 source/identity/overlay/actual leaf-renderer/readback/worker checks pass. Includes whole-source preservation, partial/unknown/duplicate/invalid snapshots, hidden/inert/script/comment proof, all-row order, deployment mismatch, tenant mismatch, CAS preflight, uncertain apply reply/replay and independent rollback verification. |
| `node scripts/bodega-controls-db-selftest.mjs` | 117 synthetic SQL/queue checks pass. Includes default-off/empty scopes, source/commit certification, immutable source identity/group, tenant-owner Auth binding, policy review, exact versioned apply/readback/confirmation, rollback conflicts, raw private-role denial, unselected intake/execution and malformed-null scope rejection, durable preflight conflict and non-Bodega compatibility. |
| `node scripts/owner-queue-selftest.mjs` | 97 queue SQL checks pass, including unselected notification lease/maintenance isolation. |
| `node scripts/account-queue-compatibility-selftest.mjs` | Same 97-check queue suite passes with tracking proposal loaded; reported separately as compatibility, not 97 new distinct scenarios. |
| `node scripts/account-staging-db-selftest.mjs` | 77 account-staging/tracking SQL checks pass. |
| `node --import tsx scripts/owner-queue-client-selftest.ts` | 43 mocked client/source/notifier checks pass. Exact tenant scopes, no RPC/network when disabled, unselected tenant not delivered, bounded retries/idempotency and safe provider errors. No mail sent. |
| `node --import tsx scripts/owner-request-actions-selftest.ts` | 18 actual server-action/route checks pass with mocked services. |
| `node --import tsx scripts/account-actions-selftest.ts` | 17 actual account-action checks pass with mocked services. |
| `node --import tsx scripts/account-import-selftest.ts` | 42 import/progress checks pass. |
| `node --import tsx scripts/owner-request-reliability-selftest.ts` | 31 receipt/freshness/triage checks pass. |
| `node --import tsx scripts/owner-menu-selftest.ts` | 51 menu checks pass. |
| `node --import tsx scripts/owner-request-selftest.ts` | Existing intake self-test passes. |
| Changed TS/TSX/MJS ESLint, plus final added test files | Pass, no diagnostics. An accidental broader app lint also finished with zero errors and 111 existing/general warnings; those unrelated warnings were not modified. |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | Full types pass before build; repeated after final HTTP harness correction. |
| `node node_modules/next/dist/bin/next build --webpack` | Production compilation, TypeScript, 58 generated static pages and build traces pass. Bodega and loopback fixtures remain dynamic. |
| `node --import tsx scripts/bodega-controls-http-selftest.ts` against loopback production server | Five pass: actual Next SSR baseline/live/fallback, actual flag-off Bodega page, invalid fixture mode 404. Only live HTML verifies; Bodega Cat is unavailable at version 1. |
| `git diff --check`; original source/dependency diff | Pass. `menu-draft.ts`, package.json and lockfile unchanged. No migration added. |

The new HTTP harness initially read `projection.snapshot` instead of `projection.state.snapshot`; corrected in the test, then all five HTTP checks passed. Earlier worker mocks omitted the newly required tenant scope; corrected before the final 69-check pass. These failed intermediate harness runs are not counted as passes. SQL tests use PGlite and serialize one connection. They do not prove hosted Supabase/Auth/PostgREST, concurrent-role, email delivery or production public-readback behavior; those are explicit release prerequisites.

## Mobile and actual HTTP evidence

Chrome owned preview tab, loopback production build only. Temporary viewports: 390×844 and 320×740. Browser scrollbar reduced content widths to 375/305; document scroll widths matched exactly, with no document overflow. Horizontal category navigation remains deliberately scrollable. No guest-note form was submitted. No captured console errors. No physical Safari or screen-reader audit was performed.

At 390 pixels, paused logo and Classics anchor were captured before the extraction (previous local build) and after the new production build. Visual review confirmed the same source order, typography, separators, item names, both size prices and game link. Screenshots are visual evidence, not a pixel-identity assertion. The source file and locked dependency diff are unchanged.

- [Before, Classics 390](BODEGA_PILOT_EVIDENCE_20261018/bodega-controls-before-390.jpg)
- [After, unchanged flag-off Classics 390](BODEGA_PILOT_EVIDENCE_20261018/bodega-controls-after-390.jpg)
- [Synthetic sold-out state 390](BODEGA_PILOT_EVIDENCE_20261018/bodega-controls-live-390.jpg): Bodega Cat keeps its original ingredients and shows Sold out; all 50 control rows are present.
- [Synthetic order 390](BODEGA_PILOT_EVIDENCE_20261018/bodega-controls-order-390.jpg) and [320](BODEGA_PILOT_EVIDENCE_20261018/bodega-controls-order-320.jpg): Mocha moves first within Classics; every size/price remains unchanged.
- [Fallback 390](BODEGA_PILOT_EVIDENCE_20261018/bodega-controls-fallback-390.jpg): explicit “Live availability could not be confirmed” notice; no live/sold-out claims, original order/content and failed completion proof.

Fixtures are public source content plus invented controls; no owner/customer records. `/pilot/bodega-controls` requires `LOCAL_PILOT_PREVIEW=1`, exact loopback Host and no Vercel runtime; it never contacts a backend. All saved screenshots are local evidence. No extra Library upload or sharing was performed. The previously delivered synthetic owner-account preview remains Library `libfile_eb73f24899288191a322aeaa9951a23d`.

Build/core/DB/HTTP/type/lint logs are saved beside the captures; saved copies normalize trailing whitespace only (raw local outputs remain in APP/web). Viewport reset, owned verification tab closed and loopback server stopped after checks. Other worktrees, browser tabs, traffic collection, deployed mail styling and production settings were untouched.

## Remaining release dependencies

No denied/pending/uncertain production operation exists: no production mutation was attempted. Activation remains intentionally unperformed. The [release packet](BODEGA_OWNER_PILOT_20261018.md) identifies precise separate approvals for current-main integration/deployment, reviewed schema/grants, actual Bodega owner authority/confirmed Auth/consent, baseline publication/source certificate, scoped intake/policy, protected execution invoker and optional notifications. There is no installed continuous assistant connection or automatic production caller. Existing infrastructure quotas must support usage without additional spending before enabling any production path.
