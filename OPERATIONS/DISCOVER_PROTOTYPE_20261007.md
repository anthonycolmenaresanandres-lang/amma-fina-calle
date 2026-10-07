# Fina Calle Discover — local prototype

Current status: VERIFIED LOCAL ONLY. See DISCOVER_PROTOTYPE_REVIEW_20261007.md for completed checks, screenshot IDs and limitations. The source gate and checklist below record the preparation phase.

Authority: user requested building the Fina Calle local-discovery concept and gamification. Local source only; no push, merge, deployment, new services, installation, real offers or signup collection.

Route: `/demo/discover` in `APP/web`. Isolated from customer menus, owner routes and existing reward APIs. Server metadata sets `noindex, nofollow`. All user progress stays under `fina-calle-discover-demo-v1` in browser storage; Reset Demo clears it. No database or backend API added.

## Design direction

Audience: adults exploring their city or planning a trip. Job: discover a sample place, understand a proposed offer, and try the passport experience.

Tokens: travel-paper `#f8faff`, Fina sapphire `#193fc5`, navy ink `#142238`, quiet slate `#52637c`, passport mist `#e8edf9`, stamp gold `#e0c282`. Condensed display typography recalls the existing Fina Calle public wordmark; Geist body/utility comes from the existing application. No new font downloads. The owned raster logo was inspected but contains a full mechanical QR composition and is not appropriate for the small product header; the header follows the current owned textual brand treatment.

Signature: a booklet-style local passport with circular visit stamps, carried from the homepage teaser into the progress screen. Original icon-based category artwork, not client photography or Localfluence assets. Open editorial spacing; offer artwork and one passport booklet carry the visual hierarchy. No nested card stacks.

## Implemented

- Food & Drink, Shopping, Family Activities, Experiences, Beauty & Wellness; search and neighborhood/category filters; list/map view; saved-place empty states.
- Manual city search with Virginia Beach aliases. Unsupported destinations are explicitly not launched and show zero offers. Save/remove destinations in Passport.
- OpenStreetMap geographic embed centered on Virginia Beach, selectable sample anchor for each filtered place, attribution and external geographic map fallback. No token, installed map library or paid API. All five merchant names, offers and address anchors are fictional; no exact real business address asserted.
- Offer terms: sample cost, purchase/sharing requirement, location, eligible times, proposed capped quota, expiry, one-adult limit and repeat restriction.
- Sequential simulated claim → visit → sample proof → redemption. Proof checkbox replaces an upload. Redemption adds one stamp and 50 noncash points once.
- Three-stop ViBe neighborhood trail and a Virginia Beach badge after three different demo redemptions. All verified-visit wording qualified as simulated/demo.
- Honest conspicuous rewarded-content disclosure in the Shopping sample; no incentivized Google/Yelp reviews, social connection, payment or identity flow. Adult family framing and no child data fields.
- Visible demo label, browser-only notice, Reset Demo confirmation, keyboard focus styles, skip link, responsive layouts and reduced-motion rule. Detail Back supports browser Back.

Map implementation follows the supported iframe export documented at https://wiki.openstreetmap.org/wiki/Export#Embeddable_HTML ; visible credit links to https://www.openstreetmap.org/copyright . The embed uses one active pin, not an assertion that all merchants exist. It needs internet; list and location context remain usable without it.

## Verification gate

No heavy process was launched during source preparation, per the parent’s explicit performance gate. After the parent grants the slot, use the already installed dependency runtime (no install), then:

1. `node --import tsx scripts/discover-demo-selftest.ts`
2. Targeted ESLint on `src/app/demo/discover/{page.tsx,DiscoverDemo.tsx,data.ts}` and `scripts/discover-demo-selftest.ts`.
3. TypeScript / production build using existing repository commands.
4. Browser at desktop 1440×1000, phone 390×844 and narrow 320×740. Check no horizontal overflow, all category/empty states, keyboard navigation, list/map selection and OSM attribution.
5. Save place; select Richmond and confirm not launched; save destination; complete one full offer flow and the disclosed-sharing proof checkbox; reload saved state; complete 3 trail stops and inspect badge; replay redemption to ensure no duplicate points; Back; Reset Demo and reload empty passport.
6. Read `.agents/skills/web-design-guidelines/SKILL.md`, fetch its guidelines and audit touched code. Capture phone/desktop Discover, map, detail and Passport; save screenshots through current Library flow and return exact IDs.

Before publication, merchants, terms, addresses, verification, privacy and a budget would need an explicitly approved live design. This branch does not implement them.

Source audit checkpoint: fetched current web-interface-guidelines on 2026-10-07 and reviewed touched files. Added explicit input names/autocomplete, hidden decorative icons, minimum touch targets, compound focus outlines, long-city wrapping, hover feedback and safe-area reset positioning. Runtime/visual verification and the self-test have since passed after the parent granted the slot; see the final review.
