# Touched UI audit

Reviewed against the current [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) and Fina Calle's local frontend-design guidance.

- src/app/demo/pocket-cafe/demo-document.ts: pass — one h1, semantic header/main/sections/footer, skip link, titled iframe, navigation anchors, instructions, explicit demo scope, no forms or customer-write controls.
- public/demo/pocket-cafe/demo.css: pass — visible keyboard focus, dark native color scheme, mobile column layout, explicit iframe dimensions, no new animation, reduced-motion scroll behavior, safe-area footer padding.
- public/demo/pocket-cafe/game/demo-marker.css: pass — textual demo status rather than color-only distinction; no motion; preserves existing game height with the marker accounted for.

Existing compiled café gameplay UI retained. This audit does not certify full accessibility of the original 3D engine or screen-reader interaction with a canvas. Its accessible canvas fallback text exists in the tree even when WebGL is visibly rendering; screenshot and timer evidence must be used alongside the accessibility tree.

Before/after desktop captures were taken using the same normal browser viewport. Mobile runtime evidence and any outstanding findings are recorded in QA.md. No customer or production UI was reshaped.
