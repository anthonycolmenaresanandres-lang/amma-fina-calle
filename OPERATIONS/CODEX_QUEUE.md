# Codex Queue — canonical live queue

## [x] 70 - Bodega launch notes, seven-day reward controls and Square-ready owner insights

**State:** IMPLEMENTED AND VERIFIED - REVIEW PR READY
**Authority:** Anthony approved the decision-complete plan and requested implementation on 2026-09-26.
**Base:** origin/main 8518155; branch codex/bodega-launch-guest-notes-square-20260926 in the existing isolated Bodega worktree.
**Scope:** Add a Bodega-branded guest-note footer with Fina Calle-only delivery until a Bodega recipient is configured; prepare an inactive five-per-day, seven-local-day reward window and official rules; create deterministic joint Instagram carousel/Story exports; add a disconnected, read-only Square catalog/owner-insights foundation for later credentials. Preserve current menu/game routes and no-save gameplay.
**Boundaries:** No Bodega email, Square credential, database migration application, reward activation, social publishing, external send, production merge or deployment. Square may not write to Square or auto-publish menu changes. Any later token is server-only and configured outside source control.
**Verify:** Guest-note failure honesty and accessibility, reward concurrency/window regressions, Square webhook signature/idempotency/deletion behavior, protected owner insights, deterministic export dimensions/copy, scoped ESLint, reward self-tests, production build, and responsive browser comparison before a review PR.
**Result:** Added the Bodega guest-note footer with honest delivery fallback, inactive five-per-day seven-day reward window and official terms, ten exact-size Instagram assets plus caption guide, and a protected disconnected Square read model/webhook/owner view. No Bodega email or credential is committed; both migrations remain unapplied and the campaign remains off. Targeted ESLint, launch/reward self-tests, local endpoint checks, production webpack build and browser review pass. Square implementation matches the official 2026-09-16 Catalog and webhook signature contracts.

## [ ] 64 - Release Bodega public owner desk only

Authority: Anthony requested "merge owner portal I want to see it live" on 2026-09-25. Scoped push/PR/merge and normal production deployment authorized.
Scope: public read-only /owner/bodega and menu QR download only, isolated from unreleased game/reward work. Existing brand/layout preserved. No reward API, migration, activation, staff access grants, Square or domain changes. Claims visibly pending; staff workflow labeled future, no broken redemption link.
Verify: scoped lint, production build, owner regression tests, mobile/desktop review and exact-head CI before merge; verify production revision and live route after deployment.

## [ ] 50 - Bodega photo-sourced menu and authorized merge

**State:** VERIFIED - AUTHORIZED MERGE
**Authority:** Anthony: "Execute merge" after reviewing the five-photo menu transcription and implementation plan, 2026-09-25.
**Scope:** Bodega menu content, size prices, modifiers, category navigation and responsive rendering; source reconciliation and verification. Preserve game, original artwork, URLs, noindex and preview status.
**Source:** 37587.jpg classics, 37592.jpg non-coffee, 37595.jpg bites, 37590.jpg fall/partial signatures, 37598.jpg bakery. Missing prices remain null; incomplete recipes and pastry names are not invented. Older unverified candidates are retained only in the internal source record.
**Workspace:** C:/dev/amma/worktrees/bodega-photo-menu-20260925, branch codex/bodega-photo-menu-20260925 from 2b26bab.
**Verify:** Photo reconciliation, missing-size/price regression checks, scoped lint, build, mobile/desktop browser review, game/menu link smoke and exact-head PR checks before scoped merge.
**Result:** Application head 1870a8f passes scoped ESLint, production build/TypeScript, and 56 browser assertions over 320/390/768/1440 viewports. All photo price cells, espresso prices, extras, item counts, missing prices, images, noindex, anchors and overflow checked. Category clicks clear sticky navigation; keyboard skip has visible focus and reaches Classics. Play starts existing game; Back then Menu returns and removes canvas. No page errors observed. Before/after screenshots reviewed. GitHub web and Vercel preview checks green; PR257. Evidence: C:/dev/amma/evidence/bodega-photo-menu-20260925. No game code changed; full gameplay not re-certified. Final documentation head must pass PR checks before merge.

## [ ] 49 - Bodega Fall Rush replacement and scoped live release

**State:** IMPLEMENTATION COMPLETE - VERIFIED FOR AUTHORIZED MERGE
**Authority:** Anthony on 2026-09-24: create a unique fall game for Bodega, replace the current game, use Spanish latte and two selected items, and merge live.
**Scope:** Bodega game route, its menu invitation, isolated game module and task records. Preserve existing /bodega-sessions-review and /demo/bodega URLs, noindex and owner-review status; no other clients, access, billing, database or customer sends.
**Content:** Spanish Latte selected by Anthony. Canela Love and Coffee Cinnamon Muffin from existing menu-draft.ts and current public listings; owner availability remains unverified. No prices, recipes or redemption claims.
**Design:** Fall Rush café order tickets; burgundy #5b202c, ink #201d24, gold #f0c34f, parchment #fff2d8, maple #d37a45, muted sage #a8c8a0. Condensed sans display, Geist body, mono ticket details; café counter with original primitive cups/muffin and bounded falling leaves. 45-second order assembly, streaks/golden-hour bonus, pause and untimed practice. DOM controls remain playable if optional Phaser visuals fail.
**Verification:** Pure scoring/deadline/pause tests, targeted lint, production build, browser gameplay/replay and responsive review, PR checks, SHA-matched production deployment.
**Verified:** Production build/TypeScript, targeted lint and 11 focused rule tests pass (including review regressions). Hosted preview dpl_3TjwPGyyGDydT2pbtTsfD3Sbrio2 is Ready. Browser play confirmed initial sequence, 520 points/four perfect orders, Golden Hour +20 item scoring, pause/resume, keyboard input, replay reset, scenery canvas and logo load, order cooling, 45-second finish and saved device best. No app errors observed; unrelated browser-extension/Vercel-login messages excluded. Desktop viewport verified; narrow CSS breakpoints inspected in source, but the browser cannot emulate phone sizes in this session. GitHub web and Vercel checks pass for application head9695d96. PR243 is cleanly mergeable. Merge/live explicitly authorized; verify production SHA and routes after merge.
**Workspace:** Isolated cloud scratch checkout; Windows workstation paths are not available in this runtime. Existing Windows clone remains untouched.

## [ ] 48 - Simpler consulting homepage with a serious comic-book identity

**State:** IN PROGRESS - IMPLEMENTATION AND SCOPED RELEASE AUTHORIZED
**Authority:** Anthony requested a much simpler, cooler page retaining a comic-book but not silly theme, and said continue after restoring filesystem access on 2026-09-17. This iterates the same redesign under his existing explicit merge/live authorization.
**Scope:** Homepage presentation, concise copy and task documentation in isolated branch codex/consulting-comic-20260917. Preserve original logo/art, LandingMotion and supporting motion styles, visible mobile explanations, verified Live/Demo labels, consultation/support split and secondary restaurant offer starting at $199/month/location; consulting/custom work requires separate written scope.
**Plan:** Barlow Condensed 800 display with Geist body; Ink #07090b, Graphite #0d1115, Gold #c8aa72, Paper #f0ece4, Muted #b9c0c6. One bold cover composition with restrained halftone, real proof, three process steps and compact restaurant strip. Remove duplicate service explanations and decorative microcopy. No new artwork or capability claims.
**PASS:** Inspected 320/390/768/1440 layouts, keyboard/focus, reduced-motion/no-JavaScript, preserved forward/reverse morph, working links, targeted lint/build, independent review, exact-head checks and live deployment verification.
**STOP:** Unexpected base/diff, failed checks or inaccessible verification. No backend, owner/menu/game behavior, access, payment, database, customer send or held-route changes.

## [x] 47 - Consulting-first Fina Calle redesign and approved release

**State:** DONE - MERGED AND VERIFIED LIVE
**Authority:** Anthony requested the consulting-first redesign and on 2026-09-16 instructed: "Do not wait execute the changes and merge I want to see the changes live". Use refreshed origin/main 30fe59e; historical release statuses below are stale, not outstanding implementation orders. GitHub confirms PR235 merged at 30fe59e and PR234 at 306fcf4; no claim is made about their unverified business activation states.
**Scope:** Isolated codex/consulting-first-20260916 worktree. Public homepage, consultation/contact intake and consistent restaurant offer copy; task evidence and handoffs. Preserve original logo, black/gold identity and LandingMotion, separate support, and label verified live work versus demos. Restaurant offer starts at $199/month/location; consulting/custom work requires separate written scope.
**Boundaries:** No owner/auth/menu/game behavior, database, payments, access, secrets, external customer messages or invented claims. Approved push/PR/merge/deployment only for this reviewed redesign.
**PASS:** Responsive 320/390/768/1440 layouts, keyboard/focus, reduced-motion/static paths, preserved crest-to-proof effect, links and intercepted form failures; targeted lint, production build, independent review, exact-head CI and live revision verification.
**STOP:** Stop before merging on failed checks, unrelated diff, changed approval scope, or unresolved release-state divergence.
**Result:** PR236 merged at b82c908 under exact reviewed head02baabb. Final production build/TypeScript, targeted lint, independent review and234 production-browser checks pass. GitHub preview CI35144646923 and production CI35145216750 pass. Vercel production dpl_8TsUrGchLUyiYfumz5o8eEJSaJ7J is Ready, SHA-matched and aliases finacalleos.com. Live homepage/contact/consultation/restaurant routes200; held owner-preview/Las Palmas owner/menu404; Colattao owner200. Seventeen live read-only browser checks pass:390/1440 consulting hero/no overflow, original crest and forward/reverse morph, support route, consultation fields and zero uncaught errors. No backend/access/payment operation or real inquiry sent. Evidence: C:/Dev/amma/evidence/consulting-first-20260916/REVIEW.md.

## [x] 46 - Gran Patron Princess Anne menu and game

**State:** DONE - VERIFIED REVIEW PREVIEW; PRODUCTION MERGE HELD
**Authority:** Anthony selected granpatronvb.com/food-menu, approved the researched Las Palmas-based plan, and said Execute on 2026-09-16. This scoped directive takes priority over historical queue37, whose implementation is already in production base306fcf4.
**Scope:** Verified complete source menu, original brand assets, premium menu and shared five-shot game with two Gran Patron characters; isolated branch codex/gran-patron-menu-game.
**Plan:** GRAN_PATRON_BUILD_SPEC_20260916.md. Implemented; review and screenshots in GRAN_PATRON_REVIEW_20260916.md.
**Result:** PR235 open; application head3799afa.135 self-tests and61 production-browser checks pass, along with scoped lint, final production build/TypeScript, GitHub web CI and Ready Vercel preview dpl_nZjLGhddS7wCmStaNfYP5sTTUT3M. Hosted visual access hits existing Vercel SSO; local production preview at localhost:3159 is verified. No production merge.
**PASS:** Source reconciliation, both characters and input modes, responsive menu/search/game, Las Palmas regression, lint/build and review evidence.
**STOP:** Production merge requires Anthony's separate approval. No database, owner access, held routes, payments, customer sends or unrelated client changes.


## [ ] 37 - Premium owner portal, payment safeguards and standard owner kit

