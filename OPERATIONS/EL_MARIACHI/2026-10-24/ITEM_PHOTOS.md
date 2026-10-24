# El Mariachi item cutouts — release approved, 2026-10-24

Prepared on `codex/el-mariachi-item-photos-20261024` from production `56f8a57d3900e38a24caf52e65e32c5de894171c`. PR: https://github.com/anthonycolmenaresanandres-lang/amma-fina-calle/pull/360 . Anthony explicitly approved merging and publishing this exact menu-photo update on 2026-10-24.

## Final scope

**Three newly sourced dish photos; two reused approved cutouts; five newly illustrated menu rows.** All five displayed images are AI-enhanced transparent cutouts of identified restaurant-source photographs, not unedited photographs. No new dish identity was invented, no ingredients or menu wording were changed, and no image was assigned by visual similarity alone.

| Exact existing Jacksonville item | ID | Source and matching evidence | Treatment |
| --- | --- | --- | --- |
| Arroz Con Pollo | 1207 | Exact merchant caption “Arroz con Pollo” on the Jacksonville DoorDash listing | Newly supplied enhanced cutout |
| Arroz Texano | 2915 | Exact merchant caption “Arroz Texano” on the same listing | Newly supplied enhanced cutout |
| Quesabirria | 2912 | Exact merchant caption “Quesabirria” on the same listing | Newly supplied enhanced cutout |
| Fajitas Fundida | 1143 | Original official homepage photograph contains “Fajitas fundida” | Reused already-approved enhanced cutout |
| Pizza Birria | 2913 | Original official homepage photograph contains “Pizza Birria” | Reused already-approved enhanced cutout |

The parent source-research worker verified the three new merchant image labels and **1305 North Marine Boulevard** location at https://www.doordash.com/store/el-mariachi-jacksonville-27536538/96700975/?pickup=true&src=yp before enhancement. The desktop independently reconciled exact current menu IDs/names, materialized the supplied Library assets, and inspected their actual pixels. It did not redownload the original DoorDash photo bytes. Source captions/location are evidence supplied by the parent research, not an owner-validation claim. No review/customer photo, menu price or description was imported from DoorDash.

The original two photograph URLs, source hashes and embedded caption evidence remain in `ITEM_PHOTO_PROVENANCE.json`, alongside approved cutout Library identities/hashes and all five delivered asset hashes. Original official site: https://www.elmariachimexandgrillnc.com/ . Existing hero, courtyard and featured cutouts are untouched.

## Mobile presentation

- Separate exact-ID `item-photos.ts`; original 260-item/20-category ordering JSON, prices, descriptions, options text and checkout links remain unchanged. Voice data/routing are untouched.
- Five WebPs total **307,670 bytes**. The existing two are 480 × 320; the new three are 480 × 480. Only proportional resizing and compression were applied on desktop. No new generation, crop, background fill or semantic food edit occurred here.
- All files retain real alpha. Decoded delivery alpha matches the proportionally resized input exactly. Supplied new PNGs are 1254 × 1254 RGBA with Library metadata readback confirmed.
- Natural 96px thumbnails on desktop and 80px on mobile, `object-fit: contain`, intrinsic image dimensions and no fixed item-row height. No frame or cover crop removes food.
- Existing category `expanded &&` rendering mounts only an open category. Native lazy loading and responsive sizes defer offscreen images; no eager loading of all 260 items.
- Adjacent dish text labels the thumbnail (`alt=""` avoids duplicate spoken names). Failed images disappear, retaining disclosure/details/order access.
- Footer retains concept/AI-enhancement disclosure and attributes both the official site and restaurant DoorDash menu. Existing ordering still uses the original Jacksonville ordering links.

## Research coverage and unresolved matches

The first phase inspected all 260 public Jacksonville item-detail GETs: all returned HTTP 200 and matched normalized item titles, none contained item-photo references. `ORDERING_PHOTO_AUDIT.json` preserves the sanitized per-item evidence. The official homepage gallery has three food images and a banner, no linked separate gallery; only the Fajitas Fundida and Pizza Birria originals carry exact dish captions. `OFFICIAL_GALLERY_AUDIT.json` records that narrower phase's zero-new-photo result. The later DoorDash research is what adds three new distinct dish sources.

The uncaptioned homepage grill and banner remain unassigned. The legacy Jacksonville gallery at `restaurantselmariachi.com` was also investigated after explicit parent authorization. Its direct asset requests failed certificate validation (`NotTimeValid`) before any HTTP response; TLS validation was not disabled. Cached gallery labels alone were insufficient to integrate photographs. See `LEGACY_SOURCE_EVIDENCE.json`:

- Arroz Con Pollo and Camarones A La Diabla have exact cached label matches, but legacy pixels were not obtained. Arroz Con Pollo is instead sourced through the separate verified DoorDash image.
- Chicken salad cannot distinguish grilled versus fried current items.
- Chicken & shrimp house special has no exact current match; a filename cannot establish one.
- Burrito Veracruz and Burrito Veracruzano are distinct legacy entries; they were not conflated.
- Botanera is insufficiently specific for a current match.

The remaining **255 menu rows** are text-only. More coverage requires additional reliably labeled restaurant-source photos. This is a limitation of the researched sources, not a claim that other photographs do not exist.

## Review and release authorization

The draft-specific deployment hold has been removed after explicit publication approval. `APP/web/vercel.json` is restored to its existing production configuration; cron entries, other branches, live project settings and GitHub CI are unchanged. Complete normal required checks on the final PR head, merge only PR360, and verify the automatic production deployment reaches READY at the exact merge commit with finacalleos.com assigned. No browser, gameplay, smoke or phone-call checks. Reference for the removed branch hold: https://vercel.com/docs/project-configuration/git-configuration#git.deploymentenabled .

Targeted lint, production build and normal repository CI are retained. Initial two-photo commit `6cfed2e` passed local lint/build and CI run `40050554662`; the final five-cutout working tree passed fresh scoped ESLint, production Webpack compile, TypeScript, all 60 static pages and build traces. Independent source review found no blockers. Its new remote CI result will be recorded on the draft PR. Browser, rendered-page, gameplay, smoke and phone-call testing remain skipped at the user's request. Asset inspection and read-only source research do not establish finished UI behavior.
