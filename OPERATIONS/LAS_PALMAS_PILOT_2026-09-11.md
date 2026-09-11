# Las Palmas: menu-control pilot

Status: PREPARED LOCALLY — NOT ACTIVATED, SENT, SCHEDULED OR PRICED AS A FREE OFFER.

Release follow-up: Anthony authorized the code merge on 2026-09-11 after adding Colattao-style account information and automatic-payment presentation (queue 26). That approval does not activate the Las Palmas account, guest-menu connection or any recurring charge. The blank intake remains a template, not an approval record.

## Account information and optional automatic payments

The authenticated owner portal now includes a read-only account summary using the existing tenant-scoped restaurant fields: business and billing names, signed-in identity, account contact, email, phone and billing address. Missing information remains not provided/unavailable; the local Las Palmas preview explicitly says pending confirmation and has no active signed-in owner.

The shared billing panel shows the existing plan, recurring status/amount, first or next payment date and invoice status. “Set up automatic payments” reuses Colattao's existing authenticated Stripe subscription Checkout; existing subscriptions use billing management. The owner reviews the amount and schedule on Stripe before confirming. Merely opening the portal does not enroll anyone. Preview buttons have no submitting payment form and are disabled. No card/bank fields or Stripe identifiers are exposed in the account summary.

Las Palmas still needs approved billing identity, plan/amount/interval, first-charge date and specific enrollment authorization. Do not copy Colattao's values, create a subscription, attach a payment method or charge anything as part of this code release. AMMA service billing is distinct from guest ordering/payment acceptance, which remains outside the pilot.

Colattao's Menu link points to a separate site. Its menu changes therefore remain in Request until a separate connection is verified; the new direct editor is not presented as updating that external menu. Account/billing presentation is shared, but guest-menu connections are tenant-specific.

