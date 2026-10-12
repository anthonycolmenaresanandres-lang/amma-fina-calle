# Olympia remake - local prospect presentation

Authority: Anthony explicitly requested examining and remaking this existing draft in the live call. Continue `codex/olympia-prospect-demo-20261009`, starting from ae42ab5. Local only; no publication, PR, push, live data, service, spend or commercial commitment. Separate safeguard architecture work is not edited here.

## Before audit and design decision

Read actual current Olympia page/CSS, menu, game wrapper/styles/config and shared VenueMenu components, plus Bodega's real menu implementation. Visually inspected unchanged Olympia logos and historical desktop/mobile captures: the initial orange rounded burger poster dominates, the artwork is a burger rather than the featured chopped-cheese subject, and repeated general section treatment lacks specific deli character. Historical captures show the earlier Fresh food / Fresh juice revision, not the current ae42ab5 campus source. The current campus source was audited by reading; no claim of current before-page rendering.

Browser recheck: initial supported inventory empty; in-app tab creation timed out waiting for the webview. Refreshed inventory then exposed Edge. Supported `createBrowserTab('edge', localURL)` returned **Tab creation is restricted in standalone sidebar mode**. Unrelated existing browser tabs were preserved. Native app APIs disabled; no restricted workaround used. Current before/after rendered audit is blocked until the review browser can open a task tab.

Photo status unchanged: all three supplied images failed the supported Library download with HTTP403. No bytes inspected, no source photo integration or crop choice. Do not bypass or substitute unrelated stock. New artwork is original temporary conceptual illustration, labeled on-screen and in review notes; it depicts a generic deli roll and juice, not actual Olympia food or approved ingredients.

## Direction and critique before implementation

Subject: Olympia deli and juice counter in Hidenwood, with chopped cheese as the menu entry point and a quick, optional existing game. Audience: phone visitors including the assumed CNU community. Page job: identify Olympia, read the provisional menu, reach the game or visit information without persuasion prose.

Tokens: Olympia orange #f36c21; deli green #215b38; ink #14241b; counter white #f9fbf8; pale juice green #e3efd9; citrus #ffd171. Impact/Arial Black restrained display and varsity initials, Geist readable menu/body, Geist mono small utility/caption. No remote font requests or new dependencies.

Layout: dark wordmark masthead -> sticky compact categories -> open headline plus deli-wrapper art -> green community band -> readable menu columns -> open juice/game strip -> simple visit information -> quiet review footer. Phone: stacked headline/art, equal prominent menu/game entry, full-width menu rows and direct visit links. Desktop: asymmetric headline/art with open menu columns. Original wrapper drawing is the single visual signature; menu and links stay quiet.

Rejected first idea: another all-orange rounded hero and pennant/stripe stack would repeat the old template. Remake uses orange only as the art stage, the actual unedited wordmark on ink, open white typography, and a restrained community stripe. No official university marks, Captains name, mascot, badge, sponsorship, promotion or distance claim. Approved line remains exact: Proudly serving the CNU community; approved presentation assumption, not independently verified customer history.

## Acceptance criteria

- Subject-specific art direction and clear concept/photo distinction, real logo unedited; no generic nested cards.
- Eight provisional menu names legible; no invented prices/hours/ingredients/rewards/reviews/offers.
- Clear menu and standard game entry; game exit remains visible, all rounds/pause/resume/restart unchanged.
- 320/390/desktop: no horizontal overflow, artwork sized, controls >=44px, category anchors clear sticky nav, menu readable.
- Semantic links, image alternatives/dimensions, visible keyboard focus, native review disclosure, no ambient animation; reduce motion disables hover motion and standard game receives existing preference.
- Final lint, types, build, source/game contract and HTTP routes; current browser navigation/game/visual checks and screenshots only claimed if actually observed. Pointer, emulated touch, physical touch and ordinary-clock result paths reported separately.

## Final result and verification

Material changes: unedited real white wordmark on an ink masthead; open white chopped-cheese headline and two direct menu/game actions; orange folded-wrapper art stage with newly authored deli-roll SVG (3,728 bytes); restrained green community line/initial; open readable provisional menu rows with the two chopped-cheese names emphasized; separate juice drawing (1,366 bytes) and simple game-entry strip; contact/visit block anchored by the original circular logo. No nested card system or Bodega artwork/palette/content copied. Game chooser removes the old 150/190px burger illustration, shortens the introduction and uses open round buttons; no game logic changes. Old concept SVG is retained for historical evidence but no longer referenced by menu/game runtime.

Source critique/fixes: new menu wrappers made the shared last-child header rule applicable to each section. Added Olympia-only single-column header and item-column overrides, avoiding cramped headings without editing shared components. Narrowed menu-grid styles with `:has(> .menuGroup)` so they cannot accidentally style the new community/menu-intro blocks. Reduced desktop heading minimum at the 700px breakpoint and kept 320px category/action sizing. Artwork was rasterized with the existing local Sharp dependency and pixels inspected; `remake-deli-art-proof.png` and `remake-juice-art-proof.png` are **artwork proofs, not screenshots or restaurant photos**.

PASS on final source:

