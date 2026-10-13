# Olympia texture, category accordions and menu cleanup

Status: local implementation complete; approved publication awaiting required CI and production verification.

## Scope and authorization
Anthony requested subtle background texture and expandable category sections, then explicitly asked to remove the highlighted Full menu on DoorDash / delivery date / in-store disclaimer block, every remaining visible DoorDash mention, and all arrows/chevrons, and to merge and publish. This supersedes earlier visible-source/arrow design instructions. Work resumes the saved codex/olympia-category-accordions-20261013 branch from main379d315 (game PR333); no duplicated checkout or overwritten work.

## Implementation
- CSS-only fine grain on the existing navy main-page background; no new image, dependency or service.
- Five native category disclosures with clear headings, item counts and Show menu / Hide menu text. Signature sandwiches starts open; other groups start collapsed and can remain independently open. Category hit areas are at least78px tall. Desktop uses two item columns inside full-width category headings.
- All39 item names, exact prices and descriptions retained. Item disclosures use visible Details / Hide details text and remain independent. Return links sit outside summary controls; no nested interactive controls. Summary markers, SVG chevrons and decorative/navigation arrow glyphs are removed across the Olympia main page, including Review notes.
- A small client wrapper opens a target category before native hash navigation, including a repeated link to the current hash; initial/deep hashes and history changes also reveal the target. Modified/new-tab link behavior is preserved. The menu itself remains server-rendered with native controls.
- Source promotional/navigation copy removed from the main page, category notes, displayed price suffixes, missing-detail fallback and footer. Prices are not labeled owner-approved or in-store. Review notes retain pending Olympia confirmation.
- Canonical captured source remains untouched in APP/web/src/app/olympia/doordash-menu.json and menu-data.ts, including DoorDash source https://www.doordash.com/store/34805753 and observed date2026-10-12. This internal record preserves provenance; it is not a new price verification.

## Checks
PASS: focused ESLint for the touched TSX/HTTP test files; Olympia source contracts for39 unique exact source records and shared standard game; git diff check.
PASS: final local HTTP checks for menu/Juice Rush200, noindex/nofollow, all39 exact names/prices/descriptions/native item disclosures, five native category disclosures with only Signature open initially, textual category actions, no nested controls inside summaries, no visible DoorDash/date/disclaimer or arrow/SVG markup, all six supplied photos/twelve exact responsive variants, original assets and template exclusions.
PASS: scoped git diff against379d315 shows no changes to canonical menu/photo data, originals/derivatives, shared venue components, dependencies, Juice Rush or Sandwich Counter source/bundle. PR333 is preserved.
SOURCE AUDIT: native summary semantics and keyboard behavior; visible focus; non-nested actions; reduced-motion image hover; readable sizes; full-width tap targets; sticky-anchor offsets; initial/hash navigation guarded to this page. No new accessibility blocker found in source.

## Rendered-review limits
Before the final wording/icon cleanup, the user's in-app browser showed the textured390px menu without horizontal overflow, native accessible category expanded/collapsed states, and the Featured items photo link opening its collapsed category. The first whole priced item fit in the844px view. A1280px top-of-page view was also inspected. The subsequent keyboard/same-hash/reopen sequence was interrupted by browser transport failure, so it is not a pass. On reconnect, no browser-control tool or agent-browser CLI was available. No fresh post-cleanup screenshot, repeated keyboard/history cycle, desktop body review or physical-device test is claimed. Earlier screenshot accordion-after-mobile.jpg is pre-cleanup evidence and must not be presented as the final UI.

## Resource handoff
One task-owned Next dev process on127.0.0.1:3121 was used for final HTTP checks and stopped successfully after the check (session13732, Ctrl-C, exit1 expected). Local lint/source/HTTP sessions completed. No full local production build, browser loop, game process, other worktree or unrelated process was started/stopped. Resource window explicitly released to the game task; full build/types will run in required remote CI.

## Owner content still pending
Owner acceptance, in-store prices, full coverage/customizations/availability, hours/dietary details and exact photo-to-item mappings. Proposed CNU community copy remains qualified in review notes. No new signing, affiliation, whole-business halal, discounts, rewards or review claims.
