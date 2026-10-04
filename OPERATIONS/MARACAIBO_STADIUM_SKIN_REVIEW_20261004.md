# Maracaibo stadium and kit skin — October 4, 2026

The Maracaibo table-football game now has an optional original silver stadium, textured grass with regulation-proportion presentation lines and goal nets, a paneled ball, and matching sculpted 3D players wearing Lago orange/charcoal or Rayo green/off-white. The exact supplied Maracaibo badge is applied separately to each shirt. This is a local review candidate on `codex/maracaibo-stadium-skin-20261004`, based on main `fed86c5` (concurrent football PR #300).

## Artwork and implementation

- Contemporary silver stadium architecture inspired by the requested Bernabéu/Camp Nou direction, drawn directly overhead to match the existing game camera. No real club marks or generated lettering.
- Original faceless sculpted sports-game characters, with consistent proportions and lighting. Stylized players remain readable at table-game scale while the grass and stands provide realism.
- Original logo source pixels are unchanged. The runtime uses `/assets/maracaibo/maracaibo-kitchen-cocktails-logo.png` as a shirt patch rather than generating the badge into the artwork.
- Runtime WebP exports: stadium 1024×1024, two transparent players 384×384; combined 284,430 bytes. Full generated PNG originals, generation metadata and their hashes are retained. Provenance: `ASSET_REGISTRY/MARACAIBO/FOOTBALL_SKIN_20261004.json`.
- Optional asset URLs extend the skin contract and adapter. Only Maracaibo opts in. An isolated Phaser renderer handles art, accurate pitch lines, team mirroring, shadows, GK/FW labels and an amber YOU marker.
- Primitive gameplay begins immediately. The enhanced renderer activates only if the stadium, both kits and original badge all decode successfully within 3.5 seconds. Missing, failed or slow artwork retains the original renderer; inputs and frames do not wait.
- Scene shutdown removes resize and loader listeners, timers, input handlers and enhanced game objects.

The simulation, collisions, timekeeping, input mapping, WebRTC/signaling, room authority, stable routes and other venue configuration remain unchanged. No package or infrastructure changes are included.

## Verification

| Check | Result |
| --- | --- |
| `NEXT_TELEMETRY_DISABLED=1 npm run build` | PASS, including TypeScript and all 44 prerendered pages |
| Scoped ESLint on four touched TypeScript files | PASS |
| `npm run maracaibo-football:selftest` | PASS: 12 checks, 40 rooms, 160 simulated phones |
| Enhanced Chromium practice at 320, 390 and 1440 pixels | PASS: stadium, both kits, badge and selected-player marker visible; no horizontal overflow |
| 390 → 320 → 1440 → 390 resize | PASS |
| Rayo keeper and Lago forward selection | PASS: team, role and amber YOU marker agree |
| Movement, Shoot, touch controls, Leave and table home | PASS: match starts, canvas is removed on Leave, lobby/home restored |
| Block all art; block Lago only; block stadium only; delay stadium 5 seconds | PASS: original primitive fallback remains playable and screenshots are pixel-identical to the baseline |
| Controls while stadium is delayed | PASS: Shoot enabled before 2 seconds and match playing within 0.9 seconds, before art timeout |
| Runtime errors, non-read requests and WebSockets in focused practice checks | None; expected aborted assets/local Vercel analytics request recorded |
| Neighboring venue isolation | No Maracaibo art requested; source confirms default skin unchanged |

The eight focused browser cases use local production Chromium, including a narrow touch/reduced-motion context. Screenshots compare the same ready state at the same viewport. These checks do not certify physical phones or real network capacity. Las Palmas practice encounters a pre-existing `noAudio` configuration error in its unchanged legacy client; neighbor gameplay verification is limited by that existing issue and was kept outside this skin task.

## Review files

Local evidence: `/workspace/shared/maracaibo-skin-review/`.

- `index.html`: desktop/phone review and generated art gallery.
- `before-desktop.png`, `after-desktop.png`, `before-mobile.png`, `after-mobile.png`: actual browser captures.
- `results.json`, `verification-summary.json`: focused checks and final verification status.
- `maracaibo-game-skin.patch`: full feature change, including optimized assets.
- `maracaibo-game-skin.zip`: generated originals, optimized assets, change patch, previews and verification evidence.

Generated originals: `/workspace/shared/maracaibo-generated/`. Application: `APP/web`; local production route: `http://127.0.0.1:3000/table/maracaibo/1`, then Play → Practice with computer players.

## Release boundary

No push, PR, merge, deployment, external upload or customer send was performed. The live site remains unchanged. The current authorization covers AI artwork and local skin implementation. Repository `AGENTS.md` requires explicit scope authorization before publication. For a later authorized release, publish this feature branch, review the exact diff and CI checks, and release through the repository's existing PR process.
