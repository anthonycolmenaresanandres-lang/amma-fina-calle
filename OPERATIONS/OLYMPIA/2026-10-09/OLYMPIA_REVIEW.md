# Olympia Deli & Juice Bar — unpublished local prospect demo

Prepared 2026-10-09 for Anthony. This is a prospect concept, not a signed-client launch.

## Local review

Worktree: `C:\dev\amma\worktrees\olympia-prospect-demo-20261009`

Branch: `codex/olympia-prospect-demo-20261009`; base `origin/main` at `4b9aba7`.

Menu: `http://127.0.0.1:3119/olympia`

Game: `http://127.0.0.1:3119/olympia/play`

To restart the local preview in PowerShell:

```powershell
Set-Location 'C:\dev\amma\worktrees\olympia-prospect-demo-20261009\APP\web'
$env:OLYMPIA_LOCAL_DEMO='1'
npm.cmd run dev -- --hostname 127.0.0.1 --port 3119
```

Both routes require the environment flag and loopback direct/forwarded hosts. Without the flag, even a local production server returns 404. They are noindex/nofollow and absent from public navigation, sitemap and venue registries. There is no public preview URL, order endpoint, form, reward, coupon, live menu connection or new integration.

## Reconciliation and preservation

Before implementation: inspected task artifacts, thread inventory and source thread; the source thread had no implementation turns. Inspected canonical Git branches/worktrees, remote Olympia branch search, base tree and source references. No existing Olympia work was found in those inspected surfaces. Created one new sibling worktree rather than copying a client or editing the canonical checkout. The canonical checkout's changes to `OPERATIONS/CODEX_QUEUE.md`, `OPERATIONS/HANDOFF_LOG.md` and untracked `OPERATIONS/BODEGA/` were preserved.

The app's worktree attachment tool cannot register worktrees for this delegated thread. The standard Git worktree is present and usable. No push, PR, merge, deployment, commercial change, spend or business contact occurred.

## Architecture and visual direction

- Shared `VenueMenuLayout`, `VenueMenuNav` and `VenueMenuSection`, with Olympia-only data and scoped CSS.
- Existing `CafeRushScene`, `CAFERUSH_LEVELS` and typed skin contract. No shared engine, rules or client registry changed.
- Logo-derived orange `#f36c21`, deli green `#215b38`, ink `#14241b`, juice pale green `#e3efd9`, white `#f9fbf8`. Heavy sans display with restrained italic; Geist body and mono labels, using existing fonts.
- One visual signature: orange sandwich-and-juice poster illustration. Authored SVG concept art, not an actual food photo, with an on-screen caption and explanatory review notes. No fabricated restaurant photos or testimonials.
- Primitive-only game art. There is no asset-enhanced Phaser path to test for this concept. The game needs no logo, food-image or service request to play.
- Accessible skip links, semantic navigation, visible focus, keyboard catches, pause/resume, loading/error states and round-result announcements. Reduced-motion preference is passed to the shared scene. No new ambient/autoplay animations.

## Source and content status

| Content | Evidence and treatment |
| --- | --- |
| Identity | Olympia Deli & Juice Bar at 23 Hidenwood Shopping Center, Newport News VA 23606, telephone 757-782-5523. Highly likely match; the user-supplied `https://share.google/X2DWjrhB6T6j0Juks` did not resolve in earlier research and has not directly confirmed identity. |
| Contact | `https://olympiadelijuicebar.com/` rechecked during this task; address and phone agree with brief. Site is unfinished/template-heavy; its claims are not treated as owner-approved copy. |
| Brand assets | Inspected both supplied public PNGs before use. `https://olympiadelijuicebar.com/wp-content/uploads/2025/11/Logo-Olympia-Deli-Juice-Bar-White-1024x384.png` and `https://olympiadelijuicebar.com/wp-content/uploads/2025/11/Olympia-Deli-and-Juice-Bar-Logo-300x300.png`. Files stored unchanged. Rights and current approval still require owner confirmation. |
| Broad categories | `https://linktr.ee/olympiadeliandjuice` rechecked; supports fresh food, fresh juice, breakfast, lunch and smoothies. `https://www.instagram.com/olympiadeliandjuice/` retained as the business social link supplied in the brief. |
| Menu names | Eight matching third-party names from the supplied prior research, labeled provisional throughout: NY Chopped Cheese, Olympia Chopped Cheese, Reuben, Caesar Wrap, Russian Panini, Lamb Over Rice, Halal Chicken Over Rice, Lamb Gyro. No ingredients, prices, sizes, availability or venue-wide halal claim inferred. |
| Exclusions | Conflicting hours omitted. Delivery prices omitted. Template testimonials, 50% offer and template menu omitted. No ordering or booking destination invented. |

## Owner requirements before any publication

Confirm exact business identity/address/contact; authorize current logo and brand use; provide approved complete menu, prices, portions/sizes, descriptions, availability, ingredients/allergens and item-specific dietary details; confirm hours; provide real food/interior photos with rights; confirm preferred ordering links, social links and any game approval. Publication remains a separate decision.

## Verification

See `OLYMPIA_VERIFICATION.md` for final passed checks, browser evidence and remaining limitations.
