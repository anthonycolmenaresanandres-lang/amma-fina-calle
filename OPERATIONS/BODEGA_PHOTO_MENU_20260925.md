# Bodega photo menu — 2026-09-25

Anthony approved the transcription plan and instructed "Execute merge". This update replaces third-party candidate names with supplied photo evidence in the existing `/demo/bodega` preview. Game route `/bodega-sessions-review`, artwork, noindex, business details and owner-review status are preserved.

## Sources

- 37587.jpg: Classics board. Espresso double $4.00 / quad $6.00; cortado $5.25 with no explicit cup volume. 12/16 oz: Americano $5.00 / unlisted; cappuccino $5.25 / $5.75; latte $5.50 / $5.75; mocha $5.75 / $6.50; drip coffee $3.00 / $3.50; hot cocoa $4.00 / $4.50; chai tea $5.25 / $5.75; tea $3.25 / unlisted. Oat milk, almond milk and syrup flavors +$0.50 each. Prices stored as integer cents; null displays "Ask us" rather than zero, unavailable, or a guessed value.
- 37592.jpg: Regular/frozen lemonade and seven syrup flavors, Morir Soñando and its listed ingredients, Strawberry Dragonfruit Refresher with/without lemonade, mango/strawberry/blueberry smoothies. No sizes/prices shown. Do not extend the Classics surcharge to these options without confirmation.
- 37595.jpg: Five croissant/bagel sandwich fillings; avocado toast with eggs/bacon add-ons; chicken lettuce wraps with croutons/ranch; strawberry parfaits with vanilla yogurt/protein granola; mini pancakes with variable options. No prices shown, including add-ons.
- 37590.jpg: Corroborates the existing five seasonal drinks and four ingredient descriptions. Spiced Apple Chai has no recipe shown. Flavored cold foam is offered without a price. Partial signature board supports Spanish Latte (espresso/condensed milk) and La Isla (espresso/mocha/coconut); no complete Bodega Cat name/recipe or complete signature lineup inferred.
- 37598.jpg: Labels Guava, Mixed Berry Strudel, Maple Pecan, Chocolate Twist, Cheese Stick (Quesito), Pumpkin, Cinnamon Coffee, Chocolate Chip, Orange Cranberry. Bagels are visible. Flavor-only labels stay literal; no guessed pastry types or bagel varieties. Empty trays do not establish current availability. No prices shown.

Photos supplied in the task as 1-37592.jpg, 2-37587.jpg, 3-37595.jpg, 4-37590.jpg and 5-37598.jpg. Original photos are references, not new marketing images or uploaded assets. Each catalog item retains its source filename.

## Reconciliation

Retain these prior candidate names in `pendingOwnerConfirmation`, not the guest-facing list: Coco Loco, Iced Bodega Cat, Canela Love, Croissant Sandwich, Breakfast Sandwich, Ham and Cheese, Sourdough Croissant, Pain au Chocolat, Coffee Cinnamon Muffin, Orange / Cranberry Muffin, Coffee Cake. The generic Bagel entry becomes photographed Bagels. Absence from these photos does not mean discontinued. Existing game sprites/copy remain outside this menu update.

Missing: unlisted Classics sizes; all signature, non-coffee, food, bakery, seasonal and cold-foam prices; full signature board; full Spiced Apple Chai recipe; exact flavor-only pastry names; daily availability. No dietary, allergen-free, redemption or real-time stock claims are added.

## Presentation

Keep current white #fff, ink #111, muted #575757 and divider #e5e5e5 with Geist type and original animated seal. Use open sections, semantic headings, a native table with aligned tabular prices, short descriptions and category-level price notes. Add Classics and Non-coffee anchors to the existing horizontally scrollable navigation. Retain Fall art, existing three category illustrations and persistent Play game action.

## Verification

- PASS: scoped ESLint, production Next.js build and TypeScript; whitespace check.
- PASS: 56 browser assertions (14 per viewport at 320, 390, 768, 1440): full photo-to-rendered price matrix, espresso and extras, missing-price handling, section/item counts, absence of unsupported candidates, anchor targets, image loading, noindex, persistent Play, no error overlay, table fit and no horizontal overflow.
- PASS: before/after visual comparison, Classics and Non-coffee clicks, sticky-header clearance, Tab-visible skip link and Enter navigation to Classics.
- PASS: menu Play opens existing game; PLAY loads a canvas, Back returns to lobby, Menu returns to `/demo/bodega` and removes canvas. No page errors observed. This is a navigation smoke check, not a new full gameplay certification.
- Browser transport timed out once during the first run. Restarting only this task's browser and using the installed CLI directly resolved it; the final full run passes. One unsupported CLI focus command was replaced with actual Tab/Enter verification.
- GitHub web build and Vercel preview pass for application commit 1870a8f, PR257. Final documentation head must pass checks before merge.
- Evidence: `C:/dev/amma/evidence/bodega-photo-menu-20260925` includes browser-results.json, matching before/after captures and focused phone screenshots.

Merge explicitly authorized. Preserve branch protections and complete checks before merging. Prior Bodega handoffs request no post-merge application testing.
