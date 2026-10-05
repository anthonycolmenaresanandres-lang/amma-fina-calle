# Maracaibo penalty stadium - 2026-10-05

Anthony requested a stadium strongly tied to Maracaibo and Venezuela in the existing animated-cartoon style, and authorized implementation and merge. Original hand-authored vector scenery: warm lakefront sky, Rafael Urdaneta-inspired concrete/cable bridge, palms, tricolor stands in yellow/blue/red order, exactly eight cream stars and quiet green turf. No source photographs, generated likenesses, logos, club marks, external assets, fonts or services.

- Runtime/source asset: `APP/web/public/assets/maracaibo/penalty/stadium-lakefront.svg` (1000 x 1600).
- Style reference: existing approved `tequeno-player.webp`; flat cel colors and outlined shapes. Both keeper expressions, player art and their sizing remain untouched.
- Integration: Maracaibo's existing optional background image; 12% scrim and 46% turf-band anchor. Central bridge pylons and stars sit within the portrait crop-safe lane; palm edges are deliberately expendable. Goal, ball, targets and field markings remain runtime objects, above the backdrop.
- No scripts, external references, filters, animation or additional runtime code in the SVG; reusable local shapes and a small crowd pattern keep the payload light.
- Inspection: source/diff review only. Anthony explicitly requested no tests; no local lint, build, browser captures, visual/gameplay or fallback tests were run. Rendered appearance and resize behavior are unverified.
