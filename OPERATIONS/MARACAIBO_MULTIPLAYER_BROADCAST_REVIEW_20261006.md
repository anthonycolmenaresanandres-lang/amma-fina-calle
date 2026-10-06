# Maracaibo multiplayer larger-pitch broadcast refinement — 2026-10-06

State: LOCAL VERIFIED, ready for review; no publication authority.
Branch: codex/maracaibo-multiplayer-sideline-20261005.
Worktree: C:\dev\amma\worktrees\maracaibo-multiplayer-sideline-20261005.
Previous local commit: c32a29e5393b03111b695679e924cf5ad29e2271; underlying main base 6f7c66b (PR312).

## Result

Anthony requested more pitch coverage in the fullscreen multiplayer view, refined stadium/material detail and original soccer broadcast graphics. The portrait pitch now covers 44.9% of the gameplay canvas at 390 x 844 (351 x 305 floor within a 390 x 680 canvas), versus about 20% before. Existing upright figures grow about 28%. Complete nets, character headroom and readable role tags remain visible. The small Back control, connection/practice disclosure and 44 px Up/Down controls remain outside the pitch.

Presentation combines the approved existing photographic-style grass raster with original toy figures, an original lake/bridge silhouette, static floodlights, vinotinto/ivory kits, authentic approved badge, contact shadows, denser nets and an original compact score strip. It is a hybrid presentation, not fully photoreal. No broadcaster logos, LIVE label or affiliation claim.

## Implementation and control impact

- sideline-projection.ts adapts portrait floor depth and raises width/figure scale. One shared projection still positions players, ball, lanes, goal mouths and pointer depth.
- SidelineTableFootballRenderer.ts bakes the distant-grass crop into a small transparent CanvasTexture with the exact pitch polygon. It refreshes only on resize/asset arrival. Resetting the Image frame after texture resize keeps its origin aligned across orientation. This avoids Phaser 4 GeometryMask's Canvas-only limitation and uses no fullscreen filter. Static 520-stroke grain, light bands and floodlights complement the optional raster; floor drawing survives asset failure.
- Contact shadows and ball shading share canonical feet/floor anchors. Goal nets receive finer mesh and light/dark metal strokes. Role labels stay above enlarged bodies.
- TableFootballScene.ts loads only existing local badge/turf art, with zero retries and three-second per-file timeout, while the primitive pitch and controls run immediately. Renderer-owned generated turf/figure textures and objects are cleaned up on shutdown.
- maracaibo.module.css scopes the original broadcast score-strip treatment to multiplayer; truthful score/state/time and practice disclosure remain. No new React interaction, service or database behavior.
- maracaibo-sideline-selftest.ts adds fullscreen sizes and portrait occupancy assertions.

Canonical 0..100 engine units, four fixed lanes/roles, simulation, automatic shooting, session topology, movement direction and collision radii are unchanged. Absolute touch still maps to the same engine depth: a browser tap at projected 76 produced 76.4. Portrait relative drag has more pixels per engine unit because the displayed floor is taller; keyboard and Up/Down behavior remain unchanged. Larger visible bodies do not enlarge collision radii.

Landscape prioritizes full goals/figures and headroom: its centered floor is about 35% of available width and 52% of gameplay-canvas height at 740 x 390. It is intentionally less horizontally immersive than portrait; review the supplied landscape capture before publication.

No solo PenaltyRush/home-lettering change in this iteration, paused abb2667 import, reliability rewrite, migration, secret/access change, new service or art generation.

## Verification receipt

PASS:

- 16 geometry/HUD variants, 1,008 projection/inverse samples, complete nets, all four lane extremes, player/tag fit and movement direction.
- All 19 focused control checks.
- Scoped ESLint; final renderer lint rerun after the orientation fix. One intermediate lint invocation from the wrong directory failed to locate config, then the correct APP/web invocation passed.
- Final-source production webpack build, TypeScript and all 45 generated static pages. Genuine existing cached Geist files supplied through the local font-response mock; no application font changes. Final build exit 0, log .review/build-retry-20261006.log.
- Actual MaracaiboExperience/FootballClient/Phaser component comparison at matching ready state; 390 x 844, 320 x 740 and 740 x 390 fit with one gameplay canvas, no horizontal overflow and non-overlapping 44 px controls.
- Real optional raster rendered, transparent outside-pitch alpha and exact displayed turf bounds after both resizes. Two issues were reproduced and fixed: WebGL ignores GeometryMask; resized CanvasTexture requires an Image frame refresh. Final captures visually inspected.
- Projected touch starts the round and reaches the intended depth. Active Back dismiss retains match; accept returns to the actual menu, destroys the canvas and preserves operational notices.
- Forced missing-turf case and combined missing-turf/generated-player-texture failure preserve all four figures and ready gameplay. No page exceptions.
- Built Next production /table/maracaibo/1 route opened on the first bounded attempt, entered computer practice and returned to menu with zero page exceptions. This resolves the earlier local integrated-navigation timeout for this task. Synthetic visit, coarse-pointer phone fixture and blocked external transport were used.
- git diff --check. Touched source audited against freshly fetched Web Interface Guidelines (https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md): no new touched-control focus, label, safe-area, animation or overlap findings.

Final evidence: .review/broadcast-ui-evidence.json, .review/broadcast-integrated-result.json, .review/broadcast-before-390.png and .review/broadcast-after-*.png. Baseline source snapshots: .review/before-broadcast-*.

UNRUN: live physical multiplayer, external signaling/network recovery, low-end real-device frame rate/texture memory and broad multidevice/Lighthouse suites. No live multiplayer claim.

Optional raster is 2,414,235 bytes and the full source decodes even though only distant grass is used (roughly 6 MB RGBA source plus the small viewport texture). It is approved generated photographic-style art, not proof of a photographed venue. Primitive fallback is verified.

## Native Library artifacts

Confirmed create results, all version 0 with local version attributes applied:

- Built production-route phone screenshot: libfile_597cb82ea2508191ac823735caf4db06; file_000000007f8c81f5984e7674bd4da4a1; broadcast-integrated-390.png.
- Component portrait: libfile_c9f30ed5e7108191a9b5b1fcfebc36b8; file_00000000087081f5b5d6e52ebee238d6; broadcast-after-390.png.
- Corrected landscape: libfile_e87b482dc4388191b2b4e70136e10667; file_00000000ac0481f5a6e5a4f1fac91bfc; broadcast-after-740.png.
- Actual forced primitive path: libfile_0d7043a2e7988191b092354897817e38; file_00000000bbc4822f83a2321b83dd4e8d; broadcast-primitive-390.png.

Library uploads and local image inspection succeeded; no attachment blocker remains observed locally. No guessed download URLs. Screenshot-only delivery; short moving preview was not rendered.

## Handoff

All own component browsers/server and integrated browser/production server closed; final build command terminal. Integrated server tree PID14696 exited and cleanup confirmed. Final successful build PID26156 is terminal. Earlier stopped build PID22776 was explicitly terminated when the resize issue was found; it is not counted as a passing final build. No task-owned process remains. Local commit only; no push, PR, merge or deployment.
