# Olympia local verification — 2026-10-09

Status: implemented, reviewable locally, unpublished. Owner content and the manual checks below remain open. No release is authorized.

## Passed

- Existing locked dependencies installed with `npm ci` in the isolated app; no package or lockfile change.
- Scoped ESLint: `npx.cmd eslint src/app/olympia scripts/olympia-selftest.ts scripts/olympia-http-selftest.mjs`.
- TypeScript: `npx.cmd tsc --noEmit`.
- Targeted source self-test: `npx.cmd tsx scripts/olympia-selftest.ts`. Covers explicit flag/loopback gate, rejected direct/forwarded hosts, exact shared round configuration, typed primitive-only prospect skin, eight unique names with no fabricated extra menu fields.
- Full existing app production build: `npm.cmd run build` (Next 16.2.11). Includes dynamic `/olympia` and `/olympia/play`; no shared client/runtime edits.
- `node scripts/olympia-http-selftest.mjs`: enabled local menu/game return 200; nonlocal Host and x-forwarded-host return 404; production server without OLYMPIA_LOCAL_DEMO returns 404 for both routes; HTML includes noindex/nofollow and omits template offer/hours/testimonial.
- Final source has no replacement-character glyphs. Final diff whitespace check passed.

## User-computer browser checks

Used the user's installed Chrome through the computer-use browser tools, not a headless substitute. Viewports: 1440 × 1000, 390 × 844 and 320 × 740. Temporary viewport override reset; final menu tab retained as the review deliverable.

- Desktop and phone hero, authentic logos, concept artwork, menu groups and contact/review sections rendered. Images loaded. No horizontal document overflow at checked widths. Final desktop rice item rows align in one column.
- All Deli / Rice & gyros / Juice / Visit anchor tabs navigate to the expected section and hash, with sticky navigation clearance. Menu-to-game and game-to-menu navigation passed repeatedly.
- All three standard rounds load: round 1 target 100 / 45 seconds, round 2 target 130 / 45 seconds, round 3 target 170 / 50 seconds.
- Keyboard arrow selection and Enter catch increased score to 10. Pause and resume worked. Three consecutive restarts reset score/time and each left exactly one canvas. Choose round removed the canvas; menu navigation left zero canvases.
- Browser QA identified delayed Phaser canvas destruction stacking canvases during quick restart. Olympia-only cleanup now detaches the old canvas immediately and wakes its deferred destruction; shared engine remains unchanged. Repeated restart checks passed after that fix.
- 320 px game HUD, controls, stage and pause overlay fit without horizontal overflow. Sampled browser console had no errors or warnings.

## Remaining / inconclusive checks

- Timed round completion, final win/loss/result focus, Play again and Next round were not conclusively observed. This Chrome automation session throttled progression between tool actions; a bounded result wait did not reach the round-end screen. Follow-up measured an untouched 48-second interval (18:25:08-18:25:56 UTC) during which the unchanged 45-second round advanced only 45s -> 44s. No clocks were shortened or manipulated. Available Chrome controls have no foreground-window/visibility control; native app APIs are disabled. Manual uninterrupted active-tab gameplay is still required. This is a verification limitation, not a confirmed runtime defect.
- Follow-up mouse/pointer catches PASSED at a 390 x 844 viewport: trusted mouse events scored 0 -> 10 -> 25 with observational diagnostics, then 0 -> 15 after restoring/reloading the exact committed source. This is mouse input at phone dimensions, not touch. The exposed browser API has no touch/touch-emulation method and no physical phone is controlled. Touch remains unverified. See OLYMPIA_GAME_QA_FOLLOWUP.md.
- Physical phone/tablet performance, touch precision, screen-reader usability and forced reduced-motion behavior are unverified. Reduced-motion wiring was inspected, but the preference was not changed in the user's browser.
- Asset-enhanced game fallback is not applicable: this skin deliberately has no enhanced asset path.
- Full repository lint and unrelated client end-to-end flows were not rerun. Targeted lint, whole-app type/build checks and preservation/source review were used for this additive scope.

## Evidence

Screenshots are browser captures of the local review route. The sandwich/juice art is an authored concept illustration, not restaurant food photography.

| Screenshot | Local file | Confirmed Library file | Version |
| --- | --- | --- | --- |
| Desktop menu | `evidence/olympia-desktop.jpg` | `libfile_2c57afef65b48191b46d13eff0a5587a` | 0 |
| Phone menu | `evidence/olympia-mobile.jpg` | `libfile_81a04afd01608191a5f728c8a02fed03` | 0 |
| Phone game paused, round 3 | `evidence/olympia-game-mobile.jpg` | `libfile_1c1e955e8e54819190005002de290104` | 0 |
| Mouse catch at phone dimensions, score 10 | `evidence/olympia-mouse-catch.jpg` | `libfile_b021bd5e4fac81919db1d9f5e61b2266` | 0 |

Exact successful create receipts are retained in `evidence/library-receipts.json`. The prepared batch helper failed before any upload with `hosted apps tools/list request failed: network`; direct single-file host uploads then succeeded for all three images. The returned Windows extended attributes could not be applied: the current helper uses `os.setxattr`, unavailable on Windows. Receipt identity is preserved in JSON; image persistence is confirmed by successful Library results. No attachment IDs were invented.

## Preservation and operations

Only new Olympia runtime/assets/tests, these review/evidence documents and isolated branch coordination records changed. The canonical checkout's unrelated modified queue/log and untracked Bodega folder remain untouched. Worktree registration in the app is unsupported for this delegated task, but the standard Git worktree and branch are usable.

Local preview: `http://127.0.0.1:3119/olympia`; game: `http://127.0.0.1:3119/olympia/play`. Restart instructions and owner-content requirements are in `OLYMPIA_REVIEW.md`. No push, PR, merge, deployment, live-data write, commercial change, spending or business contact occurred.

Follow-up: three restarts and three round-specific menu/game navigation cycles passed on the restored source; scoped lint/self-test rerun passed and APP/web diff is empty. Details, coordinate/event proof, exact timer/touch limits and new receipt are in OLYMPIA_GAME_QA_FOLLOWUP.md.

**Timer diagnosis follow-up:** Cause now supported by a passive runtime trace and independent native RAF counter: 57.991 seconds wall time / 61 browser and Phaser frames / 1.01654 seconds game delta. All samples visible, active, unpaused, timeScale 1; raw RAF gap 1016.4ms smoothed to 16.6667ms. No Olympia-specific clock override found. Exact trace, observer source and smallest manual foreground-window result check are in OLYMPIA_TIMER_DIAGNOSIS.md. Runtime restored unchanged; no result completion claimed. The previous preview process had stopped and was restarted for diagnosis; restart instructions apply if it stops after this delegated turn.
