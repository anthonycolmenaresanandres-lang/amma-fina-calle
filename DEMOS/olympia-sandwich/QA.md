# Olympia Sandwich Counter validation — 2026-10-12

Implementation complete; owner authorized PR/CI/merge at 19:23 UTC. Final CI and deployment receipt are recorded in the PR/handoff, not implied by local checks.

## Confirmed checks

- Six frozen Pocket Cafe files match SHA256 and source bytes; original `Game.tsx` simulation callback remains identical after newline normalization.
- TypeScript `tsc --noEmit` passes. Standalone native-loader Vite build passes: JS 321.86 kB (gzip 99.41), CSS 9.62 kB (gzip 3.05) before final labeling changes.
- Scoped TypeScript ESLint of eight touched files: zero errors, zero warnings. The broad shared Next configuration stalled without output and was stopped; no pass is claimed for that attempt. Repository CI supplies the full web checks.
- Seven runtime assets match manifest hashes and sizes; five food images retain alpha; runtime images total 250,252 bytes. All seven loaded in enhanced browser play with zero failed assets.
- Projection corner/bounds checks pass at 390x720, 844x312 and 320x610 game-canvas dimensions.
- Rendered 390x844 phone welcome/game and 844x390 landscape inspected. The room/counter join is coherent in portrait; ingredients sit on the measured counter plane, with transparent food edges. Landscape keeps the complete counter but has restrained gray floor extensions.
- 320px fallback play inspected; zero loaded images, no horizontal overflow. Enhanced portrait also has no horizontal overflow. Local HTTP served all seven art files successfully.
- Start and natural timeout reach results; an enhanced round finished with 10 points after the drag attempt. Replay resets score to zero and collector world position to (0,0). The drag tool timed out, so sustained touch steering and collection-effect timing are not fully confirmed by that attempt.
- Keyboard ArrowRight moved the fallback collector from x=0 to x=1.5; additional right/down input changed both axes. Escape opened pause. Pause held at 32 seconds across the intervening review, and resume decremented to 30 seconds.
- Browser warning/error sample empty. Desktop canvas diagnostics observed roughly 40–56 FPS and 3.7–5.5 ms average paint. These are qualitative local observations, not physical-phone benchmarks.
- Temporary browser viewport reset, owned tab closed and dedicated loopback server stopped after review.

## Remaining limitations

Recipe identity/species/varieties await confirmation. Sustained physical-touch steering, maximum-tier visual alignment, complete level progression and an actual mobile-device performance benchmark remain untested. Core preservation guards the original rules but does not substitute for those acceptance checks. Artwork uses illustration rather than photorealistic food; large source-tier ingredients retain the original sizing behavior.

The earlier bundled Vite loader touched the shared dependency junction's empty `.vite-temp` directory at 13:26:39 -04:00. Native-loader and worktree-local-cache corrections are now in place. The current integration build left that timestamp unchanged; no shared dependency installations or cache cleanup were performed. Existing active website source/assets/branch/server were not edited by this task.

Review captures are in `art/review/`. The snapshot artwork/layout preceded the final public-preview wording; source and release validation must identify the exact final head.

## Final release build

The final public-preview wording, Olympia return link and website entry are built. Direct Vite native-loader build passed in 31.33 seconds: JS 321,904 bytes / gzip 99.42 kB, CSS 9,669 bytes / gzip 3.06 kB. Source/art/projection verification passed again on the reconciled branch. Four obsolete bundles were removed only from this game output. Local build hashes are in `art/release-build.json`; Git normalizes HTML line endings. Public verification compares exact committed bytes. The later local lint startup stalled without output and was stopped; required repository CI remains the full web lint/types/build gate.

## Verified publication

PR [329](https://github.com/anthonycolmenaresanandres-lang/amma-fina-calle/pull/329) merged as `4c50c5d048b51fea59eeff2d20e009be85dc1aa1` after green exact-head CI. Post-merge CI passed. Production deployment `dpl_BZzNuGpsAL4NJEsAr4xkKYqsU2pv` is READY and serves [the game](https://finacalleos.com/demo/olympia-sandwich/index.html). All ten game files match committed bytes; Olympia and Juice Rush navigation return200. Public phone render loads all seven art assets, fits without horizontal scrolling, pauses and returns to Olympia successfully. Recipe and physical-touch/max-tier/device-performance limits above remain unchanged. Structured receipts are under `OPERATIONS/OLYMPIA/2026-10-12/SANDWICH_*`.


## 2026-10-12 closer-camera / rival revision

Anthony authorized implementation and publication at 21:13/21:15 UTC, then explicitly expedited publication at 21:57 UTC because the desktop was slow. Extra local testing was stopped after the standalone build and focused checks completed. This revision keeps the seven inspected artwork files (250,252 bytes), original ingredient catalog, levels and input primitives. A new opt-in standard supplies the race rules; no other live client imports it.

Settings: 45 seconds; targets 2,400 / 5,000 / 9,000 (previously 60 seconds and 1,800 / 3,800 / 6,800). Rival speed is 62% / 68% / 74% of the player's matching growth tier; target decisions every 0.65 / 0.50 / 0.40 seconds, after a 2.5-second player head start. Both start at the same safe point, follow identical size/growth/score/claim rules and compete for one pool. The rival routes around blocked ingredients, never reads player input and receives no bonus points. Win requires target plus a strict score lead.

Completed checks:
- TypeScript: zero diagnostics for the changed adapter, UI, renderer, geometry and standard engine.
- `node DEMOS/olympia-sandwich/verify.mjs`: PASS. Six frozen files, archived original callback, seven exact asset hashes, projection bounds, 135 all-tier/position/viewport alpha-hull containment cases; capture boundary, size gates, ownership/tie, unique scoring, pause, arena margin, deadline, grace and reset invariants.
- Deterministic 45-second scenarios: efficient driver wins all three counters (7,990 / 15,150 / 21,825); idle player loses all and the rival reaches tier 5; 15-second delayed start loses counter 1 (3,770 vs 4,380). These are feasibility checks, not a measured human win rate.
- Standalone Vite native-loader build PASS: JS 293,955 bytes / 92.01 kB gzip; CSS 10,491 bytes / 3.24 kB gzip. No dependency installation; game-local cache/output. Shared `.vite-temp` mtime remains 1791825999.855884.
- Actual 390x844 phone viewport: welcome and race inspected and captured. Seven images loaded, zero failures, no console warning/error. Matching green capture rim contains sandwich art; closer food view and active growing rival visible. Observed canvas 57.9 fps, 4.70 ms average paint. Keyboard moved player from (0,0) to (0.451,0.300). Pause held timer at 25s and both positions/scores unchanged across reads; resume continued.
- Task-owned browser tab 5 closed and viewport reset; task-owned 4186 server stopped. Scoped ESLint had stalled without diagnostics and was interrupted; mandatory remote CI will supply full app lint/build validation.

Untested limits for this revision: fresh landscape and 320px rendered pass, sustained pointer/physical-touch play, rendered max-player-tier pass and browser result/restart pass were stopped under Anthony's explicit expedited-release instruction. Geometry is verified across all five tiers and portrait/landscape sizes in the pure checks; reset/outcome behavior is verified in the engine. Existing recipe remains provisional and unnamed. No new art generation was needed or performed.

Production publication remains gated on exact-head remote CI and deployment verification. Preserve main95cc040 / PR330 menu, all39 menu records/photos, Juice Rush and other clients.
