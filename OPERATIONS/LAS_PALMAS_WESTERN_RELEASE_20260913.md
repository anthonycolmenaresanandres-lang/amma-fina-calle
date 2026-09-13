# Las Palmas Western QR landing release

Status: LIVE - PR #230 merged and production verified September13,2026.

## Authority and invariants

Anthony selected Sunset Ranch Cantina, palm trees instead of horns/skulls, and the second design's parchment dropdown rows. He requested keeping all actual items and checking public information, then explicitly authorized making the new design live at the current QR.

- Permanent payload: `https://finacalleos.com/demo/las-palmas` (no query, fragment or trailing slash).
- Preserve all39 existing dishes and source data. No replacement of supplied logo/food assets.
- Release is a presentation update to an already public preview, not restaurant certification or client activation.
- No owner access, billing, service routing, database, migration, print, order or external-send actions.

## Public menu check

Sources checked September13,2026:

- [Official Las Palmas Lynnhaven website](https://www.laspalmas2mexicanvb.com/), still directly linking the PDF below. Phone757-463-5100. Do not import other locations' testimonials as Lynnhaven evidence.
- [Official linked menu PDF](https://irp.cdn-website.com/1508c02f/files/uploaded/Las_Palmas_2-_3_-_4_Menu_2025.pdf),14 image-only pages visually reviewed. Filename says2025; current site linkage does not establish a latest-edit date. Multi-location PDF includes Lynnhaven.
- Existing dataset: July23 DoorDash public-source39-dish snapshot. Remains unchanged; new presentation qualifiers only apply to preview state, never owner-connected data.

All39 existing names appear in the public PDF (Lunch prefix added by existing app where appropriate). Every stored numeric value corresponds to a listed variant, but several were misleading without portion/protein/time qualifiers. This is public-source agreement, NOT certification of today's dine-in prices, availability, taxes, allergens or approval.

| PDF page | Existing dishes matched |
| --- | --- |
| 2 | Lunch Special #2, Lunch Burrito Texano, Lunch Fajitas; lunch Arroz con Pollo |
| 3 | Tableside Guacamole, Queso Fundido, Cheese Dip, Guacamole Dip, Camarones Sinaloa, Carne Asada Fries, Fajitas Nachos |
| 4 | Quesabirria; Tacos de Tripa, Carne Asada and Birria |
| 5 | Enchiladas al Queso, Enchiladas Supremas, Burrito California, Dos Manos, San Jose, Texano, Palms Ranchero |
| 6 | Carne Asada, Steak Vallarta |
| 7 | Javier Special, El Cazuelon, Carnitas Michoacan, Molcajete, Pollo Yucatan, Special El Puerto, Pollo a la Crema; dinner Arroz con Pollo |
| 8 | Fajitas, Texas Fajitas, Shrimp Fajitas, Sizzling Steak & Shrimp, Arroz con Mariscos, Arroz con Camaron, Camarones Yucatan, Ceviche Las Palmas |

Key qualifiers: Arroz con Pollo lunch$15.99/dinner$20.75; Carne Asada Fries chicken$21.99/steak$22.99/mixed$25.99; tacos per-piece versus three; fajita/molcajete one-versus-two; ceviche fish/shrimp/mixed; cheese dip small/large. Lunch listed11am–3pm daily, $3 extra after3pm. See typed helper for exact variants.

PDF includes additional dishes, vegetarian, kids, desserts and drinks. The39-item app is not represented as the full restaurant catalog; a clearly separate full PDF link is retained.

## Design implementation

- Forest green #102d21, warm cream #f6e9cd, rust #a63f19, ink #362014.
- Self-hosted Alfa Slab One via Next/font for the bold Western display; existing Geist for controls/body and Georgia for dish names. Lucide TreePalm, utensils, game, file and chevron icons match functional roles without custom icon drawings.
- Original logo and food photos retained; mockup typography stays editable HTML. No invented food, brand artwork, ratings, popularity or establishment date.
- On-page Menu primary CTA; independent game and full PDF links. Native keyboard-accessible details, price qualifiers and readable contact fields.
- No fixed Table1 navigation from general QR. Feedback explicitly names Fina Calle before entry and after success.

## Generated decorative assets

Built-in imagegen only; no separately billed API calls. Optimized with Sharp. No dependency changes.

- `mesquite-palms-v1.webp`:1536×1024,237664 bytes. Prompt: background-only weathered horizontal mesquite wood, deep forest green center#102d21, burnt-orange edges#a34522, black palm fronds only upper corners. Flat front-facing, low-contrast central65percent, center-crop-safe. No text/logo/food/drinks/people/horns/skulls/UI/buttons/borders/signs/buildings/watermark. Style grounded in selected first concept.
- `parchment-v1.webp`:512×512,7990 bytes. Prompt: square seamlessly tileable warmcream#f3e6cc paper, subtle grain/fibers, uniform very low contrast, even illumination, no focal element, dark stains, vignette, outline, borders, objects, text, UI, symbols or watermark. Style grounded in second concept.

## Verification and release gate

-95 landing selftests passed again after final refinement, including39 original media paths and39 owner-value invariants. Owner-menu41 and owner-account13 checks also passed.
- Final targeted ESLint and full production Webpack build/TypeScript passed. No dependency/configuration changes; local DNS ordering was process-scoped only.
- Final320/390/1440 screenshots, normalized source comparison,39 dropdowns, keyboard/menu/category actions, reduced motion and intercepted feedback loading/error/success verified. See `design-qa.md` for exact evidence and intentional content-preserving differences.
- Draft PR #230 application head171c2b50c187be718153b07a074409916b0a925f has passing GitHub CI and Ready Vercel preview. Final documentation commit must independently pass exact-head checks before merge.
- Source reference images and local screenshots belong in `C:\Dev\amma\evidence\las-palmas-western-20260913`.
- `design-qa.md` is passed. Require final exact-head PR checks, scoped merge and live URL/render verification before marking released.

Do not confuse a successful build or HTTP200 with visual verification or restaurant approval.

## Production result

- Approved PR #230 merged2026-09-13T18:13:16Z with expected head8d133569dc9995ed124886faddbbc887c974344f. Application revision: d381e0912038145cc91aa2ceeb31e305cdaf4ba9; application tree matches the verified head exactly.
- Vercel productiondpl_BWK7inXv8eCxKYwfgogBaRLQ7eCZ is Ready at that revision and ownsfinacalleos.com. Production GitHub CI passed.
- Exact QR GET:200, zero redirects, effective URL unchanged. Canonical matches,39 disclosures, correct new headline/font and palm/wood styles.
- Live in-app and independent390px captures inspected. On-page menu/keyboard expansion shows lunch/dinner qualifiers; original dropdown image loads640px. No horizontal overflow or browser errors. Evidence: `live-iab.png`, `live-390.png` in the stated evidence directory.
- Game and Colattao owner routes200; Las Palmas owner, `/m/las-palmas`, `/owner-preview`, `/pilot/las-palmas`404. These checks do not establish authenticated account access, restaurant certification or physical QR scanning.
- Production release complete. This post-release closeout is documentation only, committed locally separately; no extra production deployment or external message required. Original print/archive task remains untouched.
