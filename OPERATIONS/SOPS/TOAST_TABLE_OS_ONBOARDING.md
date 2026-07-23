# SOP — Onboard a Toast Restaurant into Table OS

## Hard stops

Stop before credentials, Toast-account changes, a paid test, customer publication, production merge, or printing final QR cards unless Anthony and the restaurant owner have approved that action.

Never ask for or store a Toast password, card number, bank detail, API secret, or staff login in repo files. The owner or authorized Toast representative performs account-side activation.

## Intake required from the restaurant

1. Written approval to prepare and publish the concept, including approved logo/art.
2. Exact legal/display venue name and location.
3. Confirmed table count and permanent table labels.
4. Current menu source of truth: Toast export, owner spreadsheet, or owner-approved document.
5. Current item names, prices, serving sizes, modifiers, taxes, hours, and availability rules.
6. Current public Toast ordering URL.
7. Confirmation from Toast/owner that Mobile Order & Pay is active.
8. One Toast Mobile Order & Pay destination per table.
9. Approved game colors, country choices, copy, duration, and age/accessibility requirements.
10. Approved QR placement map: table number/label, physical location, and whether a front-counter demo QR is needed.

## Build procedure

1. Create `src/table-os/menu/[venueId].ts` from the owner-confirmed source.
2. Add one typed venue record to `src/table-os/venue-config.ts`.
3. Set `tableOrderPayStatus` to `OWNER_SETUP_REQUIRED`.
4. Add the public Toast ordering URL as the safe preview fallback.
5. Apply approved skin/color tokens only; do not alter game mechanics.
6. Review `/table/[venueId]/1` at phone and desktop widths.
7. Review `/table-os/[venueId]`, set the draft table count, inspect every destination, and download the numbered PNG files.
8. After the owner supplies verified per-table Toast URLs, add them to `tableOrderPayUrls`.
9. Set `tableOrderPayStatus` to `READY` only after every mapped table opens the correct Toast table.

## Standard QR deliverables

- One production PNG per confirmed table, named `[venueId]-table-[number]-qr.png`.
- One optional front-counter demo QR, only when the owner approves its destination and placement.
- One printable owner sheet for installation and replacement.
- Recommended finished size: 2.5-3.5 inches on tables or 4-6 inches on a wall, with the QR quiet zone preserved.
- Use matte, high-contrast material and keep the code flat, unobstructed, and away from glare.
- Before printing, scan every code on both iOS and Android at close, normal seated, and angled distances.
- Record final table labels and placements. A table-map change requires re-verification before installation.

## Verification gate

- Targeted ESLint, `tsc --noEmit`, production build, and `git diff --check` pass.
- Unknown venue/table routes return 404.
- Metadata includes `noindex`, `nofollow`, and `nocache` until owner approval.
- Public Toast fallback opens in a new tab and the preview does not claim pay-at-table.
- Each configured table-specific Toast URL opens the matching table.
- QR remains readable at intended print size and resolves to the exact stable route.
- Every PNG download uses the correct venue/table filename and production destination.
- Two phones on the same table see the same score and timer.
- Duplicate role selection produces a visible warning.
- With Realtime unavailable, local practice still loads.
- No card data, PII, credential, protected mark, or unapproved client asset appears in source or network payloads.

## Activation and rollback

Activation requires owner-approved content, Anthony's production approval, a merged production release, live route verification, and a final QR re-scan before printing.

Rollback does not require reprinting: change the venue Toast status back to `OWNER_SETUP_REQUIRED` or remove the affected table URL. The stable Fina Calle QR route remains unchanged.