**State:** IN PROGRESS - SCOPED OWNER RELEASE AUTHORIZED
**Authority:** Anthony requests live owner changes for Colattao, Las Palmas and A.J. Gator's plus standard manual and printed owner QR/protocol. This current directive takes priority over inherited completed-release wording below; do not touch Colattao guest experience.
**Scope:** Premium shared owner presentation, honest setup-pending front doors for unprovisioned known clients, existing Stripe payment/enrollment safety, generic guide, manual and Colattao owner-sign-in print. Preserve tenant auth and connected-menu flags; Colattao menu remains request-based.
**PASS:** Reviewed scoped diff; meaningful payment readiness/idempotency/retry tests; owner tests/lint/build; inspected320/390/1440 states; deterministic final PDF QR decode; green exact-head CI and correct production deployment; live public owner/guide and unchanged Las Palmas ordering checks.
**STOP:** No access grants, credentials, database migrations, plan/config mutations, payment-method entry, charges/enrollment, client send, print order, held /m or /owner-preview publication, or Colattao guest changes. Account setup and physical print proof remain separate gates. Do not claim authenticated live payment success from public route checks or synthetic tests.
**Base:** origin/main a08c51a3ad8629a4e900a010dc61a33c7a363ed0; worktree C:/Dev/amma/worktrees/owner-standard-premium-20260914.

## [x] 36 - Las Palmas existing online-ordering link

**State:** VERIFIED LOCAL - SCOPED RELEASE HANDED TO LEAD AGENT
**Authority:** Anthony requested incorporating Las Palmas's existing order-online feature into its live page on 2026-09-14. This lane contains only the ordering invitation and verification; the lead agent owns release.
**Scope:** One brass Western pickup CTA at the permanent /demo/las-palmas QR, linking to the official-site-listed MenuChow storefront. Preserve menu data, game, footer, backend and other clients.
**Evidence:** https://www.laspalmas2mexicanvb.com/ links https://orders.menuchow.com/ordering/laspalmas2. Browser pickup-location screen verifies 1009 Lynnhaven Mall Loop, Virginia Beach, VA 23452. Provider determines opening hours, availability and checkout.
**PASS:** Inspected matching before/after mobile captures, 320/390/1440 overflow/focus/sticky checks, actual external navigation, targeted lint and production build. No order, cart, sign-in or feedback submission.
**Result:** One scoped page/CSS change; production build/TypeScript and targeted ESLint pass. All 39 dishes retained, no horizontal overflow at 320/390/1440, dark keyboard focus visible, Enter opens the verified MenuChow location in a new tab, game remains top 0px through footer. Evidence: C:/Dev/amma/evidence/las-palmas-order-online-20260914. Local server: http://127.0.0.1:3142/demo/las-palmas. No release performed by implementation agent.

## [ ] 32 - Cantina Jumbotron scoreboard and approved release

**State:** IN PROGRESS - IMPLEMENTATION / RELEASE AUTHORIZED
**Authority:** Anthony: change it and make it live (2026-09-13). Deliberate Las Palmas host presentation upgrade supersedes the fixed-scoreboard restriction only for this approved scope; other skins/default shell stay unchanged.
**Scope:** Dimensional cartoon scoreboard, unambiguous goals/shot counters, five outcome markers, non-flashing celebrations, uncluttered controls/instructions. Copied match presentation callback only; scoring/input/physics/assets/39 dishes/QR/account/backend/dependencies frozen.
**PASS:** Targeted state/isolation tests, lint/build, inspected mobile and fallback screenshots, live real shots/replay, unchanged legacy game and protected routes, exact-head green CI + Ready production revision/alias.
**STOP:** Unexpected source/head/deployment, failing safety gate, unrelated brand/data/access change. No bypass, secrets, billing, real feedback, client send or printing. Prior production48f8648 is rollback reference.

## [x] 31 - Release approved Las Palmas game hub at permanent QR

**State:** DONE - MERGED AND VERIFIED LIVE
**Result:** PR231 merged as48f86486474384873f752df69d09f0bf6c725cc9; Vercel dpl_DVvDBboEDhUVMfMeZfESGb4qCUrE READY and owns finacalleos.com. Production CI34778738770 passed. Exact QR200/zero redirects,39 dishes, persistent invitation/footer, dedicated lobby and real shots with both characters verified live; mobile screenshots inspected. Held Las Palmas owner/menu/pilot and owner-preview remain404. No runtime errors returned in the brief post-release query. No data/access/billing/print change. Documentation closeout remains local only.
**Authority:** Anthony replied `yes` on2026-09-13 to the explicit request to run release checks and make queue30 live at the existing QR. This authorizes scoped commit/push/PR/merge and the established Vercel automatic deployment; it supersedes queue30's local-only publication stop for this implementation only.
**Scope/base:** Release reviewed application commit `da74082`, plus prior Western documentation closeout and these release records, from `codex/las-palmas-game-hub-20260913`. Remote main reverified `d381e0912038145cc91aa2ceeb31e305cdaf4ba9`; worktree clean. Shared engine/rules/legacy route, all39 menu items, owner/account/billing/backend/dependencies unchanged.
**PASS:** Scoped diff and local evidence reviewed; targeted tests/lint refreshed; exact-head PR CI/Vercel checks green; expected-head squash merge; production Ready deployment ownsfinacalleos.com at merge SHA; live exact QR/no redirects, persistent invitation/footer, dedicated lobby, both real characters and representative held-route checks verified.
**STOP:** Unexpected diff/base/head, failed required check, unsafe fallback or deployment mismatch. No secrets, access, account/menu activation, database/migration, billing/charges, real feedback, client send or QR/print changes. Never bypass branch protection.
**Rollback:** Preserve last verified production deployment `dpl_BWK7inXv8eCxKYwfgogBaRLQ7eCZ` (d381e09); report a release fault and use only the scoped prior presentation revision if rollback is needed. Never weaken data or access gates.

## [x] 30 - Las Palmas persistent game invitation and dedicated character lobby

**State:** DONE - VERIFIED LOCAL PREVIEW; SUBSEQUENTLY RELEASED UNDER ITEM31
**Authority:** Anthony requested research, strategy, plan, then implementation of a persistent top game invitation, Colattao-style Fina Calle footer, and a clean separate character-selection game landing on 2026-09-13.
**Base:** Existing clean Western worktree, new branch `codex/las-palmas-game-hub-20260913` from `2a3ec8a` (documentation closeout atop production `d381e09`). Preserve prior closeout and unrelated canonical edits.
**Plan:** See `OPERATIONS/LAS_PALMAS_GAME_HUB_20260913.md`. Reuse the two existing playable mascots and frozen Phaser engine; no new dependency, generated branding, or backend.
**PASS:** Same permanent QR and 39 dishes; persistent game/menu navigation without obscured focus; linked original Fina Calle emblem; separate fast lobby with both real character selections; existing levels/input/fallback/replay work; targeted tests/lint, production build, mobile/desktop screenshots and legacy game smoke pass.
**STOP:** Local preview only. No push/PR/merge/production, database, billing, access, menu activation, real form send, asset regeneration or QR reprint. Stop for conflicting source state or failed safety gates.
**Result:** Persistent game ticket, direct original Fina Calle emblem/footer, and /play/las-palmas two-character lobby implemented. Final production build/TypeScript, scoped lint,114 targeted checks and36 dedicated browser assertions pass.320/390/1440 screenshots inspected; all six character/difficulty combinations, real tap/swipe, five-shot result/replay, keyboard selection/return, loading failure/retry and missing-art fallback verified. Legacy compatibility cases verified across runs, with the missing390px Pro case passing isolated real-shot/no-error/no-overflow checks; consolidated harness connection failures remain recorded, not relabeled. No shared engine, menu data, dependencies or private/account routes changed.
**Next:** Released under item31. Live menu https://finacalleos.com/demo/las-palmas and game https://finacalleos.com/play/las-palmas. Local review server retained; no further release approval required for this completed scope.

## [x] 29 - Las Palmas Western landing at permanent QR

**State:** DONE - MERGED AND LIVE; RESTAURANT MENU APPROVAL STILL HELD
**Authority:** Anthony selected first Western design with palms and second accordion, requested preserving menu items and public-source checking, and explicitly requested publishing at the current QR on 2026-09-13.
**Scope:** Only Las Palmas presentation, static preview price qualifiers, tests and release evidence. Preserve all 39 dishes, original logo/food, exact `/demo/las-palmas` route, game, approval notices and connected-menu behavior. On-page menu CTA, separate full PDF, native readable dropdowns, safe general menu (no fixed Table 1 link), clear Fina Calle feedback recipient.
**PASS:** 320/390px and desktop screenshots inspected against selected visual;39 dishes and protected routes verified; menu/category/keyboard interactions and feedback states checked without live submissions; targeted ESLint/tests, production build and diff checks pass; exact PR head green before approved release; live QR response and rendering verified after.
**STOP:** Any failing gate, unexpected diff or source conflict. No access, owner/service activation, billing, migration, printing, send, unsupported restaurant approval or unrelated production work.
**Result:** PR #230 squash-merged under head lock8d133569dc9995ed124886faddbbc887c974344f, yielding application revisiond381e0912038145cc91aa2ceeb31e305cdaf4ba9. Local build/TypeScript, targeted ESLint,149 checks,320/390/1440 visual QA and intercepted feedback states passed. GitHub preview and production CI passed. Production deploymentdpl_BWK7inXv8eCxKYwfgogBaRLQ7eCZ is Ready and ownsfinacalleos.com at that revision. Exact QR returns200 with zero redirects,39 dishes, new visual/font/canonical; live dropdown/photo and keyboard checked, no page overflow or browser errors. Game and Colattao owner200; Las Palmas owner, held/m, owner-preview and local pilot404. No access/billing/database/activation or real customer submission. No QR artwork changed or reprint needed for this URL-preserving release.
**Next:** Anthony/restaurant confirmation of the current menu/location and later separately approved onboarding remain outside this presentation release. Post-release closeout is a local documentation-only commit; separate unmerged print/archive work remains in las-palmas-table-tent-20260912.

## [x] 26 - Add owner account information and automatic-payment presentation, then release

**State:** DONE - CODE MERGED AND PRODUCTION VERIFIED; CLIENT ACTIVATION HELD
**Authority:** Anthony explicitly requested merge after the Las Palmas portal includes account information and the automatic-payment option used for Colattao. This authorizes the scoped item 25 implementation plus this follow-up to be committed, pushed, reviewed and merged with the existing automatic production deployment, after verification. It does not authorize client provisioning or payment enrollment.
**Base:** Continue `codex/las-palmas-pilot-20260911`; fetched `origin/main` remains `2afaf67`. Preserve canonical unrelated edits.
**Plan:** Reuse shared Colattao billing and account schema, expose only tenant-authorized account/contact/address fields, clarify optional automatic-payment enrollment and management, and expand the local sample preview with pending account/billing information. Do not copy Colattao identity, prices or schedules to Las Palmas. Then test, inspect mobile UI, require green exact-head CI/Vercel checks, merge and verify the live revision/routes.
**PASS:** Account fields stay behind existing authorization/reset gates; unknown fields are visibly pending/unavailable; automatic-payment controls reuse existing server-side tenant mapping and stay inert in previews; menu/game regressions, scoped lint, production build, screenshots and release checks pass. KPI: one approved deliverable passes its verification gate; Delivery Owner; initial implementation/review time-box 90 minutes, release checks may extend it.
**STOP:** No secrets, access grants, client database writes, migrations, payment-method entry, Checkout completion, subscription activation, charges, customer contact, printing or unrelated release. Las Palmas location, approved menu, account recipient and commercial terms remain unconfirmed; production menu connection stays off. Stop on unexpected diff/head/base, failed required checks, access/billing leak or deployment mismatch.

