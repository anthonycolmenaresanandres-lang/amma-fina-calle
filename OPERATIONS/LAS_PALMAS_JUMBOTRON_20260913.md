# Cantina Jumbotron - Las Palmas scoreboard release

## Authority and scope

Anthony requested the researched cartoon stadium scoreboard and explicitly said change it and make it live on2026-09-13. This is a deliberate presentation-only upgrade for `/play/las-palmas`, not an expansion of per-campaign customization. The fixed-shell protocol remains in force for other hosts/brands. The permanent QR remains exactly `https://finacalleos.com/demo/las-palmas`; its existing invitation links to this dedicated game. No print, restaurant approval, data, access or billing action.

## Design and implementation

Original Cantina Jumbotron: dimensional gold casing, pine dotted display, cream chunky goals numeral, palms, five numbered attempts with distinct goal/check, save/shield and miss/cross symbols. One compact44px navigation row; character identification in the footer; instruction/outcome above the field instead of behind the character. Goals and shot number are separately labeled. Final score and Replay remain available.

The game-visuals/frontend-design skills drove mobile-first native HTML/CSS/SVG instead of a baked scoreboard image or new rendering dependency. Existing font and Lucide palm/icon assets reused. Short transform/opacity celebration honors reduced motion. No flashing/shaking in the opted-in host. A copied match snapshot is delivered only on immutable state transitions; the renderer's optional `externalHud` flag suppresses old labels/effects. Only copied dedicated-lobby skins enable it. No pure engine, scoring, rules, geometry, input, registry skin, artwork or dependency edits.

Research references: Cartoon Network's own Toon Cup listing https://play.google.com/store/apps/details?hl=en&id=com.turner.tooncup (creative reference only, no copied artwork); https://gameaccessibilityguidelines.com/provide-high-contrast-between-text-ui-and-background/; current https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md. No claim of affiliation or full game accessibility certification.

## Verification record

Evidence directory: `C:/Dev/amma/evidence/las-palmas-jumbotron-20260913`.

-11 scoreboard model/isolation/semantic checks,19 existing lobby checks and95 existing menu checks pass. Scoped ESLint passed. Pure engine/input/geometry/config/registered skins/package manifests unchanged against48f8648.
- Initial build/TypeScript passed; first320px visual inspection identified insufficient scoreboard-shadow clearance. Frame tightened before final build. A PowerShell test helper name collided with the built-in Start alias; renamed StartMatch. These preliminary failures were fixed, not counted as passes.
- Final production Webpack build/TypeScript and refreshed scoped lint pass.125 targeted checks pass. Dedicated browser verification passes initial zero/shot1,320/390/1440 overflow/44px controls/scoreboard-shadow clearance, five real shots with correct full-time tally, Replay reset, Players teardown/focus, reduced-motion disable and asset-fallback real shot. No browser errors. Inspected screenshots include after-320/390/1440, goal/save results, full-time2/5, Quesabirria miss marker and primitive fallback. Test-helper DOM-object serialization corrected to a boolean wait; final full run passed.
- Real Quesabirria Pro Keeper swipe advanced to shot2 and goal1; screenshot inspected.844x390 landscape has no horizontal overflow and maintains scoreboard-shadow/crossbar clearance; existing portrait game intentionally scrolls vertically on short screens, not a landscape redesign.
- Existing tools/workflow/verify-local.ps1 completed all six320/390 keeper cases successfully this time: legacy/browser-20260913-193444-91a66f/results.json status passed-smoke. Inspected legacy390px screenshot retains original canvas scoreboard. Separate Colattao launch/shot confirms no external HUD, one canvas, no overflow/errors. No other brand activated the new presentation.
- Guideline audit: semantic controls/history, non-color outcome glyphs and labels, polite score announcements,44px navigation, reduced-motion CSS, no infinite animation, pointer-transparent overlay, no new request/dependency/image load. Not a full canvas keyboard-accessibility audit or physical-phone certification.

## Release gate

Base production:48f86486474384873f752df69d09f0bf6c725cc9; Vercel dpl_DVvDBboEDhUVMfMeZfESGb4qCUrE READY with finacalleos.com alias reverified. Preserve as presentation rollback reference; never change data/access fallback.

Require reviewed scoped diff, final local production build and browser proof, exact-head green PR checks, expected-head merge, Ready production revision/alias and live verification. Hosted preview protection must not be mislabeled as a successful hosted visual test. Observability is a point-in-time error scan, not an installed monitor.
