# Owner portal print and handoff standard

Version 1 | 2026-09-14 | Delivery Owner: Anthony / Fina Calle

## Purpose and boundary

Give an authorized business owner one durable, staff-only route to their private Fina Calle portal. This is **not** the public guest-menu QR and **not** a payment QR. Producing a PDF never grants access, activates a menu, enrolls automatic payments, authorizes a charge, places a print order or sends anything to a client.

Scope of this release: standard guide, premium owner presentation and billing safeguards. Colattao's live guest website/menu/game are unchanged. Las Palmas and A.J. Gator's setup-pending owner front doors are not activated owner accounts; do not print their owner handouts until their readiness gates pass.

## Source of truth and files

- Registry: `PRINT_ASSETS/owner-portal/registry.json`. Store only non-secret routing/status facts.
- Owner manual: `OPERATIONS/OWNER_MANUAL.md` (editable, four explicitly separated pages).
- Generator: `tools/reports/build-owner-portal-kit.py`.
- Outputs: `output/pdf/fina-calle-owner-manual.pdf` and `output/pdf/colattao-owner-portal-sign-in.pdf`.
- Digital QA: `output/pdf/owner-portal-qr-verification.json`; rendered proofs accompany outputs.
- Online owner guide: `https://finacalleos.com/owner/guide`.

Build the current registered client with `python tools/reports/build-owner-portal-kit.py --client colattao`. Runtime packages: ReportLab, qrcode, Pillow, PyMuPDF and zxing-cpp; use an isolated runtime, not web-application dependencies. On this machine the decoder-only package is isolated under `C:/Dev/amma/evidence/owner-standard-premium-20260914/qa-python`; append `--decoder-dir C:/Dev/amma/evidence/owner-standard-premium-20260914/qa-python` when using the default Python. The builder restricts QR payloads to exact HTTPS owner paths on finacalleos.com and rejects queries, fragments, credentials, trailing slashes and unregistered clients. It generates vector modules with ECC Q and a four-module white quiet zone, then verifies full-page and QR-crop native raster decodes at 150 and 300 DPI with zxing-cpp. The initial OpenCV attempt failed full-page 300 DPI; no OpenCV pass is claimed.

## Required gates, in order

### 1. Identity and exact route

- Confirm the business, authorized contact and exact canonical tenant ID with the approved private onboarding record. Do not infer owner email from a public website.
- Verify the owner URL through a real browser: correct domain/business, HTTPS, HTTP 200, no unexpected redirect and a sign-in or appropriate access gate. A branded setup-pending page is a **HOLD**, not active access.
- Confirm unknown tenants still fail safely. Never encode credentials, owner email, login tokens, Stripe sessions, customer IDs or invoice IDs.
- Record the exact string before generating. The Colattao contract is `https://finacalleos.com/owner/colattao` (no trailing slash/query).

### 2. Access and first use

- Use the separate approved access process; this print workflow does not provision users or modify permissions.
- Have the owner verify their assigned account. If first-login password replacement is required, it must happen before private data or actions appear.
- Never include a shared/default temporary password in any print, manual, email, repository or QR. Do not ask for or record the owner's private password. The historical access SOP's credential pattern is not copied or endorsed by this protocol; resolve credential-policy changes as a separate security task.
- With the owner's authorized participation, confirm correct tenant-only access, sign-out and re-entry. Do not certify authenticated acceptance based on the public login screen or a synthetic local preview.

### 3. Menu, contact and billing readiness

- Document menu mode: connected direct edits versus team-request-only. For Colattao, retain request-only until its separately hosted guest-site integration is explicitly approved and verified.
- Demonstrate one or two **approved** small edits only on a connected/test menu. Review before saving; verify the guest view and recent record; restore only if approved. No production edits merely to demonstrate a handout.
- Verify Contact review/send/file behaviors in an isolated test or explicitly approved real submission. A local mocked result is not proof of live request delivery.
- Billing management requires authorized access, the correct mapped provider customer and configured controls. Verify invoice/payment-method presentation without making a payment.
- New recurring enrollment additionally requires authoritative restaurant-specific amount/currency/interval, matching configured price and approved first charge at least 48 hours away. A pending, stale or mismatched plan is a **HOLD** for enrollment; do not disable safeguards for convenience.
- Internal billing activation is separate approved work: confirm service-only `restaurant_billing` terms, the correct provider customer mapping before events are processed, and the restaurant-specific recurring price setting (or an exactly matching global price). Never place configured values or credentials in the print registry. Enable and verify Stripe's one-subscription restriction as part of approved provider setup; local duplicate guards do not replace it.
- Existing active/paused/unpaid billing belongs in management, not a second subscription. Do not infer all invoices are paid from an active status, or payment/enrollment from a return URL.
- No payment-method entry, invoice payment, subscription enrollment/cancellation or Zelle transfer during routine print QA. Record client approval separately for any money action.