**Result:** PR #228 merged under exact-head lock on `c95e46f`; application revision `6a01a4b082fe3ca5b13b542c6f3cea2d23ad6c95` exactly matches the reviewed tree. Tenant-authorized account/contact/address display and optional Stripe automatic-payment presentation are shared; payment actions/webhook/data/config remain unchanged. Colattao keeps Request for its separately hosted menu. All 77 targeted checks, owner suites, lint, local production build, six refreshed mobile game cases and account/payment screenshots pass. GitHub CI, Vercel preview and production CI pass. Hosted preview visual access was SSO-blocked, not certified. Production deployment `dpl_3hhpgXd1a5VNPhY6CcHrTRVyfPbX` is Ready and owns finacalleos.com at the merge revision. Live 320/390 game captures and Colattao sign-in inspected; real shot advances, no browser errors/overflow; private owner account data/actions absent before sign-in. Root/demo/Colattao owner/menu 200; local-only pilot and held owner-preview 404; Las Palmas owner remains 404/unprovisioned. No runtime errors returned in the brief post-merge observation window. No client provisioning, menu activation, billing enrollment or charge occurred. Only documentation closeout follows this verified code release.

## [x] 25 - Prepare Las Palmas pilot, self-service menu and Mexico-themed ball

**State:** DONE - LOCAL IMPLEMENTATION; PILOT/ACCOUNT ACTIVATION HELD
**Authority:** Anthony requested a Las Palmas pilot, owner portal, clearer self-service menu benefits, a better/lower-cost menu-update workflow, and a Mexican soccer ball in the game on 2026-09-11.
**Base:** `codex/las-palmas-pilot-20260911`, clean sibling worktree from `origin/main` `2afaf676b7a3e4ae5e2d5d577127fba8fc745492`. Canonical dirty edits and previous preview are preserved.
**Plan:** (1) Prepare one reversible, measurable pilot and truthful benefit copy; compare existing portal plus stable direct QR with current alternatives. (2) Reuse authorized owner write rails, add clear direct-edit controls, and prepare the correct Las Palmas tenant/menu connection without granting access or activating public-source prices. (3) Add an original Mexico green/white/red ball presentation, preserving gameplay and other skins.
**PASS:** Targeted validation/auth/adapter tests, draft-only onboarding checks, 320px/390px UI and game screenshots, fallback/input regression, scoped lint and final production build. Record what is built versus what is live and client-approved.
**STOP:** Venue, confirmed menu, owner identity/access and pilot commercial terms remain unverified until supplied. No secrets, access grants, database changes/migrations, customer contact, QR printing/publication, purchase, API activation, push, PR, merge or deployment. Prior release authorization covered items 22/23 only. Do not publish held `/m` or `/owner-preview` surfaces.

**Result:** Prepared the 14-day pilot, approval-only intake/checks and truthful self-service benefit copy. Added direct existing-item review/save controls on existing authenticated audited rails, default-off Las Palmas menu connection with unavailable-on-error behavior, and a local-only sample workspace. Original green/white/red ball replaces only the Las Palmas primitive ball; gameplay and other skins are unchanged. All 64 new checks, owner-app/request suites, scoped lint, TypeScript and Webpack production build pass; six keeper/mobile cases, real normal/fallback shots and inspected 320/390 editor proofs pass. No live account or authenticated database write was tested or created. Default Turbopack local build hit the shared dependency junction root restriction; normal release CI remains required. No dependencies/configuration, database, held `/m` route, `/owner-preview`, access or production were changed. Local review: `http://127.0.0.1:3131/pilot/las-palmas`. Implementation is uncommitted on the isolated branch; launch awaits the explicit gates above.

## [x] 24 - Release the approved Las Palmas game and workflow improvements

**State:** DONE - MERGED AND PRODUCTION VERIFIED
**Authority:** Anthony explicitly directed on 2026-09-11: `great merge all of the changes including the game`. This authorizes committing, pushing, opening a PR, merging and the existing automatic Vercel production deployment for completed items 22 and 23; it supersedes their local-only release stops for this exact scope.
**Branch/base:** `codex/las-palmas-goal-keeper-20260910`; fetched `origin/main` still equals `26dd0426c438189efbd8bf8f76629d32031b9d79`.
**Scope:** The reviewed Las Palmas presentation/keeper changes, workflow scripts and shared routing/licensing documentation, plus release records. Preserve unrelated canonical-checkout edits. No API activation, spending, credentials, access, database, billing, route migration or additional feature work.
**PASS:** Full scoped diff reviewed; local targeted checks and mobile smoke pass; exact PR head has passing CI/Vercel checks; merge under an expected-head lock; resulting main revision reaches a Ready production deployment with `finacalleos.com`; live game and representative protected-route checks pass.
**STOP:** Stop on unexpected base/head/diff, check failure, deployment mismatch or protected-surface regression. Do not bypass branch protections or auto-remediate unrelated failures.

**Result:** PR #226 merged with exact-head protection; application release revision `1e4d78d982928d49225b7e27494c25b08f75a990`. Eighteen workflow unit/guard cases, six fresh local mobile checks, scoped ESLint, GitHub CI and Vercel preview passed. Production deployment `dpl_JCDWm54TwcpMfBkgzXukJkNoeqZ7` reached Ready and owns `finacalleos.com`. Live 390px/320px screenshots inspected, actual top-left tap scored a goal, one canvas and no horizontal overflow/page errors. Representative routes returned expected 200/404 statuses; no game-route runtime errors returned in the short post-merge window. Game remains labeled pending client approval/demo only. No unrelated changes, API activation, spending, access or package-manager migration. Subsequent release closeout is documentation only.

## [x] 23 - Implement prudent workflow-efficiency improvements

**State:** DONE - LOCAL TOOLING; ADOPTION GATES RECORDED
**Authority:** Anthony's direct 2026-09-10 request: `do all changes that you would find prudent and benefitial`, following the skills/process cost review. This authorizes the scoped local queue addition and implementation.
**Branch:** Continue `codex/las-palmas-goal-keeper-20260910`; preserve its completed game changes and running preview.
**Scope:** Shared Codex/Claude skill-routing guidance, reusable local-only browser smoke checks, isolated npm/pnpm comparison, corrected media licensing guidance, and an evidence-based optimization record.
**PASS:** Guidance stays consistent without removing approval gates; smoke checks pass and reject remote targets; installation comparison records versions, conditions, timings and compatibility limits; no unmeasured savings claims.
**STOP:** No secrets, access changes, API calls, spending, plugin uninstall, production/CI package-manager switch, push, PR, deploy, merge or customer contact. Batch integration remains held pending credential, data and budget decisions.

**Result:** Codex/Claude share one routing policy; read-only mirror audit found 41 files and 20 identical duplicate-name groups, with no drift; four Node tests and 14 PowerShell guard cases pass. Local browser verifier passes all 3 keeper selections at 320x740 and 390x844, with screenshots inspected and no page errors/overflow. Remotion licensing and historical installation claims corrected. Install pilot recorded npm 160.46s cold / 179.23s warm, then was interrupted before a pnpm install result after responsiveness degraded; reruns now require explicit `-RunPilot`. npm remains unchanged; source package/lock hashes match. Batch integration remains held, not enabled. Commands and evidence limits are in `OPERATIONS/WORKFLOW_EFFICIENCY.md`. No production or external release performed.

## [x] 22 - Ground the Las Palmas goal and add a pink-shirt keeper

**State:** DONE - LOCAL REVIEW
**Authority:** Anthony directly requested this task on 2026-09-10, authorizing the scoped goal-layout and fictional-human-character change beyond older campaign defaults.
**Branch base:** `codex/las-palmas-goal-keeper-20260910` from `origin/main` `26dd042`.
**Scope:** Las Palmas presentation configuration; shared geometry/renderer seams only as needed to align posts, aim targets, keeper, and ball; original fictional dark-skinned keeper with short natural hair and pink shirt. Preserve scoring/AI, other skins, routes, existing brand assets, and protected app surfaces.
**PASS:** Posts and feet sit on grass; visible ball travels to the moved targets; tap/swipe, all levels, resizing and missing-asset fallback work; before/after mobile captures, targeted lint/types and production build pass.
**STOP:** No push, deploy, merge, production publication, paid generation, or external upload.

**Result:** Goal frame/keeper/aim targets share the new ground line; fiesta grass remains anchored on resize; the ball starts clear of both kickers; the original fictional dark-skinned keeper uses a pink shirt on all levels. High dives and saved-ball contact use the new character's placement. Passed all six tap targets across three levels, six swipe targets/live arrow, controlled goal/save/miss outcomes, resize during flight, 320px/390px/landscape visuals, missing-asset fallback, 120 cross-skin geometry checks, targeted ESLint, TypeScript and full production build. Built local preview: `http://127.0.0.1:3127/penalty-shootout?skin=laspalmas` (PID 13528). Final 390x844 screenshot inspected; one canvas, no runtime errors or horizontal overflow; 90 frames in 1490 ms. No production release performed.

_Claude writes; Codex executes. This is the only live queue._

Canonical repo: `C:\Dev\amma\amma-fina-calle`
App: `APP/web`
Production branch: `main` (human approval required)
Live handoff log: `OPERATIONS/HANDOFF_LOG.md`
Superseded Desktop queue: `OPERATIONS/archive/desktop-20260710/CODEX_QUEUE.md`

## Revalidation gate — archived tasks only

The archived Desktop queue contains stale clone paths, a stale migration counter, and production/send steps that require human action. Claude must revalidate each item against the current canonical branch before restoring it as an actionable task.

Required revalidation fields:

- exact canonical paths and branch base;
- proposed migration filename unused, plus applied production state verified or explicitly unknown;
- whether the task crosses a secret, access, send, deploy, or production boundary;
- targeted PASS condition and explicit stop condition.

## Claude handoff template

````markdown
## [ ] N — short imperative title

**State:** READY | IN PROGRESS | DONE | BLOCKED
**Codex effort:** LOW | MEDIUM | HIGH
**Scope:** exact files/surfaces and explicit exclusions.
**Token-saving rule:** targeted reads; changed lines/new files only; final verification only.
**Why:** concise context.
**Exact prompt to paste:**
```text
Anthony, ...
PASS = ...
```
````

No task is live until it appears below this line with a current PASS condition.

## [x] 1 - Add secure owner billing and repair mobile sign-in

