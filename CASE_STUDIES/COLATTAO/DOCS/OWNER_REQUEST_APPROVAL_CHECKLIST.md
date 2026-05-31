# Owner Request — Approval Checklist (Demo Flow)

Before wiring real database storage, email notifications, and file uploads,
the owner should review and approve the `/request-update` demo flow — its
fields, wording, privacy note, and future upload plan.

> This is a review document only. The form is currently in **demo mode**: it
> does not send or save any information. See `OWNER_REQUEST_SYSTEM_PLAN.md` for
> the full build plan.

How to use: walk through each section with the owner, check items off, capture
answers in the "Owner questions" section, and record the final decision in
"Go / no-go."

---

## 1. Pages to review

- [ ] **/request-update** — the intake form itself (fields, layout, wording, confirmation).
- [ ] **/menu** — the "Probar formulario de cambios" link in the footer (mailto fallback still present).
- [ ] **/owner-presentation** — the "Probar formulario de cambios" link + demo-mode note in the workflow section.

---

## 2. Form field approval

Review each field — keep, rename, or remove:

| Field | Keep? | Rename to | Remove? |
|---|---|---|---|
| Request type (Menú / Precio / Producto / Foto / Sticker / Sitio web / Juego / Promoción / Otro) | [ ] | | [ ] |
| Priority (Baja / Normal / Urgente) | [ ] | | [ ] |
| What needs to change (change description) | [ ] | | [ ] |
| Current item or section | [ ] | | [ ] |
| New text, price, or detail | [ ] | | [ ] |
| Notes | [ ] | | [ ] |
| Contact name | [ ] | | [ ] |
| Contact email or phone | [ ] | | [ ] |
| Future file upload area (disabled placeholder) | [ ] | | [ ] |

---

## 3. Owner questions

Capture the owner's answers here:

- [ ] **Are these fields enough?** ___________________________________________
- [ ] **Should any field be removed?** ______________________________________
- [ ] **Should any request type be renamed?** _______________________________
- [ ] **Who should receive notifications?** (Anthony only? + others?) _________
- [ ] **Should urgent requests also notify by text (SMS)?** __________________
- [ ] **What file types should be allowed?** (photos / PDF / menu screenshots / sticker files?) ___________
- [ ] **Who can access the admin dashboard?** _______________________________

---

## 4. Privacy approval

Confirm the owner understands and approves the privacy posture:

- [ ] **Demo mode today:** the form does **not** send or save any information.
- [ ] **Future version will save requests** to a private database.
- [ ] **Future version may store uploaded files** (photos, PDFs, sticker files) in private storage.
- [ ] **Only approved admins** will be able to see requests and attachments.
- [ ] Contact info is optional and used only to follow up on the request.
- [ ] No customer personal data is collected by the public game/menu pages.

---

## 5. Go / no-go decision

Pick one:

- [ ] **Approved as-is** — proceed to backend build exactly as shown.
- [ ] **Approved with changes** — proceed after the noted edits:
  - _______________________________________________________________________
  - _______________________________________________________________________
- [ ] **Not approved yet** — needs another review. Reason:
  - _______________________________________________________________________

Approved by: ____________________  Date: ____________

---

## 6. Next phase after approval

Once approved, build in this order (each phase independently shippable):

1. [ ] **Database save** — persist each request with type, priority, details, timestamp, status.
2. [ ] **Email notifications** — reliable transactional email to Anthony (and any approved recipients); optional SMS for urgent.
3. [ ] **File uploads** — signed-URL uploads to private storage; allowed file types per §3.
4. [ ] **Admin dashboard** — auth-gated list/detail/status management for approved admins only.

> Until these phases are approved and built, the `mailto:` fallback and demo
> form remain the active path — no live data is sent or stored.
