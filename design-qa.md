# Las Palmas Western landing - design QA

## 2026-09-13 follow-up: game hub (local only)

Anthony requested a persistent top game invitation, Colattao-style company footer and separate character lobby. Applied the existing Western identity: pine #102d21, cream #f6e9cd, rust #a63f19, ticket gold #edbf75; Alfa Slab One display, Geist utility and Georgia player labels. The signature is an always-present Western game ticket; the standalone lobby centers the two real food mascots. No generated branding, flattened mockup or menu-data rewrite.

Current local game/menu links and full evidence are in `OPERATIONS/LAS_PALMAS_GAME_HUB_20260913.md`. New menu game links use `/play/las-palmas`; the historical verification below refers to the previous live release's generic game link.

Compared390x844 before/after lobby, menu hero/scrolled state and footer in `C:/Dev/amma/evidence/las-palmas-game-hub-20260913`;320x740 and1440x1000 variants also inspected. Menu/category anchors and keyboard focus clear the two sticky bars. Original Fina Calle emblem and direct domain are legible at the footer. Both current mascots work at each difficulty; no multi-brand selector on the new lobby. Original39 dishes, native accordions, warnings, feedback and exact QR contract remain intact. Current web-interface guidelines reviewed; radio labels, keyboard selection/focus,44px actions, explicit select colors/16px text, motion preference, async retry and dimensions verified. No new autoplay or game dependencies.

Limits: local desktop-browser viewport tests, not a physical phone or full canvas accessibility audit. Legacy consolidated smoke harness has connection timeouts; the new36-case browser assertion suite passes, with compatibility results recorded separately. This section does not supersede the release authority boundary or claim a new deployment.

Status: passed. Final production-mode render and normalized comparison inspected September13,2026.

## Target and evidence

Anthony chose Sunset Ranch Cantina, palms instead of horns, and option 2's simple parchment dropdown rows. Implementation is the existing Next.js route, not a flattened mockup or new prototype. Original logo, food assets, all 39 dishes and the exact printed QR URL are preserved.

This supersedes the July26 menu-dock design report previously at this path, retained in Git history at production base220d5fe. Its particle animation is intentionally no longer rendered by this route; original assets and component files remain available.

Evidence directory: `C:/Dev/amma/evidence/las-palmas-western-20260913`.

- Selected combined reference is archived as `selected-reference.json` and normalized to `reference-390.png`.
- First comparison: `comparison-390.png`, reference left / implementation right, both390x844 at1x. Main agent inspected together. In-app screenshots also inspected, but inconsistent320px override captures were excluded as evidence.
- Independent Chromium captures: `verified-320.png`, `verified-390.png`, `verified-1440.png` (1440x1000). Actual DOM width and scrollWidth match320/390/1440 respectively. `menu-320.png` and `form-320.png` inspected for long-name wrapping, right prices and visible keyboard focus.
- Final captures after the typography correction: `final-320.png`, `final-390.png`, `final-1440.png`, `final-menu-320.png`, `final-menu-390.png`. `comparison-final-390.png` inspected with the normalized source and implementation in the same input; width390, height844,1x density for both. Original image pixels remain unchanged. The final slab font resolves to Alfa Slab One; no clipping or overflow at320/390/1440. Native menu details remain39.

## Comparison and corrections

- P2 corrected before first screenshot: decorative palms were being cropped by sizing the background against the whole hero. Restricted background to brand/headline; kept original food as a separate image. Removed an extra generic menu heading.
- P2 corrected after normalized comparison: Rye was too ornamental/light versus the selected bold slab headline; hero spacing was too tall. Replaced with Alfa Slab One, tightened mobile brand/headline spacing, and moved the original photo crop down to show more of the dish. Fresh production build and final screenshots pass. The corrected display weight, palm framing, green/rust/cream hierarchy and parchment row structure follow the selected direction. No remaining actionable P0/P1/P2 mismatch within the original-asset and truthful-content constraints.
- Intentional source-preserving differences: real original logo/photo are not replaced by generated artwork; no fake food enhancement or lettering baked into images. All39 real names, explicit public-price qualifiers, visible approval/source warnings and actual feedback recipient take precedence over the mockup's two illustrative rows. Native controls, editable text and responsive layout are retained.

## Verified interactions

- In-app browser: all39 native dropdowns clicked open and closed; each revealed text. Arroz con Pollo opened through Enter, with lunch/dinner distinctions. Lunch category anchor and taco per-piece/three-piece options verified.
- Menu CTA stays on page; canonical is exactly `https://finacalleos.com/demo/las-palmas`. Game link retains `skin=laspalmas`; full official PDF remains separate.
- Narrow phone form: empty/incomplete submission disabled; message + explicit No consent enabled it. Aborted local request produced accessible failure and retained message. Stubbed200 replaced the form with the correct Fina Calle success message.
- Independently paused local POST showed aria-busy=true, disabled submit and Sending...; fulfilled locally, never forwarded. Interception removed afterward. These are UI tests, not end-to-end delivery claims.
- Reduced-motion emulation produced0s chevron transition; restored afterward. In-app error/warning log returned none before mocks. Original photo paths and owner-value preservation are covered by95 targeted checks.

## Scope and remaining gate

Final local production build/TypeScript, targeted ESLint and95 landing checks pass after refinement;41 owner-menu and13 owner-account checks also pass. Final browser errors command returned none. Exact-head cloud checks and public production verification remain release gates, not design-QA findings. No restaurant menu certification, live customer request, owner/database/billing change or physical QR scan is claimed.

## Live confirmation

PR #230 application revisiond381e0912038145cc91aa2ceeb31e305cdaf4ba9 reached Ready production withfinacalleos.com. Exact permanent QR returns200 without redirect. Inspected `live-iab.png` and `live-390.png`, matching the final layout;39 items, native keyboard expansion, correct canonical and loaded original dropdown image confirmed. Production browser error logs returned none. Public-source/approval warnings remain. Design QA and live presentation verification: passed.