**State:** DONE
**Codex effort:** HIGH
**Authority:** Anthony explicitly directed Codex to own this implementation here on 2026-07-17, overriding the normal Claude-only queue-writing rule for this task.
**Branch base:** `codex/owner-billing`, created from `ops/data-center-docs` at `83a1e27`.
**Scope:** `APP/web/src/app/owner/[id]`, new server-only Stripe/billing modules, one Stripe webhook Route Handler, one unused Supabase migration after `0009`, Stripe dependency metadata, and targeted documentation. Existing menu, game, public `/m`, and production surfaces are excluded.
**Migration state:** `0010_owner_billing_subscriptions.sql` is unused locally. Applied production migration state is unknown; do not apply it.
**Boundaries:** local/test-mode code only. Do not enter secrets, apply migrations, configure bank access, deploy, merge, push, or touch production.
**Token-saving rule:** targeted reads; changed lines/new files only; final verification only.
**Why:** Owners need responsive sign-in, payment status, recurring billing enrollment, invoice recovery, and a safe hosted billing-management path.
**PASS:** Local code builds without Stripe/Supabase server secrets; owner actions re-authorize restaurant access; Checkout uses only a server-configured recurring price; Customer Portal uses only the server-side customer mapping; webhook verifies the raw-body signature and deduplicates events; billing UI exposes no Stripe identifiers; 320/390 px sign-in does not overflow; targeted lint and build pass.
**STOP:** Stop before secrets, live Stripe configuration, migration application, deployment, push, merge, or production access. Stop and report if current repo state conflicts with this scope.

## [x] 2 - Build the client ledger and owner-controlled team access

**State:** DONE
**Codex effort:** HIGH
**Authority:** Anthony continued the Codex-owned implementation and requested a way to identify every client, see what each pays, and onboard future employees.
**Branch base:** `codex/owner-billing` at `ba866e8`.
**Scope:** Upgrade `/customers` and `/customers/[id]`; add `/customers/team`; extend prepared migration `0010` with recurring price facts; add unused migration `0011_client_ledger_and_team_access.sql`; update existing Supabase magic-link admin auth. Public menu, owner editing, games, bank credentials, and production are excluded.
**Migration state:** `0011_client_ledger_and_team_access.sql` is unused locally and depends on prepared `0010`. Applied production state remains unknown; apply neither migration.
**Access rule:** New team members receive internal operations access only. Only the existing Anthony owner email is prepared to manage the team. No access is granted by Codex.
**Boundaries:** local code only. Do not add a live employee, send an invite, enter secrets, apply migrations, deploy, push, merge, or touch production.
**PASS:** Client ledger identifies each business/contact and displays plan, recurring amount/interval, payment status, invoice state, and renewal date; client detail shows owner-portal access route and allowed owner emails; team roster shows active staff; only a team manager can prepare add/deactivate actions; first-time allowlisted employees can request a magic link without email enumeration; server authorization is rechecked; targeted lint, type/build, and browser checks pass.
**STOP:** Stop before any live access change, invite/send, migration application, deployment, push, merge, credential entry, or production action.

## [x] 3 - Finalize owner billing with Stripe and Zelle reconciliation

**State:** DONE
**Codex effort:** HIGH
**Authority:** Anthony explicitly directed Codex to finish the owner portal, finalize the Stripe and Zelle integration, install the prescribed browser runner and useful supporting skills, and place the SOPs in Drive Documents.
**Branch base:** `codex/owner-billing` at `5d5bc33`.
**Scope:** Harden the prepared Stripe workflow; add an authenticated owner Zelle payment-reporting surface and an admin verification inbox; add one unused Supabase migration after `0011`; correct billing documentation; verify with the installed agent-browser; create one comprehensive AMMA SOP manual and import it into the Drive `Documents` folder. Public menu, games, bank credentials, automatic Zelle settlement, and production are excluded.
**Migration state:** `0012_zelle_payment_notices.sql` will be prepared locally and depends on unapplied migrations `0010` and `0011`. Applied production state remains unknown; apply none of them.
**Payment rule:** Stripe remains the authoritative recurring rail. Zelle is a manual Bank of America rail: an owner report remains `reported` until an authorized AMMA billing manager marks it `verified` or `rejected`. Mercury is not represented as Zelle-compatible.
**Boundaries:** local/test-mode code and Drive document creation only. Do not enter secrets, access bank accounts, apply migrations, change live Stripe/Zelle settings, deploy, push, merge, or touch production.
**PASS:** The owner portal securely displays server-configured Zelle instructions, records an owner report without marking the account paid, shows recent report status, and exposes billing-manager-only verification; Stripe records the invoice paid timestamp and rejects insecure production callback configuration; the billing runbook covers Stripe, Bank of America Zelle, Mercury, reconciliation, and activation; lint, type/build, security review, and browser fail-closed checks pass; the verified SOP manual is a native Google Doc inside Drive Documents.
**STOP:** Stop before secrets, bank login, live payment configuration, migration application, deployment, push, merge, or production access. Stop and report any repo conflict.

## [x] 4 - Reframe the Fina Calle public landing page

**State:** DONE
**Codex effort:** MEDIUM
**Authority:** Anthony explicitly directed Codex on 2026-07-19 to proceed with the approved landing-page redesign and make it feel expensive, intricate, innovative, calm, secure, and edgy without becoming scary.
**Branch base:** `codex/landing-premium-20260719`, created from current `origin/main` at `422352b` in `C:\Dev\amma\worktrees\landing-premium-20260719`.
**Scope:** Public root landing page, root metadata, one bespoke social-preview asset, and this task's operations log. Preserve all owner/customer/menu, billing, authentication, database, API, game-engine, `/conquest`, and production behavior.
**Boundaries:** Local branch, verification, push, and review PR only. Do not merge, deploy, publish, enter secrets, alter access, or touch production.
**Token-saving rule:** Read and change only the root landing surface, metadata, directly used public assets, and handoff records; run targeted lint plus one final production build.
**Why:** The current homepage is visually cinematic but communicates the offer weakly. The redesign must make local-business owners understand the offer, trust the proof, and request a build while preserving the Fina Calle identity.
**PASS:** The first viewport explains Fina Calle plainly and routes to a build request and verified work; Colattao proof and live modules are represented without future-feature claims; visual language is open/editorial, premium, calm, secure, and responsive; keyboard focus and reduced motion are respected; protected routes have no diff; targeted lint and the production build pass; a review PR is open.
**STOP:** Stop before merge, Vercel deployment, Sites hosting, production publish, or any change to protected routes, data, access, billing, or secrets.

## [x] 5 - Publish the approved Fina Calle landing redesign

**State:** DONE
**Codex effort:** LOW
**Authority:** Anthony explicitly approved the live production release on 2026-07-19 with: `go for it i want to see it live`.
**Branch base:** Ready PR #163 from `codex/landing-premium-20260719` into `main`; approved head before release logging was `813bb3e` and all GitHub/Vercel checks passed.
**Scope:** Merge PR #163, wait for the corresponding Vercel production deployment, then verify `https://finacalleos.com/`, `/og.png`, canonical metadata, and representative protected routes without changing them.
**Boundaries:** No additional product code, secrets, access, data, billing, migrations, email, purchases, or unrelated deployment work. Stop at the first deployment or live-content divergence.
**PASS:** PR #163 is merged to `main`; the exact merged head reaches a Ready Vercel production deployment; the root and OG image return HTTP 200; live HTML contains the new headline, proof, CTA, canonical URL, and OG image; `/conquest`, `/owner/colattao`, `/customers`, and `/m/colattao` still return their expected reachable/auth-gated responses; production logs show no release-time error.
**STOP:** Stop and report before any remediation if mergeability changes, checks fail, Vercel does not reach Ready, the live alias points elsewhere, new homepage content is absent, or a protected route regresses.

## [x] 6 - Simplify and center the Fina Calle mobile landing page

**State:** DONE
**Codex effort:** MEDIUM
**Authority:** Anthony explicitly requested on 2026-07-19 that the mobile site use way fewer words, centered composition, and a very simple presentation.
**Branch base:** Continue `codex/landing-release-log-20260719` from production `main` at `44cb3c1`; PR #164 remains the single unmerged review surface.
**Scope:** Mobile-only presentation and copy variants in `APP/web/src/app/page.tsx` and `APP/web/src/app/page.module.css`, plus this task's operations records. Preserve the premium desktop composition.
**Boundaries:** No merge, production publish, protected-route edits, new assets, secrets, access, data, billing, migrations, email, purchases, or unrelated code.
**PASS:** At phone width, every section is centered and reduced to a short headline, primary action, image, or terse list; supporting paragraphs, codes, facts, secondary links, and metadata are removed from the mobile flow; desktop content remains intact; accessibility, targeted lint, production build, and responsive preview checks pass.
**STOP:** Stop before production merge or if the change alters desktop hierarchy, protected routes, link destinations, or verified business claims.

## [x] 7 - Present each mobile section as a premium graphic-novel page

**State:** DONE
**Codex effort:** MEDIUM
**Authority:** Anthony explicitly requested on 2026-07-19 that each mobile section read like a cool comic-book page while avoiding a lame or novelty-comic result.
**Branch base:** Continue `codex/landing-release-log-20260719` from verified PR #164 head `5b35e1e`; production remains `44cb3c1`.
**Scope:** Mobile-only sequential framing and layout in `APP/web/src/app/page.tsx` and `APP/web/src/app/page.module.css`, plus this task's operations records. Preserve the simplified mobile copy and premium desktop composition.
**Boundaries:** No speech bubbles, novelty comic fonts, sound-effect graphics, new claims, new assets, merge, production publish, protected-route edits, secrets, access, data, billing, migrations, email, purchases, or unrelated code.
**PASS:** The six phone sections read as an intentional 01-06 sequence with distinct splash, proof, module-grid, storyboard, control, and finale compositions; the graphic-novel character comes from gutters, crops, ink texture, and restrained page marks; mobile remains centered and concise; desktop, accessibility, links, routes, lint, build, and preview verification pass.
**STOP:** Stop before production merge or if the treatment becomes harder to scan, clips content at supported phone widths, harms focus/touch behavior, alters desktop composition, or changes protected behavior.

## [x] 8 - Deepen mobile comic texture, contrast, and shadow

**State:** DONE
**Codex effort:** MEDIUM
**Authority:** Anthony explicitly requested on 2026-07-19: `More texture more comic more words contrast more contrast in general use shadowing please`.
**Branch base:** Continue `codex/landing-release-log-20260719` from verified PR #164 head `45beceb`; production remains `44cb3c1`.
**Scope:** Mobile-only finish work in `APP/web/src/app/page.module.css` plus this task's operations records. Preserve the short mobile copy, sequential 01-06 structure, desktop composition, and existing assets.
**Interpretation:** Increase contrast around the words rather than adding more words: deepen Ink, brighten Paper/Gold/Sapphire, layer halftone and crosshatch texture, and use crisp offset shadows and heavier panel gutters.
**Boundaries:** No new copy, speech bubbles, novelty comic fonts, sound effects, new assets, merge, production publish, protected-route edits, secrets, access, data, billing, migrations, email, purchases, or unrelated code.
**PASS:** At 390 px and 320 px, headings and labels have stronger readable separation; all six sections carry richer ink/paper texture, harder panel depth, and clearer contrast without visual menace or clutter; desktop, focus/touch behavior, routes, lint, build, and preview checks pass.
**STOP:** Stop before production merge or if texture competes with legibility, shadows clip content, small-phone layout overflows, desktop changes, or protected behavior changes.

## [x] 9 - Publish the approved mobile sequential-art refinement

