# Maracaibo Street Football — local penalty-style revision

Status: REVIEW READY, LOCAL ONLY. Anthony requested the penalty game's graphics; this turn authorizes editing and focused review only. No push, PR, merge, deployment, permissions or spending. Current production remains unchanged.

## Presentation
The actual Maracaibo penalty source (`MaracaiboPenaltyClient.tsx`) specifies its sunset lake/bridge stadium, foreground turf, tequeño kicker, illustrated keeper, low scrim and burgundy/gold palette. Those existing files were visually inspected and reused by URL, without modifying their Git blobs. Street Football now has an angled full pitch, perspective-sized upright tequeño outfield players, existing keeper art, foot shadows, depth order, white goal frames/nets and the penalty-style palette/HUD. The away team gets a runtime cream tint of the source burgundy fabric; folds, gold pastry pixels and transparency are retained, and no asset file is changed. Home/away badges remain distinct. A missing image falls back to an upright kit-colored primitive. The ball stays above character artwork, as in the penalty renderer, to retain play readability.

Five players per side, 120 seconds, numeric rules, AI, possession, passing, charged shots, tackles, set pieces, scoring and replay are unchanged. The archived engine diff is zero. Control callbacks and the fixed-step loop match the previous source. Portrait/landscape input axes remain the same. Existing penalty game, table menu and other games are untouched.

## Evidence
Strict TypeScript, renderer production build, targeted source lint, 11 focused simulation cases (including 20 seeded full matches), and 4 simulated DOM/control variants passed. The latter cover concurrent controls, cancel, blur/visibility, resize, full time and replay with loaded/missing images. Offline renderer proofs exercise asset/fallback presentation at 390×550, 320×326 and 844×230; all world corners stay bounded, depth scaling holds, and renderer snapshots remain unchanged. `VISUAL_REVISION_EVIDENCE.json` records hashes and exact limits.

Chrome recovered for this revision. Actual browser captures at 390×844, 320×568 and 844×390 show the revised art and no page overflow; controls remain entirely visible with their existing sizes. Start/pause/resume were verified in visible browser state; actual AI play/goals were observed. Console errors/warnings: none. Physical multitouch, measured FPS, injected real-browser asset failure and an entire finished/replayed real-browser match are not claimed. Full Next build, remote CI and production verification belong to the later owner-approved release.

Editable source and PNG evidence are private in `C:/dev/amma/worktrees/maracaibo-penalty-look-source-20261011/adapted/`. Completed prior private adaptations and originals remain untouched. Public app branch contains generated runtime only, notices/manifest and this coordination report; no private original TSX, source archive or map is included.

Local review: `http://127.0.0.1:4184/games/maracaibo-street-football/` (loopback static server, no full app routing). The production menu URL remains `/table/maracaibo/1`; the static review server does not implement that Next route.

Reproduce: from the new private `adapted/`, reuse the ignored junction to the existing company toolchain; run `node build.cjs <app-public-game-output>`, the strict TypeScript command for `main.ts selftest.ts presentation.ts kit.ts`, `node node_modules/tsx/dist/cli.mjs selftest.ts`, `node controls-selftest.cjs <built-match.js>`, and `node visual-selftest.cjs`. `MARACAIBO_PUBLIC` can point the offline proof recorder at another existing app public folder. No install is required on this machine.

Review the private `visual-evidence/browser-390x844.png` for the actual phone view and `visual-evidence/offline-before-after-390x550.png` for the same-arena before/after. The offline proofs are labeled and are not browser screenshots.
