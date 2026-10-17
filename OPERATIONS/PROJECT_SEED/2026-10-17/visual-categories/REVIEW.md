# Project Seed product-category navigation and reserved Play dock

Local-only revision from8a3c925 on codex/project-seed-illustrated-art-20261017. Anthony requested categories by items like Vital Vibes. Publication remains paused; this task does not authorize a retry of the prior rejected public push.

## Implementation

Inspected Vital Vibes' actual document.ts, app.js, menu-data.js, artwork.js and category styles. Its interaction uses a product image per category, a named control and category-specific item disclosure. Seed now presents all six existing menu categories as a responsive product-image grid, with always-visible category names and accurate item counts. Selecting an image opens its existing native category, scrolls to it and moves focus there; keyboard Enter does the same. Back to categories returns focus to the grid. Hash links and per-item native details remain intact. No Vital Vibes brand, artwork, colors, counter scene or data was copied.

Existing Seed assets only: seasonal PMS and BBL illustrations for their seasonal groups, Buko Pandan for signature, generic iced coffee for both coffee groups, and existing green-latte illustration as a tea-category visual cue. Images are decorative category cues beside source-backed labels, not newly asserted exact menu-item identities or recipes. The same generic coffee image is deliberately shared by Cold brew and Coffee instead of inventing another product. No art asset bytes or menu records changed.

The current cream/burgundy identity, prominent circular logo and integrated Fina Calle footer are retained. Main category selection replaces the redundant text-only navigation/standalone hero drink; all categories are visible without a carousel. The compact persistent Play link remains available.

## Independent review finding fixed

Parent's cloud reviewer confirmed palette/logo/footer alignment with the approved print, but found the prior floating Play link overlapped first menu item text at390px. The page now uses two actual layout rows: a scrollable menu viewport and an automatically sized Play dock below it. The dock's physical height is reserved by layout; it does not overlay the menu. This also adjusts when control text enlarges or safe-area insets grow. No rule, score, engine or game asset changed.

## Verification

- Focused ESLint and existing Seed menu/game contracts pass.
- Final production webpack build and TypeScript pass,60staticpages. An earlier in-flight build was stopped to finalize the automatic-height dock; the final build completed successfully.
- Twelve protected source/asset files unchanged; integrated footer markup identical; all existing public artwork unchanged. No other restaurant or shared source change.
- Production Chromium320/390/1440: all six category targets activate by pointer and keyboard, reopen correctly, focus the destination and show the correct category's item count. All33items and item details retained. Each category target is larger than44px. Labels remain visible; decorative images have empty alt text and named links carry accessible labels.
- Direct item hashes, skip-to-category focus, Back to categories, reduced motion and menu/game return links pass. Zero page errors and no horizontal overflow.
- Dock/content rectangles touch without overlap: phone390 menu bottom756=dock top756, desktop menu bottom812=dock top812. First menu item and footer controls are fully reachable above the dock at all three widths. Enlarging Play text grows the dock to159.78px and reduces menu viewport to684.22px at844px height, still no overlap.
- Matching before/after captures retained; final390/320 menu,390 category/first-item/footer and desktop captures visually inspected. Physical-device/Safari and game-balance testing are not claimed.
- Web Interface Guidelines review: native links, meaningful labels, explicit image dimensions, keyboard focus, menu/Play safe areas and reduced-motion behavior preserved. No new findings in touched scope.

Final Library screenshot receipt and local commit are recorded at completion. Owned3146preview is stopped after review. No push, PR, merge or deployment is attempted.

Completion: five Library screenshot saves confirmed via documented direct-create fallback after prepared helper unavailable. Exact paths/IDs/bytes are retained in LIBRARY_DELIVERY.json. Mobile category preview libfile_6749648ac30881919d8731ab8a153bb5/file_0000000067b881f5af3a117d3f6758c6; first-item/dock proof libfile_05d34d0df5608191ba27e5b30231b587/file_00000000603c81f5ab79f77ab3782bf4; footer/dock libfile_61d24019eff8819197d57d7e679942f3/file_0000000060c481f5b5a8a4155bd8ff5d.320and1440menu previews also saved. Local xattr application fails Windows os.setxattr; successful Library saves remain confirmed. All owned3146processes stopped; no listener. LOCAL COMPLETE / READY FOR DESIGN REVIEW; no external repository or site action.
