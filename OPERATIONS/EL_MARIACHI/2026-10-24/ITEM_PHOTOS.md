# El Mariachi exact item photographs — draft, 2026-10-24

Prepared on `codex/el-mariachi-item-photos-20261024` from production commit `56f8a57d3900e38a24caf52e65e32c5de894171c`.

## Result and limits

Two previously unillustrated menu rows now have real restaurant photographs:

| Existing Jacksonville item | ID | Category | Explicit identity evidence |
| --- | --- | --- | --- |
| Fajitas Fundida | 1143 | Fajitas | The original official photo contains the caption “Fajitas fundida”. |
| Pizza Birria | 2913 | Especialidades De La Casa | The original official photo contains the caption “Pizza Birria”. |

Both photographs come from the [official homepage](https://www.elmariachimexandgrillnc.com/). Their full source URLs, retrieval times, dimensions, bytes, SHA-256 hashes and exact matching rationale are retained in `ITEM_PHOTO_PROVENANCE.json`. The restaurant has not been contacted; no owner validation, commission or new license is claimed.

These are two new **item-level associations**, not two newly discovered dishes: the original photographs already existed as source/fallback assets for the approved featured food cutouts. Those cutouts and the hero remain untouched. No stock or generated item images were added. No image was assigned from appearance alone.

## Delivery

- Separate exact-ID `item-photos.ts` map; the original 260-item, 20-category ordering snapshot is unchanged, including prices, descriptions, options text and source links. The voice catalog and phone configuration are untouched.
- Full-frame 480 × 360 WebP copies, 25,182 bytes and 37,328 bytes (62,510 total). Only proportional resizing and compression; original labels retained, no crop, background removal or content edits.
- Compact 80px thumbnails, 64px on narrow screens. Intrinsic dimensions reserve space; `object-fit: contain` preserves the complete photo.
- Existing `expanded &&` category rendering bounds mounted items. `loading="lazy"` and responsive image sizes defer offscreen requests; no image preloads or eager list of 260 images.
- The adjacent item name labels the photograph, so thumbnail `alt=""` avoids repeating the name in the native disclosure. Failed images are removed without changing details or ordering access.
- Jacksonville-only content, category colors/navigation/accordions/search, approved background/hero/cutouts, game, existing checkout links, other client routes and phone remain unchanged.

## Unresolved photographs

The official homepage's uncaptioned grill photograph (`el-mariachi-mex-and-grill-72zbqk4r-food1.jpg`, generic “Food image prep” metadata) and banner (`el-mariachi-mex-and-grill-vjmkr3z2-banner.jpg`) have no verified exact item-name label. Neither is mapped to a menu row. Generic alt text is not matching evidence.

The supplied Jacksonville ordering menu's main HTML contains no assigned food images; its `.fireItemImage` modal is an empty placeholder. Detail-page coverage is recorded separately in the source audit. Items without an explicit reliable photo association remain text-only.

## Review and deployment hold

Only a draft PR is authorized. No merge or deployment is authorized for this batch. `APP/web/vercel.json` sets `git.deploymentEnabled` to `false` for this **exact draft branch only**, retaining every existing cron entry and leaving all other branches at their default. This prevents the usual automatic preview on push without changing live project settings or weakening CI. Before a future approved release, remove the branch-only hold so normal Vercel checks can run. [Vercel branch configuration reference](https://vercel.com/docs/project-configuration/git-configuration#git.deploymentenabled).

Required targeted ESLint, production build and normal remote repository CI are retained. Browser, rendered-page, gameplay, smoke and phone-call checks are intentionally not run at the user's request. Source-photo inspection is provenance research, not verification of the finished UI.

## Completed preparation checks
Targeted ESLint passed with zero warnings. Production Webpack compile, TypeScript, all60static pages and build traces completed successfully. Independent source/asset review found no blockers. All260 official item-page GETs returned200 and normalized titles matched; no item-photo references, errors or rate limits. See ORDERING_PHOTO_AUDIT.json. These read-only source requests were research, not functional testing of the implementation. Remote CI status will be recorded on the draft PR.


## Official gallery coverage
The current homepage gallery contains three food photographs and a banner. The two confirmed captioned pictures are already-used official originals: **zero new distinct dish photographs discovered, two newly illustrated menu rows**. All current navigation links and image URLs were inspected; no separate gallery is linked. Domain-restricted gallery/photos/menu and food searches found only the homepage. See `OFFICIAL_GALLERY_AUDIT.json`. This is a limitation of the inspected sources, not a claim that no other restaurant photographs exist elsewhere.
