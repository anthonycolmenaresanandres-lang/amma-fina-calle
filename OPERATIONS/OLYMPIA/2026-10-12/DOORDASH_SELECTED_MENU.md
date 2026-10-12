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
- PASS: Olympia source contract and local HTTP checks rerun after the layout fix; all 39 unique source-matched items, menu/game 200, delivery-price/source/date disclosure, original assets and noindex/nofollow.
- PASS: focused ESLint on src/app/olympia and the two Olympia check scripts (exit 0).
- PASS: TypeScript `tsc --noEmit --incremental false` (exit 0).
- PASS: current local page reviewed in the user's Codex in-app browser at 1440, 768, 390 and 320 px; no horizontal overflow. Main source/date/full-menu disclosure is readable at 390/320 px. Final Drinks group spans the grid and balances five intact entries per column at tablet width, while mobile remains one column.
- PASS: Astra reviewed actual desktop/mobile/source/tablet captures. Its only concrete finding was the empty half of the final Drinks group; after the local CSS fix Astra confirmed this resolved and found no remaining concrete blocker in reviewed captures.
- PASS: three menu/game entry-return cycles across rounds 1, 2 and 3. One active canvas per game and zero after each settled return. Normal round-one completion, replay, pause (timer held at 21s), resume and restart passed. Browser error log was empty. Host slowness caused some navigation tool timeouts; settled states were then verified.
- PARTIAL: final production build compiled successfully in 4.7 minutes, then entered its TypeScript phase. The prolonged process was interrupted; no complete production-build pass is claimed. The separate TypeScript check passed.
- BLOCKED: one push retry after the parent supplied exact later publication evidence was rejected again by automatic approval review. It cited the original no-push/no-PR restriction as not clearly revoked. No alternate remote write, PR, new CI or deployment exists for this update.
- UNCONFIRMED: DoorDash photo-download approval resolutions are not exposed by available tools. Requests surfaced for the page (manager:099de19ee629464c90575f492c4f31bd:2) and img.cdn4dd.com (manager:2a110c37e76e45d6b7735092efcc915e:3). The browser download call returned C:/Users/bellmark/Downloads/8976275a-585b-46eb-9785-4334f99ff95d.jpeg, but no explicit approval state was returned. The file has not been inspected, copied, integrated or sent to imagegen. No second download route was attempted; Google permission remains untouched.
- Screenshot files are local evidence, not Library uploads: C:/Users/bellmark/Documents/Codex/2026-10-09/task/olympia-oct12-evidence/olympia-selected-menu-desktop.jpg, olympia-selected-menu-mobile.jpg, olympia-selected-menu-source-mobile.jpg, olympia-selected-menu-320.jpg, olympia-selected-menu-tablet-balanced.jpg and olympia-selected-menu-game-result.jpg. Earlier tablet.jpg is the before capture. No new Library attachment ID exists.
## Release scope
Branch codex/olympia-doordash-menu-20261012; isolated worktree C:/dev/amma/worktrees/olympia-prospect-demo-20261009.
Local preview route http://127.0.0.1:3119/olympia (local preview running for review).
Intended existing destination https://finacalleos.com/olympia; production remains b852d109f1b5c01d43b714e32a8b1c62bdb497f7.

Changes touch Olympia menu data/page/CSS and its checks only, plus operations evidence. Shared components, other clients, game rules, assets, dependencies and commercial terms are unchanged. No Google gate access, orders, sign-in, outreach, access changes or spend. Complete menu/customizations, in-store prices, availability, dietary details and owner acceptance remain open.
