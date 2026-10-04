# Approved Maracaibo flag/header/footer release - October 4, 2026

Anthony reviewed the textured flag GIF, answered "Yes please" to publication, and requested it at the top plus "Brought to you by" / Fina Calle logo / copyright at the bottom. This explicitly authorizes the combined implementation and publication.

Approved MaracaiboFlag.tsx from 453efd1 is unchanged. It is moved into the existing header table metadata, sized 88px desktop / 56px mobile. Duplicate Play flags are removed. Original Maracaibo badge/name and controls remain unobstructed. The footer reuses authentic, transparent assets/fina-calle/emblem-colattao.webp already used by FinaCalleFooter, without cropping or recoloring. Copyright scopes rights to the website experience. Essential menu/ordering/service/payment preview notices remain. No invented links, dependencies, generation, integration, gameplay or other venue changes.

Scoped ESLint and TypeScript pass. Chrome at 320/390/1440 confirms one header flag, no overlap/overflow, loaded original Fina Calle emblem, scoped copyright, reduced-motion static image and retained disclosures. Navigation to menu/service/ordering/games passes without game sessions or application writes. Zero runtime exceptions. Desktop/mobile screenshots visually inspected. Prior actual shader motion and context-loss checks remain valid because its implementation is unchanged.

One local Webpack production build compiles successfully, then fails route-export validation on BodegaBillingContent in the unchanged main APP/web/src/app/owner/bodega/billing/page.tsx. That file has zero branch diff. Do not modify this unrelated Bodega route here. Standard exact-head CI and Vercel checks gate publication.

Review GIF: libfile_acd4f8bd40f081918c60cb4096c2080f. Header/footer screenshot: libfile_f6911bf1007c8191a7ed5725c474da91. Local final screenshots/assertions: .review/header-footer/. This branch is based on main 176093b, including PR #305 traffic isolation. Canonical dirty operations/BODEGA work, old signature and paused session-reliability branches remain untouched.

Open a draft PR, wait for standard CI/Vercel on its exact head, mark ready and merge with SHA guard only when passing. Verify the production deployment for the exact merge SHA and live page/assets. Record final receipt separately in .review/publication/ and on the PR.
