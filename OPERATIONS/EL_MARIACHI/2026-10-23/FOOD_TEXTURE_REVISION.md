# El Mariachi food cutouts and page texture

Prepared locally after the separately completed phone release PR358/main545cab4. Anthony requested the same enhanced realistic cutout standard as the hero dish for the two existing food photos, plus more texture across the page. He confirmed the correction to Pizza Birria; no chicken ingredient claim is added. Publication has not been approved for this revision.

## Artwork and presentation

- Exact provided Library Fajitas fundida and Pizza Birria images were materialized with the established Windows adapter. Native Library identity/version attributes were written and read back successfully. Both PNGs were viewed before integration; source alpha was also inspected against cream to distinguish transparent pixels from hidden RGB background.
- Fajitas: libfile_feaef0f638c081919f2f0709bcfbf0f2. Pizza Birria: libfile_61706bb609d48191a58cbdefc7fde886. Both1536x1024, generated from the corresponding existing official restaurant photograph; no additional generation, ingredient changes, cropping or alpha edits were performed in this revision.
- WebP quality90, alphaQuality100, original dimensions:477296bytes and558334bytes. Decoded alpha is exactly identical to each approved PNG. Hashes, source paths, byte sizes and transparency counts are in FOOD_TEXTURE_ASSETS.json.
- Lazy responsive Next Image delivery, natural3:2 contain presentation, soft shadows and short dish captions replace the two cropped rectangular photos. Each image retains its original official photo as an error fallback. Footer attribution now covers all AI-styled food, while retaining the imagined-courtyard disclosure.
- Route-local original SVG mineral grain/trowel texture and warm plaster/terracotta surfaces provide whole-page texture. Category colors and text remain opaque/readable; no new motion or pointer-blocking overlay.

## Scope and checks

All260 menu records/prices/options, category navigation/accordions/search, Jacksonville-only location, original logo/approved hero/courtyard, Courtyard Sweep logic and phone remain unchanged. No dependencies, services, credentials, commercial terms or unrelated clients changed.

Required scoped lint and full production build follow source review. No post-change browser, rendered-page, gameplay, smoke tests or calls are performed. Source-asset inspection is not visual verification of the final webpage. No push, remote preview, PR, merge or production deployment is authorized for this revision yet.

## Publication authorization
Anthony subsequently instructed Merge them all, approving this scoped visual release in addition to the already-completed phone release. The local-only hold above is superseded. Preserve required checks and confirm production by deployment/domain metadata; no runtime testing or calls.

## Completed local validation
Scoped ESLint passed with zero warnings. Full Next.js16.2.11 Webpack production build passed compilation, TypeScript,60static pages and build traces; both El Mariachi routes are present. Independent source review found no blocking issues. Source identity confirms all menu/location records, game logic, phone and approved hero/courtyard unchanged. Shared layout adds texture/disclosure to the footer on the play route; game content keeps its own background. No browser/rendered-page/gameplay/smoke checks or calls. Proceed under subsequent Merge them all approval through required remote checks.