# Bodega Square connection record

Checked 2026-09-27. **Not connected.** This record contains identifiers and evidence only; no passwords, tokens, recovery codes, customer data, or secret values.

| Field | Verified value / status |
| --- | --- |
| Fina Calle tenant ID | `bodega` in application routes; production `restaurants` row not yet present |
| Authorized Bodega owner name and contact | Unconfirmed |
| Production owner allowlist | No `owner_emails` row for `bodega` at last read-only check |
| Square Developer application | Account and application creation unconfirmed |
| Square environment, merchant ID and name | No connection |
| Selected Bodega location ID and name | None |
| Requested permissions | `ITEMS_READ`, `MERCHANT_PROFILE_READ` in source |
| Last completed catalog sync / private objects | None / zero |
| Public menu mapping and approval | None; public menu remains editorial |
| Guest-note email recipient | Unconfigured; separate from owner email |
| Muffin reward | Off; daily limit still requires Anthony's choice |

Before filling the owner field, verify the person and exact email with Bodega through an approved channel. Before filling merchant/location fields, have that owner connect in Square and confirm the location in the private insights page. Read back the connection and sync state from production, then record the date, evidence link, and reviewer. Never infer IDs from a business name.

## Owner invitation draft — send only after contact verification

Subject: Connect Bodega's Square menu to Fina Calle

Hi [verified owner name],

Fina Calle is preparing a private view of Bodega's Square catalog so we can compare menu details with the Bodega QR menu. Please sign in at [approved owner URL] with your Bodega owner account, open **Square menu watch**, and select **Connect Square**. Square will ask you to approve read-only access to catalog items and your merchant profile. Fina Calle cannot edit your Square catalog, view payments or customer records, or change the guest menu through this connection.

After approval, choose the Bodega Square location shown in the private view and let us know if its merchant or store name looks wrong. You can disconnect from the same page. We will review any proposed guest-menu changes with you separately.

If you have questions or did not expect this invitation, contact [approved Fina Calle support channel] before connecting.

Fina Calle

Do not send this draft with placeholders. Do not include a temporary password in the invitation. Record send/acceptance only after evidence exists.