**State:** DONE
**Codex effort:** LOW
**Authority:** Anthony explicitly approved the production merge on 2026-07-19 with: `merge pleae`.
**Branch base:** Ready PR #164 from `codex/landing-release-log-20260719` into `main`; approved head is `07a8d09`, and production `main` is `44cb3c1` before release logging.
**Scope:** Commit this release check-in, squash-merge only PR #164, wait for the exact resulting `main` revision to reach Vercel production, then verify the public root and representative protected routes read-only.
**Boundaries:** No new product code, visual changes, secrets, access, data, billing, migrations, email, purchases, or unrelated deployment work. Stop at the first branch, check, merge, deployment, alias, live-content, route, or runtime-log divergence.
**PASS:** PR #164 is merged to `main`; its exact squash commit reaches a Ready Vercel production deployment; the root returns HTTP 200 and contains the approved 01-06 mobile sequence and short headline; `/conquest`, `/owner/colattao`, `/customers`, and `/m/colattao` remain reachable or auth-gated as expected; production logs show no release-time error.
**STOP:** Stop and report before remediation if the approved head changes, checks fail, mergeability changes, Vercel does not reach Ready, the live alias points elsewhere, approved content is absent, or a protected route regresses.

## [x] 10 - Add fluid editorial motion and publish when verified

**State:** DONE
**Codex effort:** HIGH
**Authority:** Anthony explicitly requested on 2026-07-19: `great now give me a fluid movement make it really cool an unique and merge and pushe when satisfiy before rechecking our work`.
**Branch base:** `codex/landing-motion-20260719`, created from production `main` at `d13642b`; the prior release closeout is carried forward as ops-only commit `54fc906`.
**Scope:** Add a small landing-page-only motion controller, semantic reveal hooks in `APP/web/src/app/page.tsx`, motion styling in `APP/web/src/app/page.module.css`, and this task's operations records. Preserve all copy, assets, links, routes, metadata, data, and protected behavior.
**Motion direction:** Use a Fina Calle-specific `registration lag`: Gold and Sapphire print plates briefly trail the Ink frame before aligning; pair it with diagonal headline reveals, staggered comic panels, and slow mechanical-crest inertia. Avoid bounce, generic fade-up repetition, scroll hijacking, or constant distracting motion.
**Boundaries:** No `/conquest`, owner/customer/menu, authentication, API, billing, database, game, secret, access, email, purchase, or unrelated code changes. Production merge is authorized only after local and deployed-preview verification are fully satisfactory and every required check is green.
**PASS:** Motion progressively enhances the static page, uses compositor-safe transform/opacity behavior, reveals each section and panel once, keeps focus and touch behavior intact, honors reduced motion with complete static content, causes no overflow or layout shift at 390 px, 320 px, or desktop, passes targeted lint/build and browser checks, reaches a Ready preview, merges under an exact-head lock, and passes exact-production verification.
**STOP:** Stop before merge if motion hides content without JavaScript, becomes visually noisy or disorienting, harms readability/focus/touch behavior, clips supported widths, changes protected behavior, fails a check, or the preview differs from the approved local result.

## [x] 11 - Transform landing images into scroll-linked color dust and publish

**State:** DONE
**Codex effort:** HIGH
**Authority:** Anthony explicitly requested on 2026-07-19: `Ok however possible I want the pics to dissolve into that color dust and transforma to the next slide as we scroll plan. First and when done merge and push`.
**Branch base:** `codex/landing-dust-20260719`, created from production `main` at `210b83b`; prior motion-release checkout is carried as ops-only commit `45e1d5c`.
**Scope:** Extend the landing-only controller in `APP/web/src/app/LandingMotion.tsx`, add semantic dust source/target hooks in `APP/web/src/app/page.tsx`, add the Canvas surface and progressive image treatment in `APP/web/src/app/page.module.css`, and maintain this task's operations records.
**Transition direction:** Sample the real Fina Calle crest and Colattao proof image, combine their colors with Gold/Sapphire/Paper dust, and map scroll progress so each image reversibly disintegrates toward the incoming page frame before reforming when the user scrolls upward. Keep native scrolling and the existing editorial reveal system.
**Conversion-safe mechanic:** Add a scoreless six-stage progress rail that mirrors pages 01-06 and gives the final build CTA a restrained completion ring. It must remain decorative, reversible, copy-free, pointer-transparent, and removable if mobile QA shows clutter or CTA competition.
**Boundaries:** No Phaser/game runtime, scroll hijacking, new copy/assets/claims, `/conquest`, owner/customer/menu, authentication, API, billing, database, secret, access, email, purchase, or unrelated code changes. Production merge is authorized only after exact local, preview, accessibility, responsive, performance, and protected-route verification.
**PASS:** The real images visibly dissolve into sampled color dust during section transitions; reverse scrolling reconstructs them; all work is requestAnimationFrame-batched and device-capped; mobile and desktop remain legible with zero overflow; reduced-motion and no-JavaScript paths retain complete static images/content; focus/touch behavior, exact links, lint/build, immutable preview, merge lock, production aliases, protected routes, and runtime logs pass.
**STOP:** Stop before merge if the effect reads as a fade/wipe, masks important copy, drops supported mobile responsiveness, causes sustained animation offscreen, exceeds a stable frame budget, taints the Canvas, changes content or protected behavior, fails reverse/reduced/no-JS checks, or diverges at preview.

## [x] 12 - Limit color dust to the opening logo transformation

**State:** DONE
**Codex effort:** MEDIUM
**Authority:** Anthony explicitly requested on 2026-07-20: `keep the disolving motion to only the logo design and it transforms into the next pic but ommit the desolvin for the next one lets keep the graphics only for that inisial one`.
**Branch base:** `codex/landing-single-dust-20260720`, created from production `main` at `e890a5c`.
**Scope:** Remove the later Colattao proof-image opt-in from `APP/web/src/app/page.tsx`; preserve the opening logo-to-page-02 dust transformation, static proof image, six-stage journey mechanic, all copy, layout, assets, links, and protected routes.
**Boundaries:** No particle-engine rewrite, new effect, new copy, asset change, route change, merge, or production publish. Push a review branch and preview only after local verification.
**PASS:** Exactly one dust source initializes; the logo dissolves into the page-02 transition; the Colattao proof image remains fully visible while entering and leaving its section; reverse scroll restores the logo; responsive, reduced-motion, no-JavaScript, lint, and build checks pass.
**STOP:** Stop before merge or if the proof image opacity changes with scroll, the opening transition regresses, static fallbacks fail, or any protected behavior changes.

## [x] 13 - Form the proof image from the opening logo dust

**State:** DONE
**Codex effort:** HIGH
**Authority:** Anthony explicitly clarified on 2026-07-20: `the next pic to be form from the dust of the logo. meaning there is no image there and as i scrooll the next image is froming not just appearing`.
**Branch base:** Continue draft PR #167 on `codex/landing-single-dust-20260720` from verified head `52828c1`; production remains `e890a5c`.
**Scope:** Extend `APP/web/src/app/LandingMotion.tsx` to sample the Colattao proof image as the opening crest scene's target grid; add source/target semantics in `APP/web/src/app/page.tsx`; add target-opacity progressive enhancement in `APP/web/src/app/page.module.css`; maintain operations records.
**Morph direction:** Keep the proof image visually absent at the beginning of the transition. Move crest-derived Gold/Sapphire/Paper particles into the proof image's exact grid, interpolate toward sampled photo colors, then crossfade to the real image only during final assembly. Reverse scroll must deconstruct the proof and rebuild the crest.
**Boundaries:** Preserve native scrolling, one dust scene, the six-stage journey, copy, layout, assets, links, hover treatment, static reduced-motion/no-JavaScript photo, and protected routes. No later dissolve, new dependency, merge, or production publish.
**PASS:** The rendered proof image begins at opacity zero during normal motion; an active non-empty particle field travels from crest coordinates into proof-image coordinates; late-stage particles cover the target grid and carry sampled photo color; the DOM photo reaches full opacity only near completion; reverse scroll returns it to zero and restores the crest; lint, build, responsive, reduced-motion, scripts-disabled, idle-frame, and preview checks pass.
**STOP:** Stop before merge if the photo merely fades in, target pixels do not visibly assemble, the image is absent in reduced/no-JavaScript modes, the transition obscures copy or overflows mobile, reverse motion breaks, performance regresses, or the preview diverges.

## [x] 14 - Publish the approved crest-to-proof morph

**State:** DONE
**Codex effort:** MEDIUM
**Authority:** Anthony explicitly approved on 2026-07-20: `merge and or push`.
**Branch base:** Draft PR #167 from `codex/landing-single-dust-20260720` into production `main`; approved head before release check-in is `148e868`, and production base is `e890a5c`.
**Scope:** Push this release check-in, require all checks on the resulting exact head, mark PR #167 ready, squash-merge under an exact-head lock, wait for the resulting `main` commit to reach Vercel production, and verify the public landing morph plus representative protected routes read-only.
**Boundaries:** No new product, copy, layout, asset, route, data, access, billing, authentication, API, or game changes. Do not merge if the head, base, checks, preview, or mergeability changes unexpectedly.
**PASS:** PR #167 is merged under the exact-head lock; its squash commit reaches a Ready production deployment aliased to `finacalleos.com`; the live root has the crest source/proof target without a later proof source; live browser checks confirm photo formation, completion, reverse reconstruction, zero overflow, and no page error; representative protected routes return expected HTTP responses; production error logs contain no entries.
**STOP:** Stop and report before remediation on any branch divergence, failed check, merge conflict, deployment error, alias mismatch, missing hook, broken live morph, protected-route regression, or runtime error.

**Result:** PR #167 merged on 2026-07-20 as `10be3ef`; GitHub currently reports the PR merged. The stale open queue state was corrected during the 2026-08-02 Las Palmas check-in.

## [x] 15 - Simplify the Las Palmas owner-review landing

**State:** DONE
**Codex effort:** MEDIUM
**Authority:** Anthony directly approved the AJ Gator's production merge and requested the same minimal landing treatment for the Las Palmas menu on 2026-08-02, overriding the stale queue order for this scoped task.
**Branch base:** `codex/las-palmas-minimal-landing-20260802`, created from current production `origin/main` at `bb0cb42` in a clean sibling worktree.
**Scope:** Refine only `/demo/las-palmas` into a logo-first, three-action first viewport using the registered exact sign asset and the existing silver-palm-to-`MENU` scroll motion. Preserve the menu single source of truth, enhanced food media, disclosures, Guest Notes, game and table-preview destinations, noindex metadata, and pending-client-approval language.
**Boundaries:** No Supabase, Stripe, POS, Client OS, customer data, secrets, menu/pricing/media edits, game engine/config, table behavior, live QR changes, or production merge. AJ Gator's release logging may be carried as operations-only history.
**PASS:** The phone first viewport contains only minimal status, the registered logo/motion, and Menu, Game, Table actions; all three destinations work; the motion completes and reverses; reduced motion, keyboard focus, responsive layout, menu/photo counts, notices, metadata, targeted lint, types, production build, and browser checks pass; a draft review PR is open.
**STOP:** Stop before the Las Palmas production merge. Stop and report if the registered logo, motion, menu, media, game, table preview, Guest Notes, approval labels, or protected surfaces regress.

