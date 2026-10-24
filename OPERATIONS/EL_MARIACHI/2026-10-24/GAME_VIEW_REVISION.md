# Courtyard Sweep: angled view and welcome

## Scope and direction

Draft-only revision requested 2026-10-24. Base production commit f3c8f63819d3fe8abc66c2b6f83cf6d6609b2c6d (PR360). Branch codex/el-mariachi-oblique-game-20261024. User requested original Hole.io-like angled perspective, no bottom controls panel, and a brief restaurant-inspired pre-game introduction.

Retain the real approved El Mariachi logo, cream #fffaf0, courtyard green #244536, chile #9b382b, terracotta #b96a42 and muted gold #b58a4a. Condensed display lettering pairs with existing Geist utility text. The signature is a small sunlit courtyard rendered with original raised geometry and a recessed opening; no third-party game code, artwork or music. Reuse the existing canvas/Phaser presentation and primitive fallback without new dependencies.

Flow: short welcome and actual rules > Play > compact top status/Pause and courtyard > result with immediate Play again. Existing menu/order navigation remains available throughout. No mandatory extra screen between replays.

The camera is a fixed elevated orthographic projection, not a perspective engine or a copied game camera. Ground paving, footprints and opening use one affine basis; height projects upward. The inverse basis maps drag/keyboard directions back to existing world coordinates while preserving bounded movement strength. Full field remains visible with no camera pan/zoom. The original world, 55-second duration, 54 objects, growth tiers, collection containment, points and deterministic replay layout remain unchanged.

## Permissions and verification

Prepare a scoped draft PR only. An exact-branch Vercel deployment hold prevents an automatic preview; production and other branches remain unchanged. Remove this draft hold only with a later authorized release. No new services, spending, access, phone or menu changes.

Required targeted lint, production build and existing repository CI will run. Runtime browser/gameplay/smoke tests, rendered captures and phone calls are expressly skipped at the user's request. Source inspection and compilation cannot establish visual quality, touch feel, runtime accessibility, rendering parity or gameplay difficulty. No such verification is claimed.

## Prepared implementation and checks

Four application files changed: MariachiRush.tsx, game.module.css, hole-camera.ts (new), hole-drawing.ts. Existing engine and Phaser loader are unchanged. Both render paths share the projected drawing. Original procedural low-poly food/furniture meshes require no image downloads; welcome reuses approved courtyard/plaster assets. Game loop and Phaser import are deferred until explicit Play; replay stays in the game, and keyboard/Escape/background pause/focus behavior is retained.

Source review corrected inherited paragraph-margin specificity and terminal sink disappearance. Final independent source review found no remaining scoped blocker. The camera determinant is 0.4208 and field corners fit inside the 420x560 canvas. This is source reasoning, not a rendered/gameplay check.

Final required local checks passed:
- Targeted ESLint on MariachiRush.tsx, hole-camera.ts and hole-drawing.ts with --max-warnings=0.
- Next.js16.2.11 production Webpack compilation, TypeScript, 60 static pages and traces.
- git diff --check and protected-source diff: menu/photos, phone, game engine/loader, dependencies and existing CI workflow unchanged.

Initial checks passed before the two source-review corrections; final lint/build were repeated because source changed. No browser, rendered capture, gameplay/smoke check or call was performed. Exact-head remote CI remains the next draft prerequisite. No merge or deployment authorized for this revision.
