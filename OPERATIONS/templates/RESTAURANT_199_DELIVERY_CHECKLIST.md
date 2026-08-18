# Restaurant $199 Delivery Checklist

> Copy this blank template to the approved private client record. Never commit a completed copy containing names, emails, phone numbers, credentials, payment data, or signatures.

## Control record

```txt
PRIVATE CLIENT RECORD ID:
LOCATION COUNT:
SAFE TENANT ID:
DELIVERY OWNER:
WRITTEN SCOPE VERSION / DATE:
MONTHLY PRICE: $199 per location / other approved written amount
SETUP LINE: amount or explicitly $0, with approval date
BILLING START DATE: approved date / unknown
SELECTED EXISTING GAME:
GUEST DESTINATION:
OWNER DESTINATION: https://finacalleos.com/owner/{safe-tenant-id}
PRINT LANE: digital files only / AMMA-managed print / client-managed print
TARGET LAUNCH DATE:
```

Status values: `NOT STARTED`, `PASS`, `BLOCKED`, `APPROVED N/A`.

| Gate | Status | Evidence location / timestamp | Exception owner | Next date |
|---|---|---|---|---|
| G0 Written scope | | | | |
| G1 Intake | | | | |
| G2 Build and review | | | | |
| G3 Release approval | | | | |
| G4 Live verification | | | | |
| G5 Print production | | | | |
| G6 Account provisioning | | | | |
| G7 Owner delivery | | | | |
| G8 Acceptance and support | | | | |

## G0 — Scope lock

- [ ] `$199/month per location` or an approved written exception is explicit.
- [ ] Setup amount, recurring start, update limits, launch timing, and cancellation terms are explicit.
- [ ] One existing game module is named; custom art/mechanics are excluded or separately priced.
- [ ] One private owner portal and initial authorized account delivery are included.
- [ ] Physical printing, table service, POS/order/pay, promotions, analytics reports, and custom work are explicitly included or excluded.
- [ ] Billing/payment action has its own recorded approval.

## G1 — Authoritative intake

- [ ] Menu items, prices, modifiers, availability, hours, and source date are owner-approved.
- [ ] Logo, photos, copy, and other assets have source and usage approval.
- [ ] Safe tenant id passes `^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$`.
- [ ] Guest destination and owner destination are written exactly.
- [ ] Account recipient and approval authority are verified privately.
- [ ] Language, accessibility, placement, support, and print needs are recorded.

## G2–G4 — Build, approval, and live QA

- [ ] Menu matches the approved source.
- [ ] Selected existing game works on the agreed mobile viewport; no custom-game promise was added.
- [ ] Guest landing and QR path expose only approved capabilities.
- [ ] Owner sign-in is tenant-specific and reveals no protected data before authorization.
- [ ] Review page remains approval-labeled/noindex until release authority is recorded.
- [ ] Exact release candidate is approved.
- [ ] Guest, menu, game, and owner routes return expected status/content over HTTPS.
- [ ] Mobile layout, keyboard/focus, console, tenant isolation, and request/support path pass.

## G5 — Printing

- [ ] `QR_PRINT_ORDER_AND_QA.md` is complete.
- [ ] Guest and owner QR records are separate and registered.
- [ ] Final PDF/image QRs decode to the exact recorded destinations.
- [ ] One physical proof scans at actual placement distance and lighting on two devices.
- [ ] Material, dimensions, finish, adhesive, quantity, price, vendor, and placement are approved before purchase.
- [ ] Delivered count and any damaged/missing pieces are recorded.

## G6–G7 — Account and owner handoff

- [ ] `OWNER_PORTAL_ACCESS_SOP.md` completed without storing a password.
- [ ] Approved account recipient is assigned only to the intended restaurant.
- [ ] Mandatory first-login reset wall is verified.
- [ ] Utilization email contains the portal URL but no credential.
- [ ] One-time credential is delivered through a separate verified channel.
- [ ] Owner QR contains only the canonical HTTPS owner URL—no email, password, token, session, PII, or tracking query.
- [ ] Owner completes reset and confirms the correct restaurant and expected portal sections.

## G8 — Acceptance

- [ ] Menu accuracy accepted.
- [ ] Selected game accepted.
- [ ] Guest QR/destination accepted.
- [ ] Owner access accepted.
- [ ] Print files, quantity, and placement accepted or approved `N/A`.
- [ ] Support/request path received.
- [ ] Billing start/status verified against the approved scope; unknown remains unknown.
- [ ] Open exceptions have an owner and dated next action.

## Closeout

```txt
APPROVED LAUNCH DATE:
OWNER ACCEPTANCE EVIDENCE:
PRINT DELIVERY EVIDENCE:
ACCOUNT DELIVERY EVIDENCE:
BILLING STATE: verified status / unknown
OPEN EXCEPTIONS:
NEXT REVIEW DATE:
```