**Result:** Feature commit `18ef60b` is pushed to draft PR #200. Local lint, types, production build, responsive/motion/reduced-motion/focus/content/destination checks pass; GitHub `web`, Vercel, and Vercel Preview Comments checks pass. The Ready preview is Vercel-SSO protected. Production is unchanged pending Anthony's explicit approval of PR #200.

## [x] 16 - Publish the approved Las Palmas minimal landing

**State:** DONE
**Codex effort:** LOW
**Authority:** Anthony explicitly approved Las Palmas for production on 2026-08-02 with: `Aprove las palmas`.
**Branch base:** Draft PR #200 from `codex/las-palmas-minimal-landing-20260802` into `main`; approved head before this release check-in is `2c8d947`, and production base is `bb0cb42`.
**Scope:** Add this release authorization record, require all checks on the resulting exact head, mark PR #200 ready, squash-merge under an exact-head lock, wait for the resulting `main` commit to reach Vercel production, and verify the Las Palmas demo plus its Menu, Game, and Table destinations read-only.
**Boundaries:** No new product, visual, copy, asset, menu/data/media, Guest Notes, game, table, Client OS, integration, secret, access, billing, QR, or customer-contact changes. Stop on any unexpected head, base, diff, check, mergeability, deployment, alias, route, motion, content-count, or runtime result.
**PASS:** PR #200 merges under the exact-head lock; its squash commit reaches a Ready production deployment aliased to `finacalleos.com`; the live demo returns HTTP 200 with the registered sign, minimal actions, reversible motion, noindex metadata, 39 disclosures, 37 enhanced photos, and truthful pending/no-send boundaries; representative protected surfaces retain expected responses.
**STOP:** Stop before remediation on any divergence. Do not claim production success until the merged revision and live behavior are directly verified.

**Result:** PR #200 was squash-merged under the approved exact-head lock as production commit `21d032c`. Vercel production deployment `dpl_HpFdBwXbnx7wdYHgVLFB5Gp98Nb3` reached Ready and aliases `finacalleos.com`. Live phone-width verification passed for the logo-first landing, three actions, reversible and reduced-motion states, 39 disclosures, 37 enhanced menu photos with no broken media, noindex metadata, Guest Notes, game and table destinations, and the pending-client-approval/no-send boundaries. Representative protected routes retained HTTP 200 responses; no protected surface was changed.

## [x] 17 - Point Las Palmas Menu to the current original menu

**State:** DONE
**Codex effort:** LOW
**Authority:** Anthony requested that the Las Palmas menu use the current original restaurant menu on 2026-08-02, overriding the stale queue order for this scoped task.
**Branch base:** `codex/las-palmas-original-menu-20260802`, created from current `origin/main` at `15edd95` in a clean sibling worktree.
**Scope:** Change only the `/demo/las-palmas` first-viewport Menu action from the local `#menu` anchor to the exact Lynnhaven menu PDF currently linked by the restaurant's official website. Keep the existing curated owner-review proof below the landing unchanged.
**Boundaries:** No menu transcription, price/media/data change, Guest Notes change, motion redesign, game/table behavior change, Supabase, Stripe, POS, Client OS, customer data, secret, live QR target, customer contact, or production merge.
**PASS:** The Menu action opens the verified official Lynnhaven PDF in a separate tab; Game and Table remain unchanged; the landing, motion, local owner-review proof, notices, noindex metadata, responsive layout, keyboard behavior, lint, types, build, and browser checks pass; a draft PR is ready for Anthony.
**STOP:** Stop before production merge. Stop if the official source no longer exposes the same menu URL or any protected behavior changes.

**Result:** Commit `0f2bfa5` is pushed to draft PR #201. The official PDF returns HTTP 200 as `application/pdf`; the 390 x 844 browser test confirms the Menu action opens it in a separate tab while Game and Table retain their exact routes and 46 px targets. Zero-overflow, keyboard focus, noindex, 39 local proof disclosures, and the reversible 500-particle motion pass. Targeted ESLint, `tsc --noEmit`, the Next.js production build, GitHub `web`, Vercel, and Vercel Preview Comments pass. Production remains unchanged pending Anthony's approval of PR #201.

## [ ] 4 - Make the owner portal installable and organize the optimization backlog

**State:** DONE
**Codex effort:** MEDIUM
**Authority:** Anthony explicitly approved publication of the completed sales-system branch and directed Codex to organize and optimize the operation, including finding a way to make the customer portal an app, on 2026-07-18.
**Branch base:** `codex/owner-portal-app-20260718`, created from `origin/main` at `422352b`.
**Scope:** Add tenant-scoped install metadata and generated app icons for `/owner/[id]`; preserve the existing route, authentication, billing, Zelle, menu, and tenant-isolation behavior; add a canonical company optimization register and owner-app runbook. No visual dashboard redesign, service worker, offline cache, native App Store package, database change, secret, access change, or production change.
**Why:** Owners should be able to install the existing portal from their browser and launch directly into their restaurant account without creating a second application or duplicating sensitive business logic.
**PASS:** Every owner route emits a tenant-stable manifest link; the manifest has a unique app id, owner start URL, owner scope, standalone display, and 192/512 icons; icon and manifest routes work without credentials; authenticated pages and billing data are never cached for offline use; targeted lint, type/build, manifest assertions, and mobile browser checks pass; the optimization register has owner, KPI, evidence, priority, and approval gate fields.
**STOP:** Stop before push, PR, merge, deploy, production access, App Store submission, service-worker caching, secret entry, access change, customer communication, or payment action. Report any conflict before editing protected owner or billing behavior.

**Result:** Local commit prepared on `codex/owner-portal-app-20260718`. Manifest self-test, targeted ESLint, `tsc --noEmit`, and two production builds pass. Local production verification confirms tenant manifest linkage, four standard/maskable icon entries, 192/512 PNG output, 320/390 px no-overflow rendering, no browser error overlay, owner `Cache-Control: private, no-cache, no-store`, and public-only caching for manifest/icons. No service worker, database, access, billing, push, PR, merge, deploy, or production change was made.

## [x] 18 - Redesign the shared owner portal as a comic command center

**State:** DONE
**Codex effort:** HIGH
**Authority:** Anthony requested planning and execution of a shared owner-portal visual update on 2026-08-04 using the public landing page principles: minimal words, high contrast, and restrained comic-book styling.
**Branch base:** `codex/owner-portal-comic-20260804`, created from current production `origin/main` at `559f616` in a clean sibling worktree.
**Scope:** Update only the shared `/owner/[id]` presentation and concise interface copy for its signed-out, password-reset, authenticated dashboard, request, billing, and payment states. Use route-scoped styling so every tenant receives the same system while retaining its own restaurant name and logo.
**Design direction:** Ink/Paper contrast with Gold and Sapphire registration accents; Bodoni Moda display type with Geist UI text; angular editorial panels, numbered workflow sections, halftone texture, and direct action-first hierarchy. Keep comic references restrained and operational rather than novelty-driven.
**Boundaries:** No authentication, authorization, server action, database, billing/payment logic, menu data, tenant isolation, API, manifest/icon, customer, public landing, `/m`, `/owner-preview`, secret, access, push, PR, merge, deploy, or production change.
**PASS:** All owner tenants inherit one route-scoped visual system; signed-out, reset, setup, unauthorized, loading/action-result, and authenticated states remain truthful and functional; words are materially reduced without removing security/payment meaning; 320 px, 390 px, and desktop layouts have no overflow; keyboard focus, contrast, reduced motion, targeted lint, TypeScript, production build, and browser checks pass.
**STOP:** Stop before push, PR, merge, deploy, or production publication. Stop and report if implementation requires auth, billing, data, route, or protected-surface behavior changes.

**Result:** Completed locally on `codex/owner-portal-comic-20260804`. The shared owner route now uses one tenant-aware, route-scoped comic command system with the Request Desk first, concise operational copy, logo substitution, responsive angular panels, visible keyboard focus, and reduced-motion support. Signed-out, reset, setup, long-name, authenticated read-only, request-preview, and representative protected-route states were browser-verified at 320, 390, and 1440 px. Targeted ESLint, `tsc --noEmit`, owner-app self-test, final production build, and `git diff --check` pass. The temporary QA route was removed. No auth, authorization, action, database, billing/payment logic, menu, API, manifest/icon, customer, landing, `/m`, `/owner-preview`, push, PR, merge, deploy, or production change was made.

## [x] 19 - Prioritize owner features and add a section index

**State:** DONE
**Codex effort:** MEDIUM
**Authority:** Anthony requested a restaurant-owner-interest feature order and a polished index menu with working section links on 2026-08-04.
**Branch base:** Continue `codex/owner-portal-comic-20260804` after local redesign commit `2f9feb2`; production remains unchanged.
**Scope:** Reorder only the authenticated shared `/owner/[id]` dashboard to Request, Menu, Live, Campaigns, Billing, and History; add a route-scoped semantic section index with native anchor links and matching section IDs.
**Design direction:** A connected restaurant order-ticket rail beneath the owner masthead, using the existing Ink/Paper/Gold/Sapphire comic system. Six compact links remain fully visible, keyboard reachable, and consistent with the numbered content sections.
**Boundaries:** Preserve every form, action binding, auth boundary, payment qualifier, tenant condition, menu URL, and read-only behavior. No shared UI/global CSS, route, API, database, manifest/icon, landing, `/m`, `/owner-preview`, push, PR, merge, deploy, or production change.
**PASS:** DOM, visual order, numbers, labels, index links, and section IDs agree; every link lands on the correct section; 320/390/1440 layouts have no page overflow; anchors, focus, reduced motion, lint, types, owner self-test, production build, and browser checks pass.
**STOP:** Stop before push, PR, merge, deploy, or production publication. Stop if reordering requires any action, auth, payment, menu-data, or route behavior change.

**Result:** Completed and release-authorized on `codex/owner-portal-comic-20260804`. The dashboard now follows Request, Menu, Live, Campaigns, Billing, and History in both DOM and visual order. A connected order-ticket index exposes 6 native links to unique focusable section targets; every link sets the expected hash, focuses its target, and leaves it visible. The index is 2 × 3 at 320/390 px and one row at 1440 px with zero page overflow. Targeted ESLint, `tsc --noEmit`, owner-app self-test, final production build, `git diff --check`, reduced-motion, keyboard, browser-error, and independent implementation review gates pass. Photo-upload naming and async auth-message announcements were corrected without changing behavior. Anthony explicitly approved merge on 2026-08-04; final PR, merge, deployment, and live-route evidence are recorded in the release handoff and delivery response.

## [x] 20 - Make the Request Desk the complete owner intake

