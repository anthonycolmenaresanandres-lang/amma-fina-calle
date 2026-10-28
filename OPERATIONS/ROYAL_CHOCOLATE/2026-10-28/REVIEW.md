# Royal Chocolate: larger world and reciprocal capture

Base: deployed main d494832f762bebb1237d162971e5bae225869660.
Branch: codex/royal-world-consumption-20261028.
Scope: Royal game only; Seed, menus, shared collector snapshot, dependencies, CI and hosting unchanged.

Anthony asked to retain the current look, ensure both player/rival consumption, remove bottom controls and map, and enlarge world area without resizing objects. Existing 30% advantage/full-containment/0.2-second hold and one-time accounting already apply both ways; preserve them and add regression coverage. Royal-only analog adapter allows short drags to move slowly without modifying the frozen core. Expanded counters 38/46/54 -> 54/66/78 units, approximately double area, with 232/350/480 products and unchanged targets/timer, object radii, speed limits and renderer zoom. Same spawns, obstacles and three-counter structure. Bottom panel and minimap removed; touch joystick, keyboard arrows/WASD, Escape and top Pause retained. Instructions move to ready/pause screens and screen-reader description. Existing chocolate/pink/cream artwork and typography retained. No brand redesign.

Read repository AGENTS, DATA_CENTER, CODEX_QUEUE, SKILL_ROUTING, relevant game visual skill and tool routing, frontend-design and web-design-guidelines. Design: preserve existing tokens (#211b1a counter surround, #785742/#6d5145/#5e4d44 counter surfaces, #f7c5c2 pink, #fff2da cream, #b8ca97 player); existing Lettering/Geist type. Arena fills vacated footer, no new panel. Signature remains the chocolate swirl and original food art. No new art, dependencies or services.

Verification pending. Publication held: no push, merge, deploy, external send, spend or access changes.

## Verification completed

Focused ESLint passed for all three changed TypeScript/TSX files. Production Webpack build passed compilation, TypeScript, all60 static pages and traces, exit0. Both verification scripts pass Node syntax checks. `gameplay.json` records fair two-way capture, equal/similar protection, interrupted hold reset, exactly one capture under two-predator contention, pending-food ownership transfer, proportional input without clock or diagonal-speed changes, clean restart, populated outer quadrants, all-size reachability and connected world, bounded actors, and camera/object-scale checks at320/390/844/1440. Legal deterministic play won all three counters with14340/17970/21730points. Shared engine/rules and snapshot remain byte-identical to their pinned version.

Browser QA used cua_repl, then the built production application on loopback3171. Screenshots retain before/after390, paused320, Counter3 landscape844, natural loss and real rival capture. At390x844, the arena is390x714 and fills y130..844; no footer controls or horizontal overflow. Pointer drag scored30; held keyboard input scored90. Pause froze score/time, resume retained play, natural loss locked results and replay reset0/45. All three selectors and starts worked. In Counter3, a larger rival naturally consumed the stationary player with25seconds left; loss text/score are correct. No browser error-log entries on normal play.

Art-failure QA used a temporary GET/HEAD-only loopback proxy to the same production build. All six SVG assets deliberately404 (12 requests/six unique); primitive drawing, keyboard collection90points and Pause remained functional with no browser error-log entries. Proxy is test infrastructure outside the repo and is stopped after verification; initial dev server3169 was stopped. Only production preview3171 is retained for review.

UI audit: existing palette/type/art retained; no map or bottom controls; keyboard movement/Escape, top44px Pause, focus ring, modal focus/inert handling, canvas accessible instructions, touch-action:none and safe areas retained. Instructions relocated to ready/pause screens. No brand/logo changes. Browser driver updated to remove the obsolete bottom-button assertion and to use a current/overrideable evidence path; used cua_repl instead of running that separate browser driver this turn.

Limits: no physical-phone/iOS/Safari testing or human balance certification. Simulation checks prove attainable wins and both capture directions using actual configured code; browser observation additionally proves rival-eats-player. No external service, secret, account, payment, menu or production write occurred. Ready for review; release remains held.
