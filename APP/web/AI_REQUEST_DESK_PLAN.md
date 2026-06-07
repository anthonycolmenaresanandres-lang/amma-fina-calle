# Fina Calle AI Request Desk — Planning Doc (Client OS / APP/web)

> **Documentation only. No app code in this phase.** This is the corrected,
> authoritative plan. It targets the **live Client OS** in this repo
> (`anthonycolmenaresanandres-lang/amma-fina-calle`, `APP/web`) — **not** the
> static `colattaoMenu.ts` in the Colattao Rush demo repo. An earlier draft was
> written against Colattao Rush by mistake; that file is now marked superseded and
> points here.

Source of truth for this workstream: `/owner/[id]`, `/m/[id]`, the Supabase menu
tables, `apply_owner_change()` / `applyOwnerChange()`, `audit_log`,
`change_requests`, and the admin-gated `/customers` registry — all of which
**already exist in this repo** (verified 2026-06-07).

---

## 0. The reframe: the hard part is already built

The earlier Colattao Rush plan treated the *apply* half as a big, dangerous thing
to design from scratch (build `applyOwnerChange()`, move the menu off static code,
build an audit table). **In this repo, all of that is done and well-secured.**

That collapses the AI Request Desk to its true shape: **a thin natural-language
triage layer that maps a typed sentence onto an action that already exists.** It
adds *input flexibility*, not new authority.

```
owner types "change the Mocha to $8"
  → TRIAGE  (intent · severity · resolve target row · proposed value)
  → L1 answer  ·  L2 applyOwnerChange() after confirm  ·  L3/L4 change_requests
```

No new mutation primitive is needed. The Desk calls the **same rail the existing
owner-portal buttons already call.**

---

## 1. What already exists (verified in APP/web)

| Vision name | Status | Where |
|---|---|---|
| Live Supabase **menu tables** | ✅ Built | `supabase/migrations/0001_owner_portal_foundation.sql` — `restaurants`, `owner_emails`, `menu_categories`, `menu_items` (**price `numeric(10,2)`**), `hours`, `promos` |
| `change_requests` table | ✅ Built | same migration + `0002_change_requests_intake.sql` (adds `submit_change_request()` RPC) |
| `audit_log` table | ✅ Built | same migration — append-only, written in the **same transaction** as every change |
| `apply_owner_change()` (SQL rail) | ✅ Built | same migration — ownership check + editable-field allowlist + type cast + old-value capture + update + audit insert, all in one `security definer` txn |
| `applyOwnerChange()` (TS rail) | ✅ Built | `src/lib/owner/rail.ts` — mirrors the allowlist (`EDITABLE_FIELDS`), calls the RPC, throws on error |
| Owner server actions | ✅ Built | `src/lib/owner/actions.ts` — `updateItemText`, `setItemAvailability`, `updatePromoText`, `uploadItemImage`, each gated by `assertOwner()` |
| Owner auth (no enumeration) | ✅ Built | magic-link OTP via `requestMagicLink`; `is_email_allowed()` returns boolean only; neutral message |
| Owner portal route | ✅ Built | `/owner/[id]` (e.g. `/owner/colattao`) |
| Public QR menu route | ✅ Built | `/m/[id]` (e.g. `/m/colattao`) via `get_public_menu()` (safe columns only) |
| Admin-gated registry | ✅ Built | `/customers`, `/customers/[id]` via `getAdminContext()` + `AdminGate` + admin magic-link |
| Customer intake API | ✅ Built | `POST /api/customer-requests` → `persistChangeRequest()` + `sendChangeRequestEmail()` (Resend) |

**Security posture already in place (do not weaken):**
- RLS on every table; owners can only **SELECT** their own restaurant's rows.
- **No direct write grants.** The *only* write path is `apply_owner_change()`,
  which re-derives the caller from `auth.jwt() ->> 'email'` and checks
  `owner_emails`. A non-owner call raises `42501`.
- Public/anon can only reach `get_public_menu()` and `submit_change_request()` —
  both `security definer`, both return/insert safe data only.

---

## 2. The Desk's real action surface = the existing allowlist

The Desk can only ever *apply* what the rail already allows. This is the whole
safety story, inherited for free:

| Table | Editable fields (from `EDITABLE_FIELDS` / SQL allowlist) |
|---|---|
| `menu_items` | `name`, `description`, `price`, `is_available`, `photo_url` |
| `menu_categories` | `name` |
| `promos` | `text`, `is_active` |
| `hours` | `open_time`, `close_time`, `is_closed` |