Primary-source reference checked 2026-09-11: [Stripe subscription Checkout](https://docs.stripe.com/payments/checkout/build-subscriptions) and [Stripe customer billing management](https://docs.stripe.com/customer-management). No new payment integration or vendor account was installed.

## Decision

Anthony's role: **Delivery Owner**. Bottleneck: the Las Palmas demo uses a static menu, while the tenant owner account, location and approved menu are unverified. Measurable outcome: one authorized owner changes one approved item and sees the correct result through the same guest QR.

Recommend a **14-day, one-location pilot**, beginning only after the gates below pass. Lynnhaven is the existing demo's location and a candidate, not an assumption about the new request. Confirm location before provisioning. No dates, invitations or customer promises have been sent.

## Three actions

1. **Prepare and approve:** Anthony confirms the location, owner-approved menu, authorized account recipient through a private channel, exact pilot fee/terms and a start date. Use `OPERATIONS/templates/las-palmas-pilot-intake.json` and `APP/web/scripts/pilot-intake-selftest.ts`'s validation contract. Do not put personal contact data in this repo.
2. **Prove owner control:** deploy only after separate approval; provision via the existing `/customers` onboarding flow and `OPERATIONS/OWNER_PORTAL_ACCESS_SOP.md` under human control. Reuse `/owner/las-palmas-lynnhaven` only if Lynnhaven is confirmed. Review one price/name/availability change, save, verify the audit row and guest result, then restore the original approved value. Code: `MenuQuickEdit.tsx`, `menu-control-actions.ts`, `las-palmas-menu.ts`. No live writes performed in this task.
3. **Run and decide:** after launch acceptance, let the owner use the same QR for 14 days, with checkpoints at day 2, day 7 and day 14. Use `OPERATIONS/templates/las-palmas-pilot-checks.csv`; Anthony records only observed outcomes, then continue, revise or stop. No recurring automation is installed.

## Scope and acceptance

| Stage | Owner/action | PASS | Stop |
|---|---|---|---|
| Preflight, 30 minutes | Anthony + venue decision-maker | Correct location; written scope/fee; owner-approved in-store names/prices/availability; asset permission; private access authorization | Any unknown represented as approved |
| Setup rehearsal, 30 minutes | Anthony + implementation support | Correct tenant and authorized role; no cross-tenant access; private password setup; one installed/bookmarked owner URL | Wrong restaurant, unapproved access or credentials requested in chat |
| Menu proof, 15 minutes | Venue owner | One price edit + one sold-out/restore cycle; new phone load matches saved data; one audit entry per edit; same QR destination | Stale/wrong price, unexpected write, missing authorization or wrong customer |
| Guest check, 15 minutes | Venue staff | Existing QR opens correct menu/game on two phones and venue Wi-Fi/cellular; 320px/390px readable | Route mismatch, unconfirmed price, game/menu error |
| Days 2 and 7 | Anthony checks with venue, after contact approval | Timed supported edits and assistance needs recorded; any bug triaged | Price accuracy or access incident: stop guest pilot and use owner-approved fallback |
| Day 14, 20 minutes | Anthony + venue owner | Review actual metric and choose continue/revise/stop; written commercial decision | No automatic paid conversion or claim of revenue lift |

Primary KPI: **supported menu edits completed correctly without AMMA assistance / all attempted supported edits**. Target: at least 4 of 5 (80%), each within 2 minutes after one training session. These are proposed acceptance targets, not measured results. Guardrails: zero wrong-location writes, zero incorrect published prices, zero access incidents. Count attempts/failures; do not report a rate with zero attempts.

Game engagement is optional qualitative feedback; no guaranteed sales or retention claim. No reward, discount, contest, staff notification, order, payment or POS action is added by this pilot.

## Stable QR and menu-source switch

- Candidate guest destination already used by the demo: `https://finacalleos.com/demo/las-palmas`. Keep that exact URL; the existing QR need not change when approved menu data changes.
- Candidate owner destination: `https://finacalleos.com/owner/las-palmas-lynnhaven`. It returned 404 during read-only preflight; an active account has **not** been created. Do not deliver an owner QR yet.
- The new code uses the existing `get_public_menu` read and authenticated audited write rails; no new database schema, paid editor or AI service.
- `LAS_PALMAS_OWNER_MENU_ENABLED` stays absent/false until location/menu/import/access/guest readback/release gates pass. Setting it to `true` is a separate production activation decision. Once enabled, read errors show “temporarily unavailable,” never stale static prices. The guest route is dynamic; reopened/refreshed pages read current data.
- Preserve demo/noindex/client-approval labeling until explicit client approval permits changing it. This task does not activate the table-service sample, alter the held `/m` or `/owner-preview` route, or change existing QR destinations.
- Before any tenant-data import, review generic public-menu exposure: creating a restaurant/menu can make its existing `/m/{id}` read route accessible. No import is authorized here, and unapproved public-source data must never be imported as approved prices.
- A QR cannot rewrite printed prices. Prefer a small permanent QR/menu-link insert for digital access; selectively replace outdated printed information when necessary. Physical printing, final QR decoding, two-device scan tests, placement and actual print approval remain launch gates.

## Owner's 60-second lesson

Open your private owner portal → Menu → choose the item → choose the field → enter the new value → Review change → note the Current value → Save menu change → open the connected guest menu and refresh. To reverse a change, repeat these steps using the recorded original value; History is a change log, not an undo control. Sold out hides an item; Available brings it back. Size prices are separate. A zero price means “Ask staff,” not “free.”

Adding items/categories or changing imagery remains in the request workflow. Routine field edits are direct, deterministic and do not require a paid AI request. Simultaneous editing is not an atomic compare-and-swap: the new form detects changes visible at its pre-save read, while the existing audited RPC remains the final database write. Avoid two staff editing the same item at once; test this limitation before expanding account access.

## Owner-facing pilot wording — draft, do not send

“Keep your menu current without waiting for a phone call. After your owner portal is connected, you can change existing item details, prices and availability yourself, review the change, then save. Your table QR stays the same. Let’s test this with one location for 14 days and measure whether you can make routine changes without help. We’ll confirm the menu, access, fee and dates in writing before anything starts.”

Known: Anthony requests fewer support calls and reprints; existing portal rails and static Las Palmas demo are verified in source. Inferred: this is useful to the venue owner; no venue priority statement or consent supplied. Missing: location confirmation, authorized identity, approved menu, terms and launch date.

Experiment: `hook_id=H-MENU-CONTROL-LP-01`, `proof_id=P-OWNER-EDIT-SAME-QR-01`, `cta_id=C-LP-PILOT-PREFLIGHT-01`. One recognition → independent update → witnessed save/readback → bounded pilot → written start decision path. Test the menu-control message only; do not infer a winner from one restaurant.

## Cost decision — researched 2026-09-11

| Option | Current source-backed price or scoped cost | Decision |
|---|---|---|
| Existing Fina Calle portal + same direct QR | No new vendor, subscription, model call or package added by this implementation. Incremental fixed software subscription: $0 **assuming existing infrastructure capacity**; current bills/usage not audited | Recommended: one menu database, one owner workflow; hosting, domain, labor and printing still exist |
| Free static QR generator | QRCode Monkey states its static codes are free for commercial use, with no scan limit or expiry; embedded destination cannot be edited | No need to adopt another service: existing `qrcode` package can generate a direct URL locally after approval |
| Separate Supabase project | Free $0: quotas and inactivity pause after one week; Pro from $25/month, with compute allowances/overages | Do not add a project or downgrade current infrastructure just to claim free hosting |
| Square Free | $0 monthly subscription; payment processing applies when used (published online card rate 3.3% + 30¢ on Free) | Reconsider only if the venue already uses Square and requests ordering/POS integration; not a necessary replacement for menu-only control |

Sources: [QRCode Monkey](https://www.qrcode-monkey.com/), [Supabase pricing](https://supabase.com/pricing), [Square pricing](https://squareup.com/us/en/pricing). Quotes/prices are vendor facts; the recommendation and $0 incremental-tooling conclusion are scoped inferences from the implementation. No new account or paid service was enabled.

AMMA's current core offer remains **starting at $199/month/location**. A $0 incremental-tooling choice is not a free client plan. Pilot charge, setup, recurring start and physical printing require written agreement; nothing was waived or charged here.

Savings formula, not a result: `(supported edits/month × avoided support minutes/60 × loaded hourly cost) + avoided reprint costs − incremental costs`. Record real minutes and invoices first. No savings percentage or revenue effect is claimed.

## Resume / approval gates

Location → approved menu → private recipient/role authorization → written pilot fee/date → review/deploy approval → human-controlled tenant/access setup → menu-source activation → real authorized write/readback → final QR proof → contact/placement approval. Stop at the first missing gate. No production access, deployment, import, invitation, printing or customer send has occurred in this task.

## Local verification and preview

Complete locally: 64 new menu/intake/ball checks, existing owner-app/request suites, scoped lint, TypeScript and Webpack production build; six keeper/mobile cases and inspected 320/390 editor proof. Confirmation, sold-out/restore and invalid-price behavior passed using sample browser state, not a real owner account. Both normal and missing-art real game taps scored. Default-off/public-host preview and held owner-preview gates returned 404; a missing connected database showed unavailable instead of old prices.

Preview: `http://127.0.0.1:3131/pilot/las-palmas`; game: `http://127.0.0.1:3131/penalty-shootout?skin=laspalmas`. The sample workspace requires `LOCAL_PILOT_PREVIEW=1`, rejects non-loopback hosts and Vercel, uses unconfirmed fixtures, and has no persistence. `LAS_PALMAS_OWNER_MENU_ENABLED` remains false. Leave all activation gates in the intake false until individually evidenced.

The default local Turbopack build rejected the shared node_modules junction's filesystem root; `npm.cmd run build -- --webpack` passed without configuration/dependency changes. A normal release CI build, actual authorized owner save/audit/guest readback, cross-tenant denial check, client approval and two-phone QR proof are still required. These local results do not certify live operation.
