# Bodega Square connection record

Checked 2026-09-27. **Not connected.** This record contains identifiers and evidence only; no passwords, tokens, recovery codes, customer data, or secret values.

| Field | Verified value / status |
| --- | --- |
| Fina Calle tenant ID | `bodega` in application routes; production `restaurants` row not yet present |
| Bodega contact email supplied by Anthony | `bodegacafe757@gmail.com`; owner identity and authority still to be verified |
| Authorized Bodega owner name and contact | Unconfirmed; do not equate the supplied contact address with a verified owner login yet |
| Production owner allowlist | No `owner_emails` row for `bodega` at last read-only check |
| Square Developer application | `Fina Calle Connector`, created under Amma Ventures on 2026-09-27. Production application ID `sq0idp-lFTKZfAvjszQvlWyI1nzPg`; [Developer Console](https://developer.squareup.com/console/en/apps/sq0idp-lFTKZfAvjszQvlWyI1nzPg/oauth) |
| Production OAuth redirect | `https://finacalleos.com/api/integrations/square/callback`; saved and confirmed in Developer Console |
| Production webhook | Enabled `Fina Calle Catalog Mirror`, subscription ID `wbhk_7a625ade3c0e49a5aa4fffb62932f4ad`, API version `2026-09-16`; `catalog.version.updated` and `oauth.authorization.revoked` to `https://finacalleos.com/api/integrations/square/webhook`. Signing key is not in Vercel yet |
| Vercel production configuration | Five non-secret Square Config variables saved and read back by name/scope; secret values and a new deployment still needed |
| Square seller account currently signed in | Amma Ventures; this is the company account, not evidence of Bodega's Square merchant authorization |
| Square environment, merchant ID and name | No connection |
| Selected Bodega location ID and name | None |
| Requested permissions | `ITEMS_READ`, `MERCHANT_PROFILE_READ` in source |
| Last completed catalog sync / private objects | None / zero |
| Public menu mapping and approval | None; public menu remains editorial |
| Guest-note email recipient | Unconfigured; separate from owner email |
| Muffin reward | Off; daily limit still requires Anthony's choice |

Before filling the owner field or granting portal access, verify that the supplied address belongs to the authorized Bodega owner through an approved channel, and confirm the signed client/plan details required by the [owner access SOP](OWNER_PORTAL_ACCESS_SOP.md). There is no `bodega` production restaurant row, `owner_emails` row, or Auth user for this address at the 2026-09-27 check. Before filling merchant/location fields, have that owner connect Bodega's own Square merchant in Square and confirm the location in the private insights page. Read back the connection and sync state from production, then record the date, evidence link, and reviewer. Never infer IDs from a business name or from the separate Amma Ventures seller account.

The guest-note recipient remains unconfigured. Anthony's contact email for onboarding does not change that earlier instruction.

## Owner invitation draft — send only after contact verification

Subject: Connect Bodega's Square menu to Fina Calle

Hi [verified owner name],

Fina Calle is preparing a private view of Bodega's Square catalog so we can compare menu details with the Bodega QR menu. Please sign in at [approved owner URL] with your Bodega owner account, open **Square menu watch**, and select **Connect Square**. Square will ask you to approve read-only access to catalog items and your merchant profile. Fina Calle cannot edit your Square catalog, view payments or customer records, or change the guest menu through this connection.

After approval, choose the Bodega Square location shown in the private view and let us know if its merchant or store name looks wrong. You can disconnect from the same page. We will review any proposed guest-menu changes with you separately.

If you have questions or did not expect this invitation, contact [approved Fina Calle support channel] before connecting.

Fina Calle

Do not send this draft with placeholders. Do not include a temporary password in the invitation. Record send/acceptance only after evidence exists.
