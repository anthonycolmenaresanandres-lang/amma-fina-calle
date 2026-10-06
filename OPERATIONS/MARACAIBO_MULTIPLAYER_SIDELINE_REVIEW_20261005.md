# Maracaibo multiplayer sideline redesign - local review

## Result and authority

Local implementation and focused verification are complete on codex/maracaibo-multiplayer-sideline-20261005, based on current origin/main 6f7c66b (PR312). Fresh fetch on October 6 found no upstream movement or reconciliation conflict. Worktree: C:\dev\amma\worktrees\maracaibo-multiplayer-sideline-20261005. Anthony approved the low side angle retaining depth, roles and both goals (Sentinel_8187c566e8c88191b99c868ef5e85d3b), then authorized resuming local verification and preparing a local commit. No push, PR, merge, deployment or production authorization.

## Review artifacts

Native Library screenshot: libfile_06becda146948191bb04e97b20da4765
https://chatgpt.com/api/library/files/libfile_06becda146948191bb04e97b20da4765/download

This shows the actual sideline renderer at 390 x 844 in a local harness using the unchanged FootballSession and synthetic computer seats. Harness chrome is illustrative; it is not a verified live table connection or integrated application flow. The final 390px renderer retains that visual direction.

Matching final before/after: .review/before-pitch-390.png and .review/after-pitch-390.png. Primitive fallback: .review/primitive-pitch-390.png. Narrow and landscape captures: .review/after-320.png, .review/primitive-320.png, .review/after-landscape.png and .review/primitive-landscape.png. Landscape harness chrome requires scrolling to see the whole canvas; the complete field is fitted within its canvas. Final recorded check evidence: .review/verification-final-20261006.json. Final-source successful build log: .review/build-retry-20261006.log. Support files remain untracked and are excluded from the implementation commit.

## Implementation and controls

- SidelineTableFootballRenderer.ts: original upright toy football figures in vinotinto/ivory kits, approved genuine badge, restrained lake/bridge setting, eight small local pose textures, direct Graphics fallback, foot anchors and floor-depth sorting. No generated bitmap art, political likeness, new dependency or service.
- sideline-projection.ts: common floor projection for markings, lanes, players, ball, shadows and both raised goals, plus inverse geometry. Sprite size does not enlarge mechanical hitboxes or kick reach.
- TableFootballScene.ts: Maracaibo-only sideline presentation from the first frame; existing optional badge is its only external asset. Touch steering uses the same visible pitch depth. A Maracaibo-only ResizeObserver keeps Phaser's dimensions synchronized with the actual container during orientation changes and disconnects on scene shutdown.
- input.ts: resizing clears a retained mobile target and gesture anchor. Up moves toward the far touchline; down moves toward the near touchline. Drag sensitivity follows the compressed visible depth. Fixed role x coordinates, automatic shooting and existing alternative controls remain.

The observer addresses a reproduced sizing transition: the container expanded to 692 x 260 while Phaser remained at 272 x 310. Refreshing after reading current parent bounds fixes that transition without changing simulation, session or network behavior.

No changes to engine.ts, football-session.ts, football-peers.ts, football-view.ts, use-table-visit.ts, DB migrations, QR routes or solo PenaltyRush PR311. Paused abb2667 was not imported; unrelated canonical work was preserved.

## Verification and limits

PASS: 19 real-adapter/control checks, including projected tap/drag, primary-pointer ownership, resize cancellation, retained targets, blur/cancel and rematch. PASS: 10 viewport/HUD geometry variants and 630 coordinate round trips, complete goal/player fit, role ordering and direction. PASS: scoped ESLint and final-source full Next 16.2.11 webpack production build, including TypeScript and all 45 static pages. Build used genuine existing cached Geist/Geist Mono responses through a temporary build-only helper; no application font change.

PASS: one sequential Chrome run reached matching ready-state before/after views, eight generated pose textures in the enhanced path, zero pose textures under forced generateTexture failure, all four roles, one canvas, no horizontal overflow or page exceptions, touch steering, target cancellation on resize, and portrait-to-landscape width synchronization for enhanced and primitive paths. Final images were visually inspected. Fallback exercises the real TableFootballScene, not a replacement scene. The one final browser attempt and its owned preview server were closed; server tree termination returned exit 0 and confirmed process exit. All builds are terminal; no task-owned preview remains running.

NOT VERIFIED: integrated production table-page navigation/practice/leave, natural device performance, and live physical multiplayer. Production navigation to /table/maracaibo/1 exceeded its bounded 15-second load wait after focused renderer checks completed. No further retry was made at the user's instruction to avoid dwelling. This is a verification blocker, not a diagnosed source defect or permission to rewrite reliability.

Independent static review of unchanged main also identified existing reliability concerns: transient visit heartbeat errors can unmount FootballClient (use-table-visit.ts:33-50); device clock expiry can stop revalidation (66-70); departure can reassign surviving members' roles (football-session.ts:141-147); neutral clears can be treated as published when not-ready session input is dropped, with retained targets across disconnect (football-view.ts:63-71); readiness can include inactive disconnected members (football-session.ts:164-169). These findings have no physical-phone reproduction and are not resolved by this presentation change. Do not import paused abb2667 as part of this task.

## Handoff boundary

The local commit is a review candidate. Before any release, obtain Anthony's explicit feature-branch push/PR authorization, complete integrated navigation verification, then require normal exact-head CI and review. Merge/deployment need their own authorization. No new services, credentials, access changes or migrations are proposed.
