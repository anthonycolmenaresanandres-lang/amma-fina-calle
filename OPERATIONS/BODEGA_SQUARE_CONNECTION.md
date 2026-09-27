# Bodega Square connection record

Checked 2026-09-27. **Not connected.** This record contains identifiers and evidence only; no passwords, tokens, recovery codes, customer data, or secret values.

| Field | Verified value / status |
| --- | --- |
| Fina Calle tenant ID | `bodega` in application routes; production `restaurants` row not yet present |
| Bodega owner email confirmed by Anthony | `bodegacafe757@gmail.com`; Anthony says this owner controls Bodega's Square account |
| Authorized Bodega owner name and contact | Name not supplied; Square consent and portal sign-in have not yet occurred |
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

Anthony has confirmed the address belongs to the Square-controlling Bodega owner. Before granting portal access, record the approved service scope and create/read back the `bodega` restaurant and exact `owner_emails` assignment; this is a separate production access gate. There is no `bodega` production restaurant row, `owner_emails` row, or Auth user for this address at the 2026-09-27 check. The new passwordless path creates the Auth user only after that allowlist exists and the owner requests a link. Before filling merchant/location fields, have that owner connect Bodega's own Square merchant in Square. A sole active location is selected automatically; several active locations require owner choice. Read back the connection and sync state from production, then record the date, evidence link, and reviewer. Never infer IDs from a business name or from the separate Amma Ventures seller account.

The guest-note recipient remains unconfigured. Anthony's contact email for onboarding does not change that earlier instruction.

## Owner invitation draft — send only after contact verification

Subject: Connect Bodega's Square menu to Fina Calle

Hi Bodega team,

Fina Calle is preparing a private view of Bodega's Square menu so we can compare it with the Bodega QR menu. Open https://finacalleos.com/owner/bodega/insights, enter your Bodega owner email, and tap the link we send you. Then select **Connect Bodega's Square**. Sign in on Square's screen and approve read-only access to your items and store name. Fina Calle cannot edit your Square menu, view payments or customer records, or change the guest menu through this connection.

If Square lists several stores, choose Bodega's store by name. If there is one active store, it is selected automatically. Let us know if the merchant or store name looks wrong. You can disconnect from the same page. We will review any proposed guest-menu changes with you separately.

If you have questions or did not expect this invitation, use the contact link on the Fina Calle website before connecting.

Fina Calle

Do not send this draft before the owner link, production access, Square secrets, and private sync have been verified. No temporary password is needed. Record send/acceptance only after evidence exists.
