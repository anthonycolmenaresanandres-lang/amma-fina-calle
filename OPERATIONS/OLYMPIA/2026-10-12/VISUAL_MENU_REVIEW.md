# Olympia visual menu redesign

Status: implementation and review in progress; publication authorized for this scope.

## Design brief and critique
Olympia visitors need to recognize food, reach a category, and see a price quickly on a phone. Reference: Command Center's objects-as-destinations interaction, inspected read-only in source and the user's browser. Do not copy its campus or force exploration to reveal the menu.

Tokens: deli navy #10283f; counter navy #0c2033; paper cream #f4f1e8; Olympia orange #f36c21; warm price yellow #ffd171; leaf green #215b38. Restrained Impact/Arial Black headings, existing Geist Sans body and Geist Mono source/price captions. No new font downloads.

Layout: compact brand and sticky navigation → three photographic category jumps + remaining two text links → compact source notice → all priced menu rows → drink photographs/game → counter/address. Desktop uses the existing two-column menu with full-width Drinks.

Signature: an open photographic deli counter index; real sandwich, bowl and refrigerator images are navigation destinations with visible category labels, not exact dish assignments. Native anchors and details work without hydration.

Critique: rejected the oversized editorial hero and five boxed category cards; both postpone prices. Three unboxed photographs are sufficient recognizable choices while all five category links remain visible without horizontal swiping. Chopped-cheese prominence comes from the verified first two entries rather than an unverified photo pairing. Decorative game art does not compete with the food.

## Evidence
Pending final checks and rendered review. All39 source records remain immutable. Six original photos and optimized derivatives remain byte-identical.

## Local review results
- Initial targeted ESLint and existing Olympia source contract PASS (39 exact source records and standard game). Final scoped ESLint also completed successfully (exit0) after the CSS correction; full lint/types/build remain delegated to existing PR CI.
- Local HTTP PASS: menu and Juice Rush200, noindex/nofollow, all39 source-matched names/prices/descriptions in native initially-collapsed disclosures, six photos, all12 responsive derivatives and preserved assets.
- Used the user's Codex in-app browser. Actual screenshots inspected at390x844,320x740 and1440x1000. No horizontal overflow; desktop retains two menu columns and full-width Drinks. The first complete priced item is inside the opening390px view (top661.75,bottom776.14 in844px height).
- All5 category jumps and return links PASS; target tops67.7-68.4px clear the sticky52px navigation. Native Enter/Space details passed repeated open/close cycles. Missing-description fallback and DoorDash link inspected.
- Astra inspected actual mobile, narrow, desktop and expanded-details captures: pass with one narrow-phone decorative arrow crowding issue. Fixed by hiding decorative category arrows below360px and removing their reserved padding.
- Sandwich Counter link reaches the existing game start screen and its Back to Olympia link is present. Browser CDP input/navigation then timed out; repeated game/replay/return interactions and a fresh post-fix320px capture remain unverified. No game code changed. No physical-device performance claim.
- The task-owned localhost3121server was stopped after checks to release resources. No unrelated process or game worktree was changed.
- Source menu JSON, menu-data, all photo originals/derivatives, shared components, dependencies, Juice Rush and Sandwich Counter runtime are unchanged (scoped git diff empty).
- Web Interface Guidelines audit: semantic anchors and details, visible keyboard focus, empty alt for label-redundant category photos, explicit image dimensions, reduced motion,13px mobile source notice, tabular prices and sticky-anchor offsets.

## Remaining owner content
Full menu coverage, customizations and availability; approved in-store prices; current hours and dietary information; exact photo-to-dish/flavor mappings; Olympia acceptance; confirmation of proposed CNU community copy. No claim of university affiliation, restaurant signing, whole-business halal status, real rewards, discounts or reviews.

## Publication
Exact-head CI, guarded PR merge and production verification pending. The21:15UTC user instruction authorizes this reviewed menu revision and the separate game release through existing hosting; no new integration or access change.
