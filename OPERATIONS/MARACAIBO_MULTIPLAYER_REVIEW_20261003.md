# Maracaibo concurrent football

Anthony explicitly authorized examining the existing game, researching comparable games, implementing the improvement and merging it on October 3, 2026. This is the scoped game implementation after the visual-only PR #299. Work Mode supplies the isolated Linux checkout; the Windows workstation data-center path is not available in this session.

## What changed

Maracaibo keeps its approved Kitchen & Cocktails identity, Lago/Rayo teams, table QR routes and four guest actions. The game now creates a six-character seating code or joins an existing code, reserves four distinct rods, fills empty rods with computer players, highlights the controlled rod and provides large movement/shoot controls. A fresh-code action starts a new seating. A round counts goal pauses inside its 90 seconds and has a shared result/replay.

The old Maracaibo client elected arbitrary competing phone hosts, accepted unvalidated state, permitted duplicate rods and had no takeover. The new session bootstraps joining phones from an existing authority, preserves its logical join order instead of depending on phone clock synchronization, and hands authority to a remaining active phone when the host leaves or hides. Incomplete peer connectivity pauses simulation. A live round cannot be reset by another phone.

Supabase carries Presence and a small number of signaling envelopes only. Full-mesh WebRTC data links carry inputs, 10 Hz snapshots and visibility changes. Bundled ICE uses one offer and one answer per peer link, with three attempts maximum. There are at most three peer connections per phone and six links per four-phone room. Browser-local play uses a separate BroadcastChannel and is labeled same-device; that channel is never relayed through Supabase. A transient signaling outage preserves already established WebRTC links.

Input is capped at 20 Hz in the touch/keyboard adapter, checked at 30 messages/second per sender in the authority and coalesced into at most four pending slots. Lost movement expires after 750 ms. The view admits bounded finite state only from its authority, rejects earlier rounds/ticks, caps frame catch-up at six steps, checks packet sizes/rates and drops sends when a data-channel buffer exceeds 32 KiB. Cleanup closes the canvas, channels, listeners and timers. No game scores are written to the database.

Menu/payment/provider data, account credentials, permissions and external service plans are unchanged. No new hosting service, database migration or paid dependency is required. Other venue clients keep their existing route and mechanics; shared input and bridge cleanup receive compatible safety fixes.

## Research and design rationale

- Jackbox: short browser/phone joining through a room code. https://www.jackboxgames.com/how-to-play
- HaxBall: a compact multiplayer football surface and peer networking. https://blog.haxball.com/2017/10/25/html5-haxball-is-here.html
- Gartic Phone: guest-friendly browser party rounds. https://garticphone.com/
- Supabase: broadcast fan-out counts toward message limits; Presence should be slow-changing membership. https://supabase.com/docs/guides/realtime/limits and https://supabase.com/docs/guides/realtime/presence
- WebRTC: direct data channels, signaling and connectivity limitations. https://webrtc.org/getting-started/peer-connections and https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel

The existing physical football theme fits this venue better than introducing drawing, typing or a long round. The upgrade focuses on joining, playable rallies, touch controls and keeping game traffic out of the menu/owner database path.

## Verification

- `npm run maracaibo-football:selftest`: twelve passing behavioral checks, including 40 isolated rooms / 160 simulated phones for a complete round, unique seats while connectivity is pending, reserved-rod input, skewed-clock joining, authority departure/visibility, incomplete-mesh pause, stale/invalid packets, 80,000-input flooding, bounded catch-up, movement expiry, finish and replay.
- Scoped ESLint and the production build/types pass. Full ESLint passes with six pre-existing warnings in untouched Lead Arcade files.
- Optional browser runner: `scripts/maracaibo-football-browser-selftest.mjs`. It checks four simultaneous same-browser players, full-room refusal, table isolation, host departure, rejoin, one canvas, 320/390/1440px layouts, a natural full round/replay and menu cleanup.
- The local Phoenix signaling fixture exercises separate browser contexts, Presence, reserved roles, bounded signaling and a usable menu on failed connectivity. It does not emulate a real Supabase project.
- The same-browser runner passed four players, full-room refusal, table isolation, departure/rejoin, a natural full round/replay and menu cleanup with zero runtime errors. The failed-network fixture passed four reserved roles, bounded retries and menu navigation with zero runtime errors. The final readiness guard is being rechecked on the exact branch state before merge.
- Before/after lobby and active-match captures were reviewed at 390px; the 320/390/1440px browser checks show no horizontal overflow. The game retains the original primitive render path and approved optional artwork.
- The execution runtime denies network-interface enumeration (`uv_interface_addresses` reports EPERM). A standalone native RTCPeerConnection generates no ICE candidates even with loopback enabled. Therefore actual WebRTC connectivity and real-phone Wi-Fi/cellular readiness cannot be certified from the local runtime. This limitation must remain explicit in the PR and handoff.

## Operational limits

This is a casual ephemeral game, with no prizes, persisted leaderboard or tamper-proof scoring. Possession of the seating code grants participation; it is not an authenticated private account boundary. WebRTC may fail on restrictive networks without a TURN relay. No TURN credentials/service were provisioned. Failure is shown with rejoin, same-Wi-Fi and practice options; menu and service navigation remain available.

The 160-phone figure is a deterministic simulation, not a live Supabase/network capacity certification. Actual capacity remains subject to the deployed Supabase account's connection, Presence and signaling limits and the participating phones/networks. Existing Supabase browser configuration is required for cross-phone signaling; an unconfigured deployment supports explicitly labeled browser-local play and isolated practice.
