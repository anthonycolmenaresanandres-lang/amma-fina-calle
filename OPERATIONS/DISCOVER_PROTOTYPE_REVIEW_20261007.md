# Fina Calle Discover — verified local prototype

Branch: `codex/fina-calle-discover-prototype-20261007`. Base: `055bce600a87b33e1d828c30158c4dc63a674bb1`. Route: `/demo/discover` (noindex, nofollow). Worktree: `C:/dev/amma/worktrees/fina-calle-discover-prototype-20261007`.

Original Fina Calle brand treatment, five discovery categories, category/neighborhood/search filters, list/map, manual city search with unsupported-city empty state, saved places/destinations, transparent fictional offer terms and browser-only simulated claim → visit → sample proof → redemption. Passport stamps, 50 noncash points per distinct demo redemption, three-stop ViBe trail and a three-visit Virginia Beach city badge. Reset Demo confirms clearing only this prototype's browser state.

The geographic map is the supported OpenStreetMap iframe with one selected sample-neighborhood pin at a time, visible attribution and an external map fallback. Live geographic canvas and sample-marker selection passed. The merchants, anchors, prices, eligible times, caps and offers are fictional; no store participation, real verification or approved discounts are asserted. Adults manage family offers; there are no child, account, payment, identity or upload fields. The social-sharing example requires honest conspicuously disclosed rewarded content. No Google/Yelp reviews or social connections.

## Passed

- Meaningful state self-test: sequential claim states, corrupt/unknown saved-state recovery, duplicate redemption protection, untouched initial state, city normalization and five-category/three-trail-stop configuration.
- Final scoped ESLint: four touched TypeScript/TSX files, zero errors/warnings.
- Production build using `next build --webpack`: successful compile, TypeScript and 46 static pages including `/demo/discover`. No dependencies installed. The default Turbopack attempt failed on the existing shared node_modules junction; the supported Webpack option succeeded without configuration changes.
- Desktop 1440×1000, phone 390×844 and narrow 320×740: no horizontal overflow in checked Discover, map, offer and Passport states.
- Category, neighborhood and text filtering; no-match and saved-place empty states; bookmark saving; unsupported Richmond city has no offers; destination saving.
- Full coffee and disclosed-sharing sample flows; proof checkbox gate; three unique redemptions; 150 noncash points, three stamps, complete ViBe trail and unlocked city badge; repeat redeemed offer cannot issue another stamp.
- Reload preserves claims, stamps, saved place and destination. Reset removes all demo progress across reload.
- In-app Back and browser Back restore discovery; offer return restores focus. Keyboard skip link/Enter and 3px solid focus outline verified. Reduced-motion browser context and scoped CSS audit completed.
- Live OSM map canvas, selected pin, visible credit and geographic external link; family adult/no-child-data terms; honest social disclosure and sample-proof checkbox.
- Visual inspection of all 11 final captures. New route has no previous UI baseline; desktop/phone captures document the resulting states.
- Whitespace check and local review commit. Owned Chrome contexts and local preview stopped; port 3031 connection refused after shutdown.

## Supporting evidence and limits

Browser report: `C:/Users/bellmark/Documents/Codex/2026-10-07/task-2/screenshots/verification.json`. Focus/map/disclosure follow-up: `followup-verification.json`. Library receipts: `library-create-receipts.json` in the same directory. All 11 Library results confirmed succeeded with IDs and sizes. The local Windows xattr helper lacks os.setxattr, so receipt identity is retained in that JSON rather than claiming extended attributes were applied. No screenshots were uploaded twice.

No prototype JavaScript runtime exceptions. The unchanged application's Vercel analytics script emits expected local-only 404/MIME console messages because its hosting endpoint is absent from a local Next preview; the prototype does not add analytics. No new services, installs, secrets, accounts, real offers or signup collection.

Unrun: physical-device/screen-reader testing, Safari/Firefox matrix, Lighthouse, remote CI and deployment checks. No push, PR, merge, deployment or public hosting. Map needs internet. This is a local sample, not a live campaign or national merchant inventory.

## Library screenshots

| Screenshot | Library file ID | File ID |
| --- | --- | --- |
| fina-calle-discover-desktop.png | `libfile_49bc35f786208191b91c17189a192515` | `file_00000000e38881f5abebb581512f730e` |
| fina-calle-discover-unlaunched-city.png | `libfile_f61b37a5c75c81919994a8dd8dc12ce8` | `file_00000000b8b481f5acab18a816280335` |
| fina-calle-discover-map-desktop.png | `libfile_4f111005be6c8191bafe8b915fca9ffc` | `file_00000000097081f69345646bac51e753` |
| fina-calle-discover-offer-desktop.png | `libfile_0eb4e1ff8e6c819183d67261ff97d2a7` | `file_000000002b88822fb17f1f1698a33c7c` |
| fina-calle-passport-desktop.png | `libfile_4a8cab2409048191b5d8e8e2d7bf0a7c` | `file_000000004e30822fbf99f6848a0cb9a3` |
| fina-calle-passport-phone.png | `libfile_719c5ceae5488191b14732dd61044388` | `file_000000003868822fac7b3c8be89c51d6` |
| fina-calle-discover-phone.png | `libfile_a9f1ecb37b1c8191bb7ae051cee3654d` | `file_0000000050fc822f80364de651cd9ec6` |
| fina-calle-discover-map-phone.png | `libfile_fe965fd088bc819192aca61b90feff2b` | `file_00000000665081f58875da85285ef185` |
| fina-calle-discover-family-phone.png | `libfile_b5b507a853f48191895b6010c4d5b865` | `file_000000001d68822fbd0e01c9e034939e` |
| fina-calle-discover-sharing-phone.png | `libfile_060e4d5ef0608191a7d17aca55b7b35a` | `file_00000000377881f7be9f9f599aa45496` |
| fina-calle-discover-phone-viewport.png | `libfile_37da14276e448191a9ee2e7af6abf352` | `file_0000000037dc81f58d61b53303e57247` |

Primary previews: desktop `libfile_49bc35f786208191b91c17189a192515`; phone viewport `libfile_37da14276e448191a9ee2e7af6abf352`; phone passport `libfile_719c5ceae5488191b14732dd61044388`; phone geographic map `libfile_fe965fd088bc819192aca61b90feff2b`.
