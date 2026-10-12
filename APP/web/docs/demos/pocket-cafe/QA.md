# Verification and limitations

Completed before the request to publish without further testing: scoped route/asset/security self-test, scoped ESLint, full TypeScript check and actual Next.js dev HTTP checks passed. Wrapper GET 200 with noindex/CSP; POST 405; game document and 13 local resources returned 200. Screenshot evidence shows the 3D scene and timer, round completion, restart, Pause/Keep playing, and a 390x844 results layout.

Steering, absorption/growth, all levels and 320px layout remain unverified because browser control timed out. Anthony will test the preview. No further gameplay tests or local build were run for publication.

The first production build compiled but failed writing generated metadata (ENOSPC). Only caches in this isolated demo worktree were cleared. The later local build was stopped without a successful build result. Publication uses the existing Vercel project's remote preview build; a local build pass is not claimed.

Evidence retained in the task workspace: fina-calle-demo-http-results.json, fina-calle-demo-gameplay.jpg, fina-calle-demo-round-complete.jpg, fina-calle-demo-mobile-390.jpg. The canvas fallback text appears in the accessibility tree even when WebGL renders, so it was not treated as evidence of a rendering failure.

2026-10-10 3D update: see 3D-INTEGRATION.md and 3D-FIT-CHECKS.json. Necessary small game build, actual model bounds/core preservation, scoped isolation/ESLint and enhanced/fallback visual smoke completed. Gameplay QA remains Anthony's task.

2026-10-10 Astra-led source correction: corrected model hashes and every posed vertex pass within unchanged game bounds; small game TypeScript/Vite build, route isolation and scoped ESLint pass. Astra accepted offline camera before/after tray fitting. Fresh browser automation timed out twice; GPU/mobile visual validation remains unverified. No local full Next build or repeated gameplay suite. See updated 3D-INTEGRATION.md and presentation comparison PNGs.
