# Maracaibo split-bill presentation

Local presentation: `/table/maracaibo/1` → **Pay / Split bill**. Also available from menu/service/game selection navigation and the online-order page. Existing gameplay is unchanged.

The DEMO uses a fictional $86.43 bill, including fictional items/prices/tax. Select 1–12 guests and an example guest; Preview my share shows a hypothetical remaining amount. Every share is integer cents, with the first remainder guests assigned one extra cent. Reset, Close, Escape and browser Back discard the preview. No tip is simulated. Nothing is ordered, charged, collected or saved; no real payment success is shown. Native Toast amounts and rounding can differ.

## Owner next step

Confirm Maracaibo's merchant and payment eligibility, enabled equal-split feature, and exact Toast-generated URL for each actual table. Toast is the source of truth for the real check, tax, gratuity, outstanding balance and partial payments. Returning to Fina Calle never proves a check was paid.

Toast Pay can evenly split an existing check when enabled. It cannot select individual items. Item-based splitting belongs to a distinct Mobile Order & Pay configuration. A public pickup/delivery link is not a table checkout. Public documentation alone does not verify Maracaibo's configuration or production readiness.

Official sources checked October 8, 2026:

- [Toast Pay](https://support.toasttab.com/en/article/Get-Started-with-Toast-Pay?lang=en_US): owner-enabled equal splitting; shared receipt QR/link; actual tip/payment inside Toast.
- [Table URLs and digital menus](https://support.toasttab.com/en/article/Setting-up-mobile-payments-and-digital-menus): owner can download exact per-table URLs. Verify that the supplied link opens the intended existing table check and supports the required split product; these products are not interchangeable.
- [Mobile Order & Pay item splitting](https://support.toasttab.com/en/article/Split-Payments-with-Toast-Mobile-Order-Pay): separate item-oriented product/configuration.

## Disabled configuration seam

Existing `src/table-os/venue-config.ts` is the maintained venue configuration. Maracaibo alone has `ordering.tablePayment = { status: "OWNER_SETUP_REQUIRED", tableUrls: {} }`. All live gates remain off. Do not enable this in this presentation branch.

A future separately authorized release must first record owner verification of each exact table URL and enabled payment/split features, reconcile/remove the venue's prospect notices and finish an end-to-end owner/staff check. Only then set the restaurant's `reviewStatus` to `APPROVED`, explicitly set `tablePayment.status` to `OWNER_VERIFIED`, and add the exact reviewed URL under its exact table ID. Changing the older ordering `READY` flag does not enable table payments.

`resolveTablePayment` fails closed without those gates or a matching own table-key entry. Exact HTTPS hosts `toasttab.com` and `www.toasttab.com` are the current conservative allowlist. No subdomain wildcard. Credentials, nondefault ports, fragments, whitespace/control injection, public `/local/order` destinations and redirect-style query keys are rejected. This validates a destination's shape, not merchant ownership. Different real Toast hosts or check-specific/expiring links require separate review rather than expanding the allowlist or inventing routing.

The seam exposes only a normal user-clicked new-tab handoff to the exact configured URL. No auto redirect, arbitrary URL query parameter, guessed table mapping, API credential, payment request, callback or paid-status inference. The example allocation is never sent to Toast. Toast's own screen supplies the actual options; Fina Calle does not collect card/customer data.

## Review boundaries

No merchant, Toast account/configuration, table URL, API credential, real price or payment authorization is verified. No custom processing, Stripe routing, account change, real order, new service, dependency install or spend. No push, PR, merge or deployment. This branch prepares the owner conversation; it does not certify live payments.
