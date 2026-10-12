# Company game adaptation — 2026-10-11

Anthony authorized implementation, merge and a public Maracaibo demonstration. Originals at archive commit `566c4f06cc85bd2fa5e351df7146782fad124573` remain private and unchanged. The public company repo receives a new route and generated runtime only; editable adaptation files remain in the private library on `adapt/maracaibo-20261011`. No ZIP, original TSX, SDK helper, source map, credential, audio, or hosted asset is distributed.

| Game | Adaptation state | Live publication |
| --- | --- | --- |
| Fina Calle Street Football | Five-a-side archived simulation extracted into pure TypeScript; shared skin maps current Maracaibo logo, stadium, Lago/Rayo player art, colors and labels. Mobile pointer/keyboard controls, fixed 60 Hz ticking, pause/replay, and canvas fallback. | New isolated `/play/maracaibo-street-football` route; verification receipt below. |
| Pocket Collector | Native `SkinConfig` seam inspected; shared presentation translator prepared in private source. Item mesh, scale, collision bounds, collector growth, levels and timers unchanged. | No replacement of existing Pocket Café or Fall Colattao. Full archived collector runtime adaptation remains pending. |
| Slide Stack | Native `SkinTheme` seam inspected; shared presentation translator prepared in private source. Puzzle palette identity, layouts, move rules, hint/undo untouched. | Not published; full puzzle host integration and level validation remain pending. |

Counter Club is absent. This release does not invent it.

## Football integration

Runtime uses no third-party library or Google SDK. Existing local TypeScript/tsx/esbuild are build tools only. Preserve the archived component notices in the distribution. The archive's broader application license is absent; this company demonstration follows the owner's explicit adaptation/publication authorization and makes no claim of commercial redistribution clearance. Hosted music rights remain unverified and all audio is omitted. No hosted avatar/CDN content was fetched.

The archive renderer required React Three Fiber/Three and preview SDK hooks. The phone release uses the archived simulation with a lightweight Canvas renderer and existing company assets, so it does not require new production dependencies or WebGL. Original formations, dimensions, speeds, ball physics, AI and 120-second rules are retained. Integration repairs: selected-player switch uses the new player immediately; one ball owner, no teammate dispossession; last-touch on releases; set pieces assign the entitled side; goal celebrations freeze play; configured score cap ends the match. No claim of FIFA-level simulation.

Assets (already present in app): `/assets/maracaibo/football/stadium.webp` (248858 B), `player-lago.webp` (18748 B), `player-rayo.webp` (19588 B), and `/assets/maracaibo/maracaibo-kitchen-cocktails-logo.png`. No generic or newly generated replacement artwork. Images are optional and fail to branded primitives. Skin configuration owns asset URLs, labels, colors and team appearance; numeric match rules are separate.

## Verification

Private TypeScript strict no-emit check passed. Eleven focused simulation/skin cases passed, including twenty seeded full matches, start/play, pass/switch, charged shot/tackle, both goal paths, kick-in/corner/goal-kick ownership, pause, full time, cap and replay. Simulated DOM control test results and CI/deployment receipts are recorded with release evidence.

Local full app build is blocked by C: disk space (about 40 MB free after sparse checkout); existing dependencies were reused without installing. In-app browser returned `Timed out waiting for the Browser webview to attach`; Chrome creation returned `js execution timed out; kernel reset`, then Chrome disappeared from the automation inventory. Consequently no real-browser mobile screenshot comparison, multitouch, visual overflow, FPS, or physical phone pass is claimed. Automated DOM and engine checks are alternatives, not a browser pass. Remote CI must complete lint/types/build before merge, and production must be independently verified before reporting live.

Canonical app dirty operations files and all existing menu/game paths remain untouched. Isolated app worktree: `C:/dev/amma/worktrees/maracaibo-street-football-20261011`; private adaptation worktree: `C:/dev/amma/worktrees/game-adaptation-20261011`.
