# Project Seed contrast verification — October 7, 2026

Verified runtime/source commit: e27b92c5c491e318cf491083cf10e0fd985117b9, on codex/project-seed-bodega-layout-20261007. Parent released the process slot for this bounded pass. Local only; no publication.

- Final-source Next production build/TypeScript and 45 generated pages passed. Scoped lint and Seed selftest passed on the preceding unchanged TSX/menu/game source; not repeated for the CSS-only contrast declaration. Committed diff whitespace check passed.
- Real keyboard Tab via browser key input focused Skip to October menu at both requested viewports, 1440×1000 and 390×844. Its computed colors are rgb(36,23,47) on rgb(248,242,232), contrast 15.22:1. Focus outline is 3px rgb(228,198,239); the link is visible at top 8px.
- Enter activates #october-lattes. Desktop section top 76.23px, heading top 109.14px, nav bottom 53px. Phone section top 76.16px, heading top 114.56px, nav bottom 63px. Both headings remain clear of sticky navigation.
- Desktop/phone footer container computes cream rgb(248,242,232) with a 12px border. Its original image retains brightness(0), and the animated rig retains its forced-black matrix. During playing the rig was visible and the image hidden; after completion the image was visible and rig hidden. Both occupy the same cream-backed container. Completed visual frames show the original signature/QR clearly: black/cream 18.86:1. No recoloring or shared/Bodega changes.
- No horizontal page overflow observed. All 33 price notices and noindex,nofollow,nocache retained. Browser error log was empty. No game started or further gameplay tests run.

Unrun: forced reduced-motion emulation (only viewport control exposed), physical devices, Safari/Firefox, formal screen-reader traversal, Lighthouse, CI. Existing reduced-motion source selects the same original image over the verified cream backing. No remaining blocker for local review.

Owned build and production server stopped. Owned contrast review tab closed and viewport reset. Heavy-process slot free. Previously reported stale old 3027 tab was not touched.

## Verified Library screenshots

| Evidence | Library ID | File ID |
|---|---|---|
| project-seed-contrast-skip-desktop.jpg | libfile_7f5c6f6f09888191a8b045062c373d70 | file_00000000e91881f58a89d956fe24be0c |
| project-seed-contrast-skip-mobile.jpg | libfile_aea2ff0441cc8191ba6759fb4fef2a5a | file_00000000e0d881f598ad16f363e8b656 |
| project-seed-contrast-footer-desktop.jpg | libfile_3d042a230e608191b7675c836c4220c2 | file_00000000092481f5b7872fb8cd9029f0 |
| project-seed-contrast-footer-mobile.jpg | libfile_583b4a163fc08191b768c4d56fad9296 | file_00000000dab481f7ac07c47badeae61f |

Screenshots: C:/Users/bellmark/Documents/Codex/2026-10-07/task/screenshots/. Exact receipts/versions: library-seed-contrast-manifest.json. No new gameplay testing, publish, PR, merge or deploy.
