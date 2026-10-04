# Maracaibo tequeno shooter and keeper expression - October 4, 2026

Anthony requested a tequeno-inspired vinotinto shooter against a satirical Maduro goalkeeper in exaggerated military dress, with a sad expression when scored on. He reviewed the three generated character images and explicitly approved placing and merging them: "Great place them and merge" (October 4, 22:38 UTC, Sentinel_8fae95dbc840819198b36108e05d6061). Publication is authorized after release checks.

The supplied images were materialized into this Windows executor through Library prepare_materialize and the current transfer helper, then inspected as actual pixels. The originals are transparent 1254-square PNGs. Both keeper poses share the same canvas and nearly identical registration (alpha bounds differ by at most two source pixels). Originals and provenance are retained in ASSET_REGISTRY/MARACAIBO/penalty-characters-20261004. Runtime images preserve the entire canvas at 768 square, alpha intact, using WebP quality 92: 250,738 bytes total. No new generation, paid API, dependency or service was used.

Only Maracaibo supplies these character assets and presentation fits. The renderer switches the existing keeper image to the optional sad texture during a goal result, then returns it to the ready texture. Saves, misses, aiming, shots and replay retain the ready texture. Missing expression art retains ready; missing character art retains existing primitives. The existing player movement, keeper dive, uniform scale and bottom anchors remain in use.

No engine, scoring, hit zones, controls, multiplayer, staff integration, pricing, header/footer or operational behavior changed. The latest main base is 767714eb20d4e578b165abbecd1b1551ba260a02, including the approved realistic flag/Fina Calle footer and PR305 traffic changes. Canonical dirty work and paused reliability abb2667 are untouched.

Validation:
- Scoped ESLint on four touched TypeScript files; Next route type generation and TypeScript noEmit passed. The final fit-only adjustment passed scoped lint.
- Real Chromium rendered game at 320, 390 and 1440 pixels with touch emulation: source textures loaded; uniform scale, shooter inside canvas and no horizontal overflow.
- Actual aim control produced deterministic goal, save and miss cases via browser-only random substitution, immediately restored. Goal switches to sad only during the result hold and resets; saves/misses stay ready. Five-shot completion and actual replay control reset the score and expression.
- Normal desktop retains the existing phone handoff. Deliberately failed optional reaction and all-character loads retain the intended fallbacks. No runtime exceptions or application writes. Browser evidence is local .review/sprite-checks.json.
- A six-second 20 fps sequence captured actual browser renders, showing the shot, dive, goal reaction and reset. Moving Library preview: https://chatgpt.com/api/library/files/libfile_eab3200ea4808191be122e13f1de644a/download . PNGs and GIF encoding evidence remain in .review. This is rendered gameplay, not a static contact sheet.
- Standard exact-head web CI and Vercel checks are mandatory before the approved guarded merge; exact merge deployment and public asset/render checks follow. No expensive multiplayer suite or repeated installs.

Supplied Library originals:
- tequeno-player.png: libfile_682eea595e3481918e8fd14ef8e722e2
- keeper-ready.png: libfile_59d3560bcd048191a1d96f0972a32af7
- keeper-sad.png: libfile_83e3bedbe1148191a291209b167999b8
