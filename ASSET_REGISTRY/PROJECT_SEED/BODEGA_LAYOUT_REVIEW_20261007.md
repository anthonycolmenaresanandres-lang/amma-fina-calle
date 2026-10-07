# Project Seed: Bodega layout review — October 7, 2026

Local only. Branch: codex/project-seed-bodega-layout-20261007. Base: current main 055bce600a87b33e1d828c30158c4dc63a674bb1 (PR314). Earlier publication approval does not authorize this revision. No push, PR, merge or deployment.

## Exact changes

- Reuse Bodega's existing shared shell, larger centered logo stage, compact image/title hero, illustrated product rows, featured product column, category headers, menu grid, game teaser, visit layout and bottom clearance. Keep Bodega and shared layout files unchanged.
- Add fixed Seed Rush entry in Bodega's button structure, using the authentic Buko Pandan photo and Seed's cream/ube colors. Destination remains /play/project-seed.
- Display existing Buko Pandan, iced coffee and custard cutouts as named product rows; feature the existing Borahae Latte photo with its original label. Add matching existing category artwork for Signature lattes and Coffee. Do not assign unmatched photos to Ube Velvet, Turon or Matcha.
- Retain the approved ube/cream palette and cold-foam Fraunces titles. Add a Seed-only cream backing behind the unchanged black Fina Calle signature/QR for contrast.
- Preserve all 33 menu items and ASK STAFF FOR PRICE notices, menu wording, supplied Seed logo, Philippine flag, noindex/concept notices, official links and existing October activation function. No new regional affiliation, claims, assets, seasonal activation, game rules or gameplay changes.

Runtime files: APP/web/src/app/(internal)/demo/project-seed/page.tsx and october.module.css. Supporting files: this review, task queue and handoff.

## Verification

Passed: targeted ESLint; existing project-seed-selftest.ts source/route/assets checks; final-source Next production build using existing dependencies and webpack (compilation, TypeScript, 45 generated pages); git diff --check; touched-file web interface audit for semantic links, accessible/decorative image labels, dimensions, focus/reduced motion/safe areas inherited from shared CSS; desktop and phone inspection in user's Chrome.

Compared against actual public Bodega/Seed screens before editing. Requested viewports: 1440×1000 and 390×844; screenshot JPEG captures use browser content bounds. The built menu retains 33 price notices and noindex,nofollow,nocache, has no horizontal page overflow at either tested width, and no observed broken rendered product images. Sticky Signature/Visit anchors, fixed game link to the built Seed Rush intro, teaser and footer clearance inspected. Footer original signature pixels are readable on a cream backing. Existing Halloween intro remains unchanged and was observed; no game started during this revision.

Unrun: full three-round gameplay, physical phones, Safari/Firefox, formal screen-reader/keyboard traversal, automated visual regression, Lighthouse and CI. No game runtime changed. A dev-browser timeout occurred while navigating as the server was stopped; the completed production build's game link subsequently passed. No remaining blocker for local review.

All owned dev/production processes stopped after review; active review tab closed and viewport reset. The previously reported stale old 3027 tab was not touched. Canonical checkout's unrelated queue/handoff/BODEGA changes and prior Seed publication records remain preserved.

## Screenshots retained in Library

| Screenshot | Verified Library ID | File ID |
|---|---|---|
| project-seed-bodega-layout-mobile.jpg | libfile_c4053a87b8b08191859fc5a0fb08c96a | file_00000000e3b8822fbbdd9b4be501dc23 |
| project-seed-bodega-layout-products-mobile.jpg | libfile_65c80d5d169c8191b83979877ce31909 | file_00000000b70081f5b03d7e9f0d50043d |
| project-seed-bodega-layout-signature-mobile.jpg | libfile_d90d5cb27214819190d2a2c3141e9c99 | file_00000000c59081f5b373e22f04a0cb35 |
| project-seed-bodega-layout-game-entry-mobile.jpg | libfile_8116c08df0048191ba6366f036973c47 | file_00000000fd7081f5a3ef713243da5b5a |
| project-seed-bodega-layout-desktop.jpg | libfile_782eaee3bcb08191afef1ebb07c2210a | file_00000000a5e881f5b8a1483430a8f084 |
| project-seed-bodega-layout-menu-desktop.jpg | libfile_89b71d17ea648191bda44cad435e73e0 | file_000000003770822fa2a2c266814dbae9 |
| project-seed-bodega-layout-footer-mobile.jpg | libfile_458a3e0648288191adfe3b31326291fe | file_000000004d6c81f5bb1f7f3c65c607fa |
| bodega-layout-reference-desktop.jpg | libfile_2401e6dd670c81918311f3c881b9e2cc | file_00000000df00822fb37ca1b4abc38a8f |
| bodega-layout-reference-mobile.jpg | libfile_7b5b9c263fd88191b22e3c790f077b19 | file_00000000cdd881f58bfd61be210e5260 |

Local images: C:/Users/bellmark/Documents/Codex/2026-10-07/task/screenshots/. Exact successful receipts and versions: screenshots/library-bodega-layout-manifest.json in the workspace. Windows Library xattrs are recorded in the receipts; no xattr helper was installed.

## Post-review contrast follow-up

The above build/screenshots cover layout snapshot 1fa0f046. A subsequent Seed-only skip-link foreground correction is source-checked but awaits the parent-granted build/browser slot. Footer backing already covers both signature layers. See CONTRAST_FOLLOWUP_20261007.md for source evidence and pending checks; latest source is not yet fully build/browser-verified.

## Final contrast verification complete

Runtime commit e27b92c5 has now passed the final production build and desktop/phone keyboard-focus/activation/footer checks. Prior pending status is superseded. See CONTRAST_VERIFICATION_20261007.md for new Library evidence and exact checks. All owned processes stopped; local only.
