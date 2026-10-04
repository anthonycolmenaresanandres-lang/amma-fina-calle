# Maracaibo signwriter design QA

final result: passed

## Visual truth and comparison setup

Source: `/workspace/generated_images/exec-0ec9e711-23b6-457a-bdd5-d2ad7574b177.png` (1536 × 1024). Anthony's final amendments: fainter stars and reuse the generated fabric Venezuelan flag for Play.

Rendered implementation: production Next server at `http://127.0.0.1:3032/table/maracaibo/1`, Chromium via the installed Playwright runtime. The agent-browser CLI is absent in this executor; the existing repository browser harness supplies equivalent actual Chromium captures and interactions. No screenshot mock is substituted for browser output.

CSS viewport: 390 × 844, deviceScaleFactor 1, touch/mobile. Source board columns cropped below their board captions (home x64/w435, menu x547/w442, play x1038/w436; y86/h938), aspect-preserved and contained within 390 × 844 for comparison. Each artifact puts normalized source LEFT and actual render RIGHT:

- `/workspace/shared/maracaibo-signwriter-review/compare-home-final.png`
- `/workspace/shared/maracaibo-signwriter-review/compare-menu-final.png`
- `/workspace/shared/maracaibo-signwriter-review/compare-games-final.png`

States: home actions, menu top, game chooser. Original same-state application before captures: `home-before.png`, `menu-before.png`, `games-before.png`. Current individual browser captures: `home-390.png`, `menu-390.png`, `games-390.png`. Additional actual captures at 320/768/1440 and the Drinks anchor are in the same directory. The full paired captures keep lettering, labels and foreground details legible; individual source/export image inspection provides the focused asset check.

## Comparison history

Initial comparison found a P2: home action lettering was smaller than the approved sample, and the preview/header/navigation spacing pushed the game choices down. Increased mobile lettering from 62 to 76px nominal height, tightened row padding and the header, and compacted preview wording while retaining all inactive-menu/order/service/payment facts. Preloaded the category masks' visual layer before reveal. Fresh production build and final screenshots above confirm the fix. The preliminary menu capture preceded image paint; final captures explicitly wait for the heading asset to load.

No actionable P0/P1/P2 findings remain.

## Required fidelity surfaces

- Typography: custom ImageGen brush lettering supplies hero, four actions and all twelve category headings; exact spelling checked. Existing Geist supplies dish names, body, controls and game labels. Image-sized containers reserve space; real text remains available to assistive technology, blocked-image fallback and forced-colors mode.
- Layout rhythm: open black surface, generous rows, fine dividers, no numbered rows/arrows or nested cards. Both game choices and their distinct actions fit the 390px reference viewport; 320px uses normal vertical scrolling without horizontal overflow. Desktop retains an intentional hero/action split.
- Colors: home yellow → blue → red; categories repeat the same sequence in actual menu order. Blue/red action buttons are deepened for white-text contrast. Eight background stars at 0.025 opacity are deliberately fainter than the mock. Warm white remains readable.
- Images: transparent generated lettering has no clipped strokes or visible matte; 17 optimized WebPs total 475,776 bytes. The actual logo and fabric flag are unchanged. The user-requested flag replaces the mock's brush stripes. Standard Lucide stars supply the requested subtle background motif; no generated logo.
- Copy/content: the real menu retains all dishes/prices and category navigation, unlike the mock's illustrative three-category excerpt. Consequently the top menu capture shows the Appetizers group rather than three abbreviated groups. Inactive-service/payment notice stays truthful. Play has exactly Multiplayer / Table Football and Solo / Penalty Rush, with clear separate buttons and no invented QR gate for solo.

## Interaction and accessibility verification

Browser-tested home/menu/service preview/order handoff navigation, semantic button/heading names, blocked lettering fallback, no horizontal overflow at 320/390/768/1440, eight decorative stars, zero visit requests before multiplayer. Production browser fixtures exercise both games, solo without visit cookie/API, football visit acquisition/rejoin/expiry/reset, game cleanup, desktop phone guidance, outage and replay. The four-player browser suite verifies touch input and natural match finish/replay. No JavaScript runtime errors in final visual captures or football suite.

## Follow-up polish / limits

Physical-phone WebRTC across real networks remains unverified from the prior release. This change does not alter the transport or certify it. No further design changes are required for this approved scope.
