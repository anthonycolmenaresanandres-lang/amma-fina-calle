# Pocket Cafe - isolated Fina Calle preview

Route: `/demo/pocket-cafe`. A standalone GET document embeds the compiled React/Three.js Colattao demo with real GLB cup, croissant and iced-matcha props. It bypasses the customer/root layout and includes no accounts, real rewards, saved scores, database or analytics integration. The wrapper blocks connections; the inner game allows only same-origin static assets and embedded model image blobs. The iframe permits scripts and same-origin local assets; it is not a separate security origin.

Only this demo route, its static assets/notices, provenance, scoped verification script and coordination documents are added. Packages, root layout, configuration and live Colattao/customer routes remain unchanged. Seven existing Colattao assets and dependency license notices are preserved. ASSET_SOURCES.json remains outside public content.

Original Playground editor: https://playground.google/create/6581734140600644177 . The original project-files.zip (136580 bytes; SHA256 4ED7310CF4600831F72BC8390A17D01AE628DC7A04D78FB8B0D32C63F2ACDF01) and editable skin delivery remain in the task workspace. Gameplay rules and levels were preserved. No Google SDK/music service is active.

Anthony explicitly authorized this separate branch preview and asked to publish without further testing on 2026-10-10. Existing Vercel sign-in protection must remain enabled. No production merge or promotion is authorized. Remote deployment completion/URL is recorded in the task handoff rather than claimed here before deployment.

Application and Colattao asset licenses are not independently documented for broader commercial distribution; dependency notices are included. See QA.md for completed checks and their limits.

## Public release authorization - 2026-10-10 18:38 UTC

Anthony explicitly approved merging this demo branch into main and publishing /demo/pocket-cafe on the live Fina Calle site, with public access without Vercel sign-in disclosed. This supersedes the earlier protected-preview-only publication scope for this demo. Required exact-head PR CI and production READY/public-route verification remain release gates. Owner approval does not establish third-party ownership or broader commercial reuse rights. Live Fall Colattao, unrelated files/settings and private original archives remain excluded. Exact PR/head/merge/deployment verification is recorded in the release task receipt.

The web ESLint configuration excludes only generated Pocket Cafe JavaScript bundles under public/demo/pocket-cafe/game/assets/*.js. These compiled vendor/application bundles are produced from DEMOS/pocket-cafe; the isolated Next.js wrapper remains linted. This prevents linting minified generated output from exhausting ESLint's report formatter.
