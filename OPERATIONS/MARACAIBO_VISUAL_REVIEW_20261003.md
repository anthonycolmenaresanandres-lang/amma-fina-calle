# Maracaibo visual refresh — October 3, 2026

## Scope and authority

Anthony requested a local visual refresh of the complete Maracaibo prospect experience, preserving the EAT. PLAY. Stay. landing and its four numbered actions. He subsequently approved the object-only Venezuelan flag and explicitly authorized this scoped branch to be reviewed, published and merged after required checks pass. No people or portraits are included.

Base: `2fb2da8ac947cdca920e275f4a3ac16ccf2fcc8a`. Branch: `codex/maracaibo-visual-refresh-20261003`. Worktree: `C:/dev/amma/worktrees/maracaibo-visual-refresh-20261003`. Canonical checkout remains on `abf21fe` with its existing dirty queue, handoff and Bodega files preserved.

## Changed presentation

- `APP/web/src/table-os/TableExperience.tsx` routes only the Maracaibo venue to the new presentation; the original component remains for other venues.
- `APP/web/src/table-os/maracaibo/MaracaiboExperience.tsx` provides the landing, public-source menu, local service-request preview and truthful ordering/check handoff. Menu inventory/prices and the Toast destination are unchanged. The example service choices do not promise unconfirmed restaurant offerings.
- `APP/web/src/table-os/maracaibo/MaracaiboMatchView.tsx` presents the existing football role selection, connection state, score, local match, results and replay. Leaving via either home control or a match link warns before losing the current game. Results retain the same hidden canvas for replay.
- `APP/web/src/table-os/maracaibo/MaracaiboMarks.tsx` and `maracaibo.module.css` provide the scoped teal/cream/gold/wine treatment, wave/lightning team marks, responsive flag objects, keyboard focus, readable disclosures and reduced-motion styling.
- `APP/web/src/table-os/venue-config.ts` changes only Maracaibo skin/team presentation to Lago and Rayo.
- `APP/web/src/table-os/TableMatchClient.tsx` connects the new view to existing callbacks. `game/client.ts` adds an optional no-audio mount setting, enabled only for Maracaibo. Browser testing found that Phaser could try to resume an already closed unused AudioContext after leaving this silent game; opting out avoids creating that context. Engine, transport, input rules, match duration and other venues' audio defaults are unchanged.

## Validation

- Responsive browser audit: landing, menu, service, ordering and lobby at 320, 360, 390, 430, 768 and 1180 pixels; all 30 screens had no horizontal overflow, decoded images, the expected noindex flag and no runtime exceptions.
- Actual Chrome captures inspected at desktop and phone sizes. Local keyboard focus, category anchors, selection states, repeated service previews, explicit no-send feedback, truthful Toast handoff and reduced motion were checked.
- Natural 90-second local match, reset, results, replay, leave cancellation/confirmation and canvas cleanup were exercised. Final lifecycle result: 30/30 checks passed, zero runtime exceptions and zero attempted non-GET requests.
- Touch input (enabled before game boot), repeated leave and primitive play with failed decorative artwork all passed without runtime exceptions or attempted writes.
- Local neighbor read checks: Las Palmas table, Bodega demo, AJ Gators demo and Colattao case study load without Maracaibo presentation/assets. No neighboring venue configuration changed.
- Final source TypeScript check passed (generated Next build types are excluded and reported under build limitations). Scoped ESLint: passed. Existing Table Duel unit suite: 9/9 passed; this is not cross-phone multiplayer certification.
- Local production build limits: standard Next/Turbopack rejects the reused node_modules junction outside its filesystem root. Webpack compiles application code, then fails on the pre-existing named `BodegaBillingContent` export in `APP/web/src/app/owner/bodega/billing/page.tsx:81`. That file exactly matches main. Clean remote CI and Vercel Preview are required before merge; no checks are bypassed.
- `.review/` contains actual screenshots and JSON browser evidence, deliberately excluded from the source commit. Root text size at 200% was checked on the menu; this is not a full assistive-technology or real-device certification.

## Asset provenance

Approved source Library item: `libfile_561364a60be08191a8ef944fa17ab067`, version 0; file `exec-9aa6054e-dc35-4e98-a1b5-3f79ef26d88c.png`.

Source SHA-256: `b8ab3c5a615e281b9a83b89d6e3ac70731cde8aa79fe6b9e0af65e794204b733`. Source pixels were inspected: satin Venezuelan flag, eight white stars, transparent color haze, no people. It is AI-generated concept decoration, not a restaurant logo, venue photo or food photograph; the footer discloses that status.

`APP/web/public/assets/maracaibo/venezuelan-flag-concept-480.webp` is 480×320 / 25,094 bytes. The 960 variant is 960×640 / 68,814 bytes. Both preserve transparency and source content with no crop. Only resize/compression was applied locally; no new paid generation occurred.

## Operational boundaries and next gates

This remains a prospect/owner-review concept. No order or staff request is sent. Table payment is inactive. The existing Toast pickup/delivery URL is not proof of installed POS access, authorization or table-check settlement. No pricing, credentials, database, POS/payment configuration, room server or external service was changed.

Real phones, cross-network shared play, reconnect/host recovery, role reservation and party privacy remain unverified. The earlier input-validation and reconnect findings are not fixed by this visual refresh. No real restaurant check, tip, split/partial payment or payment confirmation was tested.

Next product phases remain: (1) repair and verify multiplayer recovery/input validation with multiple phones; (2) conduct the owner demo and confirm menu/service/brand details; (3) only after confirmed vendor access, design the POS-backed table/check/payment flow, including split bills, tips, partial payments, idempotency, authoritative confirmation and staff fallback. Static payment links must not be presented as bill settlement.

Release evidence and exact merge/deployment identifiers belong in the final handoff after required checks pass.
