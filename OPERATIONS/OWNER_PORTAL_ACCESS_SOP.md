# AMMA Owner Portal Access SOP

## Standard

- Use `1234` as the standard one-time temporary password for a newly provisioned owner account.
- Require immediate replacement before exposing any portal data or actions; never use `1234` as the owner's private password.
- Mark every newly provisioned Supabase Auth user with app metadata:

```json
{
  "owner_password_reset_required": true
}
```

- Confirm the exact owner email is already assigned to the correct restaurant in `owner_emails`.
- Send the utilization email without the temporary password.
- Deliver the temporary password separately by a verified phone call, text, or another agreed channel.
- On first sign-in, the portal must show the password-reset screen and withhold dashboard data and actions.
- The owner selects a private password of 4–128 characters. AMMA does not request or record it.

## Activation checklist

### 1. Intake and identity

1. Confirm the business name, restaurant ID, store count, owner/contact name, exact owner email, phone, billing identity, service plan, recurring amount, billing interval, and approved first-charge date.
2. Confirm which person may approve access and billing. Do not infer an owner email from a public website or an employee address.
3. Record the non-secret client facts in the client ledger and handoff before changing production.

### 2. Database assignment

1. Confirm the restaurant exists and the restaurant ID matches the intended live owner URL.
2. Add the exact email to `owner_emails` for only that restaurant with the approved role.
3. Read the row back and verify restaurant ID, email, and role. Stop on duplicates, mismatches, or an unexpected existing assignment.

### 3. Authentication provisioning

1. Set the standard one-time temporary password to `1234`. Never place an owner-selected private password in chat, email, source control, tickets, documents, logs, or the client ledger.
2. Create or update the Supabase Auth user server-side and confirm the exact email.
3. Set `owner_password_reset_required: true` in `app_metadata`.
4. Read the user and metadata back; PASS requires the exact email, confirmed user state, and reset flag `true`.

### 4. Production readiness

1. Confirm the deployed portal has server-side Supabase access and the correct public application URL. Never expose the server credential to the browser.
2. Confirm Stripe price, webhook, and Zelle display/reconciliation configuration only when those services are in the signed scope.
3. Verify the production owner URL returns HTTP 200 before sharing it.

### 5. First-login verification

1. Sign in once with the temporary credential through the exact customer URL.
2. PASS requires the first-sign-in reset screen to appear while menu, billing, Zelle, change-request, and Checkout controls remain unavailable.
3. Do not enter the owner’s private replacement password. Deliver the temporary credential separately through a verified channel and have the owner choose the final 4–128 character password.
4. After the owner completes the reset, verify the dashboard opens, the reset flag is false, and the client sees only their restaurant.

### 6. Billing and handoff

1. Verify plan, recurring amount, billing status, scheduled charge, payment-management route, and manual Zelle status against the client ledger.
2. Never complete Checkout, attach a payment method, create a paid subscription, or move money without the specific approval recorded for that client.
3. Send the utilization template without credentials, provide the owner URL/QR code, and record completion without storing any password.
4. Check out in `OPERATIONS/HANDOFF_LOG.md` with evidence, remaining approvals, and the next owner action.

## Stop conditions

Stop if the identity, email, restaurant assignment, allowlist, Auth user, reset metadata, server-side configuration, plan, price, charge date, or approval is uncertain. Stop at the first failed readback. Never send a credential to an unverified recipient, bypass the mandatory reset wall, or continue into payment after an authentication failure.
