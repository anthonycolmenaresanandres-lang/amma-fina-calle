# Project Seed contrast follow-up — October 7, 2026

Inspected local layout snapshot 1fa0f0466b57d95915e043161d1cb3ebd149c2a6 against the two source-supported PR314 review findings. Local source correction only; no publication authorization for the new layout. Parent has reserved the heavy-process slot for another task: no server, browser or build started during this follow-up.

## Findings and action

1. [Focused skip link](https://github.com/anthonycolmenaresanandres-lang/amma-fina-calle/pull/314#discussion_r4208344633): still present in 1fa0f046. Shared .skipLink uses white text on var(--ink), which resolves to Seed cream. Add a Seed-only direct-child anchor rule for href #october-lattes, keeping the cream background and using deep ube #24172f foreground. Existing native anchor, focus reveal and focus-visible outline stay intact. Shared CSS and Bodega are unchanged.
2. [Footer signature](https://github.com/anthonycolmenaresanandres-lang/amma-fina-calle/pull/314#discussion_r4208344648): already addressed in 1fa0f046 by the Seed-only cream backing and 12px border on the signature container. The original image, animated SVG rig and reduced-motion image occupy that same container; both forced-black layers render over cream. Keep original pixels and QR unchanged. Earlier built screenshot: libfile_458a3e0648288191adfe3b31326291fe. No extra footer edit is needed.

## Light verification

Source inspection and WCAG sRGB contrast arithmetic passed. Original skip white/cream: 1.11:1; fixed ube/cream: 15.22:1. Original footer black/ube: 1.24:1; backed black/cream: 18.86:1. git diff --check passed. This is a CSS-only follow-up; no menu/game/shared/Bodega changes.

## Pending slot-dependent verification

The previous production build and screenshots apply to 1fa0f046. They do not verify the new skip-link declaration. Once parent grants the slot: run one final-source production build, Tab to the skip link on desktop/phone, inspect computed foreground/background and visible focus, activate the link and verify the October heading is clear of sticky navigation, save new focus evidence to Library. Verify footer fallback/reduced-motion and animated appearance if the browser exposes the required control. No heavy process or browser is currently owned or running. No push, merge or deployment.

## Final status — verification completed

Parent granted the slot. Final-source build/types and bounded desktop/phone keyboard Tab, Enter destination clearance and footer contrast checks pass. Four new screenshots confirmed in Library. No owned processes or browser tab remain; no publication. See CONTRAST_VERIFICATION_20261007.md for exact evidence, IDs and unrun checks. The pending section above records the pre-slot checkpoint and is now superseded.
