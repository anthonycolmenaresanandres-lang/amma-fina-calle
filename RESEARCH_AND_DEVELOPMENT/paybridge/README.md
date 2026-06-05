# PayBridge R&D Notes

## Concept Boundary

Fina Calle PayBridge is an isolated R&D concept for a local-business payment-options connector. It is not a live payment product and must not be presented as a lender, credit product, underwriting system, repayment servicer, or payment processor.

## Low-Friction Owner Model

The owner experience should stay simple enough to explain in one sentence: place this QR code where customers pay, and watch a simple status.

Owner setup should be:

1. Receive QR code.
2. Place QR at counter, invoice, receipt, table, estimate, or service desk.
3. Tell customer to enter order number and amount.
4. Watch status: Pending, Approved, Paid, or Declined.

Owner should not manage:

- Customer card data.
- Credit decisions.
- Underwriting steps.
- Repayment terms.
- Partner compliance screens.
- Provider decision logic.

## Customer Mock Flow

Required fields:

- Order number
- Amount
- Phone or email

Required choices:

- Pay Now
- Request Payment Options

The flow should feel like a branded handoff, not a loan application. No card fields. No bank fields. No Social Security number. No real application. No live partner handoff in R&D.

## Mock Status Lifecycle

| Status | Meaning | Boundary |
|---|---|---|
| Pending | Customer submitted details or started the mock flow. | Fina Calle may display this as a received request. |
| Approved | Merchant or external provider marked the request approved. | Fina Calle does not approve; it displays external/merchant status. |
| Paid | Merchant or provider says payment is complete. | Fina Calle does not settle funds in R&D. |
| Declined | Merchant or external provider could not approve or complete the request. | Fina Calle does not decide declines. |

## Third-Party / Merchant Boundary

Financing, approvals, repayment terms, lending decisions, payment settlement, disputes, declines, refunds, and compliance obligations must be handled by third-party providers or the merchant.

Fina Calle can provide a digital connector layer only after legal and provider review. Fina Calle is not the lender, not the approval party, not the repayment servicer, and not the merchant of record unless a future legal/compliance review explicitly says otherwise.

## Phase Path

### Phase 0: R&D Mock

Current state. Static docs and isolated mock route only. No live data flow.

### Phase 1: Merchant Intake Prototype

Research what merchants need to configure: business name, QR placement, order number format, staff instructions, status language, and support boundaries.

### Phase 2: Partner-Link Prototype

Research whether a customer can be sent to a merchant-controlled or approved third-party partner link after entering order context. Keep Fina Calle outside approval and repayment decisions.

### Phase 3: Compliance Review Before Production

Complete legal, privacy, security, provider, merchant-of-record, and customer-support review before public launch or production integration.

## R&D Route

Prototype route:

`/research-and-development/paybridge`

The route is intentionally isolated. It can be referenced from the existing R&D index for internal review, but it should not be promoted in public navigation until approved.

## Open Questions Before Production

- Which provider, if any, would handle external payment options?
- Who is merchant of record?
- Who services repayment or customer support?
- What exact language is legally approved?
- What customer data can be collected and for how long?
- What provider status API, if any, would be used?
- What support process handles declines, refunds, disputes, and failed handoffs?
- What state/federal compliance review is required?

## Do Not Build Yet

- Stripe SDK
- Square SDK
- POS integration
- SMS
- Loan application
- Credit decisioning
- Repayment servicing
- Card storage
- ACH storage
- Customer account system
- Provider webhooks
- Database tables
- API routes
