# Las Palmas Western landing - design QA

Status: verification in progress; final typography refinement awaiting fresh render.

## Target and evidence

Anthony chose Sunset Ranch Cantina, palms instead of horns, and option 2's simple parchment dropdown rows. Implementation is the existing Next.js route, not a flattened mockup or new prototype. Original logo, food assets, all 39 dishes and the exact printed QR URL are preserved.

Evidence directory: `C:/Dev/amma/evidence/las-palmas-western-20260913`.

- Selected combined reference is archived as `selected-reference.json` and normalized to `reference-390.png`.
- First comparison: `comparison-390.png`, reference left / implementation right, both390x844 at1x. Main agent inspected together. In-app screenshots also inspected, but inconsistent320px override captures were excluded as evidence.
- Independent Chromium captures: `verified-320.png`, `verified-390.png`, `verified-1440.png` (1440x1000). Actual DOM width and scrollWidth match320/390/1440 respectively. `menu-320.png` and `form-320.png` inspected for long-name wrapping, right prices and visible keyboard focus.

## Comparison and corrections

- P2 corrected before first screenshot: decorative palms were being cropped by sizing the background against the whole hero. Restricted background to brand/headline; kept original food as a separate image. Removed an extra generic menu heading.
- P2 identified in normalized comparison: Rye was too ornamental/light versus the selected bold slab headline; hero spacing was too tall. Replaced with Alfa Slab One, tightened mobile brand/headline spacing, and moved the original photo crop down to show more of the dish. Fresh production build/screenshots required before pass.
- Intentional source-preserving differences: real original logo/photo are not replaced by generated artwork; no fake food enhancement or lettering baked into images. All39 real names, explicit public-price qualifiers, visible approval/source warnings and actual feedback recipient take precedence over the mockup's two illustrative rows. Native controls, editable text and responsive layout are retained.

## Verified interactions

- In-app browser: all39 native dropdowns clicked open and closed; each revealed text. Arroz con Pollo opened through Enter, with lunch/dinner distinctions. Lunch category anchor and taco per-piece/three-piece options verified.
- Menu CTA stays on page; canonical is exactly `https://finacalleos.com/demo/las-palmas`. Game link retains `skin=laspalmas`; full official PDF remains separate.
- Narrow phone form: empty/incomplete submission disabled; message + explicit No consent enabled it. Aborted local request produced accessible failure and retained message. Stubbed200 replaced the form with the correct Fina Calle success message.
- Independently paused local POST showed aria-busy=true, disabled submit and Sending...; fulfilled locally, never forwarded. Interception removed afterward. These are UI tests, not end-to-end delivery claims.
- Reduced-motion emulation produced0s chevron transition; restored afterward. In-app error/warning log returned none before mocks. Original photo paths and owner-value preservation are covered by95 targeted checks.

## Scope and remaining gate

Local build/TypeScript, lint,95 landing checks,41 owner-menu checks and13 owner-account checks passed before the typography refinement. Final fresh build/lint/landing checks, screenshots, exact-head CI and production verification remain required. No restaurant menu certification, live customer request, owner/database/billing change or physical QR scan is claimed.