**State:** DONE - LOCAL RELEASE GATE
**Codex effort:** HIGH
**Authority:** Anthony directly requested this owner-portal follow-up on 2026-08-05, overriding the normal Claude-only queue-writing rule for this scoped task.
**Branch base:** `codex/owner-request-intake-20260805`, created from current production `origin/main` at `d57ddb6` in a clean sibling worktree.
**Scope:** Make the shared `/owner/[id]` Request Desk the complete owner-request intake with a 4,000-character brief, explicit completeness guidance, and up to five supporting image/PDF files; remove Campaigns from the owner dashboard/index/live metrics/data query and owner auto-triage; preserve the separate Live menu-status section.
**Upload contract:** Maximum five files, 4,000,000 bytes each, JPG/PNG/WebP/PDF. Persist the request first, then upload one file per authenticated request to stay beneath Vercel's 4.5 MB function-body limit. Re-authorize restaurant ownership and verify the reference belongs to that restaurant on every upload; require matching MIME, extension, and file signature; deterministic slots `0..4` enforce the count without a migration.
**Boundaries:** No migration, secret, access, billing/payment, public menu or promo-record change, API unrelated to this intake, `/owner-preview`, customer contact, push, PR, merge, deploy, or production publication.
**PASS:** The Request Desk collects a complete brief and 0-5 validated files, selected attachments always force team review, five unique slots are enforced server-side, partial upload failure is reported truthfully without losing the saved request, Campaigns is absent from every owner surface and auto-triage, Request/Menu/Live/Billing/History numbering and links agree, 320/390/1440 layouts do not overflow, and targeted lint/types/selftests/build/browser/security checks pass.
**STOP:** Stop before push, PR, merge, deploy, migration, secret/access change, or production publication. Stop and report if the authenticated owner/reference boundary cannot be proven.

**Result:** Completed locally in `61e5aa8`. The Request Desk now captures one 4,000-character complete brief and up to five JPG/PNG/WebP/PDF files, persists the request first, uploads each file through an exact-origin authenticated route, verifies tenant/reference ownership, namespaces storage by authoritative request UUID, checks 4,000,000-byte/MIME/extension/signature limits, and preserves failed files for truthful retry. Campaigns is removed from owner navigation, rendering, metrics, data reads, history, and auto-apply; public `/m` promo behavior is untouched. Five linked sections and 320/390/1440 browser layouts pass with no overflow. Request/owner self-tests, targeted ESLint, TypeScript, final Next production build, anonymous/cross-origin denial checks, `git diff --check`, and independent UI/security reviews pass. Evidence: `C:\Dev\amma\evidence\owner-request-intake-20260805\report.md`. No push, PR, merge, deploy, or production change was made.

## [x] 21 - Simplify the owner portal to request, billing, and history

**State:** DONE - PRODUCTION
**Codex effort:** MEDIUM
**Authority:** Anthony directly requested this follow-up on 2026-08-05, overriding the normal Claude-only queue-writing rule for this scoped task, and explicitly authorized its production merge later that day.
**Branch base:** `codex/owner-portal-simplify-20260805`, created from current production `origin/main` at `8fede5a` in a clean sibling worktree.
**Scope:** Remove the owner Quick Edits panel and per-store Live status panel; retain the public Menu header link and complete Request Desk; reduce duplicate interface copy; replace the fashion-serif display face with a bold comic display face; reorganize the index and board as Request, Billing, History.
**Boundaries:** No authentication, request behavior, billing/Zelle behavior, menu data, server action, API, database, public `/m`, campaign record, `/owner-preview`, access, secret, or customer contact change. Production release is limited to the exact verified owner-portal diff authorized by Anthony.
**PASS:** Quick Edits and Live are absent from rendering, index, direct-edit imports, derived status work, and layout; Request/Billing/History numbering and links agree; the public Menu link remains; copy is materially shorter; display type is bold comic while body copy stays readable; 320/390/1440 layouts have no overflow; targeted lint, types, self-tests, build, guideline review, and browser checks pass.
**STOP:** Stop on an unexpected head, base, diff, check, deployment, alias, or live-route result. Stop if release requires changing request, billing, authentication, menu-data, tenant behavior, or any protected surface.

**Result:** Completed locally in `d9d2151`. Quick Edits, the tenant-specific Live box, and per-store request shortcut chips are removed; the shared owner surface now follows Request, Billing, History while retaining the Colattao/public Menu header link and the complete five-file Request Desk. Lilita One supplies the bold comic display hierarchy while Geist remains on operational copy and controls. Native section links focus the correct targets; 320/390/1440 browser checks pass with one-row navigation, 44 px controls, long-history wrapping, no horizontal overflow, and no browser errors. Request/owner self-tests, targeted ESLint, TypeScript, the final Next production build, `git diff --check`, current interface-guideline review, and independent scope review pass. The temporary QA route was removed. No auth, request action, billing/Zelle, menu data, API, database, `/owner-preview`, push, PR, merge, deploy, or production change was made. Evidence: `C:\Dev\amma\evidence\owner-portal-simplify-20260805`.

**Production release:** Ready PR #210 was squash-merged under the exact verified head lock as `f85098e`. GitHub CI and Vercel checks passed; the Vercel production deployment completed successfully at `https://amma-fina-calle-5ozdz6dad.vercel.app` and the `finacalleos.com` alias serves the release. Live verification confirms `/owner/colattao` returns the expected private Colattao sign-in at HTTP 200 with no browser errors or horizontal overflow, `/m/colattao` remains HTTP 200, and held `/owner-preview` remains HTTP 404.

## [ ] 50 - Correct Bodega to falling-item catch game
Authority: Anthony rejected the ticket game and requested falling items like Colattao. Original scoped merge/live authorization persists.
Scope: reuse CafeRushScene and its existing rules, Bodega-only skin and wrapper at the stable review URL; preserve logo/noindex/menu. Add muffin primitive rendering only; no changes to existing skins or rules. Verify build/lint and hosted play before merge.

## [x] 51 - Integrate Bodega art and silent catch feedback
Authority: Anthony requested seamless integration, a more New York bodega cat first, and a light instead of sound on each catch. His explicit Bodega merge/live authorization persists.
Base: origin/main 9425e110; branch codex/bodega-new-york-art. Cloud scratch exception continues from queue49.
Scope: Bodega-only generated reference-informed products, cafe backdrop and cat; optional shared rendering hooks with primitive fallback; silent golden catch feedback. Preserve frozen round/spawn/collision/scoring rules, other skins, stable URLs, real logo and owner-review/noindex status.
PASS: optimized local assets, loading failure fallback, reduced motion, keyboard/pointer controls, pause/replay/end-round, lint/types/build and hosted verification; merge exact checked head and verify live.

Update 2026-09-24: Anthony explicitly stopped the cat work and directed integration of the rest of the art. Exclude the mascot asset/UI and catcher-image support from this release; retain the illustrated products, cafe interior and silent golden tray light.

Result: PR245 application head68530c6, exact tree68ea991. Cat excluded per latest direction. Products/interior art (270 KiB) integrated with optional primitive fallback and silent local tray glow. Scoped lint, TypeScript, production build, GitHub web and Vercel pass. Hosted preview verifies all art, +10 catch scoring, mouse/keyboard steering, pause/resume, replay reset and single-canvas cleanup; default Colattao primitive route still renders. Mobile CSS inspected; viewport emulation and complete timed-round playback were not certified in the constrained cloud browser. Rules unchanged. Exact-head merge/live remains authorized; final deployment evidence in PR245.

## [x] 52 - Replace two Bodega products and improve mobile play
Authority: Anthony supplied two product photos, requested replacement of two items, iOS/mobile optimization and merge, with no testing afterward. Keep Spanish Latte; replace Canela Love and muffin with reference-informed green iced drink and cereal-topped bites, using descriptive labels pending exact menu names. No cat.
Scope: new sprites, Bodega-only responsive/touch/lifecycle refinements; preserve frozen timing/scoring/collision rules, sound-free feedback, real logo and review routes. Explicitly authorized merge; do no post-merge tests or browser play. Pre-merge compilation/required CI only.

Result: replacement transparent sprites total57,486 bytes; Spanish Latte preserved. Added native thumb steering, phone screen layout with safe-area padding/stable viewport height, short-landscape treatment, background pause and scroll/text-selection suppression. No shared engine/rule changes. Pre-merge compilation gates apply; no post-merge testing per Anthony.

## [x] 53 - Make direct tap-to-catch the shared café standard
Authority: Anthony requested Colattao-style tap-to-catch as our standard game, superseding the frozen-engine restriction for this shared input change. Existing merge authorization applies; no post-merge tests.
Scope: shared CafeRushScene direct item taps/clicks, silent local feedback, Bodega copy/control simplification, retained art/mobile safe areas/background pause. Keep scoring and difficulty configuration. Document the standard for future skins.

Result: Shared engine now catches one visible item per direct tap/click with a 56px minimum hit diameter and a settled guard. Removed tray/slider and automatic catches; added keyboard selection/catch, local silent glow and matching copy. Approved art, mobile layout, background pause and configured rules retained. TypeScript, targeted ESLint and whitespace checks pass before merge. Required remote build/CI gates apply; no post-merge testing.

## [x] 54 - Bodega faster rounds, larger items and catch sounds
Authority: Anthony approved the proposed 20-second round, roughly 600ms spawns, faster falling, 35% larger items, distinct catch tones/mute, and immediate capped win at 100; explicitly requested merge. Scoped rule/presentation extension authorized. No post-merge testing.
Scope: Bodega preset plus opt-in shared size/finish behavior and catch event; existing shared levels keep their settings. Gesture-unlocked lightweight audio, mute, background/pause cleanup. Pre-merge compilation/required CI only.

Result: 20s/100-point Bodega preset, fixed600ms spawns, faster falls and 1.35x items implemented. Capped awards immediately end play at100; further taps cannot score. Item-specific synthesized tones include visible mute, gesture unlock and bounded voices; pause/background/unmount silence added. TypeScript, scoped lint and whitespace checks passed pre-merge. Required remote compilation/CI gates remain release conditions; no post-merge tests.

## [x] 55 - Minimal black-and-white Bodega game landing
Authority: Anthony approved the landing-only plan and explicitly requested execution and merge. Remove product/menu cards and repeated copy; retain logo/Menu, one FALL RUSH heading, compact colored product composition, black PLAY CTA, short instructions and Preview/Play for fun note. No post-merge testing.
Scope: landing markup/CSS only; preserve gameplay, audio, approved art and mobile game layout. Required pre-merge compilation/CI gates apply.

Result: landing reduced to logo/Menu, FALL RUSH, unboxed composition of the three approved products, Tap treats/Skip spills, PLAY, 20 seconds/100 points and Preview/Play for fun. White/black landing CSS with compact short-screen treatment; removed retired card/banner/caption styles. Gameplay settings/audio unchanged. TypeScript, scoped ESLint and whitespace checks passed before publication; required CI/build gates apply. No post-merge tests.

## [x] 56 - Bodega Fall Sessions menu and branded unnamed drink
Authority: Anthony approved execution of the photo-sourced seasonal menu/art plan, specifying no name for the green drink. Existing scoped release authorization applies; no post-merge testing.
Scope: five board-named drinks with only visible ingredients, new seasonal hero and separate illustrations, centered original-logo treatment on the unnamed green drink shared with game, preserve animated menu signal logo, correct outdated game teaser. No invented prices or green-drink identity; chai recipe omitted because cropped.

Result: five fall-board drinks added with source-visible descriptions and no prices; cropped chai recipe omitted. Seven generated assets integrated: seasonal music-themed hero, five transparent seasonal cups and centered-logo green cup. Green drink remains unnamed; game/landing reuse its branded art and former provisional name is removed. Menu signal logo unchanged; stale tray/45s teaser corrected to tap/20s. TypeScript, scoped lint and whitespace checks passed; required remote CI/build gates apply. No post-merge testing.

