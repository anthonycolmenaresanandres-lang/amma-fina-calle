# Maracaibo editorial refinement - October 3, 2026

Local refinement from cb258b16cf246d57eba5e108e01f0d3f69d0ac22 on codex/maracaibo-brand-iteration-20261003. Anthony requested "Make it look cooler"; Astra supplied a critique of the previous screenshot. This is local visual work only, with no publication approval.

## Direction and changes

The previous hero and action column had similar weight, while the small objects looked detached. The new composition gives EAT. PLAY. a heavier, tightly set display treatment, offsets the second line, and stages the larger cocktail on the Stay. baseline. The action column is narrower and quieter, with short 150ms arrow/rule hover feedback and reduced-motion support. Near-black #0B0B0C and off-white remain dominant; amber #E7A551 replaces the yellow punctuation and interaction accent. The drink has only a subtle lighting falloff/contact shadow, with no rectangular image box or decorative motion.

Service and the lobby now use purposeful, larger bell/football compositions beside strong sans headings. Menu categories, check and result headings share the same sans system; Georgia italic is reserved for Stay. The exact original circular logo and small Venezuelan flag remain unchanged. No extra slogans, badges, portraits, cards, fonts, dependencies or assets were introduced.

The objects remain decorative, do not intercept input and are absent from menu/payment/active match/results. Existing empty-alt and failed-image behavior is retained. At 320px the composition makes room for the object and heading instead of allowing either to cover the other. An initial strict text-range clearance finding and phone heading wrapping were corrected before final captures; the initial finding is retained in the scratch evidence.

Application changes:
- APP/web/src/table-os/maracaibo/MaracaiboExperience.tsx - semantic headline spans and shared Stay./cocktail composition.
- APP/web/src/table-os/maracaibo/maracaibo.module.css - responsive type, composition, restrained color/hover, and consistent inner-screen presentation.

Menu data/prices, all capability disclosures, ordering destination, service/game logic, game engine/input/transport, actual logo/flag/object bytes, dependencies and final configuration are unchanged. The drink remains generated atmosphere, never a claimed menu-item photograph. Object assets remain the three existing alpha WebP files totaling 112,198 bytes.

## Verification

- Scoped ESLint passed from APP/web for the Maracaibo presentation components.
- Final Next production build and TypeScript passed; 44 static pages generated. The temporary local Turbopack root for existing linked dependencies was restored byte-for-byte. next.config.ts SHA256: bd77a15ea6593435124e37e272565f527506259f991f61c42963e698a35afa8b.
- 30 final responsive views passed at 320, 360, 390, 430, 768 and 1180px, with no overflow and all images decoded. Same-state baseline captures from cb258b16 are retained.
- 88 artwork checks passed across nine widths through 1180px, including the 1024/1120px boundaries, no text-range overlap, decorative semantics, 200% service/lobby text and artwork suppression during play.
- 30 full flow checks passed: keyboard skip/focus, 12 category anchors, local service previews, truthful Toast handoff, reduced motion, local game, natural 90-second results, replay, confirmed/canceled exits, canvas cleanup, 200% menu text and four neighboring routes.
- 11 targeted provenance/selection checks passed. Touch gameplay and missing-artwork fallback passed with nine deliberately failed artwork loads. Final runtime exceptions and attempted non-read requests were zero.
- Final desktop, phone, narrow-screen, active match and result captures were inspected. Original logo hash remains 213148e712faeac2328e4944fbba4cec5292b7a68ff49aa37fd103c61cad7188.

The [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) audit covered touched markup/styles: semantic headings and controls, decorative image semantics/dimensions, keyboard focus, touch targets, reduced motion, state contrast and responsive clearance. Browser evidence uses isolated local Chrome/CDP and touch emulation; physical-device or screen-reader certification is not claimed. No game or POS integration capability was newly verified by this visual pass.

## Review artifact and handoff

Native Library image: libfile_57b546a51edc8191a6997803438e4b56
File: file_00000000b85481f5b825668c73397bc7; version 0; 372,313-byte PNG.
Local: .review/nightlife/Maracaibo-editorial-refinement-review-20261003.png
Library identity/version metadata was preserved and verified on the local file.

Evidence: .review/nightlife/ contains baseline/final screenshots, baseline-responsive-checks.json, responsive-checks.json, art-placement-checks.json, functional-checks.json, refinement-checks.json and extra-checks.json. Previous .review/artwork/ sources, provenance and evidence are intact.

No blockers to this local visual handoff. No push, PR, merge, deployment, customer/staff write, payment activation or pricing change occurred. Existing canonical dirty work was preserved. Shared-phone multiplayer and POS-backed table settlement remain outside this task and unverified; the on-screen limitations remain explicit.
