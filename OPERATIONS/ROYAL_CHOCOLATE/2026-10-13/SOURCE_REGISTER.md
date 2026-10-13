# Source and asset register
Reviewed 2026-10-13. Unsent prospect concept; no owner approval or launch authority.

| Source | Used for | Limits |
| --- | --- | --- |
| https://www.opentable.com/r/the-royal-chocolate-virginia-beach | Public business-supplied menu dated May29,2026: three fondue collections and specified dippers; milk/white/dark Belgian chocolate choices | Parent's current browser says Not available on OpenTable. Search/cache experience price stale; no numerical prices or booking CTA used. Ingredients paraphrased without new substitutions. Current menu/availability not owner-confirmed. |
| https://www.theroyalchocolate.com/collections/gourmet-apples | Six individual apple names | Cached3–4months old; live homepage under construction. No prices, availability or unsupported ingredient descriptions copied. Royal Apple Collection bundle omitted from selected menu. |
| https://www.visitvirginiabeach.com/listing/the-royal-chocolate/662/ | Business address/phone; Frozen Hot Chocolate and fondue offering | Current preparation/hours/allergens unverified. No hours or allergen claim used. |
| https://www.theroyalchocolate.com/ | Contact website | Under construction; no generic construction-template logo copied. |
| DEMOS/collector-standard/engine.ts and rules.ts | Owned opt-in reciprocal capture and accounting, pause/clear/clock rules | Imported unchanged from pinned main443de7d. Olympia-specific assets/menu/race configuration not copied. |
| Approved PR336/eeafc98; OPERATIONS/MENU_DRAFT_BASELINE.md | Open layout, disclosures, category navigation, accessible title art, floating Play structure | Design principles only; no Olympia/CNU/Maracaibo brand content or artwork. |

## Original assets
All9 SVGs under APP/web/public/assets/royal-chocolate were authored locally with original geometric paths on2026-10-13. Files: apple, chocolate, counter, drink, fondue, marshmallow, pretzel, strawberry, wafer. No external photograph, font outline, customer logo or generated real likeness incorporated. Optional game SVGs have original product-shaped Canvas2D fallbacks. Lettering.tsx contains original piped monoline glyph paths for decorative titles; business name is semantic text, no purported real logo. Palette is a proposed concept, not official brand guidelines.
Menu illustrations are labeled Illustrated concept, and footer explains they are not actual product photos. Game art marked illustrative. All custom art/identity pending business approval before any launch.

## Reference photos supplied by research (not downloaded or incorporated)
Cookies and Cream Apple: https://www.theroyalchocolate.com/cdn/shop/products/RoyalChoc_CandyApple3_05.jpg?v=1769898120
Chocolate Toffee Krunch Apple: https://www.theroyalchocolate.com/cdn/shop/products/RoyalChoc_CandyApple10_06.jpg?v=1769898120
Rocky Road Apple: https://www.theroyalchocolate.com/cdn/shop/products/RoyalChoc_CandyApple4_06.jpg?v=1769898120
Fondue: https://resizer.otstatic.com/v4/photos/96373097-2?width=1280&height=720&format=avif
Researcher inspected these as pale-marble/charcoal photo references; reuse rights unestablished. This implementation uses generic product-shaped original illustration and makes no exact visual likeness claim.
No all-truffles-made-in-house claim: indexed artisan-truffle gift box refers to Birnn Chocolates sourcing. No private personal data, contact outreach, prize/discount/loyalty claims or customer participation.

Release compatibility repair: required PR338 CI38439982286 passed lint/regressions but failed default Turbopack resolution of external DEMOS imports. Runtime now imports an unmodified pinned owned snapshot under APP/web/src/app/royal-chocolate/collector-standard; both snapshot and canonical files are checked against443de7d. No visual/mechanical changes, global config edits or new dependency. Original sources/art/screenshots remain applicable.
