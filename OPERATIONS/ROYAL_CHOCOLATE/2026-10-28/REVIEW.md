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

## Authorized combined release and clean navy branding

Anthony approved the final simplified logo and requested the site/menu match company colors, then merge when ready. The exact Library logo v1 was materialized via unchanged current official helper plus the validated native-EA adapter; native Library ID/version1 readback, size1327374, PNG/RGBA1774x887, alpha0..255 and SHA256 were verified, and actual local pixels inspected. Clean oval/logo has no background scrollwork. See LOGO_PROVENANCE.json. Runtime WebP is a derived optimization, not a new Library item.

Royal menu UI and game chrome now use sampled navy#091B3F, silver and white; existing layouts, content, game world/food art and mechanics stay intact. Clean logo replaces menu wordmark and appears only on the game's ready screen. Owner-review/business-approval labeling remains. Seed and all other clients, shared core, dependencies, CI and hosting configuration remain unchanged. Release uses existing Git integration, exact-head checks, normal merge with no approval review or bypass, followed by exact-commit deployment/domain/live verification.

## Final pre-release checks

After navy styling and the exact clean-logo install, focused ESLint of four changed TS/TSX files and full production Webpack/TypeScript/60-page/traces build PASS. Dedicated game verification rerun PASS with all prior fairness/accounting/reachability/camera checks and legal wins14340/17970/21730; unchanged shared core confirmed. White/silver/muted text on navy contrast15.80/11.82/9.53 respectively. React and interface review passed on touched code.

Final built-app browser check:390px menu clean logo/all5images loaded, correct navy, category links/keyboard details, no horizontal overflow;320px game logo loaded and Start visible at y621..667 in740px viewport. Direct drag after restart scored30 and Pause retained the score. Natural result/replay/resume checked, no browser error logs. Landscape ready overlay remains scrollable at844x390; no horizontal overflow. No physical phone/Safari claim. Native held-key attempts in this final UI pass were not treated as proof of movement; prior keyboard90 and after-theme simulation tests are retained evidence. All inputs/geometry implementation remains unchanged by branding except existing ready-screen logo markup.

See CHECKS_FINAL.json and before/after navy screenshots. Release authorization is current; no review approval or protection bypass will be submitted. Existing main has no active rulesets and legacy protection endpoint reports branch not protected; nevertheless wait for every exact-head PR check and require normal clean merge state.
