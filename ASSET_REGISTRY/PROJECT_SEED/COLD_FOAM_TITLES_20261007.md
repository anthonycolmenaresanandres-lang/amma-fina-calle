# Project Seed — cold-foam title review

Date: 2026-10-07. Local revision of e51e58061f86e77945d912452bb3266e3d7bd557 on codex/project-seed-filipino-refinement-20261007. Anthony requested titles that look written in cold foam.

## Exact changes

- Main menu display headings and the Seed Rush entry title have softly rounded letterforms, a thin creamy rim, restrained raised depth, and fine microbubbles clipped inside the real text. The approved ube/cream palette and open layout stay in place.
- Fraunces uses its SOFT 100 / WONK 1 variant, self-hosted as public/fonts/project-seed/fraunces-foam-latin.woff2 (62,264 bytes, valid wOF2 signature), normal weights 400–700 and optical sizes 9–144. The prior font file remains historical; only the soft variant is referenced. Existing SIL OFL license covers this variant. Official [Google Fonts CSS](https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,400..700,100,1&display=swap) and [Latin font](https://fonts.gstatic.com/s/fraunces/v38/6NU78FyLNQOQZAnv9bYEvDiIdE9Ea92usiIk_WBq8U_9v0c2WS01xC9TeA.woff2).
- Shared Seed-only project-seed-foam.module.css adds gradient text fill, a .65px desktop/.35px phone rim, and small static drop shadows. Original 859-byte cold-foam-bubbles.svg provides an illustrative microbubble texture. No raster generation, new dependency, paid asset or installation was needed.
- Major menu h2 titles are scoped through the Seed wrapper. Only the game intro h1 receives the finish; playing/results headings and game engine are unchanged. Body descriptions, item labels, price notices, navigation, original client logo/flag, and product photos remain clean and unchanged.
- Real text, heading semantics and selection are preserved. Plain cream fallback is retained for browsers without background-clip support; forced-colors uses CanvasText without effects. No animation or motion added.
- A production visual check caught the game's existing background:none overriding the foam fill. The final scoped selector explicitly outranks that rule; production DOM and screenshots confirm full creamy fill, including the Rush span. No hollow title remains.

Menu content/prices, original labeled products, noindex/demo notices, October/Halloween activation, game rules/timings/scaling/scores/rewards, and shared Bodega components/styles are unchanged. No new regional claim or rejected asset/text restored.

## Passed checks

- Targeted ESLint: menu page, SeedRushClient.tsx, project-seed-type.ts.
- Existing project-seed-selftest.ts source/route/original product/seasonal timing/rule/asset checks.
- Final production next build --webpack: compilation, TypeScript, all 45 generated pages. Rebuilt after the CSS override correction.
- git diff --check.
- Desktop and phone production visual inspection at requested 1440x1000, 390x844, and narrow 320x812. Menu width/scrollWidth matched at 375 standard phone and 305 narrow phone; game narrow matched at 305. Signature heading and unchanged body rows remain readable.
- Full game title fill confirmed via computed background-image and visible screenshots. Accessible text remains Seed Rush.
- All 33 Ask staff for price notices still present; noindex/nofollow/nocache and concept notices retained.
- Darkest illustrative bubble core #e0d3c0 (25% core over darkest gradient #e7dccc) is 11.50:1 against ube #24172f. Body colors unchanged from prior checked 9.58:1.
- Browser error logs empty in final production review.

Unrun: full gameplay/control retest, full three-round completion, forced asset-failure/fallback, forced-color device review, Lighthouse and physical-device performance. This change only affects display typography; previous game control smoke evidence remains in UBE_TYPOGRAPHY_REVIEW_20261007.md. Unsupported-CSS and forced-colors fallbacks were reviewed in source, not emulated on a physical device.

## Confirmed Library screenshots

- project-seed-foam-menu-desktop.jpg: `libfile_5cbd1ba39b548191ae55c3bf1a9f4c1d`; underlying file `file_00000000593081f5a0a8461f6c48ad8c`; confirmed saved version 0.
- project-seed-foam-menu-mobile.jpg: `libfile_261f31e10d7c8191881a58e3be621054`; underlying file `file_000000000cb881f5812fe0b46ea0d450`; confirmed saved version 0.
- project-seed-foam-signature-menu-mobile.jpg: `libfile_10d3f8df0e2c819181a7bb9556d5132d`; underlying file `file_00000000941c81f5b03ed8cd881ba491`; confirmed saved version 0.
- project-seed-foam-game-desktop.jpg: `libfile_3c64c7098ad881919c5e12b376a23408`; underlying file `file_000000003aa8820e877a54ced41d5eff`; confirmed saved version 0.
- project-seed-foam-game-mobile.jpg: `libfile_85dbdc9218e481918bcbb7c6e5f18d28`; underlying file `file_00000000506c81f59861576d2a1b786c`; confirmed saved version 0.

Local captures and full receipt: C:/Users/bellmark/Documents/Codex/2026-10-07/task/screenshots/library-foam-manifest.json. All five creates returned succeeded with version 0. As previously documented, Python is unavailable; Library identity/version metadata remains in the receipt, and filesystem xattrs were not applied.

## Boundaries and cleanup

No push, merge, deploy, credentials, installation or paid assets. Isolated worktree retained for review; canonical unrelated changes preserved. Owned development/production processes stopped; active final browser tab closed; viewport reset. Only one heavy process ran at a time.

Browser cleanup limitation: the initial preview tab 1179783743 at http://127.0.0.1:3027/demo/project-seed lost its debugger connection during reload. The API refused its close action with Debugger is not attached. A final owned-tab inventory confirms it remains open; no alternative control route was used. Its local server has been stopped. No implementation or screenshot blocker remains.
