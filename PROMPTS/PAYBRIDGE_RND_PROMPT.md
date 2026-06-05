# PayBridge R&D Prompt

Use this prompt when continuing Fina Calle PayBridge concept work.

```txt
Codex effort: MEDIUM

Work in:
C:\Users\antho\OneDrive\Desktop\AMMA Ventures LLC DBA Fina Calle

Goal:
Continue the isolated Fina Calle PayBridge R&D concept without turning it into a live payment, lending, approval, or repayment-servicing product.

Rules:
- R&D only.
- Do not add backend/API/database/auth/payment/SMS logic.
- Do not add Stripe SDK, Square SDK, Plaid, lending, KYC, underwriting, card storage, repayment servicing, provider APIs, or webhooks.
- Do not imply Fina Calle lends money, approves customers, services repayment, settles funds, or acts as merchant of record.
- Do not modify production navigation or deployments unless explicitly approved.
- Do not add secrets or env files.

Concept boundary:
- Local owner receives a QR code.
- Owner places QR at counter, invoice, table, receipt, estimate, or service desk.
- Customer scans QR, enters order number, amount, and phone/email.
- Customer chooses Pay Now or Request Payment Options.
- External financing/payment partner or merchant handles approvals, repayment terms, lending decisions, settlement, disputes, refunds, and declines.
- Owner sees simple statuses only: Pending, Approved, Paid, Declined.

Required legal/safety note:
Fina Calle PayBridge connects customers to payment options. Financing, approvals, repayment terms, and lending decisions are handled by third-party providers or the merchant.

Internal safety rule:
Fina Calle is connector only, not lender, not approval party, not repayment servicer, and not merchant of record unless future legal/compliance review explicitly says otherwise.

Phase path:
- Phase 0: R&D mock
- Phase 1: merchant intake prototype
- Phase 2: partner-link prototype
- Phase 3: compliance review before production

Before changing files:
1. Run git status --short.
2. Inspect existing PayBridge docs and route.
3. Confirm changes stay isolated to PayBridge docs, prompt, R&D route, or existing R&D index.
4. Run npm.cmd run build from APP/web if app files change.
5. Do not commit or push unless explicitly asked.

Report:
- files changed
- boundary preserved
- phase path status
- verification result
- remaining production blockers
```
