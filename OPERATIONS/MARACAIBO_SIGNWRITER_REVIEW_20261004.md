# Maracaibo Venezuelan signwriter release review

Anthony approved the second generated concept, asked for fainter stars and the existing generated fabric flag beside Play, and explicitly authorized implementation, push and merge.

## Result

- Seventeen transparent ImageGen lettering assets (475,776 bytes total), with retained real text for assistive technology, failed-image fallback and forced-colors mode. Original supplied logo and generated fabric flag reused unchanged.
- Home actions: Menu yellow, Order online blue, Service red, Play ivory with the original flag. Numeric prefixes and arrows removed. Menu categories repeat yellow/blue/red in menu order; item names/prices stay ordinary text.
- Eight decorative Lucide stars at 2.5% opacity; hidden during active games. Layout follows the approved dark hand-painted concept, with the full real menu and truthful preview boundaries retained.
- Play always offers exactly Table Football / Multiplayer and Penalty Rush / Solo. Home, menu and the chooser no longer create a game visit. Multiplayer selection acquires membership using the existing printed-QR table route; solo starts without a visit cookie/API and survives unavailable or expired membership.
- Existing mobile-only gameplay, protected visit API, refresh identity, leave/reset/expiry, game-seat cleanup, stadium and Venezuela kits retained. No schema, credentials, dependencies, payments or other venue changes.

## Verification

- Targeted ESLint and production build/types pass. Full lint: zero errors, six unchanged LeadArcade warnings.
- Visit origin/contract + SQL lifecycle: 55 checks pass. Football/control regressions: 47 checks pass, including 40 rooms / 160 simulated phones.
- Four-player production browser suite passes simultaneous joins, unique roles, full table/isolation, touch/cancel, refresh, host hide/return, leave/rejoin, missing-art fallback at 320/390, landscape, natural 90-second finish and replay. Zero runtime errors; physical-phone WebRTC remains unverified.
- Updated real Next HTTP/PGlite browser fixture covers lazy membership, both games, solo with zero API/cookies, refresh, staff reset, leave/expiry, blocked lettering and backend outage. Final receipt: `/workspace/shared/maracaibo-signwriter-review/verified/result.json`.
- Rendered responsive inspection: 320, 390, 768 and 1440 px; no horizontal overflow, zero guest API calls before multiplayer selection, exactly eight stars at 0.025 opacity. Home/menu/game selector before/after screenshots and normalized concept comparisons retained in `/workspace/shared/maracaibo-signwriter-review`.

The first browser pass used full-page mobile capture, which changed Chromium's emulated touch capability. Viewport captures preserve device identity. The outage fixture also accommodates the existing explicit rejoin response after a failed initial join has no cookie. These were harness corrections; the final fixture verifies the production flows.

## Visual QA

See repository-root `design-qa.md`. Initial comparison identified undersized home lettering and excess header spacing. Increased action lettering and compacted the preview/header, keeping all inactive-service/payment facts. Category masks are now prepared before image reveal. The approved fabric flag replaces the mock's painted tricolor accent at Anthony's request.

## Release

Feature branch: `codex/maracaibo-signwriter-20261004`, base `f3a1dca4bb11caedb6f5f23fa62e0b890a4182b0`. Exact published head, CI, preview, merge and production receipts will be recorded in the PR. Publication and merge are explicitly authorized after these checks.
