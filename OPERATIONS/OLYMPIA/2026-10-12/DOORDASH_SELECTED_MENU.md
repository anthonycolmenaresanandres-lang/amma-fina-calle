# Olympia selected DoorDash menu — local review checkpoint

39 unique captured items now render with available descriptions and prices labeled DoorDash. The page says Selected menu, links to Full menu on DoorDash (https://www.doordash.com/store/34805753), shows Oct 12, 2026 and says In-store prices may differ. Identity matched 23 Hidenwood Shopping Ctr, Newport News VA and +1 (757) 782-5523. The listing was viewed in Delivery mode.

## Coverage
10 signature sandwiches, 11 special sandwiches, 3 Featured Items, 5 Most Ordered and 10 drinks. Observed groups retained; no duplicate featured entries, inferred categories, unknown variants or empty groups. Source spellings retained with whitespace normalization. Data is extensible in APP/web/src/app/olympia/doordash-menu.json. Earlier unmatched provisional names are superseded by this sourced selection; historical records remain intact.

No category is claimed complete; customization dialogs were not captured. Missing canonical item lists:
- Sandwiches - Cold Cut
- Fresh Squeezed Juice & Smoothies - Juice
- Fresh Squeezed Juice & Smoothies - Smoothies
- Breakfast
- Breakfast Wrap
- Breakfast Omelet
- Breakfast-Croissant
- Brunch Classics
- Brunch Griddle Originals
- Burgers
- Quesadillas
- Veggie Wraps
- Wraps
- Paninis
- Halal
- Appetizers
- Salads
- Salad Bar

## Checks and blockers
- PASS: Olympia contract check, 39 unique source-matched items/groups/prices/descriptions, no inferred options, unchanged standard game.
- PASS: local served HTTP; all 39 rendered items matched, menu/game 200, source/date/disclosures, original assets, noindex/nofollow.
- PASS: Astra source-only review found no concrete blocker.
- PASS: canonical workspace still has only prior unrelated queue/handoff/BODEGA changes.
- BLOCKED: browser status/reconnect/fresh-tab timeouts; no new rendered approval, screenshots or repeated interactive-flow result claimed.
- INCOMPLETE: prolonged combined lint/type pipeline interrupted without final result. Focused lint and local production-build attempts also produced no final results and were interrupted after prolonged stalls. No lint, type or production-build pass is claimed for this revision. The build reached Creating an optimized production build; no compiler error was returned.
- BLOCKED: remote push rejected by automatic approval review, which cited original no-push/no-PR instructions and did not accept later publication scope as clear revocation. No retry or alternate publishing route attempted. No PR, new CI or deployment exists for this update.

## Release scope
Branch codex/olympia-doordash-menu-20261012; isolated worktree C:/dev/amma/worktrees/olympia-prospect-demo-20261009.
Local preview route http://127.0.0.1:3119/olympia (owned preview stopped after verification).
Intended existing destination https://finacalleos.com/olympia; production remains b852d109f1b5c01d43b714e32a8b1c62bdb497f7.

Changes touch Olympia menu data/page/CSS and its checks only, plus operations evidence. Shared components, other clients, game rules, assets, dependencies and commercial terms are unchanged. No Google gate access, orders, sign-in, outreach, access changes or spend. Complete menu/customizations, in-store prices, availability, dietary details and owner acceptance remain open.
