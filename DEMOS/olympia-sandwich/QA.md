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
