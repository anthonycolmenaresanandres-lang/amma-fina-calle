# AMMA Owner Portal Access SOP

## Standard

- Never use `1234`, a shared password, or a reusable client password.
- Generate a unique temporary password of at least 16 characters for each owner account.
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
- The owner selects a private password of 12–128 characters. AMMA does not request or record it.

## Activation checklist

1. Verify the owner’s name, business, exact email, and restaurant ID.
2. Create or update the Supabase Auth user server-side; set the unique temporary password and `owner_password_reset_required: true` in `app_metadata`.
3. Confirm the email exists in that restaurant’s `owner_emails` record.
4. Confirm `SUPABASE_SERVICE_ROLE_KEY` is configured server-side in the deployment environment; never expose it to the browser or email.
5. Send the utilization template.
6. Deliver the temporary password separately.
7. Ask the owner to sign in, replace the temporary password, and confirm the dashboard opens.
8. Record completion in the client ledger without recording any password.

## Stop conditions

Stop if the identity, email, restaurant assignment, allowlist, server-side service-role configuration, or authorization is uncertain. Never send a credential to an unverified recipient.
