# Olympia floating Play — local review

Base: approved PR336 commit `eeafc98bba32040490166994def4dd265245e386`.
Branch: `codex/olympia-floating-play-20261013`.
Status: local implementation; publication is not authorized for this new revision.

## Approved draft saved

`OPERATIONS/MENU_DRAFT_BASELINE.md` freezes Anthony's approved PR336 reference and describes the reusable open-menu hierarchy, original accessible display lettering, native disclosures, menu-first photography and optional game flow. `APP/web/src/venue-menu/README.md` links maintainers to it. Customer logos, photos, colors, menu data, lettering and affiliation copy remain in their own namespaces; nothing was moved into shared runtime code.

## Play behavior

The existing `VenueMenuNav.floatingAction` slot now receives `OlympiaFloatingPlay`. The normal anchor goes to `/demo/olympia-sandwich/index.html` and is available while scrolling. It uses original “Play” lettering plus readable “Sandwich Counter” text and the accessible name “Play Olympia Sandwich Counter.” The current inline Sandwich Counter link and Juice Rush entry remain.

The requested box is the explicit exception to the otherwise borderless menu: Olympia orange, navy text, cream border, with a yellow hover/pressed state. A 72 px minimum height provides a generous tap area. Mobile left/right offsets use the larger of 16 px or the device safe area; the bottom offset adds 16 px to the safe area. At 700 px and wider it becomes a compact, width-constrained lower-right control. No animation, scroll listener, observer, prefetch or game bundle was added.

Page-bottom space and root scroll padding reserve 8.5 rem plus the bottom safe area, keeping the final footer scrollable above the control. Keyboard targets retain the existing focus outline and top margin, with an additional bottom margin. Grid columns have zero minimum width, destination text can wrap, and the Play SVG can shrink to its column. These are source-level safeguards; actual overflow, zoom and focus visibility still need a browser check.

## Implementations inspected

- Bodega: `APP/web/src/app/(internal)/demo/bodega/bodega-menu-nav.tsx` and `bodega-vibra-link.tsx`, plus `src/venue-menu/venue-menu.module.css`: fixed Play action, existing slot, safe areas and reserved shell space. This is the applicable implementation used.
- Colattao local source at `22f403d73a8631fec3a72e78854af2965cf612f6`: `C:\dev\amma\colattao-cafe-rush\src\app\menu\page.tsx`, with an inline Play Fall Rush entry. Also inspected the checked-in `CASE_STUDIES/COLATTAO/CODE_REFERENCE/src/app/menu/page.tsx` footer Play link. These are reference snapshots, not a claim about the current live Colattao UI.
- Installed Next Link guide read; a standard anchor is intentionally used for the standalone HTML game.

## Checks

- PASS: focused ESLint on `page.tsx`, `OlympiaFloatingPlay.tsx` and the updated HTTP contract script; no warnings.
- PASS: Olympia source contract — all 39 unique items, exact source prices, groups and standard game retained.
- PASS: protected-file diff against the approved baseline: data, six photos, original lettering, both disclosure/navigation components, both games, shared runtime components and dependencies unchanged.
- PASS: source review against repository frontend-design and web-design-guidelines; semantic navigation, labeled control, decorative SVG hidden from assistive technology, existing visible focus, reduced-motion-safe static styling and safe-area/wrapping/clearance safeguards.
- PASS: one sequential `next build --webpack`, including TypeScript and all 51 static pages. Production compilation took31.1s and TypeScript36.4s; both Olympia routes prerendered.
- PASS: updated local production HTTP contract: one labeled floating Play link to the correct game, real accessible Play text, existing inline Sandwich Counter and Juice Rush entries, all39items/prices/descriptions, five category disclosures, six photos/all12variants and prior prospect safeguards. The floating target itself returned HTTP200.
- BLOCKED: fresh browser/mobile/desktop scrolling, footer, zoom, focus and click/back visual verification. This session exposes no browser-control tool and `agent-browser` is unavailable. The user's computer browser was not used for a fresh check; no screenshot is claimed.

One local production preview was used at `http://127.0.0.1:3121/olympia` and stopped after the checks; port3121 has zero listeners. Reproduce after a successful build from `APP/web` with `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3121`. No parallel servers, live game loops, installs or new integrations are needed.

No push, PR, merge, deployment, business contact, pricing/content change or live-data write was performed for this revision.