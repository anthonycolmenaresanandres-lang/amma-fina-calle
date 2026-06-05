# Fina Calle PayBridge

## Status

R&D concept only. Not production. Not a live payment system. Not a lender. Not a credit product. Not a repayment servicer.

## Product Idea

Fina Calle PayBridge is a local-business payment-options connector concept. It gives a merchant a low-friction QR flow for collecting order context and routing a customer toward either a mock `Pay Now` path or a mock `Request Payment Options` path.

The product thesis is simple: local owners should not need to understand payment infrastructure, credit workflows, underwriting, partner APIs, or compliance language just to offer a better customer handoff.

## Owner-Friction Model

The owner experience should be almost invisible:

1. Owner receives one QR code for the counter, invoice, table, receipt, estimate, or service desk.
2. Owner tells the customer: scan this and enter your order number.
3. Customer enters order number, amount, and contact information.
4. Customer chooses a mock path: `Pay Now` or `Request Payment Options`.
5. Any financing, approval, repayment terms, settlement, or decline happens outside Fina Calle through a third-party provider or the merchant.
6. Owner sees a plain status only: Pending, Approved, Paid, or Declined.

The owner should not see underwriting steps, bank/card details, repayment terms, provider decision logic, or sensitive customer financial data.

## Customer QR / Order-Number Flow

The customer-facing flow should stay short enough for mobile use at a counter:

1. Scan the business QR code.
2. Confirm the business name or PayBridge mock screen.
3. Enter order number.
4. Enter amount.
5. Enter phone or email for follow-up.
6. Choose one of two mock actions:
   - `Pay Now`
   - `Request Payment Options`
7. Receive a plain message that the next step is handled by the merchant or external provider.

No card fields, bank fields, Social Security number, loan application, or live partner application should exist in the R&D mock.

## What Fina Calle Does

Fina Calle provides the branded digital bridge:

- QR landing experience.
- Simple customer intake fields.
- Clear customer choice between mock payment paths.
- Simple owner status view.
- Documentation and handoff structure for future partner evaluation.

## What Fina Calle Does Not Do

- Does not lend money.
- Does not make approval decisions.
- Does not underwrite customers.
- Does not service repayment.
- Does not store cards.
- Does not process payments in this R&D concept.
- Does not use Stripe SDK.
- Does not connect to Square, Toast, Clover, or merchant POS systems by default.
- Does not promise approvals, repayment terms, financing availability, settlement timing, or provider acceptance.

## Mock Status Lifecycle

| Status | Owner Meaning | Customer Meaning | Source of Truth in Production |
|---|---|---|---|
| Pending | Customer submitted the request or mock payment flow started. | Request received; next step is outside Fina Calle. | Merchant or external provider. |
| Approved | External provider or merchant marked the request approved. | Payment option or merchant approval may be available. | External provider or merchant. |
| Paid | Merchant or external provider indicates payment is complete. | Payment is complete according to merchant/provider records. | Merchant or payment provider. |
| Declined | External provider or merchant could not approve or complete the request. | Request could not proceed through that external path. | External provider or merchant. |

Fina Calle should only display statuses supplied by the merchant or future approved partner. It should not create, infer, or override financial decisions.

## Safety Language

Use this sentence in every R&D mock and production review packet:

> Fina Calle PayBridge connects customers to payment options. Financing, approvals, repayment terms, and lending decisions are handled by third-party providers or the merchant.

Additional internal rule:

> Fina Calle is a connector only, not the lender, not the approval party, not the repayment servicer, and not the merchant of record unless a future legal/compliance review explicitly says otherwise.

## Phase Path

### Phase 0: R&D Mock

Static concept page and internal docs only. No payment processing, provider handoff, backend, database, auth, SMS, card storage, or live integration.

### Phase 1: Merchant Intake Prototype

Create a non-payment merchant intake prototype to understand owner setup needs, QR placement, order-number conventions, support expectations, and approved language.

### Phase 2: Partner-Link Prototype

Test a partner-link handoff concept where Fina Calle routes customers to an approved third-party or merchant-controlled destination. No embedded credit application or payment processing inside Fina Calle.

### Phase 3: Compliance Review Before Production

Before any production use, complete legal, compliance, privacy, security, provider, and merchant-of-record review. Do not ship a public PayBridge product before this phase clears.

## R&D Guardrails

- Keep all UI copy labeled as concept/mock until production partners are selected.
- Do not add backend routes for this concept.
- Do not add Stripe, Square, Plaid, lending, KYC, underwriting, SMS, database, API, webhook, or card-storage code.
- Do not use language that implies Fina Calle offers loans, credit, approval decisions, repayment servicing, or payment settlement.
- Do not deploy as a public payment product without legal, compliance, partner, and merchant review.

## Production Readiness Requirements

Before this could become production work, AMMA/Fina Calle would need:

1. Payment/financing partner selection.
2. Legal review of customer-facing language.
3. Merchant approval workflow.
4. Data retention policy.
5. Security review.
6. Privacy policy update.
7. Explicit no-card-storage architecture.
8. Real support process for disputes, declines, refunds, and provider handoffs.
9. Written rule that Fina Calle is a connector, not lender of record.
10. Written rule defining merchant of record and repayment-servicing responsibility.
