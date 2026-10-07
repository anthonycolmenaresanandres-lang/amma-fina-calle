# Project Seed — approved ube and typography revision

Date: 2026-10-07. Local review only; Project Seed client approval remains pending.

This revision follows Anthony's request for a quieter composition and distinct typography, then the approved deep ube purple with cream lettering direction. It supersedes the active ivory/woven/sun treatment recorded in FILIPINO_VISUAL_REFINEMENT_20261007.md. Historical decorative SVGs remain in the branch but have no active references.

## Result and scope

- Seed menu and game entry now use deep ube #24172f, cream #f8f2e8, and muted lavender #c9bfd2. This connects to the brand's established ube drinks, Filipino ownership, and supplied Philippine flag; no regional affiliation or new brand claim was added.
- A free, locally hosted Fraunces variable serif gives Seed its own display typography. It differs from Maracaibo's Geist/current-main and Decoy/in-progress treatment. Existing Geist body copy remains readable. Scope is Seed only: project-seed-type.ts imported by the menu and game entry.
- Font: public/fonts/project-seed/fraunces-latin.woff2, 67,304 bytes, valid wOF2 signature, normal variable weights 400–700 and optical sizes 9–144. SIL Open Font License bundled as OFL.txt. Sources: [Google Fonts CSS](https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&display=swap), [font metadata](https://github.com/google/fonts/blob/main/ofl/fraunces/METADATA.pb), [OFL](https://github.com/google/fonts/blob/main/ofl/fraunces/OFL.txt). No remote runtime font dependency, paid asset, or installation.
- Menu uses one original Buko Pandan photo and an open headline; duplicated photo strip, duplicate Borahae decoration, signature art repetition, ornate woven/sun decoration, large floating play panel, and redundant promotional flavor sentence removed. A simple text link keeps Seed Rush available in its teaser.
- All menu groups, item names, descriptions, options, prices and 33 Ask staff for price notices remain unchanged. Readable October menu stays text, not a flyer.
- Game entry uses open three-round product previews, original labeled photo cutouts, quiet Halloween edition text and a simple cream CTA. Decorative webs removed so seasonal decoration does not overwhelm the permanent identity. Intro-only seasonal class and October live/date behavior unchanged. The game engine, rules, scores, item scaling, round timings, assets, reward notices and original café playfield are unchanged.
- Supplied circular logo, Philippine flag, demo/concept notices, official links, and noindex/nofollow/nocache are retained. No cartoon cups or Tabi-tabi po restored. Shared Bodega/VenueMenu components and styles are untouched.

Brand reference: [official Project Seed site](https://projectseedcoffee.squarespace.com/). Original asset decisions: VISUAL_CLEANUP_20260930.md (PR288/289).

## Validation

Passed:
- Targeted ESLint: Seed menu page, SeedRushClient.tsx, project-seed-type.ts.
- Existing scripts/project-seed-selftest.ts source, route, original product, seasonal timing, rule and asset-budget checks.
- Production next build --webpack: compilation, TypeScript and all 45 generated pages.
- git diff --check.
- Production Chrome desktop review requested 1440x1000, phone 390x844 and narrow phone 320x812. Menu actual DOM width/scrollWidth matched: 1425 desktop, 375 standard phone, 305 narrow phone. Game desktop 1440 and standard phone 375 matched. Captures are viewport screenshots, not full-page images.
- Menu signature and Tea & more anchor navigation and narrow category readability.
- Original photo cutouts and original labels visually inspected; no clipping at tested widths. Font appearance visibly matches the new serif; computed heading family is seedDisplay with Georgia fallback.
- Menu/game noindex metadata and concept notices verified in production DOM.
- Existing game Start, Pause, Resume and Exit flow; original café playfield visually inspected. Production browser error log empty.
- Contrast against ube: cream 15.22:1, secondary lavender 9.58:1, accent 11.0:1.

Unrun: full three-round completion, forced asset-failure/primitive fallback, Lighthouse, physical-device performance. No gameplay logic changed. Browser automation may pause game timers when the tab is not foreground; this review is a control/entry smoke check, not a full score run.

## Confirmed revised Library screenshots

- project-seed-ube-menu-desktop.jpg: `libfile_e11a57b829048191bcae8e1fe2cf4f28`; underlying file `file_00000000fe1881f587021a340ea81f1f`; confirmed saved version 0.
- project-seed-ube-menu-mobile.jpg: `libfile_85361d39ca048191b91caa0c19f6e744`; underlying file `file_00000000167c81f993aa01bbcf741a12`; confirmed saved version 0.
- project-seed-ube-signature-menu-mobile.jpg: `libfile_364d43f1802c8191bd542b5ccb3bac80`; underlying file `file_0000000086bc820cbe48d33abf3caf2a`; confirmed saved version 0.
- project-seed-ube-game-desktop.jpg: `libfile_23281420bbd08191ac34782fb56ba622`; underlying file `file_000000003bcc8230884d33fcf5435a60`; confirmed saved version 0.
- project-seed-ube-game-mobile.jpg: `libfile_bb68e05fb76c8191a70bcf496cfe7e0b`; underlying file `file_00000000c08081f592474aa5e4e7cd92`; confirmed saved version 0.

All five Library creates returned succeeded. Local originals and exact receipt are in C:/Users/bellmark/Documents/Codex/2026-10-07/task/screenshots/library-ube-manifest.json. Python is unavailable, so the helper could not apply filesystem xattrs; identity/version metadata is retained in the manifest. Earlier ivory screenshots remain historical and are not the latest review.

## Isolation and cleanup

Branch: codex/project-seed-filipino-refinement-20261007. Worktree: C:/dev/amma/worktrees/project-seed-filipino-refinement-20261007. Based on verified main b8ab4913792f0674080bfcc3daaa5c794a752c8e; initial local refinement d0854e3e5b8b6ea59a60f938ca6032a9c8ed1105 remains in history.

Canonical checkout still has only its pre-existing operations modifications (CODEX_QUEUE.md, HANDOFF_LOG.md, untracked OPERATIONS/BODEGA). They were not imported or modified.

Owned production server stopped, owned tab closed, temporary viewport reset. One heavy process at a time. No push, merge, deploy, credentials, paid assets or installation. Initial denied discovery actions were stopped without another route: C:/Users/bellmark directory enumeration; Get-CimInstance Win32_Process inventory. No denied session paths accessed. No remaining implementation blocker.
