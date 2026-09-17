# Simpler consulting homepage - 2026-09-17

Anthony requested a much simpler, cooler homepage with a serious comic-book theme. This is a refinement of the consulting-first redesign, under the existing scoped implementation and live-release approval.

## Design and content

- Audience: local businesses considering practical consulting and digital delivery. Primary action: start a consultation.
- Palette: Ink #07090b, Graphite #0d1115, Gold #c8aa72, Paper #f0ece4, Muted #b9c0c6. Existing sapphire remains only in the preserved motion system.
- Type: Barlow Condensed 800 for short display headlines; existing Geist for readable body and interface copy.
- Structure: hero and original crest; Colattao live menu plus one playable game demo; three short process steps and consultation/support actions; a compact secondary restaurant offer.
- Signature: the original crest-to-photo transformation inside a stronger graphic-novel composition. Restrained halftone, angular framing and hard shadows carry the comic character; no generated artwork, novelty illustrations or invented branding.
- Cut: duplicate services section, ornamental label clusters, proof fact triplets, R&D diversion, repeated assurances and long restaurant panels. Preserve essential explanations on mobile.

Wireframe: header / [headline + crest] / [4:5 proof photo + live menu + playable demo] / [talk -> scope -> build, consultation + support] / [restaurant price and scope] / footer.

The prior page's thin serif hierarchy did not meet Anthony's requested comic character. The new display face is heavier and condensed; brand specificity comes from the original artwork and motion, rather than generic comic decorations.

## Evidence and conversion boundaries

Known: Anthony explicitly prioritizes simplicity and a serious comic theme. Family ownership is user-confirmed. Colattao's public menu and the Penalty Shootout demo are verified examples. Consulting/custom work requires separate written scope; restaurant packages start at $199/month per location. Current sources remain FEATURE_STATUS_TABLE.md, CORE_OFFER_199.md and the prior release evidence.

Inferred: a shorter page may make the consultation path easier to understand. This is a design hypothesis, not a proven conversion improvement. No visitor research, new testimonial, credentials, client approval, metrics or activation is invented.

Path: practical business need -> consulting and hands-on delivery -> live menu/demo proof -> written scope -> consultation. Existing-customer support remains separate. Detailed restaurant terms remain on the package page.

Optional future hypothesis H-COMIC-SIMPLICITY-01 / proof P-COLATTAO-LIVE-01 / CTA C-CONSULTATION-01: track qualified consultation inquiries per recorded exposure, with support misrouting and pricing/demo confusion as guardrails. Stop on a broken proof link or misunderstood offer. No tracking, experiment rollout or winning result is claimed here.

## Preservation and verification

Original assets, LandingMotion.tsx and page.module.css remain untouched. The root retains the original motion class and attributes; the new comic.module.css controls only layout and typography, plus explicit reduced-motion opacity restoration. The square crest, native 4:5 proof photo and particle source/target hooks remain. Real window scrolling and the original animation timings are retained.

Baseline: C:/Dev/amma/evidence/consulting-first-20260917/before. Actual production at b82c908 has no overflow at 390/1440, 616 particles with verified forward/reverse travel, and zero reduced-motion animations. Mobile sections span about 7053 px before the footer. Final evidence and measurements will be recorded after verification.

No backend, owner/auth/menu/game behavior, dependency, database, access, payment, customer-send or held-route change is included.

## Verification progress

Initial browser review passes 320/390/768/1440 layouts and essential copy, loaded Barlow Condensed 800, keyboard skip/navigation and no-JavaScript visibility. Root inspected desktop hero/proof/full and mobile full captures. Mobile visible words dropped from 594 to 217 (63.5%); section height from 7053.23 to 3082.98 px (56.3%); full document from 7329 to 3394 px (53.7%). These are layout/content measurements, not conversion results.

The first desktop motion check caught a shortened hero triggering the existing 96vh morph threshold at rest. Layout-only minimum height restores the original resting state without changing controller or timings. Fresh 1440 checks confirm progress 0/crest opacity 0.9 at rest and after reversal, with completed forward travel; 768 starts at progress 0 with proof top at 844 px. Mobile forward/reverse and preference-change reduced-motion checks pass. Initial screenshot artifacts from capturing an offscreen fixed skip link while scrolled are addressed by resetting to the top for final full-page evidence; actual unfocused skip control stays outside the viewport.

Targeted homepage ESLint passes. The first build was interrupted to include the motion-layout fix; final production build and production-artifact verification remain release gates.