- Scoped ESLint: `node_modules/.bin/eslint src/app/olympia scripts/olympia-selftest.ts`.
- Existing Olympia self-test: loopback/flag/forwarded-host cases, eight provisional names with name-only fields, exact shared rounds, prospect and primitive asset-free game contract.
- Standalone `tsc --noEmit`, exit 0.
- Full `npm run build`, Next16.2.11 Turbopack: compile, TypeScript, 47 static pages and finalization exit0; both Olympia routes dynamic. One earlier build was interrupted for a local selector correction, excluded from passing evidence.
- Final production HTTP self-test: menu/play200 locally with flag, both routes404 for external/forwarded hosts and separate production instance without flag, noindex/nofollow and template exclusions.
- Final production remake HTTP smoke: exact approved line/headline, visible photo-pending caption and assumption/access notes, every category href/target, all eight names, both new art files and original logos200, three server-rendered menu/game/return-link cycles. React text-node comments are stripped before matching round labels. This tests server output and links, not browser click state or gameplay.
- Repository `verify-local.ps1 -SelfTest`: 14 fail-closed local-origin/assertion cases. Its live smoke supports football skins only; no Olympia result was inferred from it and it was not adapted to bypass unavailable browser tooling.
- `git diff --check`; explicit empty diff for shared VenueMenu/CafeRush, Olympia rounds/gate/menu data and package/lock files. Canonical unrelated queue/log/Bodega modifications preserved.

Transient development check: initial page request returned500 with Tailwind/CSS-module pure-selector transform errors; a fresh request after final source update returned200 and repeated route checks passed. Do not assert an unproved cache root cause. Full final production build/route tests pass. An earlier HTTP smoke also incorrectly matched contiguous Round1 text across React comment delimiters; the evidence script now handles those separators and passes on the built application.

Source accessibility review against fresh Web Interface Guidelines:

`APP/web/src/app/olympia/page.tsx:1` - pass: semantic links/headings, skip target, explicit images/caption/dimensions, decorative art/initial hidden, contact semantics, native disclosure.

`APP/web/src/app/olympia/olympia.module.css:1` - pass source: min-width/grid controls, >=44px controls, anchor margins, visible focus, no new animation/transitions; responsive media rules. Rendered overflow/focus contrast pending browser.

`APP/web/src/app/olympia/play/OlympiaGame.tsx:104` - chooser-only presentation change; existing keyboard catch/pause/resume/exit, status announcements and reduced-motion input preserved.

`APP/web/src/app/olympia/play/play.module.css:20` - open chooser controls, hover/focus, existing active arena/HUD unchanged.

## Blocked acceptance and delivery

Current 320/390/desktop rendered layout, keyboard traversal/anchor clearance and repeated **browser** menu/game/restart/exit were not observed. Supported browser inventory initially empty; in-app creation timed out; later Edge available but task tab creation rejected in standalone sidebar mode. An app preview-open attempt did not return a confirmed result and was stopped; no success or new tab is claimed. Existing unrelated tabs preserved. No automation via restricted native/CLI/raw browser control used. No fresh page screenshot bytes were created, therefore no Library screenshot upload or new screenshot identity exists. The Library upload path itself was not tested in this remake; distinguish this from the earlier three photo-download403 failures.

Pointer catches, keyboard gameplay, one-canvas cleanup and round navigation have historical evidence on the unchanged game logic, not a current final-page browser pass. Emulated touch was unsupported previously, physical touch untested. Ordinary-clock round completion/result/Play again/Next round remain pending: earlier independent RAF/Phaser trace established ~1Hz browser callbacks plus standard smoothing; do not shorten clocks or certify completion from pointer/source/HTTP checks. See OLYMPIA_TIMER_DIAGNOSIS.md and OLYMPIA_GAME_QA_FOLLOWUP.md.

Acceptance is **local remake implemented and build/route verified; final visual/interactive acceptance blocked**, with allowed temporary art rather than integrated photos. Historical Library page captures are obsolete for this remake.

## Local review and next verification

Worktree `C:\dev\amma\worktrees\olympia-prospect-demo-20261009`, existing branch `codex/olympia-prospect-demo-20261009`. Routes `http://127.0.0.1:3119/olympia` and `/olympia/play`. Owned QA servers stopped after tests; restart from `APP/web`:

```powershell
$env:OLYMPIA_LOCAL_DEMO='1'
npm.cmd run start -- --hostname 127.0.0.1 --port 3119
```

The final local `.next` build is present. `npm.cmd run dev -- --hostname 127.0.0.1 --port 3119` also works for editing. No public URL, push/PR/merge/deploy, service/dependency, business contact, spend or live-data/security/commercial change.

When a task browser can open the local route: capture same-state1440/390/320 menu views and game chooser/active state, test category/menu/game/exit three cycles, pause/resume/restart one-canvas behavior and keyboard focus, reduced-motion mode, pointer catches; ordinary foreground45s result/Play again/Next round separately. Report actual emulated/physical touch coverage, then save final screenshots through supported Library flow. Photos remain a separate readable-byte/rights requirement: inspect all supplied inputs before crop/selection when supported materialization succeeds.

Owner inputs: exact identity/contact confirmation, approved full menu/prices/hours/availability/ingredients and item-specific dietary/allergen details, logo and real-photo usage rights, verified ordering destination if wanted, game approval, and any commercial university-name consent. Approved CNU presentation assumption is preserved in review notes, not independently verified history or launch consent.
