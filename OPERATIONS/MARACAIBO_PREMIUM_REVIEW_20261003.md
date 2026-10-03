# Maracaibo premium restraint review — October 3, 2026

Local-only refinement of e16d48ead7b13d8faaf6d5cf0eef4e552f9824d9 on codex/maracaibo-brand-iteration-20261003. Anthony requested “premium” layout, “way less busy” and “less words.” This supersedes the visual direction shown in MARACAIBO_BRAND_REVIEW_20261003.md; earlier source/evidence is preserved.

## Before → after

- Landing: marketing slogans, concentric numbers and circled icons → one EAT. PLAY. Stay. headline, four quiet action rows and short capability labels. The original badge is 68px on desktop / 56px on phone; Table 1 is plain metadata. The single small flag sits in the header.
- Hierarchy: repeated eyebrows, headings, badges and helper paragraphs → spacious consistent gutters, one useful heading, thin rules and a restrained serif for inner titles. Main buttons are white. Citrus is limited to the signature period, focus and interaction; orange/leaf identify game sides.
- Menu: stacked introduction and provenance ahead of dishes → Menu, visible approval status, categories and dishes. Dated public-source provenance remains keyboard accessible in “About this preview.” Prices and inventory are unchanged.
- Service: icons plus four descriptions plus repeated explanations → four concise choices and Preview request. Feedback explicitly says “Preview only. Nothing sent.” The server fallback is visible before selection.
- Ordering: repeated labels and setup badges → a prominent outlined “Table payment unavailable” state with server fallback. The Toast link is clearly pickup/delivery only and does not settle a table check.
- Play/results: slogan, metadata band, repeated team labels, long hints and two scoreboards → compact role controls, one accessible score/timer, concise actual connection state, one result and Play again. No simulation, input, room or payment behavior changed.

The visible shared status region still states concept preview, menu unapproved, and inactive orders, staff requests and table payments. Shared play, reconnection and privacy remain explicitly unverified. Operational limitations were not moved into the optional provenance disclosure.

## Exact implementation paths

- APP/web/src/table-os/maracaibo/MaracaiboExperience.tsx — concise landing, menu, service, ordering and shared shell.
- APP/web/src/table-os/maracaibo/MaracaiboMatchView.tsx — role selection, active display, result presentation and short truthful status.
- APP/web/src/table-os/maracaibo/maracaibo.module.css — responsive hierarchy, spacing, neutral controls and quiet links.
- APP/web/src/table-os/TableMatchClient.tsx — enables the presentation-only hideHud option exclusively for Maracaibo.
- APP/web/src/table-os/game/client.ts — forwards the optional presentation flag.
- APP/web/src/table-os/game/TableFootballScene.ts — hides duplicate canvas text and gives its space to the pitch when the parent supplies the HUD. The default remains unchanged for every other venue.

Original logo and flag files, venue/menu data, engine.ts, input.ts, realtime.ts, toast.ts, dependency manifests and final next.config.ts are unchanged.

## Verification

- Scoped ESLint and TypeScript --noEmit --incremental false: passed.
- Production build: passed, including TypeScript and all 44 static pages. Existing linked dependencies required the same documented temporary Turbopack root as the previous local build. next.config.ts was restored byte-for-byte (SHA-256 bd77a15ea6593435124e37e272565f527506259f991f61c42963e698a35afa8b).
- Final production browser verification: passed: 30 responsive screens at 320, 360, 390, 430, 768 and 1180px; 30 functional checks including the natural 90-second result, replay, exit cleanup, reduced motion and 200% text. Touch and missing-artwork fallback passed. All recorded runtime errors and attempted non-read requests: zero..
- Additional targeted checks: all four service requests, all four roles, visible owner approval and keyboard-opened dated provenance passed (11 checks). The browser harness needed a complete Enter event including its text; no product workaround was needed.
- Actual desktop and phone captures were inspected before and after. Active game now has one visible score/timer. Existing menu items, including prices, remain verbatim.
- [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) review: touched presentation files pass for semantic controls, focus, targets, image dimensions, live status, reduced motion and responsive overflow. Existing view state remains client-local by scope; deep-link routing and full assistive-technology certification are not claimed.

Only this stopped preview's disposable development cache was removed to retain disk space for the build. Canonical dirty checkout and all earlier source/review artifacts are preserved.

## Deliverable and limits

Screenshot: .review/premium/Maracaibo-premium-review-20261003.png
Library: libfile_34d63d4b01548191853e0e166b059b98 (file_000000006b5081f5bd6261e2fe3a2c9a, version 0). Confirmed saved; 404,779-byte image/png.

Evidence: .review/premium/responsive-checks.json, functional-checks.json, extra-checks.json and refinement-checks.json. Screenshots are actual local browser captures, not generated mockups.

No push, PR, merge, deployment, external contact, staff/order sends, pricing change, paid API call, new service or payment activation. The live site remains on PR298 / 40132ecf. Real-phone multiplayer and POS-backed checks/payments remain unverified and outside this revision. Publication requires separate authorization.
