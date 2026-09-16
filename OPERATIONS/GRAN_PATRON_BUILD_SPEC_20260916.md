# Gran Patron Princess Anne — researched build specification

**Date:** September 16, 2026
**Status:** Plan executed on isolated branch codex/gran-patron-menu-game; final review evidence in GRAN_PATRON_REVIEW_20260916.md. Production release awaits Anthony.
**Confirmed client:** Gran Patron, 5168 Princess Anne Rd, Ste 145, Virginia Beach. Anthony selected https://granpatronvb.com/food-menu.
**Direction:** Las Palmas's menu and soccer-game design, with Gran Patron's identity and content.

## Decision
Build one cohesive Gran Patron menu/game experience inside the existing Fina Calle app. Reuse the Las Palmas presentation and penalty engine. Add structured food/drink navigation and search for the larger catalog. Keep each restaurant's content, links, assets and future owner integrations separate.

The first release candidate is a reviewable menu and five-shot game preview. It does not require a new checkout, database migration or owner-portal activation.

## Verified research

| Source | Finding |
| --- | --- |
| [Food menu](https://granpatronvb.com/food-menu) | Direct live DOM: 223 unique source IDs, 20 sections; Main 176 rows/17 sections, Lunch 36/2, Dinner 11/1. One row is filling instructions; counts are not certified sellable-product totals. |
| [Drink menu](https://granpatronvb.com/drink-menu) | 116 source rows across 10 sections, under Beer, Cocktails, Spirits and Soft Drinks. |
| [Official homepage](https://granpatronvb.com/) | Confirms the Princess Anne address, original logo and linked ordering provider. |
| [Official linked ordering](https://granpatron.hrpos.heartland.us/menu) | Browser displayed the same location/address on Heartland/Genius. No order was started or submitted. |
| Direct menu assets | 14 food-photo references. Two inspected candidates are 800x800. Logo source is 600x315. No drink-photo references in the inspected drink rows. |

**Content discrepancy:** The live food page showed Fresh Guacamole at $14.00; the cached reader showed $10.49 and fewer categories. Use direct live source snapshots, then restaurant confirmation. Do not combine cached, dine-in and online-order prices.

Other import details: repeated names across sections have distinct source IDs; shared section prices and size/portion choices must survive import. Instruction rows must become notes rather than products. Missing/variable values must remain explicit. Preserve source dietary labels and the accompanying restaurant caution without inventing certifications.

**Existing Fina Calle work:** The prior bounded search did not verify a Gran Patron-specific route, asset pack or game. The verified reusable foundation is Las Palmas's current live menu, character lobby, scoreboard and penalty engine. Earlier work can still be incorporated if Anthony supplies its location.

## Visual direction

Use the requested Las Palmas composition: sticky game invitation, strong restaurant identity, a large food photograph, a prominent View menu action, category navigation and parchment menu rows. Gran Patron's original black logo sits on a quiet light area so it stays legible; preserve its proportions and artwork.

Palette: pine #102d21, deep green #071b13, parchment #f6e9cd, rust #a63f19, warm gold #edbf75. Alfa Slab One for major headings, Geist Sans for controls and Georgia for menu names. Texture stays subtle behind text. Keep one clear main action per section.

**Hero recommendation:** The menu-linked Molcajete Cielo, Mar Y Tierra photo has a more recognizable silhouette and stronger composition than the inspected plated burrito photo. Use it as the first candidate, subject to asset review and an appropriate crop. Do not upscale the available 800px file into a large full-screen desktop background. Preserve it for a mobile hero or constrained desktop image; request a larger original if needed.

### Menu flow

```text
Sticky invitation: Play Gran Patron Shootout
Original logo · Princess Anne / Virginia Beach
Large Gran Patron dish portrait
[ View menu ]   [ Order online ]

Food | Lunch | Dinner | Drinks
Search dishes and drinks
Browse categories / active category navigation

Dish name                            Price / From price
Expandable ingredients, options and available photo

Restaurant menu reference · Game · Fina Calle footer
```

Use Food as the default tab. Search covers the full catalog and identifies each result's menu/category, so a lunch item cannot be mistaken for its dinner version. Keep section context visible when jumping to results. Provide a useful empty-search state and a clear way to reset.

Reuse Las Palmas's expandable rows, but display price variants deliberately. Avoid a first screen containing hundreds of cards. Load only the hero eagerly; lazy-load optional dish photographs. Do not add an automatic carousel or decorative video to the menu entry experience.

Order online opens the verified external provider. The menu itself remains a browsing experience. The source restaurant's web menu serves as the full-menu reference; no PDF button is claimed until an actual current PDF is verified.

### Game flow

Working title: **Gran Patron Shootout**. Reuse the two-character lobby, five-shot match, large scoreboard, tap/swipe settings, keeper difficulty, replay and menu return.

Proposed food-character concepts: **Burrito California** and **Piña Loca**, both grounded in this location's menu. These are concepts, not approved new artwork or popularity claims. Give them readable, distinct silhouettes and Gran Patron-specific presentation. Do not carry over Las Palmas's identity, named roster or jersey art without an explicit reusable-asset check.

Keep scoring, keeper logic, shot rules, goal geometry and existing fallbacks unchanged. Missing or delayed art must preserve a playable default. The menu remains reachable from lobby and match. No new prize or redemption system is part of this build.

## Content and asset preparation

Create a client-specific content manifest with:
- Source URL, retrieval date, original source ID, menu group and category.
- Display name, source description, source labels, price text and explicit variants/shared-price context.
- Photo URL/local derivative path and approval status.
- Logo, hero, game skin and character art provenance.
- Confirmed contact/location and menu/game/ordering destinations.

Do not key records only by dish name. Keep source evidence separate from normalized display content. Review exact duplicates, renamed items, structural notes and inherited prices before reporting a final catalog count. A missing price is not zero.

Use reviewed local image derivatives in the finished app rather than making guests depend on third-party image hosts. Preserve originals. Public visibility is not proof of publication approval; keep review status attached to the assets until launch sign-off.

**Observed asset sources:**
- Logo: https://static.spotapps.co/website_images/ab_websites/629773_website_v1/logo_v1.png
- Molcajete candidate: https://static.spotapps.co/spots/52/63d0f893c1433382fe5adf998a4b1d/full
- Burrito candidate: https://static.spotapps.co/spots/9a/806926ac9a4455a0bd32dae222960e/full

## Implementation sequence

1. **Prepare a source snapshot and normalized menu.** Re-fetch the confirmed live pages at implementation time. Reconcile all menu groups, structural rows, prices/options and photo associations. Treat public prices as a review snapshot until confirmed.
2. **Build the mobile menu and lobby prototype.** Match the captured Las Palmas reference at 390px. Integrate the original Gran Patron logo and reviewed hero. Validate hierarchy, category access and character scale before filling in all content.
3. **Extract only the shared presentation needed.** Introduce typed brand/menu/game configuration. Keep Gran Patron data and owner integration separate. Preserve Las Palmas's output with reference checks. Avoid a broad application refactor.
4. **Connect the existing game.** Reuse PenaltyScene, engine/input, renderer fallback, match model and external scoreboard. Parameterize client-specific title, links, images and skin. Lazy-load Phaser after Play.
5. **Complete verification and preview.** Run relevant existing self-tests, targeted lint and the production build. Capture both restaurants at matching states/viewports. Open one scoped PR with a ready preview and clear source/approval notes.
6. **Release after the completed preview is approved.** Recheck the exact reviewed head, deploy, verify public menu/game/assets/links and record the release.

Proposed new routes follow the existing convention: /demo/gran-patron and /play/gran-patron. These are proposals, not live links or a registered QR contract. Check for any existing Gran Patron route/QR before reserving them.

### Expected source areas
- New Gran Patron menu dataset/media manifest under APP/web/src/table-os/menu/.
- New scoped menu/game route wrappers following the existing Las Palmas route convention.
- Shared presentation extracted from the current menu page/CSS, LasPalmasGame, MatchCanvas and CantinaScoreboard only where needed.
- Gran Patron skin/config in the existing penalty presentation layer; client assets under public/assets/granpatron/.
- Existing penalty engine and input rules remain shared.

Do not clone the Las Palmas restaurant ID, menu-enable switch, feedback attribution, ordering account or client-specific approval state. Gran Patron feedback/service functionality needs its own explicitly defined destination; it is not part of this first menu/game release.

## Acceptance criteria
- Correct Princess Anne identity, source URLs and external ordering destination throughout.
- All normalized food/lunch/dinner/drink sections reconcile to the source manifest; no silent missing rows or inherited-price errors.
- Search distinguishes identical names across menus; categories and return navigation work with keyboard and touch.
- Usable 320/390/430px and desktop views; no sideways overflow, obscured focus or tiny controls.
- Both characters, all five shots, difficulty/input modes, scoreboard, replay, cleanup, slow loading and missing-art fallback work.
- Reduced motion is respected; loading/errors are understandable; images have accurate alternative text.
- Existing Las Palmas screens and routes remain correct after shared changes; no cross-client names, links, assets or IDs.
- App checks pass, preview is reviewable, and mobile hardware testing is reported separately from browser viewport checks.

## Scope and evidence
Original research scope (before Anthony said Execute): no app code, asset derivative, production setting, checkout action or external message was changed. Implementation and verification are now recorded separately in GRAN_PATRON_REVIEW_20260916.md. Screenshots and source-photo reviews are under C:/Dev/amma/evidence/gran-patron-design-plan-20260916. Relevant files: gran-patron-food-390.png, gran-patron-drinks-390.png, gran-patron-home-390.png, molcajete-source-review.png, burrito-source-review.png, and the three earlier Las Palmas reference captures.

The prior inventory remains in GRAN_PATRON_LAS_PALMAS_PLAN_20260916.md. Anthony subsequently authorized implementation with Execute; no further location clarification is needed.
