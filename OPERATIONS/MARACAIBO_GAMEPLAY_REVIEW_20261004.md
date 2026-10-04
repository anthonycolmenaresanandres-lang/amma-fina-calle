# Maracaibo mobile game and automatic table join — October 4, 2026

Anthony requests better gameplay, phone joining without a code, removal of the Shoot button, a thoughtful mobile-only experience, and merge of all current Maracaibo changes. This explicitly authorizes release of the approved stadium, Venezuela kits and this gameplay refinement through the feature PR and its existing automatic deployment.

## Result

The permanent `/table/maracaibo/{tableId}` QR route identifies the match. On a touch device with a coarse primary pointer, Play immediately discovers the table match and assigns an available rod. The first two players receive opposing forwards; the next two receive goalkeepers. No room code, creator choice or role selection is required. Desktop visitors receive a QR/link handoff before any game session, peer connection or canvas is created.

One finger steers the selected player relative to its current position and the displayed pitch height. A short tap sets a position target. The player kicks automatically within the existing engine's reach and cooldown. Up/down movement buttons remain as an accessible alternative; there is no separate shooting action. Empty or inactive places use computer players after a human starts the round. Targets reset on cancellation, blur, handoff and rematch; neutral heartbeats cannot start a new round.

The admitted roster and authority generation preserve late joins and active-match progress. Discovery agreement, immutable generation priority, a started flag, handoff terms and admission revisions prevent competing provisional hosts and stale former-host metadata from resetting ordinary table play. Snapshots, inputs and rematch requests are validated and bound to their round/generation. An incomplete mesh pauses; recovery does not silently create a replacement match from a foreign manifest without a snapshot. The clock includes goal pauses, so a complete round lasts 90 seconds; a slow ball is kept moving.

The existing Supabase Presence/Broadcast bridge carries only discovery, admission and WebRTC signaling. Game state and inputs stay on bounded peer data channels. The browser-local fallback is labeled “this device only”; connection/full-room recovery offers retry or computer practice. Active-match navigation confirms leaving. No service, dependency, schema, credential or POS/payment change is included.

The approved silver stadium and vinotinto/ivory Venezuela kits remain intact. Optional art still loads after primitive gameplay; missing art preserves the fallback. Historical artwork and provenance remain in the earlier review records.

## Verification

The controller suite covers simultaneous admission, delayed/skewed joins, full tables, stale/invalid packets, visibility handoff, snapshot recovery, rematch, bounded input and 40 isolated rooms / 160 simulated phones. The controls suite covers relative drag geometry, tap targeting, cancellation, multiple fingers, rate limits, blur/rematch and other-venue defaults.

| Check | Result |
| --- | --- |
| Deterministic football/session suite | PASS: 30 checks, 40 isolated rooms / 160 simulated phones |
| Mobile controls suite | PASS: 17 checks |
| Full application ESLint | PASS: zero errors; six unchanged Lead Arcade warnings |
| Production build / TypeScript | PASS: 44 prerendered pages |
| Isolated fixture production build | PASS: synthetic local signaling URL/key; runtime credentials excluded |
| Fresh simultaneous joins | PASS: three separate four-phone browser trials, all 12 pages ready with one host and four unique roles |
| Local production browser gameplay | PASS: four players, full-table rejection, table isolation, native touch/mixed controls, actual refresh, visibility handoff, leave/rejoin/Menu cleanup |
| Natural finish and rematch | PASS: a real-time 90-second round; rematch stays ready at 90s until a new gesture |
| Phone / desktop / missing art | PASS: 320/390 portrait and 844×390 landscape, desktop QR without a canvas/session, playable blocked-art fallback at 320/390 |
| Isolated-context signaling recovery | PASS: four presences/roles, 173 bounded discovery/handshake messages, no gameplay broadcasts; retry/computer recovery and cleanup |
| Runtime errors / application backend writes | Zero in both final browser suites |

Final browser evidence is `verified-local-r3/result.json` and `verified-remote/result.json`. The headless browser throttles background rendering and changes touch capability during beyond-viewport screenshots. QA foregrounds the actual surviving host and uses settled viewport captures with explicit software WebGL; the clock proof recorded 2033.3ms of match progress over 2008.9ms of wall time. These are harness corrections, with no application timing override or simulated early finish.

Settled inspection caught the alternative movement buttons covering the bottom of the pitch on short screens. The buttons now stay in normal document flow below the field. A focused final production rebuild and 320/390/landscape visual check pass: the controls start exactly at the field's bottom at all three sizes, with zero overlap/errors/writes. The final harness asserts this geometry. The gameplay suite was not repeated for this layout-only correction; its simulation, input and transport code are unchanged.

Independent review exposed and fixed stale former-host metadata, validation-before-mutation, foreign-manifest orphan bootstrapping, ordinary follower authority elevation, mixed button/field retained targets, visibility cleanup and neutral clears restarting ready rounds. Real-browser diagnostics also reproduced a manifest arriving before its host's hello: the joining phone incorrectly invented a handoff term and rejected the actual host's snapshots. The final controller preserves the claimed host/roster until first state bootstrap, while observed departures still permit handoff. Each correction has a focused regression rather than a timing-only workaround.

## Practical limits

The public table room uses cooperative peer assertions, rather than authenticated match ownership. This work does not add authentication to Presence manifests or peer snapshots. Two independently started, previously isolated generations reconcile by immutable origin and show a recovery notice; peer-only discovery cannot infer an absent table's earlier history.

Container Chromium exposes no usable ICE candidates. Local multi-page gameplay and isolated-context signaling/recovery can be verified here; an actual cross-phone WebRTC mesh, device performance and real restaurant network capacity require physical-phone testing. No TURN service or changed network infrastructure is introduced or claimed.

## Evidence and release

Feature branch: `codex/maracaibo-stadium-skin-20261004`, based on main `fed86c595eeda0f2f409653f614235d893098c72`. Evidence is retained under `/workspace/shared/maracaibo-gameplay-review/` with prior skin and kit evidence preserved separately.

The combined change is locally verified and ready for its explicitly authorized release. Release follows feature branch publication, PR checks and Vercel preview on the exact head, a SHA-guarded merge, and verification of the resulting production revision and route. The PR records the final head, merge and deployment receipt. Unrelated open PRs and the canonical checkout are preserved.
