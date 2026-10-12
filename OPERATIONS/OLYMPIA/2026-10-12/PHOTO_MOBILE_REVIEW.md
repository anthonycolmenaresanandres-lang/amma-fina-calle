# Olympia supplied photos and mobile layout

Branch: `codex/olympia-mobile-photos-20261012`, retaining checkpoint `de60a4f`.

## Authority and provenance

Anthony explicitly approved public repository publication of the six supplied originals after disclosure that the repository is public. The parent supplied pinned commit `c63151eb5d9ebc8961f9ffef05b16bbdbc2eb6cf` on `codex/olympia-photo-assets-20261012`. Only `APP/web/public/assets/olympia/photos/photo-01.png` through `photo-06.png` were restored from it; the branch was not merged. All six SHA256 values match the provided evidence. Existing photo identities are preserved in `MOBILE_PHOTO_CHECKPOINT.md` and hashes/crops in `APP/web/src/app/olympia/photo-data.json`.

The Git-backed originals resolve the prior Library materialization dependency. No Library helper was modified or bypassed. Original and optimized pixels were inspected. No image generation or external photo search/download was needed. Original files remain unchanged.

## Design and performance

The navy/orange identity and early phone menu/game actions are retained. The sandwich is the main photo, shown at its full aspect ratio and capped at its native 565px width. The hero says “Deli. Juice.” to avoid assigning an unconfirmed sandwich photo to a named menu item. The bowl is a general menu feature; orange-colored and green drink pours form a pair; the counter and Olympia sign establish the visit section, supported by the refrigerator photo. Exact dish/flavor mapping remains unconfirmed.

Display crops remove screenshot arrows/top overlays while preserving sandwich halves, pouring streams/cups and the Olympia sign. Twelve WebP variants use 320px and native cropped widths, without upscaling. Six largest display files total 217,670 bytes versus 2,361,519 bytes for the originals (90.78% smaller). Only the hero photo loads eagerly with high fetch priority; the other five load lazily. Dimensions reserve image space and responsive sources select a suitable file. Reproduce with `node scripts/olympia-photos.mjs` from `APP/web`, using the existing installed Sharp dependency.

All 39 captured menu names/descriptions/prices, native disclosures, source/date notice, standard Juice Rush rules and other clients remain unchanged. Existing concept SVGs are retained as original assets, though replaced on this page by the supplied photographs. Review notes identify provenance and unconfirmed item/flavor pairings.

## Verification status

- PASS: all six original SHA256 checks; original and optimized pixel/crop inspection.
- PASS: focused ESLint; existing source selftest verifies all 39 source-matched selected items and standard game; updated local HTTP selftest verifies menu/game 200, noindex/nofollow, all 39 names/prices/descriptions and native collapsed disclosures, six responsive photos/all 12 served WebP variants, preserved original assets and template exclusions.
- Astra: final source/asset review found no concrete blocker. All six crops preserve food, pouring action and Olympia sign; general text avoids unverified dish/flavor mapping. Actual page rendering is not approved. Check photo/text balance near the 700px breakpoint in particular.
- BLOCKED: user-computer browser control timed out/reset on documentation recovery, read-only inventory and one new local preview tab. No new screenshot, phone/tablet/desktop overflow check, keyboard disclosure check or repeated game/navigation pass is claimed. No alternate browser automation attempted.
- No redundant local full build; full production build/type validation belongs to the existing CI workflow.

The separate sandwich collector task yielded heavy work and stopped its preview. This revision does not touch its worktree, game or assets. Local preview route: `http://127.0.0.1:3119/olympia` when the task-owned server is running. Publication remains subject to the outstanding release checks; existing live revision is unchanged at this checkpoint.

## Saved result and remote blocker

Implementation commit: `809cdefb83b3efaf81d057128b4b2a104a633eff`. Local source, lint, HTTP and staged diff checks pass; whitespace-only trailing blank lines in the operations logs were corrected before commit. The task-owned preview server was stopped after HTTP verification.

Automatic approval review rejected `git push -u origin codex/olympia-mobile-photos-20261012`, stating that the original user instruction forbids pushes/PRs and that later authorization for this code branch was not established. The command did not run. The rejection has not been bypassed or retried through another tool. A read of parent thread `01a118e6-7e07-7102-95a6-fb86286da011` returned no turns, so it supplied no additional authorization evidence. A pre-push GitHub search found no PR for this feature branch.

No feature push, PR, remote CI run, merge or new site deployment is claimed. The originals' already-authorized public asset commit is separate from this blocked site revision. Full build/types remain pending in the existing CI workflow; rendered review remains independently blocked by browser transport. Explicit confirmation of feature push/PR/checked merge/deploy scope is needed to clear the automatic approval blocker. Then complete CI and actual phone/tablet/desktop/disclosure/game-flow review before release.

## Remaining owner content

Confirm exact dish/flavor pairings before attaching these photos to individual menu entries. Full menu coverage, customizations, in-store prices, hours, dietary availability and Olympia acceptance remain open. No whole-business halal claim, fabricated review, offer or opening hours was added.
