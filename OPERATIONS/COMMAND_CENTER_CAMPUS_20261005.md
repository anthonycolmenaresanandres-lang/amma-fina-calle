# Command Center campus - local review

## Scope and authority
Anthony confirmed /command-center and requested the reference style. Local branch `codex/command-center-campus-20261005` was initially based on stale local main `b7317440de2edfca85cad12eda80b7b09a766257` and is now rebased onto freshly verified `origin/main 144aa513633227b153432eb2687e21647ba96554`. Worktree: `C:\dev\amma\worktrees\command-center-campus-20261005`.

Inspected actual Library reference `libfile_674895bdfb608191a2a621706e31c9d0`. Direction: bright miniature cobalt campus, yellow equipment, trees, roads, quiet white navigation, floating directory facts, right-side inspector. The social frame in the reference is excluded.

## Implementation
- Five selectable places: Sales, Client Operations, Content Studio, Product Lab, Infrastructure.
- Lightweight deterministic SVG illustration; React owns selection, search, camera and inspector. No render loop, generated imagery, gameplay backend, fictional activity, XP, or new service.
- All 54 original registry destinations preserved exactly once; existing authenticated /customers added. Internal links preserve destination authorization and disable prefetch. Original route and noindex metadata retained. No new authentication claims or access rules.
- Global search, empty state, full list alternative, Tab/arrow/Home/End building navigation, visible focus, zoom/reset and mouse background drag. Mobile department strip and inspector anchor; 320 and 390 px verified. No ambient animation; reduced motion honored.
- Static/manual directory and unavailable live metrics explicitly labeled. Lead Arcade fictional starter pack and manual events labeled; no imported lead or customer data.
- Search, selected department and camera remain local UI state and reset on reload.

## Verification
- Scoped ESLint: PASS for all five touched TS/TSX sources plus registry-preservation self-test.
- Scoped TypeScript: PASS; `review/tsconfig.command-center.json` extends the existing application config and includes touched Command Center sources and self-test, excluding unrelated generated route validators.
- Registry self-test: PASS. Run from APP/web: `node node_modules/tsx/dist/cli.mjs scripts/command-center-selftest.ts`.
- Real Chrome CDP interactions: 18 PASS, zero browser exceptions. Building click, arrow focus/selection, search and empty state, all 55 list links, external target/rel behavior, zoom/reset, noindex, reduced motion, mobile selection and no horizontal overflow at 1440/390/320.
- Touched-file visual audit against current Web Interface Guidelines: keyboard equivalents for decorative SVG clicks; labeled controls; focus replacement for search; semantic links/buttons; long text wrapping; reduced motion; list content visibility; touch alternatives. No blocking finding in the touched UI.
- Same-viewport before/after: 1440 x 1000. Mobile world captures: 390 x 844 and 320 x 844; separate client inspector and search/list captures. Final desktop preview hides only Next development chrome and clears incidental focus.
- `git diff --check`: PASS.
- Reconciled production build: PASS, `npm.cmd run build -- --webpack`, exit 0. Bundle compilation, full TypeScript validation, static page generation (45/45), optimization and traces all complete. Both billing helper export fixes from merged PR #309 are preserved. Full output: `review/reconciled-build.log`. The initial failure was on stale local main b731744 and is superseded by this result. Webpack remains the local supported build path because Turbopack rejects the reused dependency junction; no app configuration was changed.

## Deliverables
Local loopback preview: http://127.0.0.1:3117/command-center (Next dev --webpack). Existing installed node_modules is reused via a junction to the main worktree; dependency manifests unchanged.

Screenshot: `review/after-desktop.png`.
Library preview: `libfile_efd432b6e96881919430c11fbe8ff6d5` (image, version 0); filename `after-desktop.png`.
Evidence: `review/before-desktop.png`, `review/after-mobile-390.png`, `review/after-mobile-320.png`, `review/mobile-inspector.png`, `review/search-desktop.png`, `review/list-desktop.png`, `review/interaction-results.json`. Local review helpers/browser profile are untracked and excluded from the commit.

## Release boundary
No secrets, migrations, bank access, live customer actions, access grants, invitations, send, purchase, service provisioning, push, PR, merge, publish, or deploy. No Maracaibo or EscapeTheBomb files touched. Anthony can review the local campus and approve a later release separately. The billing export fixes from PR #309 are preserved; no current full-build blocker remains on the reconciled code.

## Current-main reconciliation
- Fresh fetch and subsequent `git ls-remote origin refs/heads/main` both confirm `144aa513633227b153432eb2687e21647ba96554` (PR #311).
- Original task HEAD: `7a473e4a0322fa9a83885d827b902ee5de94487a`. Rebased application-source commit tested by the successful full build: `a69f3ed2cb87db6f72990ccab1d4f477611203ed`. Final documentation-only amendment does not change application source.
- Conflicts were limited to CODEX_QUEUE.md and HANDOFF_LOG.md; retained every upstream entry and appended only this task's records.
- Exact source comparison against the original task commit is empty for all Command Center files and its self-test. Existing scoped lint, registry, keyboard, mobile and browser evidence therefore remains applicable; only the affected full build was repeated.
- Billing helpers, package manifests and all Maracaibo code match fresh origin/main exactly. No billing fix was redone or reverted, and no game file was edited by this task.

## Authorized release preparation
Fresh origin/main and production both remain at `144aa513633227b153432eb2687e21647ba96554`. GitHub reports no branch protection or rules on main; the agent will nevertheless require all reported exact-head CI/Vercel checks to succeed before merging and will use SHA matching, without admin override. Publish only the feature branch. Merge/deploy outcome is recorded in the release handoff after verification.
