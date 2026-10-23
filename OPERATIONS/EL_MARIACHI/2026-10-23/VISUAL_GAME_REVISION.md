# El Mariachi courtyard and hole-game revision

## Scope and authority
User requested a more appealing, realistic regeneration of the existing grilled dish with its background removed, a refined realistic Mexican architectural background, and a hole.io-style replacement game. Prepare locally for review only: no push, remote PR, merge, deployment, calls or new services/spend. Parent generated the dish and architectural imagery in parallel, showed the dish to the user, and received approval to use both images. Existing site and phone remain live unchanged while preparation proceeds.

Branch: codex/el-mariachi-courtyard-hole-20261023, from main e670247e05a2ce08b9577ae8380ed878cce9c957. Reuse the clean retained El Mariachi worktree; leave traffic and other worktrees untouched.

## Visual direction
Audience: mobile restaurant guests exploring the concept menu. Primary job: quickly reach the correct location menu. Preserve all Jacksonville menu content and prices, concept disclosure, accessible navigation and existing phone routing. Later user direction restricts this route to Jacksonville only; retain the six-location source records unchanged, but show only Jacksonville address and ordering links.

Palette: cantera limestone #e8dfcb, deep mesquite #244536, oxblood #9b382b, warm ivory #fffaf0, aged brass #b58a4a, charcoal #252b26. Retain the brand's bold condensed display face with quieter Geist Sans body and tabular menu prices. Layout: one immersive photographic courtyard opening, restrained copy over an opaque-readable limestone surface, a real dish cutout anchored in the foreground, followed by an uninterrupted readable menu. Signature: the architectural dining scene carries Mexican identity through materials and light, without flags, sombreros or unrelated props.

Keep factual imagery provenance distinct: the restaurant's existing logo/photos remain official-source; new architecture is an illustrative concept, not an actual restaurant-location photograph. The dish edit must preserve the exact visible ingredients of the supplied original; do not substitute a generic plate or infer a menu-item identity.

## Game
Original hole-style swallow-and-grow courtyard game at the existing /el-mariachi/play route. Reuse company-owned mechanics if appropriate, with route-local integration and original primitives. No hole.io branding, copied art, live multiplayer or rewards. Mobile one-thumb movement plus keyboard, pause/resume, visibility pause, reduced motion, persistent menu and external ordering access. No shared engine or other-client changes.

## Asset handoff
Parent may supply full local file paths or downloadable URLs. Preserve originals and prepare optimized versioned assets under APP/web/public/assets/el-mariachi/. Transparent dish preferably PNG/WebP; architectural backdrop preferably landscape PNG/JPEG/WebP. Do not claim new imagery has been integrated before files arrive and are inspected. No unrelated ingredient substitutions. Generated dish must be shown to user before site integration.

## Validation boundary
Required scoped ESLint, TypeScript/production build and source review only. No browser, visual after-build, gameplay, smoke, live order, SMS, phone or model probes. No new remote preview on this turn. Report visual/functional behavior as unverified and provide a local diff/review artifact. Prior live site and phone status preserved.
## Approved image provenance and delivery
The user saw the regenerated dish and approved both images with "I love it use it". This authorizes image use, not publication. Both exact Library originals are now successfully materialized in the private local task directory `el-mariachi-generated/`, with Library identity/version metadata read back successfully. The original Library helper initially failed because Windows Python lacks `os.setxattr`; a process-local compatibility adapter mapped those operations to real native NTFS extended attributes and ran the unchanged transfer helper. No metadata checks were bypassed, no alternate image was generated, and no persistent runtime/credential was changed. Transfer URLs/tokens and helper files stay outside the repository.

| Image | Library identity | Original dimensions | Original SHA-256 |
| --- | --- | --- | --- |
| Grill cutout | `libfile_144e557fce188191989da39d0c3e27ca` | 1536 x 1024 RGBA PNG | `9b21a330d1a65f581a44494a57e3802033b0d749a92232962370945d36d28277` |
| Courtyard | `libfile_f6b64bd0824481918994a481f5162d04` | 1672 x 941 PNG | `62a265d7a0c6902d9c3a88de18a920ab16e6c6cdedf6dea3ccd07c5143c7590c` |

The dish is the parent's user-approved regeneration of the official grilled-skillet photograph already retained as `official-grill.jpg`. No menu-item identity, serving guarantee or new ingredient is inferred. The architecture is generated atmospheric design: lime plaster, terracotta paving, restrained Talavera tile, wood and courtyard light. It is not a documentary photograph of the restaurant. The route discloses generated food treatment and the imagined setting. Original public logo/photos and menu provenance remain documented in SOURCE_PROVENANCE.md and the existing asset records.

Pre-integration asset inspection: the dish has 728,582 fully transparent pixels, with smooth edge alpha and nearly opaque food (predominantly alpha 250-253/255). A limestone-background inspection composite confirmed a usable cutout without an opaque rectangular backdrop or conspicuous fringe. Its alpha was preserved unchanged. This was source-image inspection, not website visual QA. No further creative retouching, ingredient substitution or crop was applied.

