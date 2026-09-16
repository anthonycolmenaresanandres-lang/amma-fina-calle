# Gran Patron — inventory and Las Palmas design adaptation plan

Date: September 16, 2026. Status: initial inventory retained as history. Anthony subsequently confirmed the Princess Anne Road location through https://granpatronvb.com/food-menu. The actionable researched plan is now GRAN_PATRON_BUILD_SPEC_20260916.md. At the time of this initial inventory there were no application changes or deployment. The later implementation is recorded in GRAN_PATRON_REVIEW_20260916.md.

## Recommendation
Use the current Las Palmas menu and Cantina Shootout as the visual and interaction reference. Build Gran Patron through an explicit restaurant configuration and its own content/assets. Preserve the existing penalty engine and keep both clients' routes, menu data and destinations isolated.

## What we have verified

| Work | Current evidence | Meaning for Gran Patron |
| --- | --- | --- |
| Las Palmas menu | Live at https://finacalleos.com/demo/las-palmas; 39-dish preview, six category links, expandable descriptions/photos, PDF and verified location-specific ordering link | Reusable layout and interactions; Gran Patron needs its own dishes, prices, source links and identity |
| Las Palmas game | Live at https://finacalleos.com/play/las-palmas; Burrito California and Quesabirria choices, five-shot match, tap/swipe settings, difficulty, replay and scoreboard | Existing engine and presentation foundation; Gran Patron-specific characters, skins and copy require source/approval checks |
| Visual system | Pine green, parchment, rust and warm gold; Alfa Slab One headings; textured background; strong mobile menu/game actions | Match this hierarchy and treatment, then apply Gran Patron's verified logo and imagery |
| Gran Patron implementation | No specific route, asset folder, repository, branch/commit or exact-name Drive file verified in the searched sources | Do not claim an existing finished menu/game, or overwrite an unidentified prior project |
| Public restaurant material | Two official websites show different Virginia Beach addresses and menus | Confirm the location before importing any content or ordering destination |

Search scope: canonical AMMA origin/main 306fcf458dba0f76c72ea2328bfd754921c0a27c; relevant current worktree files and logs; tracked repository text; local branch/commit names; GitHub repository/code search; targeted filenames under the data center, Documents and Downloads; exact-name connected Drive search; recent app task index; connected Sites inventory (empty). This is a bounded search, not proof that no old chat, external file or database record exists elsewhere. The current queue's Las Palmas print/CAD work is unrelated and preserved.

## Location decision
- [Gran Patron at 2613 Atlantic Avenue](https://www.granpatronva.com/): official site exposes food and drink menus and oceanfront restaurant details.
- [Gran Patron at 5168 Princess Anne Road, suite 145](https://granpatronvb.com/): official site exposes its food/drink menus and a Heartland ordering destination.

Do not infer that menus, logos, prices, ordering links or approvals are interchangeable. Anthony has been asked for the location or an earlier work link. These public websites are reference sources, not evidence of work created by Fina Calle or permission to publish their assets.

## Plan in execution order

### 1. Lock the correct existing project and content
Confirm the location and recover any prior demo/QR/repository supplied by Anthony. Preserve an existing QR destination if one exists. Record the original logo, approved food/drink photos, current menu categories, descriptions, prices/options, official menu link and ordering destination in a client-specific content manifest. Mark missing/unconfirmed fields; never fill them with Las Palmas data.

### 2. Match the reference visually
Menu: retain the sticky game invitation, prominent restaurant identity, full-width food photograph, strong View menu action, category navigation and parchment menu rows. Use Gran Patron's actual dishes and location. Include an Order online action only after its destination is verified for that location.

Game lobby: retain the large title, two prominent character choices, selected-state styling, one clear Play button, compact settings and return-to-menu navigation. Use Gran Patron-specific approved product characters or the existing company-owned fallback until new art is approved. No assumption that Las Palmas's named/numbered characters transfer to this client.

Initial design tokens follow the requested Las Palmas reference: pine #102d21, deep green #071b13, parchment #f6e9cd, rust #a63f19, gold #edbf75. Alfa Slab One for display headings; existing Geist Sans for controls and Georgia for menu names. Any departure should be supported by Gran Patron's real brand material.

### 3. Reuse presentation without mixing clients
The inspected Las Palmas pages contain hard-coded names, asset paths, restaurant ID, menu destinations and ordering/feedback behavior. A blind copy-and-replace is insufficient.

Create a small typed presentation configuration for brand name, location, logo/hero paths, menu/game URLs, category data and character skin. Share layout components where they preserve the existing Las Palmas output. Keep data adapters and restaurant-specific destinations separate. Do not connect Gran Patron to the Las Palmas owner-menu switch, restaurant ID, feedback attribution or ordering account.

Reuse the current penalty scene, engine, match model, input modes and renderer fallback. Brand work should change presentation/configuration; it should not fork scoring, physics, keeper behavior or match rules. Reuse the current external scoreboard through an explicit title/icon configuration where needed.

### 4. Review before release
First review matched 390px menu and game-lobby screenshots against the captured Las Palmas references. Then finish the connected game flow. Check 320px, 390px, 430px and desktop; keyboard focus; menu anchors; names/prices/options; image failure; loading recovery; both players; tap/swipe; difficulty; all five shots; replay and return cleanup.

Add targeted checks that Gran Patron pages contain no Las Palmas identity, menu data, ordering link or restaurant ID. Recheck Las Palmas at the same viewport/state after shared-component changes. Run the existing relevant game/menu self-tests, targeted lint and a final production build.

Deliver one reviewable PR and preview. Production release follows Anthony's explicit approval of that completed revision. Existing held menu/owner routes and unrelated owner/billing workflows are outside this design task.

## Source seams
- APP/web/src/app/(internal)/demo/las-palmas/page.tsx
- APP/web/src/app/(internal)/demo/las-palmas/LasPalmasWestern.module.css
- APP/web/src/app/(internal)/demo/las-palmas/menu-presentation.ts
- APP/web/src/table-os/menu/las-palmas-lynnhaven.ts
- APP/web/src/lib/owner/las-palmas-menu.ts
- APP/web/src/app/play/las-palmas/LasPalmasGame.tsx and LasPalmasGame.module.css
- APP/web/src/app/play/las-palmas/characters.ts, MatchCanvas.tsx, CantinaScoreboard.tsx
- APP/web/src/penalty/skin/skins.ts; existing penalty engine/input remain the shared foundation

## Evidence and completion boundary
Live reference captures are under C:/Dev/amma/evidence/gran-patron-design-plan-20260916/: las-palmas-menu-390.png, las-palmas-game-390.png and las-palmas-match-390.png. Menu and lobby were visually inspected. The public game reached a loaded canvas and five-shot scoreboard; this planning pass is not a new full gameplay certification.

Planning is complete. Gran Patron-specific implementation depends on identifying the correct location/project and receiving implementation direction. No menu, game, asset source, customer message or live site was changed.