Anything outside this set **cannot be applied** by anyone — the DB rejects it. So
any owner request that maps onto one of these pairs is a candidate L2 auto-draft;
everything else is L3/L4 (a `change_requests` row), exactly like today's form.

---

## 3. Categories, severity, and routing

Severity decides the gate. Priority (Low/Normal/Urgent, already in the intake API)
becomes a sort key within a level.

| Level | Meaning | Desk behavior | Calls |
|---|---|---|---|
| **L1 — Answer** | Question, no change | Answer from the owner's own menu (read via owner-session RLS). No write. | menu read |
| **L2 — Safe edit** | Maps to an allowlisted `{table, field}` | Resolve the target row → preview `old → new` → **owner confirms** → apply. | `applyOwnerChange()` |
| **L3 — Review** | Ambiguous, new build, multi-item, or off-allowlist | Record a structured request, notify AMMA. No auto-apply. | `submit_change_request()` + Resend |
| **L4 — Urgent** | Outage, billing/money, auth, suspected tampering | Escalate immediately, never auto-act. | `submit_change_request()` (Urgent) + priority notify |

Map of intents → level (seeded from `/api/customer-requests` `ALLOWED_REQUEST_TYPES`):

- `answer_question` → L1
- `price_change`, `item_rename`, `item_description`, `toggle_availability`,
  `promo_text`, `hours_change`, `photo_upload` → **L2** (each lands on the allowlist)
- `new_item`, `remove_item`, `website_change`, `game_module_idea`,
  `operational_support` → **L3**
- `billing`, `account/auth`, `outage`, `tampering` → **L4**

Unknown / low-confidence → L3 (human), never auto-apply.

---

## 4. Worked examples (grounded in the real tables)

**"change the Mocha to $8"**
- intent `price_change` → L2. Read the owner's `menu_items` (RLS-scoped), fuzzy-match
  `name ≈ "Mocha"` → one `id`. Current `price = 7.00`.
- Desk: *"Found **Mocha** ($7.00). Update price to **$8.00**? Confirm."*
- On confirm → `applyOwnerChange({ table:"menu_items", rowId, field:"price", newValue:"8" })`
  → DB casts to numeric, updates, writes `audit_log` in the same txn. `/m/colattao`
  revalidates. Done. (`updateItemText` already validates `Number(raw) >= 0`.)

**"86 the Flan Latte" / "we're out of churro latte"**
- intent `toggle_availability` → L2 → `field:"is_available", newValue:"false"`.

**"add a new matcha called Rosa, $8"**
- intent `new_item` → **L3**. `menu_items` *insert* is **not** on the rail's allowlist
  (the rail only `UPDATE`s existing rows). So this is a review request via
  `submit_change_request()`, not an auto-apply. (A future `add_owner_item` rail
  could promote this to L2 — out of scope here.)

**"I was double charged this month"**
- intent `billing` → **L4**. `submit_change_request()` with Urgent + priority notify.
  The Desk never touches money/auth.

**"someone changed my prices"**
- intent `tampering` → **L4**. Escalate; the owner can already self-verify via
  `/owner/colattao` audit reads (`audit_log` is owner-readable by RLS).

---

## 5. The one critical safety rule for the AI layer

**The Desk must call `applyOwnerChange()` inside the owner's authenticated session —
exactly as the existing server actions do (`assertOwner()` + `createServerSupabase()`).**

Why this is non-negotiable: `apply_owner_change()` derives the actor from
`auth.jwt() ->> 'email'` and checks `owner_emails`. If the Desk instead used the
**service role**, it would bypass that ownership check and the audit actor would be
wrong. So:

- The Desk runs as a **server action on `/owner/[id]`**, behind the existing
  magic-link session. Same gate as the buttons; only the *input* differs (free text
  vs. a form field).
- The AI/parser **never** holds write authority. It produces a *proposal*
  `{ table, field, rowId, newValue }`; the human confirms; the existing rail applies.
- Owner identity comes from the session, never from text in the box.
- The DB allowlist + RLS remain the final guard — the Desk cannot widen them.

Everything else (audit on every change, no destructive bulk ops, no money/auth) is
inherited from the rail and the level gates.

---

## 6. Optional additive migration (only if persisting triage)