## [x] 57 - Remove Bodega spill, menu numbering and refine signal beat
Authority: Anthony approved all three planned changes and standing scoped merge authorization applies. No post-merge tests.
Scope: remove Bodega spill/negative award and related copy, keep20s/100 target and pace; remove seasonal item numbers and layout column; six-second left/cup/right logo pulse with rest, offscreen/hidden pause and reduced-motion static logo.

Result: removed spill from Bodega skin, set badChance0 and removed spill instructions/legend. Seasonal numbers and their grid column removed. Replaced bounce/expanding glow with a six-second left/cup/right/rest pulse on the original stationary seal, paused offscreen/hidden and disabled for reduced motion. TypeScript, scoped lint and whitespace checks passed; required CI/build gates apply before authorized merge. No post-merge tests.


## [x] 58 - Clean Bodega seal and animate its actual waveform
Authority: Anthony approved the vector-cleanup plan and execution. Standing scoped merge authorization persists; no post-merge tests. Cloud workspace exception continues.
Scope: source-traced black/white SVG lettering, clean ring and cup, actual connected waveform deformation on a six-second cycle, hidden/offscreen pause and reduced-motion static fallback. Preserve logo identity and existing menu/game content. Pre-merge scoped compilation and required CI/build gates.

Result: rebuilt seal in inline SVG with source-traced Bodega lettering, clean outlined locality text, ring and cup. Native six-second polyline interpolation moves the real connected wave; no bitmap or per-frame React updates. Offscreen/document-hidden and reduced-motion handling plus accessible pause control. Static SVG reviewed; TypeScript and scoped ESLint passed. Required remote CI/build gates apply; no post-merge tests.


## [x] 59 - Execute Bodega premium menu plan
Authority: Anthony approved the full menu plan and three generated illustrations, explicitly requesting execution and merge. Cloud workspace exception persists; no post-merge tests.
Scope: Bodega menu copy/layout/category navigation, responsive category art, compact Visit/game/footer. Preserve source menu data, animated seal, unnamed centered-logo green drink, noindex and game behavior. Scoped compilation and required CI/build gates before merge.

Result: compact seal header and sticky category links, consistent white/black menu, three640px category WebPs (264,186 bytes total), simplified item rows, compact Play invitation, Visit links/hours and one Menu details disclosure. Existing items/ingredients/source data and seal/game behavior retained. Scoped TypeScript and ESLint passed; remote CI/build gates required before merge. No post-merge tests.


## [x] 60 - Persistent Bodega Play game action
Authority: Anthony requested keeping the existing menu/categories/game and adding a game button that stays visible while scrolling, with execution and merge.
Scope: fixed black Play game link, safe-area positioning and footer clearance; existing sticky category strip retained. No post-merge tests. Scoped lint and required remote build gates before merge.

Result: added persistent bottom-right Play game link to the existing game route, with48px touch target, iOS safe-area offsets, white/black styling and disabled automatic game prefetch. Existing categories remain sticky and retain their width; extra bottom padding protects footer content. Scoped ESLint passed; required remote CI/build gates apply. No post-merge tests.


## [x] 61 - Larger Bodega rush and Fina Calle signature
Authority: Anthony approved the plan and explicitly requested execute and merge. Cloud workspace exception persists; no post-merge tests.
Scope: about30% larger items and faster falling,450ms spawns, Bodega-only separation opt-in, original monochrome Fina Calle emblem under Powered by. Preserve20s/100 target/audio/menu/categories/persistent Play. Pre-merge scoped lint and required CI/build gates.

Result: itemScale1.75, fallSpeed0.55–0.72,450ms cadence and Bodega-only horizontal separation with scaled tap targets/edge clearance. Centered original144px Fina Calle emblem rendered black on white beneath Powered by, linked to company site. Sticky categories and floating Play preserved. Scoped lint/whitespace passed; required remote compilation gates before merge. Browser/device validation not certified in constrained browser. No post-merge tests.


## [x] 62 - Articulated Fina Calle footer signature
Authority: Anthony approved the3.6s robotic-arm plan and explicitly requested execute/merge. Cloud exception and no-post-merge-tests instruction persist.
Scope: Bodega footer only; layer the original emblem at render time, keep central lettering/QR fixed, stagger articulated arms emerging and gripping, once per mount on visibility, offscreen/background pause and reduced-motion static original. Preserve game/categories/links.

Result: original emblem layered through SVG masks and articulated upper/lower arm, wrist and jaw groups. One3.6s eased stagger on footer visibility; protected stationary center, exact original at rest,184px display. Offscreen/hidden pause, reduced-motion/no-JS/unsupported static fallback and cleanup. TypeScript, scoped ESLint, timeline and whitespace checks pass. No browser/device playback certification in constrained session; required web/Vercel build gates before authorized merge. No post-merge tests.

## [x] 64 - Bodega five-chapter wait-time game and gated muffin reward
Authority: Anthony requested execution of the five-level game, larger Play action, muffin end state and cinematic finale. Anthony then explicitly directed that rewards remain off until he chooses a daily limit.
Base: origin/main acb8c72; branch codex/bodega-five-levels-20260926 in an isolated worktree. Prior unreleased reward foundation was ported into this branch; main owner portal remains intact.
Scope: Five progressive timed chapters totaling ten minutes, saved completed-chapter progress, mobile pause/retry, larger menu/game actions, original illustrated finale and server-validated one-time muffin claim foundation. Preserve Bodega branding and other tenants. Keep promotion inactive with zero daily cap and no production migration or environment activation.
Result: Five chapters, seeded catch validation, persisted checkpoints, mobile QA and finale artwork implemented. Reward tables/RPC/staff redemption prepared but inactive. Targeted ESLint, TypeScript, game/reward PGlite self-tests, owner self-tests, production build and browser interaction checks passed. PR review remains the release gate; no production push, migration or claim activation.

## [x] 65 - Bodega one-minute Rush and menu-matched redesign
Authority: Anthony approved the plan for five 10-second rounds with faster falling, white/black menu-matched game UI, clear Back to menu, and a prize-first landing. Existing instruction keeps muffin rewards off until a daily cap is chosen.
Base: origin/main cab51ef; branch codex/bodega-minute-rush-20260926 in the isolated worktree.
Scope: new 50-second campaign tuning and validation, v3 save/session migration, landing/game/interlude/finale redesign, menu teaser update, browser/mobile verification and a review PR. Keep campaign inactive, zero cap and unapplied database migration. No production merge/deploy without further explicit instruction.
Result: Five exact 10-second rounds with faster spawns/falls, v3 saved-progress and server validation, additive inactive reward migration, menu-matched responsive game, muffin-first coming-soon landing, and clear return links. Deterministic and PGlite reward self-tests, scoped ESLint, TypeScript production build, desktop/mobile browser layout and round-advance checks passed. Rewards remain inactive with zero cap; migration unapplied. Review PR is the release gate; no production merge or deploy.

## [x] 66 - Bodega Bad Vibes instant loss and round one reset

Authority: Anthony approved the plan for an illustrated Bad Vibes hazard, instant loss on touch, full restart after any failed round, and clear rules before Play. Anthony directed that visible rule copy avoid the dash sign. Muffin rewards remain off until a daily cap is chosen.
Base: origin/main d66046b; branch codex/bodega-bad-vibes-reset-20260926 in the isolated worktree.
Scope: Replace the Bodega spill art and identifier with original generated Bad Vibes art and a primitive fallback, add Bodega only instant loss, clear collected rounds on failure, explain catch and avoid rules on the landing, update verifier and v4 save/session migration, verify phone and desktop, and open a review PR. Keep claims inactive and migration unapplied.
Result: Original generated Bad Vibes X sprite optimized to a 75 KB transparent WebP, Bodega only immediate hazard loss with no point deduction, full collection reset after hazard or missed goal, rules before Play, updated menu copy, deterministic verifier rejection of hazard catches and an additive v4 session migration. Deterministic and PGlite reward tests, TypeScript, targeted ESLint, production build and desktop/mobile browser checks passed. Browser play confirmed first-round success, timed-out loss, Bad Vibes touch loss and no saved progress after reload. Primitive fallback retained. Rewards remain inactive with zero cap; migration unapplied. Review PR before production.


## [x] 67 - Bodega muffin percentage meter and New York loss copy

Authority: Anthony approved the five-step muffin-meter and New York loss-screen plan, then explicitly requested implementation and merge. Muffin claims remain off until he chooses a daily limit.
Base: origin/main e3ac98e; branch codex/bodega-muffin-meter-20260926.
Scope: Replace the five-find game tracker with a muffin image filling in 20 percent steps, retain separate per-round points, show meter on desktop and mobile, reset to zero after a loss, update transient and final loss copy, and keep practice results distinct from reward claims. No reward activation, migration or other venue changes.
Result: The muffin meter appears on landing, play, chapter transition, loss and finale. Completed rounds alone advance it; a failed run returns it to zero. Bad Vibes uses “NAH, NOT TODAY.” and a timed or score miss uses “MISSED YOUR STOP.” Both offer “RUN IT BACK.” Timed misses show a faded muffin instead of the Bad Vibes X. Targeted ESLint, production build, desktop/mobile browser layout and round-loss checks passed. Prize claims remain inactive.

## [x] 68 - Bodega restart on exit and faster falls

Authority: Anthony requested that exiting the game discards all won rounds and that items fall faster at every level. Muffin rewards remain off until he chooses a daily cap.
Base: origin/main 1e5b321; branch codex/bodega-no-save-faster-20260926.
Scope: Remove local completed-round persistence and resume, reset browser history restores, accelerate every chapter by 20%, update explanatory copy and deterministic round version. Prepare the additive SQL version migration without applying it. Review PR before production merge.
Result: Exiting and returning starts at round one with 0% muffin progress, including after winning a round and using browser Back. In-page pause remains. Five fall-speed ranges are each 20% faster with existing chapter progression intact. Targeted ESLint, deterministic/PGlite game reward self-tests, production build and browser win/leave/reenter checks passed. Rewards stay inactive, migration unapplied. Production merge and deployment require review.

## [x] 69 - Bodega Vibra and prominent menu return

Authority: Anthony approved the Bodega Vibra plan and explicitly requested implementation and merge after validation. Muffin rewards remain off until he chooses a daily cap.
Base: origin/main b1fd179; branch codex/bodega-vibra-menu-20260926.
Scope: Rename the experience and menu actions to Bodega Vibra, add the line “Es que no entienden la vibra,” redesign both game-entry actions with a rhythm mark, and make every return to the Bodega menu a large high-contrast control. Verify desktop and phone layout, run scoped lint/build, open a PR, and merge after checks pass.
Result: Renamed the menu invitation, game metadata and landing presentation to Bodega Vibra. Added the approved Spanish line and a shared black rectangular game action with waveform mark, directional arrow, offset shadow and tactile press response; the in-game Play control uses the same rhythm language. Every return now reads “Bodega Menu” as a large high-contrast action on landing, gameplay, loss, interlude and victory. Targeted ESLint, production build, 1280px desktop and 390px phone browser checks passed with no overflow or console errors. Muffin claims remain inactive.
