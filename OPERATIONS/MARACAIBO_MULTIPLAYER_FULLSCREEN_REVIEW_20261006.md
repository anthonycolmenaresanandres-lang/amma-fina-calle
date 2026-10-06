# Local Maracaibo fullscreen multiplayer and home underline refinement

Built on local sideline commit 278321e in codex/maracaibo-multiplayer-sideline-20261005. Anthony explicitly requested multiplayer filling the screen like solo with small Back to menu, and removal of lines below the home wording. Local review only; no push, merge or deployment authorization.

Phone multiplayer now uses the available 100dvh viewport, with safe-area-aware compact Back/score header, connection/seat/Leave row, remaining-space canvas, and 44px alternative movement buttons below the canvas. Connecting, unavailable/ended membership, recovery, local lobby and results remain reachable. Back uses the existing active-match confirmation and returns to the real menu. Desktop phone-handoff, QR identity, solo, simulation, roles, network/session code and approved sideline projection are unchanged.

The home actions now omit thin divider/hover lines. Menu, Order online and Service keep their original raster glyphs with home-only CSS polygon clips suppressing their decorative brush underlines. Other headings and the original assets are unchanged. Focus outlines, readable fallback text, hover feedback and operational notices remain.

## Verified artifacts

- Fullscreen multiplayer: libfile_26466e37b35481918adc730b74c63b46
  https://chatgpt.com/api/library/files/libfile_26466e37b35481918adc730b74c63b46/download
- Home actions: libfile_17174cf609c08191a93f64521d3ffb98
  https://chatgpt.com/api/library/files/libfile_17174cf609c08191a93f64521d3ffb98/download
- Originals: .review/multiplayer-fullscreen-390.png and .review/home-actions-after.png. Same-state before shots: .review/home-actions-before.png and .review/multiplayer-before-fullscreen-390.png. Narrow/orientation shots: .review/multiplayer-fullscreen-320.png and .review/multiplayer-fullscreen-740.png.
- Evidence: .review/fullscreen-ui-evidence.json.

These are screenshots of the actual MaracaiboExperience/MaracaiboFootballClient source, actual Phaser renderer and FootballSession in a local component harness. It uses a fixture visit, an explicitly emulated coarse-pointer phone profile, blocked external transport and synthetic computer seats. Harness global font/reset approximates the app shell; this is not a deployed route or live table test.

PASS: scoped ESLint for all three touched React files. PASS: actual component before/after checks, no home action borders, viewport fit at 390x844, 320x740 and 740x390, exactly one gameplay canvas, no horizontal overflow, 44px Back/movement targets, controls outside the canvas, touch starts the round, active Back cancellation preserves the match, confirmed Back reaches the actual menu and destroys the gameplay canvas, essential preview notices retained, and zero page exceptions. Images visually reviewed: upright enlarged players and both goals remain visible, home words readable without brush tails. Browser and local server were closed; all commands are terminal.

## Remaining gates and handoff

Parent requested a prompt bounded return while this component check was progressing. The final production build/TypeScript gate for these latest layout changes has not run. The prior full build passed only for 278321e. Complete this gate before publication. Integrated Next route navigation was not retried; its preceding 15-second load timeout remains documented in MARACAIBO_MULTIPLAYER_SIDELINE_REVIEW_20261005.md. Physical multiplayer, real notched-device safe areas and natural device performance remain unverified. Existing static reliability findings are preserved and not repaired here.

The single heavy build/browser slot is free for the seasonal prototype worker. Queue stays open for the remaining production/integrated gate. No task-owned preview/build/browser process remains running; no further retries or new work were started after the bounded return request.


## Subsequent verification receipt — 2026-10-06

The larger-pitch broadcast iteration completes final-source production build/types and the built Next table route practice/menu-return checks over c32a29e. These previously pending local gates now pass. Live physical multiplayer remains unverified; no publication authority. See MARACAIBO_MULTIPLAYER_BROADCAST_REVIEW_20261006.md.
