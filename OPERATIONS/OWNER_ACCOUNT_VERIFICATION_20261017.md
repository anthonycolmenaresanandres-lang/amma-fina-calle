# Account staging and request tracking — verification

Local isolated owner worktree, continuation from `388fa45`. All database rows and identities used by tests are synthetic; no production SQL, access grants or client actions were run.

| Check | Result |
| --- | --- |
| Pure import/adapter/progress checks | PASS, 42 checks |
| Actual server actions with explicit mocked dependencies | PASS, 17 checks |
| PGlite foundation + queue + tracking + private-staging proposals | PASS, 77 checks |
| Existing full queue state-machine suite with tracking replacement loaded | PASS, 95 checks |
| Focused ESLint, new UI/core/routes/scripts and three navigation changes | PASS |
| Full no-emit TypeScript | PASS before final recent-draft UI addition; final production build also checks types |
| Initial complete production build | PASS, webpack, types, 58 static pages, trace collection; provider variables cleared |
| Final build after mobile confirmation fix | PASS, webpack compile 33.8s, TypeScript 46s, 58 static pages 8.1s, completed trace collection, exit 0 |

The database checks verify default-off gates, anonymous/owner/manager boundaries, fresh confirmed Auth identity/reset status, tenant and cursor isolation, normalized duplicate protection against the existing registry, immutable retry keys, exact stored owner menu approval, expiry, revision conflicts, no public registry/menu/access writes, stable UUID mappings, retained missing items, single audit events on retry, private table denial for anon/authenticated/service roles, 25-row request pagination and identical durable detail references. Owner confirmation and rollback continue through the existing guarded queue actions.

The tests use a minimal synthetic Auth schema and a deterministic manager stub, not the complete hosted Supabase stack. PostgREST behavior, actual Auth sessions/recovery, database advisors, live concurrency, source publication and provider delivery remain unverified release requirements. No new production executor, scheduler or notification caller was installed.

Initial browser smoke: 390 CSS px and 320 CSS px layouts had no horizontal overflow or overflowing controls. Unsupported Square import was rejected. Fictional account review, pending owner consent, menu before/after, disabled staging before approval and a competing-edit conflict worked. The smoke check caught an unchecked-state reset issue: refreshed previews must not retain a previous checkbox. Approval forms are now keyed by stored plan ID (or test digest/revision); request confirmation is keyed by request ID/status. Final smoke repeats this behavior below.

## Final browser and route evidence

Using a separate Chrome verification tab and production `next start` bound only to `127.0.0.1:3147`, with provider variables cleared:

- Fictional account identity/source review and confirmed local draft creation passed. No live identity was used or verified by this simulation.
- Owner acceptance and exact-menu approval were required before staging. A competing edit blocked the stale plan. Refreshing that preview reset the checkbox to **unchecked** and staging to **disabled**; fresh approval then staged only the browser copy.
- A renamed item kept `coffee-001-12oz`; an omitted item remained visible with its original `coffee-002-12oz`, availability and price. The preview reported 1 update and 1 retained item, with no additions or deletion.
- Request progress showed exact item UUID/current name, before/after, durable request ID, readable history, pending notification retry and the warning that provider acceptance is not assistant receipt. Completion without a checkbox did not proceed. Checked completion and separate checked rollback simulations passed.
- 320px viewport: usable document width 305px; document scroll width 305px; 0 overflowing controls. 390px viewport: usable document width 375px (390px without a scrollbar); matching scroll width; 0 overflowing controls. No captured warning/error console entries. Refresh reset the fixture.
- `GET /pilot/accounts` with loopback Host: 200. Non-loopback Host `example.invalid`: 404. Disabled `/owner/enrollment/<synthetic UUID>`: 404. Unconfigured `/customers/new`: gated response with no account form. `/owner/bodega/requests`: sign-in guidance pointing to the existing Bodega billing login, with no private data.
- Browser viewport reset, owned test tab closed and loopback server stopped. No other tabs/worktrees/branches were used.

Screenshots are synthetic data only:

- [Account setup, 390px](OWNER_PORTAL_PREVIEW_20261017/owner-account-390-start.jpg)
- [Before/after and retained item, 390px](OWNER_PORTAL_PREVIEW_20261017/owner-account-390-import.jpg)
- [Narrow import preview, 320px](OWNER_PORTAL_PREVIEW_20261017/owner-account-320-import.jpg)
- [Owner request tracking, 390px](OWNER_PORTAL_PREVIEW_20261017/owner-account-390-request.jpg)
- [Explicit test rollback result, 390px](OWNER_PORTAL_PREVIEW_20261017/owner-account-390-rollback.jpg)

No previous version of these new routes existed for a like-for-like visual comparison. New-route states above were compared at fixed widths; existing pages received only one navigation link each. Full-page screenshot capture initially timed out; normal viewport capture succeeded. Physical touch devices and Safari were not tested.

## Reproduction

From `APP/web`, using existing installed dependencies:

```powershell
node --import tsx scripts/account-import-selftest.ts
node --import tsx scripts/account-actions-selftest.ts
node scripts/account-staging-db-selftest.mjs
node scripts/account-queue-compatibility-selftest.mjs
npm run build -- --webpack
```

Main deliverable: [OWNER_ACCOUNT_ONBOARDING_20261017.md](OWNER_ACCOUNT_ONBOARDING_20261017.md). Older audit build failures are historical; `388fa45` was subsequently built successfully. This task does not rely on any traffic/mail worktree's build, browser tab, branch or deployment.
