# Maracaibo Venezuela player kits — October 4, 2026

Anthony approved the stadium and requested cooler Venezuela-style players. The two kits now use Venezuela's vinotinto identity and tricolor detailing: Lago wears deep burgundy with gold trim and charcoal shorts; Rayo wears ivory with burgundy trim and shorts. Yellow, blue and red shoulder ribbons unify the pair. The existing Maracaibo badge remains a separate runtime shirt patch.

This revision continues the local feature branch `codex/maracaibo-stadium-skin-20261004` from stadium commit `88fbc2679078cf5e79bd08b18e7ecd6145640404`.

## Changes

- ImageGen edited the matching original player sprites, preserving the straight overhead camera, east-facing pose, sculpted anatomy, lighting, scale and transparent background. No real person, generated client logo or federation/club mark.
- New 1254×1254 RGBA originals are retained at `/workspace/shared/maracaibo-generated/venezuela/`. Alpha-safe 384×384 WebP exports replace the existing player asset URLs.
- Lago primary is vinotinto `#7c1d32`, with gold `#d5af73` secondary; Rayo primary is ivory `#f5f1e8`, with vinotinto secondary. Team IDs, names and roles are unchanged.
- Game-only scoreboard/lobby glyphs use gold and ivory for visibility on the dark UI. The rest of the page palette and all layout declarations are unchanged.
- Player exports total 38,336 bytes. Including the approved stadium, runtime art totals 287,194 bytes. Provenance: `ASSET_REGISTRY/MARACAIBO/FOOTBALL_KITS_VENEZUELA_20261004.json`; it supersedes only the prior player's asset records.

The stadium remains byte-identical (`3dca2125bba5e065cc6ea0522cdb9722ec4bcf2a79d1d52ed9233ae933b958c1`). The renderer and game view are also byte-identical. Field geometry, input mapping, mechanics, clocks, authority, multiplayer transport, QR routes and other venue defaults are unchanged. No dependencies were added.

## Verification

| Check | Result |
| --- | --- |
| Production build / TypeScript | PASS; 44 prerendered pages |
| Scoped ESLint on changed venue configuration | PASS |
| Fresh Web Interface Guidelines audit | PASS for touched presentation |
| Enhanced 320×844, 390×844, 1440×1000 practice | PASS: both kits, original badges and selected-player marker visible; no overflow |
| Lago forward / Rayo keeper selection | PASS |
| Native touch, responsive resize, movement / Shoot | PASS |
| Blocked artwork | PASS: original primitive renderer remains playable in the new team palette |
| Leave / table home | PASS: canvas removed, lobby and home restored |
| Runtime exceptions / attempted writes / WebSockets in focused practice | None |
| Stadium / renderer / game view identity | PASS: exact pre-refinement hashes match |

Five focused Chromium cases ran against the local production build. Before/after screenshots use the same ready state and viewport; previous captures remain intact. Source-edge color fringes were inspected at the optimized gameplay scale and did not present a material issue. Physical phones and real network capacity were not certified. The prior deterministic football suite passed at the stadium base; it was not repeated for this asset and color-only refinement.

## Evidence and handoff

`/workspace/shared/maracaibo-venezuela-review/` contains the before/after gallery, phone/desktop screenshots, results, asset hash verification, source audit and the downloadable `maracaibo-venezuela-kits.zip`. The package includes original artwork, current optimized assets, provenance and both the incremental kit patch and full skin patch.

Local practice remains available at `http://127.0.0.1:3000/table/maracaibo/1` → Play → Practice with computer players. No push, PR, merge or production deployment was performed; the live site remains unchanged.
