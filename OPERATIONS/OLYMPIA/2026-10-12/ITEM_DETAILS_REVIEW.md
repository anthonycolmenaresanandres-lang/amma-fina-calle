# Olympia expandable item details - 2026-10-12

Anthony resumed only dropdown work after STOP, with images to be supplied separately. Existing authorized PR/CI/merge publication workflow applies. Branch codex/olympia-item-details-20261012 starts at production820bcd6 in the existing isolated Olympia worktree.

## Change
All39 menu items use native details/summary disclosures, collapsed initially. Names and DoorDash delivery prices stay visible. Whole-row tap/keyboard targets, visible focus, chevron rotation and reduced-motion support; exact captured description inside. The three missing descriptions explicitly link to the full DoorDash menu without invented ingredients. Drinks use two stable columns above700px so expanding a row does not rebalance entries. Olympia-only component/styles; shared components, source menu JSON, other clients, assets, game rules and dependencies unchanged. No new images, searches, downloads, generation or permission requests after the dropdown-only resumption.

## Review and validation
- PASS prior focused ESLint for the unchanged TSX/HTTP code; final stylesheet spacing is the only later UI adjustment.
- PASS source contract and local HTTP checks, all39 names/prices/captured descriptions,39 initially collapsed native disclosures, original assets and menu/game200.
- PASS actual user Codex in-app browser: Enter opens, Space closes, SUMMARY retains focus; minimum measured target height84.8px.390/320 mobile and768 tablet have no horizontal overflow.1280 desktop names/prices readable. Opening a drink retains five entries in each column.
- Astra source/rendered review found one defect: summary focus outline touched description. Fixed with8px top padding. No other concrete UI/accessibility issue found. Full final visual clearance not claimed.
- BLOCKED final local browser reload by browser URL security policy. No workaround attempted; final rendered spacing/public browser verification unconfirmed. Earlier browser captures remain local in C:/Users/bellmark/Documents/Codex/2026-10-09/task/olympia-oct12-evidence/olympia-details-* (captures predate the spacing fix).
- Prior local type/build processes terminated at Anthony's STOP. Latest instruction explicitly prefers existing CI over redundant slow local builds. Full exact-head CI lint/types/build required before merge.

Images are outside this revision. User will provide them separately. Existing prospect labels, selected-menu coverage and delivery-price/source/date caveats remain. Owner menu completeness, in-store pricing/hours/dietary details and acceptance still require confirmation.