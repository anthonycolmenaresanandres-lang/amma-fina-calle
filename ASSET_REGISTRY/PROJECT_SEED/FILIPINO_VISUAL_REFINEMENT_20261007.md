# Project Seed Filipino visual refinement — October 7, 2026

Anthony requested a more Filipino visual identity. This is a local concept refinement, pending Project Seed approval.

## Grounding and scope

Base: verified GitHub main `b8ab4913792f0674080bfcc3daaa5c794a752c8e` (October 6).
Branch: `codex/project-seed-filipino-refinement-20261007`.
Worktree: `C:/dev/amma/worktrees/project-seed-filipino-refinement-20261007`.

References: [official Project Seed Coffee site](https://projectseedcoffee.squarespace.com/) and `VISUAL_CLEANUP_20260930.md` (PR288/289 context). The official site describes Filipino ownership, community roots, and ube cold brew. No regional affiliation has been inferred or added.

The supplied circular logo, Philippine flag, original photo-based product cutouts and labels remain unchanged. Cartoon October cups, displayed menu flyer and “Tabi-tabi po” remain excluded.

## Exact changes

- `APP/web/src/app/(internal)/demo/project-seed/page.tsx`: Seed-only wrapper and brand/CTA classes. No copy, menu data, ordering links or dates changed.
- `october.module.css`: warm ivory/beige hero with subtle woven texture behind the original Buko Pandan photo; brand-red headline; small decorative flag-sun detail; logo 150px desktop / existing 138px mobile; 5px red page edge; sun detail replaces generic equalizer bars in Seed play links.
- `APP/web/src/app/play/project-seed/page.module.css`: landing uses the permanent ivory, red and warm ink palette; restrained woven divider and sun detail; existing Halloween webs reduced to 12% desktop / 8% mobile opacity and 220px / 108px maximum width. Existing intro-only Halloween activation is unchanged.
- `brand/woven-trim.svg`: original lightweight interlaced material texture. It is not attributed to a particular regional weaving tradition.
- `brand/philippine-sun-detail.svg`: decorative eight-ray detail adapted from the existing public-domain [Philippine flag asset](https://commons.wikimedia.org/wiki/File:Flag_of_the_Philippines.svg). It does not replace or modify the client logo.

Shared VenueMenuLayout, Bodega styles, all menu data/prices, seasonal dates/activation, game rules, engine, scores, rewards policy and playfield assets are untouched. Both routes retain noindex, pending-approval concept notices.

## Validation

Passed:
- Targeted ESLint for the changed TSX page.
- Existing `scripts/project-seed-selftest.ts` (menu/source/route, original products, rejected text, seasonal timing, rules and asset-budget checks).
- Production `next build --webpack`: compilation, TypeScript and all 45 generated pages.
- `git diff --check`.
- Production browser inspection with viewport overrides 1440×1000, 390×844 and 320×812. Actual captured sizes: desktop 1425×990; phone 375×812. Narrow DOM width/scrollWidth both 305px; standard phone both 375px, on both menu/game.
- Signature anchor navigation; all 33 “Ask staff for price” notices present.
- Keyboard focus on October menu link: solid 3px outline.
- Menu/game noindex metadata and concept notices.
- Original landing product images loaded; production browser error log empty.
- Existing game start, pause, resume, exit and menu-return flow inspected during development; café playfield remains unchanged.
- Before/after visual comparison at the same requested viewport/state. Baseline screenshots are saved locally beside final captures.

Not rerun: full three-round completion, forced asset-failure/primitive fallback, Lighthouse, physical-device performance. No runtime game logic or playfield assets changed.

One initial closing-tag error was corrected before passing lint/build. An initial sandbox lint invocation stalled and was canceled; the successful isolated checks ran afterward. No installation occurred.

## Confirmed Library screenshots

- project-seed-menu-desktop.jpg: `libfile_e5216b8ef34881919c3d1028f30c743d` (file `file_00000000ef0c81f5b5bf74fb545af68f`, saved version 0).
- project-seed-menu-mobile.jpg: `libfile_6299778aea1c81919c42636f3fa2685a` (file `file_00000000a658822fa9d471311aae2687`, saved version 0).
- project-seed-signature-menu-mobile.jpg: `libfile_b6cd0ec39e648191b5899a22aab7bb11` (file `file_0000000090fc81f5a9a93568a3e23497`, saved version 0).
- project-seed-game-desktop.jpg: `libfile_0b36f853a1cc81918010fd68256859bc` (file `file_00000000aa1481f49413487f71f23dea`, saved version 0).
- project-seed-game-mobile.jpg: `libfile_8fa3a9e3a1e081918ec75905b6b1b785` (file `file_00000000a4c881f5851029865aa8f9a2`, saved version 0).

Original files and complete receipt: `C:/Users/bellmark/Documents/Codex/2026-10-07/task/screenshots/`.
Library confirmed every create succeeded. Python is not installed; the Library metadata helper could not run. Returned identity/version metadata is retained in `library-manifest.json`; filesystem xattrs were not applied.

## Boundaries and cleanup

No push, merge, deployment, credentials, paid assets or installation. Owned development and production servers stopped; owned browser tabs closed; temporary viewport reset. Canonical checkout's unrelated operations changes were not imported or modified.

Denied discovery actions were stopped: directory enumeration of `C:/Users/bellmark`; `Get-CimInstance Win32_Process` process-inventory read. Neither was retried by another route. No denied session paths were accessed. These did not block source implementation, verification or Library saving.

