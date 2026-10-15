# Approved menu draft baseline

**Baseline v1 — approved by Anthony on 2026-10-13.** Anthony's direction: “I love it. Save this as our menu draft.”

The frozen reference is [Olympia PR #336](https://github.com/anthonycolmenaresanandres-lang/amma-fina-calle/pull/336), commit **`eeafc98bba32040490166994def4dd265245e386`**. [Browse that exact menu implementation](https://github.com/anthonycolmenaresanandres-lang/amma-fina-calle/tree/eeafc98bba32040490166994def4dd265245e386/APP/web/src/app/olympia). A later main branch or live URL is not a substitute for this immutable reference. This is a reusable design baseline, not evidence of Olympia business approval or permission to reuse customer material.

## Reusable design principles

- Lead with the menu and real photography. Keep copy minimal and the hierarchy clear on a phone.
- Use an open layout: spacing, alignment and type separate content. Avoid repeated cards, decorative rules, divider lines, title boxes or promotional badges. Ordinary informational lines such as the CNU sentence sit directly on the page.
- Give display titles a deliberate identity; keep food names, descriptions, prices, navigation and controls easy to read. Original vector lettering retains semantic real text and hides decorative artwork from assistive technology.
- Provide a compact category/photo index, native category disclosures, and native item details. Anchor navigation opens the destination category before scrolling. Preserve direct links and keyboard access.
- Keep a light, static background texture subordinate to the food and type. Use restrained, purposeful color and no unnecessary animation.
- Retain visible keyboard focus, reduced-motion behavior, sufficient tap targets, image dimensions/responsive variants and safe-area spacing.
- Offer the existing game as an optional break with a clear return path. Do not add claims about rewards or integrations that have not been authorized.
- Preserve verified source content and provenance. Customer approval, availability, hours and in-store prices are separate from approval of the design; never invent them.

## Existing architecture to reuse

| Reusable seam | Location | Per-customer responsibility |
| --- | --- | --- |
| Menu layout slots and semantic shell | `APP/web/src/venue-menu/VenueMenuLayout.tsx` | Brand, menu, photos, game/visit/footer content and theme |
| Category navigation and optional floating action | `APP/web/src/venue-menu/VenueMenuNav.tsx` | Section IDs/labels and an explicit game destination |
| Section/item content conventions | `APP/web/src/venue-menu/VenueMenuSection.tsx` | Names, prices, descriptions, categories and evidence |
| Reference native disclosures and anchor enhancement | `APP/web/src/app/olympia/OlympiaMenuSection.tsx`, `OlympiaMenuNavigation.tsx` | Adapt intentionally; preserve native HTML and route-specific IDs |
| Reference original vector lettering technique | `APP/web/src/app/olympia/OlympiaLettering.tsx`, `lettering.ts` | Create or select lettering appropriate to the new brand |

Do not extract shared runtime code or alter other clients just to start a new draft. Use the existing slots and a venue-specific route/style module. Promote a proven common behavior to shared code only when a concrete second use warrants it.

## Keep customer material separate

Olympia's logos and photos stay under `APP/web/public/assets/olympia`; photo mappings, menu data, original lettering, route-specific CSS and owner-review copy stay under `APP/web/src/app/olympia`. Sandwich Counter source/assets and Juice Rush remain in their existing game locations. Do not copy these into the shared `venue-menu` folder or another customer's folder.

For a new venue, supply its own approved name, palette, logo, photos, menu/prices, contact details, affiliation wording and game branding. Do not carry over Olympia's CNU sentence, dishes, pricing, address, photographs, logos or original title artwork. Olympia's navy `#10283f`, cream `#f4f1e8`, orange `#f36c21`, yellow `#ffd171` and “Olympia Counter” lettering are the reference treatment, not compulsory branding for every customer.

## Requested extension: persistent Play control

Anthony separately requested a Play box that remains available while scrolling. This is an explicit exception to the otherwise borderless menu. The local implementation follows Bodega's `VenueMenuNav.floatingAction` pattern and uses an Olympia-specific anchor, colors and lettering. On phones it spans the available width inside safe side insets; on larger screens it sits at the lower right. Its current destination is `/demo/olympia-sandwich/index.html`; the inline Sandwich Counter and `/olympia/play` Juice Rush entries remain.

Reserve page-bottom space for the control, bottom safe area and focus clearance; keep the footer reachable. Use a normal labeled link, a generous tap target, and no scroll animation or observer just to keep it visible. Keep this optional and customer-specific. The new floating-control revision is a local draft pending its own publication approval; it is not part of the frozen PR336 approval.

## Starting another menu draft

1. Pin this baseline commit, inspect the current shared components, and identify the new venue's evidence and approved material.
2. Create an isolated branch and a venue-specific asset/data/style namespace. Reuse structure and interaction principles rather than Olympia content.
3. Preserve semantic headings, native disclosures, readable body text, focus and mobile safe areas. If adding a persistent control, reserve its space and verify footer/focus visibility.
4. Run the repository's applicable source, lint/type/build and content checks. Check narrow mobile, larger mobile and desktop layouts, keyboard navigation and menu/game return flow where browser tooling is available. State blocked checks honestly.
5. Save the local draft for review. Design approval, business-content approval and publication authorization remain separate decisions.

Reference evidence: `OPERATIONS/OLYMPIA/2026-10-13/ORIGINAL_LETTERING_REVIEW.md`. Its 320/390 px artifacts are lettering specimens, not screenshots of the full menu.

## Forward-looking Fina Calle footer standard — 2026-10-15

Anthony requests this closing signature for future new builds. This is a later extension, separate from the frozen PR336 baseline and not authorization to mass-edit existing customer sites. Existing customers require separately scoped rollout approval.

- Use the authentic company emblem at `APP/web/public/assets/fina-calle/emblem-colattao.webp`, as already used by `FinaCalleFooter.tsx`; do not redraw/generate a substitute or copy a customer logo. The existing shared component remains unchanged in this revision.
- Link to the verified official `https://finacalleos.com` with an accessible Fina Calle name. Keep meaningful image dimensions, a >=44px link target, visible focus, responsive spacing and safe-area clearance.
- Scope the copyright to **Diseño y software del sitio**, followed by **© [current year] Fina Calle. Todos los derechos reservados.** Compute the year at rendering/build time. Do not imply Fina Calle owns the customer name, logo, products, menu, photographs or third-party marks.
- Keep the footer subordinate to the customer experience, with its logo and rights line readable on phones; preserve existing menu/game return/navigation and floating-control clearance.
- Retain substantive availability, ingredient/allergen and pending-owner-confirmation information. Neutral illustrative-image wording must not falsely claim a generated or conceptual image is a photograph of a real product. Internal provenance records remain intact.
- Use route-local markup/styles for a bounded update. Reuse this standard on future builds; shared component changes or retroactive customer rollout need their own explicit scope/review.

Local reference implementation: `APP/web/src/app/vital-vibes/document.ts` and `APP/web/public/vital-vibes/footer.css`. Publication of that follow-up is a separate release decision.
