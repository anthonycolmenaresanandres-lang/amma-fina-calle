# Las Palmas game hub - implementation plan and evidence

## Decision / scope

Anthony's 2026-09-13 screenshots and request govern this work. Keep the approved Western menu, all 39 dishes, the exact permanent `https://finacalleos.com/demo/las-palmas` QR, and approval safeguards. Build locally; release is a separate gate.

1. Place a compact, always-present game invitation at the start of the full-height menu shell. CSS sticky requires no scroll listener. Category navigation sticks immediately beneath it. Reserve both heights for anchors and keyboard focus; retain a skip link.
2. End with the original Fina Calle emblem treatment seen on Colattao, a clear Powered by label, and a direct `https://finacalleos.com` link. Do not copy Colattao contact information or use an unverified QR-bearing company poster as a logo.
3. Add `/play/las-palmas`: Western heading, two actual existing characters, one kickoff action, optional existing difficulty/control settings. Burrito California #10 and Quesabirria #7 must each work at every existing keeper level. A fresh skin copy overrides the kicker only; shared registry/engine/campaign stay unchanged.
4. Use the existing Phaser scene with lazy runtime imports after kickoff, loading/error/retry states, and destruction on exit/replay. Keep the old generic route compatible for existing links and smoke tooling; menu links use the dedicated lobby. No other brand is changed.
5. Verify 320/390px and desktop, persistent bar at top/middle/footer, category anchors and keyboard, both characters, all levels, tap/swipe, replay/return, real shots and missing-asset fallback. Run scoped tests/lint, existing local smoke, production build, and inspect screenshots.

## Research and verified sources

- Live Colattao menu, inspected 2026-09-13: <https://colattao-cafe-rush.vercel.app/menu>. Final branding uses original `/assets/colattao/ui/fina-calle-os-emblem.webp`, Powered by, and a Fina Calle website link. Use current canonical company domain instead of the older Vercel hostname. Source asset is reused without altering pixels.
- W3C WCAG 2.2 Focus Not Obscured: <https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html>. Sticky content must not hide focused controls. Reserve offset; test keyboard focus.
- MDN position: <https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position>. Sticky positioning stays within its containing block, so the bar belongs in the full page shell, not the shorter hero.
- Installed Next16.2.11 `docs/01-app/02-guides/lazy-loading.md`: defer heavy libraries with dynamic imports until needed. No Next upgrade or caching migration in this scope.
- Local verified assets/config: `APP/web/src/penalty/skin/skins.ts`, `config.ts`, `PenaltyScene.ts`. Existing engine owns five shots, keeper AI, Mexico ball, pink keeper, primitive fallback. All remain unchanged.

## Cost / non-goals

No added dependency, subscription or generated art. Existing hosting/bandwidth charges still apply; this is not a claim of zero-cost hosting. No database, account, payment, live menu activation, prize/reward promise, physical printing or external submission.

## Evidence

Local production-mode evidence: `C:/Dev/amma/evidence/las-palmas-game-hub-20260913`. Not a production release or restaurant approval.

- Final Webpack production build / TypeScript and scoped ESLint passed. No dependency, shared engine, legacy game route, owner, billing or menu-data diff against production d381e09.
- 95 existing landing checks and19 new game-hub checks passed. `scripts/las-palmas-game-hub-selftest.ts` checks two actual characters, all six level combinations, registry immutability, preserved keeper/geometry/ball/background, new route/noindex, lifecycle feedback, sticky offsets and original linked company asset.
- `verify-hub.ps1` and `browser-checks.json` record36 passing browser assertions across320/390/1440 layouts, sticky invitation at middle/footer, anchor/keyboard clearance,39 dishes, no eager canvas, original footer, all six character/level launches, shots, return focus and teardown. Screenshots inspected, including `lobby-after-320.png`, `lobby-after-390.png`, `lobby-after-1440.png`, `menu-scrolled-390.png`, `menu-footer-after-320.png` and both actual mascot renders.
- Keyboard arrow selection switched to Quesabirria. Real upward swipe advanced to shot2; five shots reached the2/5 result screen; Replay reset to0 goals / shot1 and retained Quesabirria. `quesabirria-swipe-shot-390.png`, `quesabirria-match-complete-390.png`, `quesabirria-replay-390.png` inspected.320px resize and844x390 landscape inspected; landscape retains vertical scrolling for the existing game's minimum field height, not a new landscape-optimized engine.
- Intercepted lazy runtime chunk failure produced `load-error-390.png`; removing interception and using Try again loaded the real game (`load-retry-390.png`). Blocking skin artwork still allowed a real fallback goal (`fallback-shot-320.png`). No real feedback submitted; interceptions removed and test sessions closed.
- Legacy smoke tooling attempted twice; browser connection timeouts stopped the first after five passing cases and the second after three. Logs retained honestly as failed, not relabeled. A fresh isolated390px Pro Keeper check passed:1canvas, no horizontal overflow, images loaded, no page errors and a real shot advanced to2/5 (`legacy-390-pro-final.png`, `legacy-390-pro-shot-final.png`, inspected). This completes all six compatibility cases across runs, not a claim that the consolidated harness passed. All original legacy/game engine files are byte-unchanged.
- Local `/demo/las-palmas` and `/play/las-palmas` return200; company `https://finacalleos.com` returns200. `/owner-preview` returns404. Existing `/owner/las-palmas` and `/m/las-palmas` render their not-found boundary with `NEXT_HTTP_ERROR_FALLBACK;404` even though local streamed HTTP headers are200; this is not tenant activation. No links to these held routes were added.
- Reused original company emblem source: `https://colattao-cafe-rush.vercel.app/assets/colattao/ui/fina-calle-os-emblem.webp`; SHA256 `C8578FD74AAB2E19CD75D0C9D8008A5260BDC281600ED00B00CA9A1E0AE9B7A4`. No image edits. The footer links directly to the company site; no QR decoding/printing claim for the emblem.

## Review / release gate

Local URLs: `http://127.0.0.1:3137/demo/las-palmas` and `http://127.0.0.1:3137/play/las-palmas`. Preview server remains running for Anthony. Separate scoped approval, exact-head CI and deployment/public checks are required before making these changes live. Existing canvas gameplay is pointer-based; UI keyboard checks are not a complete accessibility certification. Physical-device proof and restaurant approval are not claimed.
