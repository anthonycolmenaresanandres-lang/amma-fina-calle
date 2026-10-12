# Olympia collector race review


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
