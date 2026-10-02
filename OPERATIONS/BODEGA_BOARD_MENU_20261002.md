# Bodega complete Matcha and Signature Drinks boards — 2026-10-02

Anthony supplied two complete photographed boards and asked to ensure each item is in Bodega's menu and add missing items. The live menu at https://bodegacafe757.com/ and the main-branch menu data agreed before editing.

## Board reconciliation

38582.heic, Signature Drinks:
- Bodega Cat: espresso, lavender & white mocha. Added.
- Spanish Latte: espresso & condensed milk. Already present; updated provenance to the complete board.
- Coco Loco: espresso, coconut & condensed milk. Added.
- La Isla: espresso, mocha & coconut. Already present; updated provenance to the complete board.
- Canela Love: espresso, cinnamon & nutmeg. Added.

38581.heic, Matcha:
- Matcha Latte. Added; no recipe is written on the board, so none is invented.
- Banana Cloud Matcha: banana matcha & vanilla bean cold foam. Added.
- Crème Brûlée Matcha: vanilla matcha & toasted sugar cold foam. Added; French accents normalized.
- Ube Coconut Matcha: coconut matcha & ube cold foam. Added.

No sizes or prices appear on either board. Both categories retain the existing "Ask us for sizes and prices" pattern. No extra milk, espresso, dietary, allergen or preparation claims inferred. The images were visible in the user message; the reported scratch HEIC paths were unavailable. No original photos uploaded as marketing assets.

## Change and verification

Reuse the existing open shared menu section with a text-only Matcha heading and category link. Preserve existing imagery, layout/CSS, all Classics prices/extras, seasonal items, food/bakery/non-coffee items, game, routes, noindex, owner access and Square data. Remove confirmed Coco Loco and Canela Love from the internal pending list; retain "Iced Bodega Cat" because the board does not establish that exact iced variant. Remove the outdated partial-signature-lineup note.

PASS: Node 24 source checks confirmed all nine board drinks occur exactly once with matching descriptions/source filenames, seven net additions, no assigned prices, existing data/sections preserved, Matcha anchor alignment and stale-copy removal. Reviewed the three touched app files against repository frontend-design and fresh Vercel Web Interface Guidelines; the new category reuses semantic headings/lists, native anchor navigation and existing focus/sticky-scroll handling. Existing live desktop menu captured before editing.

Required GitHub CI and Vercel preview checks plus rendered preview inspection are the release checks. Their actual result will be recorded in the PR. No new tests or dependencies were added.