The Desk works for Phase 0 with **zero schema change** (L2 calls the rail directly;
L3/L4 use the existing `submit_change_request()`). If you later want to persist the
triage itself, add nullable columns to `change_requests` (additive, no breakage):

```
alter table public.change_requests add column if not exists intent         text;
alter table public.change_requests add column if not exists severity       text;   -- L1..L4
alter table public.change_requests add column if not exists target_table    text;
alter table public.change_requests add column if not exists target_row_id   text;
alter table public.change_requests add column if not exists current_value   text;
alter table public.change_requests add column if not exists proposed_value  text;
alter table public.change_requests add column if not exists confidence      numeric;
```

Not required to ship. Defer until there's a reason to analyze triage history.

---

## 7. Corrected Phase 0 (what to actually build first)

Scope: a text bar on `/owner/[id]` that turns plain language into a **previewed,
confirmable** L2 edit — reusing everything above. No new tables, no OpenAI, no new
write path.

1. **Read + resolve.** In the owner session, load the owner's `menu_items` /
   `promos` / `hours` (RLS-scoped). Build a deterministic matcher: keyword/intent +
   fuzzy name match → a target `{table, field, rowId}`.
2. **Parse the value.** Price → number (reuse `updateItemText`'s `Number(raw) >= 0`
   check); availability → boolean; text → trimmed string.
3. **Preview + confirm.** Show `old → new` and the matched item name. Require an
   explicit confirm tap. Below a match-confidence threshold, ask one clarifying
   question instead of guessing.
4. **Apply via the existing rail.** Call the existing server action / `applyOwnerChange()`.
   Audit + `/m/[id]` revalidation already happen.
5. **Fallback to L3/L4.** Anything off-allowlist, ambiguous, or money/auth/outage →
   `submit_change_request()` + Resend, with the right level. (Same destination as
   today's `/request-update` form — proven path.)
6. **Flag it.** Gate the whole Desk behind an env flag and degrade to the existing
   form when off — mirror `isSupabaseConfigured` / the intake API's graceful no-op.

Prove it on **Colattao first** (`/owner/colattao`), watching `audit_log`, before
exposing it to other tenants.

---

## 8. AI integration plan (deterministic first, no OpenAI dependency)

- **Phase 0 — no model.** Intent + value parsing is regex/keyword + fuzzy name match
  against the owner's own menu rows. Fully testable, free, and — importantly — it
  does **not** depend on `OPENAI_API_KEY`. (The Fina Calle newsroom currently has a
  standing publish blocker from an empty key silently degrading a gate; the Desk
  must never inherit that. Missing key = no AI, **not** a broken Desk.)
- **Phase 1 — LLM as classifier only.** Optionally add a model that outputs strict
  JSON `{ intent, severity, target_ref, proposed_value, confidence, clarifying_question? }`.
  Server validates it against the same allowlist; the model never calls the rail and
  never holds authority. Add an explicit key health-check + per-request token budget.
- **Phase 2 — phrasing.** Use the model to phrase L1 answers / confirmations in the
  owner's language. Still zero new authority.

---

## 9. Decisions for Anthony

1. **Confirm step UX:** inline preview-and-confirm in the text bar, or a confirm card?
   (Recommend inline `old → new` with one confirm tap.)
2. **Persist triage?** Ship Phase 0 with no schema change (recommended), or add the
   §6 columns now for analytics later?
3. **`new_item` / `remove_item`:** keep as L3 review (recommended — the rail only
   updates existing rows), or invest in an `add/remove` rail to make them L2?
4. **L4 channel:** Resend email only (current), or add SMS/priority for outages/billing?

---

## 10. Repo correction summary

| | Colattao Rush (`Desktop/Colattao Rush`) | **APP/web (`amma-fina-calle`)** |
|---|---|---|
| Menu | **Static** `src/data/colattaoMenu.ts`, string prices, protected file | **Live Supabase** `menu_items.price numeric` |
| Owner edits | None (email + best-effort CRM insert) | **`applyOwnerChange()` audited rail** |
| `audit_log` | ❌ none | ✅ append-only, in-txn |
| `change_requests` | ~`requests`/`owner_requests` (email-first) | ✅ table + `submit_change_request()` RPC |
| Owner auth/portal | ❌ none | ✅ magic-link `/owner/[id]`, RLS, admin `/customers` |
| Role | Marketing/demo + game; **reference only** | **Client OS — source of truth, build the Desk here** |

*Planning doc only. No code, no migration, no table change has been made.*