| Committed derivative | Dimensions | Bytes | SHA-256 |
| --- | --- | --- | --- |
| `APP/web/public/assets/el-mariachi/grill-cutout-v2.webp` | 1536 x 1024 | 566628 | `4d5187654bfc0485a7c395bd6c984d677ae0d0b04d8114dda0d79f8bbeaef38a` |
| `APP/web/public/assets/el-mariachi/courtyard-atmosphere-v2.webp` | 1536 x 864 | 204258 | `d4577a5c1d8324c18d84194f94516aa8f8e775ddd460fea2a1a8db54e3c16c3c` |

Existing Sharp was used only for delivery resizing/compression (WebP quality 92/84, alpha quality 100), with no dependency change. Full-resolution PNG originals and the inspection composite are private local artifacts, not committed assets. `visual-assets.ts` activates these exact derivatives. If an image fails, the hero uses the retained official food photograph or a plain limestone background.

## Game source completion
Courtyard Sweep replaces Mariachi Rush at the same /el-mariachi/play URL. Added a route-local original engine, procedural courtyard drawing and optional Phaser renderer with a Canvas2D fallback; no shared runtime/core changes. 55 seconds, 54 objects, five growth tiers, drag/keyboard/directional controls, visible eligibility rings, pause/background handling, replay and reduced motion. Jacksonville menu/order links stay available. Removed the three now-unreferenced rhythm modules. Static source review found no remaining material issue; gameplay, difficulty and rendered behavior have not been run.

Protected source identity was checked against the base commit: jacksonville-menu.json, locations.json, data.ts and services/voice-gateway/tenants.json are byte-identical. No menu or phone data changed. Palette and game promotional copy are scoped to El Mariachi. Both exact approved images are integrated through the route-local asset manifest; publication remains held.

## Latest authorized menu refinement
User asked to leave only Jacksonville and use menu dropdowns with category choices at the top because the menu is too large. Implement a horizontal mobile category bar and accessible collapsible category sections with clear selected/expanded state, keyboard controls and section navigation. Preserve search and all Jacksonville items/prices; show no other-location selector or destination on the menu/game route. Underlying other-location records and the live phone knowledge/routing remain untouched. This supersedes only the earlier visible six-location UI requirement. Images are approved for use, publication is still held.
## Local review summary
- Menu: Jacksonville-only visible identity, address, hours, phone and external ordering destination on both routes. All 260 source items/prices and 20 categories remain available. The horizontal category bar selects, expands, focuses and scrolls to a section; one section is expanded at a time. Native buttons expose selected/expanded state and keyboard activation. Search still covers all categories; typing does not move focus or scroll the page. Legacy other-location query strings cannot switch this route's location.
- Visuals: full-width atmospheric courtyard, original approved dish cutout, restrained limestone/mesquite palette, explicit independent-concept and generated-setting attribution, retained official-image error fallback.
- Game: original Courtyard Sweep at `/el-mariachi/play`, route-local engine/drawing/Phaser adapter and Canvas2D fallback. The legacy `MariachiRush.tsx` filename now exports CourtyardSweep; former rhythm modules are removed. Small movement/growth patterns were adapted from the existing owned `DEMOS/pocket-cafe` implementation. No proprietary third-party game assets, music or dependencies added.
- Scope: only El Mariachi route/assets and required operations records. Underlying menu/location files and `services/voice-gateway/tenants.json` match base `e670247e05a2ce08b9577ae8380ed878cce9c957` exactly.

## Review and release boundary
This revision is local only. No new remote PR, preview, push, merge or deployment has been requested or performed. Existing public site and demo-phone releases are unchanged. Future publication requires explicit approval and the repository's unchanged remote CI/PR workflow. Existing CI contains regression suites; they have not been removed or bypassed. This local preparation ran only the required static/build checks, not those functional suites.

The user's no-post-build testing instruction overrides the repository skills' normal browser-capture/gameplay review for this revision. Source-image alpha inspection preceded integration. No browser screenshots, live page requests, gameplay, smoke checks, ordering, phone calls or phone configuration changes were made. Rendered layout, mobile interactions, game difficulty and enhanced/fallback runtime behavior remain unverified.

## Completed local checks
- `eslint src/app/el-mariachi --max-warnings 0`: PASS, exit 0, after the final menu and asset integration.
- `npm run build -- --webpack`: PASS, exit 0, Next 16.2.11; compilation (45 seconds), TypeScript (31.7 seconds), all 60 static pages, optimization and build traces complete. Both `/el-mariachi` and `/el-mariachi/play` appear in the route table.
- Source preservation: menu JSON, location JSON, data adapter and voice tenant registry match the base commit. Source review confirmed location selection is fixed to Jacksonville on both routes, with no data deletion.
- Final staged diff hygiene and scope are checked before the local commit. No browser/gameplay/smoke/phone tests were run; no public or preview deployment was created.

Prepared local review note: `C:/Users/bellmark/Documents/Codex/2026-10-22/task/EL_MARIACHI_REVISION_REVIEW.md`. Branch `codex/el-mariachi-courtyard-hole-20261023` is ready for review; publication remains pending explicit approval.
