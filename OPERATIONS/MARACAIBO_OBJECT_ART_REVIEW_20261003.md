# Maracaibo decorative objects review — October 3, 2026

Local refinement from 297f91cfd36ce3d7ac8dd5e6554a8c2359a018e2 on codex/maracaibo-brand-iteration-20261003. Anthony requested additional restaurant-related object artwork while retaining the approved premium restraint. No publication is authorized.

## Placement

- Citrus drink: a small atmosphere accent beside Stay. on the welcome screen. It is never attached to a menu item, price or claim about an actual drink.
- Service bell: beside Service, within the existing local request preview. No reservation, ordering or staff-notification capability was added.
- Football: beside Table match in the unjoined lobby; hidden during active play and results.
- The exact restaurant logo, subtle header flag, typography, four action rows, spacing and concise capability limits are retained. Menu and payment/check screens have no new artwork.
- At most one new object is visible per view. Objects are suppressed below 375px; the drink is also suppressed in the narrower two-column desktop range (864–1119px). A check at 1024px caught crowding, so the illustration was hidden instead of compressing type.
- Objects use empty alt text and aria-hidden, do not intercept input, and have no animation. A failed image hides gracefully. One compact footer credit identifies generated object illustrations.

## Source and optimized files

The three exact Library references were materialized into the consumer's Windows workspace, verified readable and inspected at actual pixels before integration. Original bytes, Library identity/version metadata and hashes are preserved with the local source records. They are generated illustrations, not verified restaurant product photography.

| Object | Source Library ID | Source file | 480px WebP bytes |
| --- | --- | --- | ---: |
| Bell | libfile_18a001a3b2d88191a5be0f6e5d6a0cb4 | maracaibo-service-bell.png | 26,432 |
| Drink | libfile_346c4da044088191a2c1fd235a2119e9 | maracaibo-citrus-drink.png | 57,340 |
| Football | libfile_89a322fa0cf481919114db6e5db7debd | maracaibo-football.png | 28,426 |

Sources are 1254×1254 RGBA. Derivatives total 112,198 bytes (about 110 KiB), retain real alpha and proportions, and were not flattened, redrawn or retouched. No new paid generation or external processing was used here.

Exact new assets:
- APP/web/public/assets/maracaibo/service-bell-480.webp
- APP/web/public/assets/maracaibo/citrus-drink-480.webp
- APP/web/public/assets/maracaibo/football-480.webp

Code:
- APP/web/src/table-os/maracaibo/MaracaiboMarks.tsx — optional decorative image component with failure fallback.
- APP/web/src/table-os/maracaibo/MaracaiboExperience.tsx — three placements and compact attribution.
- APP/web/src/table-os/maracaibo/maracaibo.module.css — sparse positioning and responsive suppression.

Sources and hash/alpha verification: .review/artwork/sources/ and .review/artwork/asset-verification.json. All source Library versions are 0. Existing logo/flag assets, menu/prices, game code, transport, Toast/POS/payment behavior, dependencies and final configuration are unchanged.

## Verification and handoff

- Scoped ESLint: passed. Production build and its TypeScript check: passed; all 44 static pages generated.
- 30 responsive page views at six widths passed. Final desktop/phone captures passed on the final production build.
- 88 placement checks passed across nine widths, including 1024/1120px boundaries: sparse object count, no heading overlap, decorative semantics, enlarged service/lobby text, clean payment/menu views and no object during play.
- 30 full flow checks passed, including keyboard focus, menu anchors, local service feedback, truthful Toast handoff, natural 90-second results, replay, canceled/confirmed exits, canvas cleanup and neighboring routes.
- 11 targeted selection/provenance checks and touch/missing-artwork fallback passed. All recorded runtime errors and attempted non-read requests were zero.
- All six baseline landing action positions are unchanged. Final desktop, phone, enlarged-text and active/result captures were inspected.
- Source alpha, decoded dimensions, byte counts, hashes and Library provenance were verified before and after optimization. Original logo hash is unchanged.

[Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) review covered decorative semantics, image dimensions, keyboard focus, no pointer interception, reduced motion and responsive layout. Full assistive-technology and real-device certification are not claimed.

The production build uses the existing locked dependencies and the previously documented temporary local Turbopack root; next.config.ts is restored byte-for-byte. Canonical dirty work, earlier commits and review artifacts remain intact.

Review screenshot: .review/artwork/Maracaibo-object-accents-review-20261003.png
Library: libfile_93165964f8888191a45d137a6b60a366 (file_00000000463881f5a36e7533d321f61d, version 0; confirmed saved, 261,701-byte PNG).

No push, PR, merge, deployment, customer/staff writes, pricing change, new service or payment activation. The live site remains at PR298 / 40132ecf. Real-phone multiplayer and POS-backed table payments remain outside this visual refinement.