### 4. Digital and physical print proof

- Render the final PDF, not a source image. Inspect every page for clipping, readable type and a unique prominent QR. Confirm full-page and cropped decodes at both 150 and 300 DPI equal the registry payload exactly.
- The existing `emblem-colattao.webp` artwork contains a working legacy QR unrelated to owner sign-in. This print layout displays only its original upper wordmark through a clipping viewport, without changing the source asset. Never place the full QR-bearing emblem on an owner handout. Require exactly one decoded destination on the final handout and no barcode destinations on manual pages.
- Use US Letter, **Actual size / 100%**, portrait, one page per sheet for the sign-in handout. Do not choose Fit, booklet, borderless enlargement or automatic crop. No bleed is required; artwork stays inside a half-inch safe margin.
- The handout QR is 2.25 inches square including its four-module quiet zone. Print black modules on opaque white; keep the full white margin, avoid reflections, and never overlay logos on the functional QR.
- Print **one proof only after print authorization**. Scan the physical sheet using two different phones under typical back-office lighting, at practical distances and slight angles. Check the exact browser destination and business before signing in.
- Digital PASS is not physical PASS. Record printer/material/scale/date, two-device result and the human approving the proof. Stop if either device fails or a protective sleeve creates glare.

### 5. Private delivery and placement

- Supply the approved PDF/manual to the verified owner through the approved channel. Do not send automatically from this protocol.
- Place the owner handout inside a staff/management area, not on guest tables. Keep the separate guest-menu tent and its permanent URL unchanged.
- Explain: owner QR opens sign-in; account/billing availability varies; autopay is opt-in; a saved card or scan is not consent to recurring charges.
- Ask the owner to demonstrate: open the correct portal, locate a menu-change route, locate invoice management without paying, locate Contact, and sign out. Record supported/unsupported/pending honestly; never fabricate successful live actions.

### 6. Version, reorder and closeout

- Keep the approved route stable. For a new client, add a registry entry only after identity/route checks; never copy Colattao terms or IDs.
- If content or QR changes, increment the asset version, regenerate, redo digital/physical QA and archive the previous approved file plus hashes. A file generated from a draft registry is not approved for delivery.
- Before any reorder, recheck route/business and proof dimensions. Changes behind the stable owner URL do not require a new QR by themselves.
- Record asset ID, payload, PDF SHA-256, source revision, digital evidence, physical proof, authorized recipient/delivery status, training result and any activation holds in the appropriate private onboarding record. Never store credentials or payment details here.

## Current proof record

Asset `QR-OWNER-COLATTAO-20260914-V1` is prepared for Anthony's review. Digital proof **PASS**: four handout checks decode only the exact owner URL (full page and QR crop, each at native 150/300 DPI); eight manual-page checks find no unintended barcode destinations. Decoder: zxing-cpp 3.1.1 in the isolated QA directory. All five final page renders were visually inspected with no clipping or overlap; the four-page manual keeps body type at least 10 pt. Six offline contract tests pass, including sixteen invalid URL/ID variants. Consult `output/pdf/owner-portal-qr-verification.json` for hashes and individual results. Physical proof, owner-authenticated acceptance, live billing readiness and client delivery remain separate gates. No service price or contractual commitment is printed.

## References

- Existing `OWNER_PORTAL_APP_RUNBOOK.md`: stable tenant-scoped PWA routes, online-only operation, no cached private data.
- Existing `OWNER_PORTAL_ACCESS_SOP.md`: access work is a separate approval process; do not reproduce legacy credential instructions in customer assets.
- [Stripe customer portal](https://docs.stripe.com/customer-management): invoice/payment-method/subscription capabilities and provider configuration.
- [Stripe hosted invoice page](https://docs.stripe.com/invoicing/hosted-invoice-page): provider-hosted invoice payment and receipts.
