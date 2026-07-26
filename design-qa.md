# Las Palmas original-logo menu-dock design QA

## Source visual truth

- Reference: `C:\Users\antho\Documents\Codex\2026-07-16\i\.codex-remote-attachments\019f6cc2-0bf2-7660-a6c9-70ef653d4f03\e7c91342-8703-4b1c-a42e-70f557498cb2\1-Photo-1.jpg`
- Source pixels: 1280 x 424, sRGB JPEG.
- Locked target: preserve the exact red/orange Las Palmas sign, palm silhouettes, lettering, proportions, and internal wood/paradise imagery. Exclude the beach scene and the screenshot's menu/phone controls.
- Intended product state: retain the existing dark-green demo and resolve the logo through silver-palm motion into a permanent semantic `MENU` dock directly above the category rail.

## Browser-rendered implementation evidence

- Route: `http://127.0.0.1:4310/demo/las-palmas`
- Mobile viewport: 390 x 844 CSS px, device pixel ratio 1.
- Desktop viewport: 1440 x 900 CSS px, device pixel ratio 1.
- Mobile start: `C:\Dev\amma\evidence\las-palmas-original-logo-menu-dock-20260726\mobile-start-390x844.png`
- Mobile transform: `C:\Dev\amma\evidence\las-palmas-original-logo-menu-dock-20260726\mobile-mid-390x844.png`
- Mobile resolved dock: `C:\Dev\amma\evidence\las-palmas-original-logo-menu-dock-20260726\mobile-end-390x844.png`
- Desktop start: `C:\Dev\amma\evidence\las-palmas-original-logo-menu-dock-20260726\desktop-start-1440x900.png`
- Desktop resolved dock: `C:\Dev\amma\evidence\las-palmas-original-logo-menu-dock-20260726\desktop-end-1440x900.png`
- Full-view comparison input: `C:\Dev\amma\evidence\las-palmas-original-logo-menu-dock-20260726\comparison-full-source-over-implementation.png`
- Focused logo comparison input: `C:\Dev\amma\evidence\las-palmas-original-logo-menu-dock-20260726\comparison-focused-logo-source-over-implementation.png`
- Density normalization: comparison inputs resize both source and implementation to a common 700/720-pixel width. The source is shown above the implementation in each combined input.

## Final comparison findings

- Fonts and typography: the source logo lettering remains raster content from the supplied photograph and was never recreated. The permanent HTML `MENU` heading uses the existing Playfair display token with a deliberate silver finish; category and disclosure typography remains unchanged.
- Spacing and layout rhythm: the original sign sits fully above the permanent dock with a measured 28.09 px mobile gap and 1.28 px desktop gap. The dock and category rail form one continuous menu transition without overlap or horizontal overflow.
- Colors and visual tokens: the established green cantina surface remains intact. Red/orange/yellow logo colors match the source pixels; silver is reserved for the transition, dock heading, and dividers.
- Image quality and asset fidelity: the exact supplied pixels are deterministically isolated to transparency. No beach image, generated logo, replacement text, inline SVG, or CSS approximation appears. Focused comparison confirms the same sign, palm silhouettes, wording, proportions, and internal texture.
- Copy and content: `MENU` now resolves into a real level-two heading that labels the category navigation. Pending-client approval, owner-review, game, and table-preview copy remain unchanged.
- Responsiveness and accessibility: 390 x 844 and 1440 x 900 have zero horizontal overflow. The page retains one semantic level-one restaurant heading, a real level-two menu heading, visible focus styles, and `noindex, nofollow, nocache`. Reduced-motion emulation shows the native logo and semantic dock together with the canvas disabled.
- Behavior: scroll progress verified at 0.000, 0.495, and 1.000; reverse scroll returns to the source logo. The final target is `semantic-menu-dock`, the mobile run uses 500 particles, and browser console error/warning count is zero.
- Preserved product surfaces: 39 menu disclosures, one game destination, two table-preview links, and the existing menu/media dataset remain present.

## Comparison history

1. First combined pass found a P2 image-fidelity issue: thin cyan beach-edge contamination remained around the extracted sign. The deterministic alpha extractor was tightened and boundary-adjacent cyan pixels were removed without redrawing the mark.
2. Second focused pass found a P2 overlap: the dock gradient dimmed the bottom of the original sign. The native image was lifted from 44% to 35% stage position.
3. Final combined pass confirms no beach scene, no logo/dock overlap, no actionable P0/P1/P2 mismatch, and no responsive or console regression.

Focused comparison was required because the exact logo lettering, palm silhouette, transparency edge, and beach removal are too small to judge reliably in the full-page frame.

## Final result

passed
