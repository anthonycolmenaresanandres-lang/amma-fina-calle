# Corrected Colattao 3D demo integration — 2026-10-10

Anthony authorized publication of the Astra-led corrected model pack to the separate protected Pocket Cafe preview at 16:25 UTC. Permission to publish is not a claim of owner likeness acceptance. The existing demo branch is the only publication target; no main/production or live Fall Colattao changes.

## Model identity and presentation

The three actual glTF models now reproduce the supplied gameplay item artwork: warm ivory/dark toile cup with scalloped saucer, open croissant with yellow filling, and fluted milk/matcha glass with cream. Source photos depict some different products and were kept distinct. No invented logo plaques, blue sprigs, straw, or full-object image planes. The models total 1,639,164 bytes; their measured dimensions, triangles, source provenance and SHA256 hashes are in MODEL-PROVENANCE.json. The original and corrected editable source packs remain preserved in the originating local task workspaces, including the corrected models.mjs and texture-authoring.mjs.

CafeModels.tsx uses the new measured dimensions, preserving uniform aspect ratio and all existing recipe poses. The single cup uses its authentic built-in saucer without an extra serving tray. It sits at Y=0, scaled to min(.98 × logical height / model height, .90 × logical radius / model radius). At tier 1 this is scale 5.08636, height .686 and saucer radius .38342 inside the original .7 height/.65 radius.

Other recipes retain their original height budget and common model scale. Their trays fit the conservative posed model envelope with a .045R margin, capped at .94R, and a subtle brown rim. Primitive fallback geometry and default navy fallback tray remain unchanged. No presentation dimension feeds back into game rules.

## Evidence

- Small game TypeScript check and Vite build passed. No local full Next build was run; the remote Vercel preview build is authoritative.
- 3D-FIT-CHECKS.json verifies every actual GLB vertex for all six recipes against the unchanged logical radius and height, verifies support by the fitted tray, and verifies corrected model hashes and dimension metadata.
- Game.tsx, gameplay.ts, levels.ts, constants.ts, input.ts, utils.ts, CafeApp.tsx and brand/colattao.ts are byte-identical to prior demo commit 7959ff050126ed881cedfbd2e188736d06b5171e. Scoring, growth, collision, camera, spawning, movement and sinking are unchanged.
- Standard Three.js GLTFLoader successfully reloaded all six authoring-pack GLBs before integration. Their loaded-model images were visually inspected.
- Astra and the integrating agent inspected presentation-before.png and presentation-after.png at camera [0,12,11], FOV50. These show the same corrected models arranged consistently before/after tray fitting. Astra accepted the offline visual integration; these are not GPU screenshots or owner likeness acceptance.
- Demo route/asset/isolation self-test and scoped ESLint passed. Existing noindex, CSP, local-only asset loading, demo notices, seven original brand images and reward/account isolation are retained.

## Remaining limits

Browser automation timed out twice, so fresh GPU/browser/mobile visual validation is unverified. Exhaustive gameplay testing remains waived by Anthony; he will test the preview. Vite reports the existing large-chunk warning (1.32 MB JavaScript before gzip). Triangle/load budgets are authoring checks, not a physical-device performance benchmark.

The owner Library screenshot could not be materialized through the supported local helper because Python is absent; it was not viewed. Readable local item artwork supplied visual evidence. Rear surfaces, physical dimensions, fine pastry flaking and cream irregularity are inferred approximations, not scans.

The protected READY deployment URL and exact commit are recorded in the task deployment receipt after publication. Vercel authentication protection must remain enabled; no access, service, install, purchase, production alias or promotion changes.
