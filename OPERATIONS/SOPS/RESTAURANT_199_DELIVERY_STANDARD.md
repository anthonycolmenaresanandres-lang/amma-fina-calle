# Restaurant $199 Delivery Standard

## Purpose

This is the canonical intake-to-handoff process for the Fina Calle restaurant plan.

## Commercial lock

**Starting at $199/month per location.** The base delivery includes:

- one branded mobile menu using owner-approved content;
- one stable guest destination and print-ready guest QR file;
- one existing playable game module selected from the verified library;
- one private owner portal for the location and delivery of the initial authorized owner account;
- one print-ready back-office owner-portal QR file;
- hosting, link support, and routine menu/copy support within the written scope.

The written proposal must state any setup amount, billing start date, update limits, launch target, and recurring terms. Physical printing, table-specific routing, additional users or training, custom game art/mechanics, promotions, analytics reports, photography, social posting, ads, ordering, payment, checkout, POS, loyalty, and other custom work are not silently included.

## Accountability

- **Delivery Owner:** owns the checklist, evidence, launch readiness, print QA, and handoff.
- **Revenue Producer:** obtains the written scope and owner approvals; does not promise unverified features.
- **Finance/Admin:** verifies the approved recurring price and billing state; never activates a charge without authority.
- **Authorized restaurant owner:** approves content, scope, print proof, access recipient, launch, and final acceptance.

## Required records

Use blank templates only in the repository. Store completed client records in the approved private client system; never commit client PII, credentials, payment data, or signed documents.

- `OPERATIONS/templates/RESTAURANT_199_DELIVERY_CHECKLIST.md`
- `OPERATIONS/templates/QR_PRINT_ORDER_AND_QA.md`
- `ASSET_REGISTRY/RESTAURANT_ONBOARDING_PACKET_TEMPLATE.md`
- `OPERATIONS/OWNER_PORTAL_ACCESS_SOP.md`
- `OPERATIONS/templates/OWNER_PORTAL_UTILIZATION_EMAIL.md`
- `ASSET_REGISTRY/APPROVED_QR_CODES.md`

## Gates

| Gate | Required work | PASS evidence | Hard stop |
|---|---|---|---|
| G0 — Written scope | Confirm location count, `$199/month/location`, setup line, recurring terms, selected existing game, print lane, owner portal, exclusions, and approval authority. | Approved written scope and dated next action in the private record. | Any price, term, feature, approver, or payment date is unknown. |
| G1 — Intake | Record safe tenant id, authoritative menu, prices, hours, approved assets/rights, desired guest destination, owner-portal recipient, support route, and accessibility/language needs. | Completed intake with source and approval status for every required field. | Public listings are being treated as owner approval or assets lack rights. |
| G2 — Build and review | Build the menu, configure one existing game, prepare the tenant owner route, and create review links. Keep prospect work approval-labeled and noindex until authorized. | Source-to-screen menu comparison, game/library record, owner-route record, and review approval. | Custom game or unsupported integration is required but not separately scoped. |
| G3 — Release approval | Freeze the exact release candidate and verify protected boundaries. | Explicit production approval tied to the reviewed scope and release candidate. | Approval is missing, ambiguous, or tied to a different revision. |
| G4 — Live verification | Verify guest, menu, game, owner sign-in, request/support, tenant isolation, mobile layout, HTTPS, expected metadata, and console state. | Timestamped route/status checklist with screenshots or machine-readable results. | Any wrong tenant, broken route, exposed data, authorization failure, or material content mismatch. |
| G5 — Print production | Create separate guest and back-office owner assets, register destinations, decode final artwork, approve the quote/proof, and scan a physical sample before the full run. | Completed `QR_PRINT_ORDER_AND_QA.md`, final file hashes, physical proof scans, approved quantity, and delivery record. | Printing/spend is unapproved; destination, material, placement, or proof scan is unknown. |
| G6 — Account provisioning | Follow `OWNER_PORTAL_ACCESS_SOP.md`; allowlist only the approved recipient, require first-login reset, and verify the reset wall before dashboard access. | Tenant/email readback, reset-required state, correct owner URL, and first-login verification. Do not store any password. | Identity, tenant assignment, reset state, authorization, or server configuration is uncertain. |
| G7 — Owner delivery | Send the portal URL and utilization guide without credentials. Deliver the one-time credential through a separate verified channel. Provide the internal-use owner QR and confirm it contains only the canonical HTTPS owner URL. | Owner confirms reset, correct restaurant, expected portal sections, and receipt of approved print/digital files. | Credential would appear in email, QR, print, source control, tracker, or handoff notes. |
| G8 — Acceptance and support | Obtain acceptance for menu accuracy, game launch, guest QR, owner access, print quantity/placement, support path, and billing start. Record open exceptions. | Dated acceptance or explicit exception list in the private record; client ledger and handoff updated without PII. | Unknowns are being converted into approval, completion, cash, or `$0`. |

## Standard digital handoff

Deliver one folder or approved secure share containing:

1. guest launch URL and print-ready guest QR;
2. menu URL and selected game name/URL;
3. owner portal URL and print-ready internal owner QR;
4. owner quick-start/utilization guide;
5. approved print files and print-order record when printing was purchased;
6. written scope, support/request path, launch date, recurring start date, and open exceptions.

The guest QR and owner QR are different assets. The guest QR may be public. The owner QR is for back-office convenience only and grants no access by itself.

## Print default

Use `QR_PRINT_ORDER_AND_QA.md`. The AMMA starting specification is a 3 × 3 inch matte opaque-white durable sticker with a black QR, approximately 1.5 inches including a four-module quiet zone, ECC Q, at least 0.50 mm per module, vector SVG plus press-ready PDF, and a 300 PPI minimum raster proof. The chosen printer must confirm material, adhesive, color mode, bleed, and finishing before purchase. Any other size, substrate, table tent, window application, or viewing distance requires a new proof and recorded scan test.

## Change, replacement, and reorder

- Never repoint an existing QR image silently.
- If a destination changes, create a new registered asset, proof, and replacement plan.
- Reorders must use the recorded asset id, destination, final-file hash, dimensions, material, finish, adhesive, vendor, and approved quantity.
- Keep old stock from use when its destination or disclosure is no longer correct.

## KPI and definition of done

Primary KPI: **calendar days from approved written scope to verified owner acceptance**, with blocked days and cause recorded separately. The baseline is currently unknown.

Delivery is complete only when G0–G8 are PASS or an approved `N/A`, every exception has an owner and next date, no credential is stored, and the restaurant has confirmed the menu, game, guest QR, owner access, and any purchased print delivery.
