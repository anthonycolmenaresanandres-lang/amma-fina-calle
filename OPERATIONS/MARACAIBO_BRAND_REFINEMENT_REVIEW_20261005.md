# Local Maracaibo branding refinement - October 5, 2026

Anthony requests removal of Eat. Play. Stay., slightly smaller prominent words, a larger Venezuela flag with stronger realistic fabric motion, and Venezuelan Food beside restaurant branding. This request authorizes local edits and review only. Earlier PR308 publication approval does not authorize this revision. No push, PR, merge or deployment.

Isolated branch: codex/maracaibo-brand-refinement-20261004, based on latest main b4e47129b4e4f55c0f9a0e89dd303935d584dab5. Main was verified unchanged at completion. Canonical dirty operations/BODEGA work and paused reliability abb2667 are preserved.

Actual reference finding: the supplied JPEG libfile_a5c130efa7f08191b4c9f99a26977665 was materialized into this Windows executor with the current Library helper and inspected. It shows the round angular MBVF monogram, Kitchen & Cocktails ring lettering and the Maracaibo Bistro name beside it. The authentic badge likewise has the monogram and Kitchen & Cocktails; Venezuelan Food is not written out. The expressly requested phrase is added as a small live-text caption beneath the existing wordmark, using the established sans caption type and uppercase tracking. The original badge and existing geometric wordmark are unchanged; no original-font match is claimed.

Only three application files changed:
- MaracaiboExperience.tsx removes the slogan composition, retains a semantic accessible restaurant heading, and adds the cuisine caption beside the branding. Four existing action rows form a restrained centered column.
- maracaibo.module.css reduces display lettering roughly 12-16%, shrinks the existing name slightly, and sizes the flag wrapper to 144px desktop / 88px phone. After protective margins, visible flag art is still roughly 46% / 40% wider than before. Utility/body text, controls and disclosures retain their sizing and behavior.
- MaracaiboFlag.tsx increases primary/free-edge cloth displacement and fold lighting geometry, with somewhat quicker wind phase. This is continuous UV deformation on the existing texture and a stationary canvas, not whole-image rocking. Matching 5.5% margins protect all edges. The finite 4.8-second animation, reduced-motion still, loading/no-WebGL fallback and lost-context fallback remain.

PR308 character images, keeper reaction, gameplay code and all other assets have zero branch diff. Header badge SHA256: 213148e712faeac2328e4944fbba4cec5292b7a68ff49aa37fd103c61cad7188. Flag source SHA256: 51a03e18eb216f27070e60f167687ff950dde51986b771555f7c61c9d790665a. No generated art, new dependencies, installs, paid usage, credentials, services or operational changes.

Checks completed:
- Scoped ESLint on both touched TSX files, Next route type generation and TypeScript noEmit passed before the full-build validator was generated.
- Real Chromium same-state before/after screenshots at 320, 390 and 1440 pixels: caption readable, display words smaller, one flag, no brand overlap or horizontal overflow. Original badge, Fina Calle footer and operational preview disclosures retained.
- Mobile menu/service/ordering/game-chooser navigation passed without joining multiplayer or sending any application writes. Reduced-motion static image checked at all three sizes.
- Actual shader sampled at 20 fps for six seconds (120 source frames). All alpha bounds remained inside the canvas at every frame, canvas transform stayed none, no WebGL errors, and context loss restored the still image. Original three colors/eight-star source was preserved; peak screenshots inspected.
- Six-second 390x844 animated GIF decoded and verified: 97 encoded frames (identical hold frames combined), 6,000ms duration, changing actual fabric pixels. Local development indicator hidden only in review screenshots. Native Library preview: https://chatgpt.com/api/library/files/libfile_3daec1c4aa58819196d0657763df31f7/download . Matching PNG comparisons, clean final screenshot, decoded GIF peak and JSON checks remain in .review.
- One production build using the compatible local Webpack compiler compiled successfully in 71 seconds, then failed Next route-export validation on the unchanged BodegaBillingContent named export in APP/web/src/app/owner/bodega/billing/page.tsx. The same baseline issue was recorded in the prior flag release; zero diff in that file. No unrelated fix or repeated build. Full log: .review/production-build.log. This limits claiming a complete production-build pass; publication remains unapproved.

Preview setup used existing dependencies through a junction. Turbopack cannot use that external junction, so local verification used Webpack. The server's advertised localhost URL allowed its client resources to hydrate; no application configuration was changed. Task-specific preview processes were closed after captures.

Ready for Anthony's visual review. Any later publication needs explicit approval and normal exact-head release gates.
