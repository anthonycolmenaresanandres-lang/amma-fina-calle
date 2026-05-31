# Owner Request — Phase 1: Database Save Plan

The first build phase of the owner request system (see
`OWNER_REQUEST_SYSTEM_PLAN.md`): turn the demo `/request-update` form into a
flow that **persists each request to a database**. No file uploads, no admin
dashboard yet — just reliable, private storage of submitted requests.

> Documentation only. No app code changes in this file. Requires owner
> approval (see `OWNER_REQUEST_APPROVAL_CHECKLIST.md`) before building.

---

## 1. Chosen database option

**Supabase Postgres** (recommended for Phase 1).

Why over Vercel Postgres:
- Bundles **Postgres + Auth + Storage + Row-Level Security** in one service —
  Auth and Storage are needed in Phases 2–4 (uploads, admin dashboard), so
  starting on Supabase avoids a migration later.
- Generous free tier; managed; works cleanly with Next.js Route Handlers.
- Standard Postgres underneath → portable, no lock-in to proprietary SQL.

Vercel Postgres remains a valid fallback if the project must stay single-vendor;
the schema below is plain Postgres and works on either.

---

## 2. Schema for `owner_requests`

```sql
-- Enum types
create type request_status as enum ('new', 'in_progress', 'done', 'archived');
create type request_priority as enum ('low', 'normal', 'urgent');

-- Main table
create table owner_requests (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- tenant (future white-label; default 'colattao' for now)
  tenant          text not null default 'colattao',

  -- form fields (see §3)
  request_type    text not null,
  priority        request_priority not null default 'normal',
  what_changes    text not null,
  current_section text,
  new_detail      text,
  notes           text,
  contact_name    text,
  contact_info    text,

  -- workflow
  status          request_status not null default 'new',
  source_page     text,           -- e.g. 'request-update'

  -- light anti-abuse / audit (no precise PII)
  user_agent      text
);

create index owner_requests_status_idx   on owner_requests (status);
create index owner_requests_created_idx  on owner_requests (created_at desc);
create index owner_requests_tenant_idx   on owner_requests (tenant);

-- keep updated_at fresh
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger owner_requests_set_updated_at
  before update on owner_requests
  for each row execute function set_updated_at();
```

---

## 3. Fields matching the current form

| Form field (`OwnerRequestForm.tsx`) | Column | Type | Notes |
|---|---|---|---|
| Request type | `request_type` | text | validated against the allowed list server-side |
| Priority | `priority` | enum | low / normal / urgent |
| What needs to change | `what_changes` | text | required |
| Current item or section | `current_section` | text | optional |
| New text, price, or detail | `new_detail` | text | optional |
| Notes | `notes` | text | optional |
| Contact name | `contact_name` | text | optional |
| Contact email or phone | `contact_info` | text | optional |
| (auto) source page | `source_page` | text | e.g. `request-update` |
| (auto) timestamp | `created_at` | timestamptz | server default |
| (auto) user agent | `user_agent` | text | best-effort, for abuse triage only |

> Request-type values are stored as `text` (not an enum) so the owner can
> rename/add types without a DB migration; the server validates against the
> current allowed list.

---

## 4. Status values

`request_status` enum:
- `new` — just submitted (default)
- `in_progress` — Anthony is working it
- `done` — change shipped & live
- `archived` — closed without action / duplicate

## 5. Priority values

`request_priority` enum:
- `low`
- `normal` (default)
- `urgent`

> The form currently shows Spanish labels (Baja / Normal / Urgente); the server
> maps these to the canonical enum values on insert.

---

## 6. Privacy rules

- Public game/menu/concept pages remain **data-free** — unchanged.
- The request form only stores what the owner voluntarily types. Contact info
  is **optional**.
- **No precise PII beyond what's submitted**; no IP storage in Phase 1
  (`user_agent` only, for abuse triage — reconsider even that if not needed).
- **Row-Level Security enabled** on `owner_requests`:
  - Inserts allowed only via the server (service role / server-side key), never
    from the public anon client directly with broad rights.
  - Reads restricted to authenticated admins (Phase 3); no public read.
- Secrets (service role key, DB URL) live only in server env vars — never in the
  client bundle.
- Retention: define a window (e.g. archive/delete after N months); add a delete
  path in a later phase.
- The form's demo-mode privacy note is replaced with accurate wording once live:
  requests are saved privately and seen only by approved admins.

---

## 7. Environment variables needed

Server-side only (never `NEXT_PUBLIC_*` for secrets):

```
SUPABASE_URL=                 # project URL
SUPABASE_SERVICE_ROLE_KEY=    # server-only; bypasses RLS for inserts via Route Handler
# (Phase 3 admin reads may instead use scoped auth, not the service role)
```

If using the anon key for a tightly-scoped insert policy instead of the service
role, add:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
> Prefer the **server-side Route Handler + service role** approach for Phase 1
> so the public bundle ships no DB credentials with write access.

Add these in Vercel project settings (Production + Preview) and a local
`.env.local` (git-ignored).

---

## 8. Implementation steps

1. **Provision** a Supabase project; run the §2 SQL in the SQL editor.
2. **Enable RLS** on `owner_requests`; add an insert policy scoped to the
   server role and a (deny-by-default) read policy.
3. **Add env vars** to Vercel + `.env.local`.
4. **Install** the Supabase server client dependency.
5. **Create a Route Handler** `POST /api/owner-requests`:
   - validate payload (required fields, allowed request types, enum mapping),
   - rate-limit + honeypot check,
   - insert one row, return `{ id }`.
6. **Wire the form**: on submit, `fetch('/api/owner-requests', …)`; on success
   show the confirmation with the returned reference ID; on failure show a
   graceful retry message (keep the demo confirmation copy as the success state,
   minus "demo mode").
7. **Update privacy wording** on `/request-update` to reflect that requests are
   now saved privately.
8. **Keep the `mailto:` fallback** available until this is proven in production.
9. **Deploy to a Preview** first; verify inserts land; then promote.

> Routes that submit become dynamic (Route Handler); the public marketing/menu
> pages stay static.

---

## 9. Rollback plan

- **Feature flag:** gate the live submission behind an env flag
  (e.g. `REQUESTS_DB_ENABLED`). If off, the form reverts to demo-mode behavior
  (no network) — instant rollback without a redeploy of code.
- **Revert commit:** the Phase 1 change is isolated (Route Handler + form
  submit wiring + form privacy copy). `git revert` restores the demo form.
- **Data safety:** rolling back code never drops the table; existing rows are
  preserved. A separate, deliberate migration is required to drop schema.
- **Provider issue:** if Supabase is unreachable, the handler returns a friendly
  error and the UI suggests the `mailto:` fallback — no data loss, no crash.

---

## 10. Test checklist

Functional:
- [ ] Submitting a complete form inserts exactly one row with correct values.
- [ ] Required-field validation rejects empty `what_changes`.
- [ ] Priority labels (Baja/Normal/Urgente) map to `low/normal/urgent`.
- [ ] Request type stored matches selection; invalid types rejected server-side.
- [ ] Optional fields can be blank and store as null.
- [ ] Confirmation shows a reference ID returned by the server.
- [ ] Failure path shows a graceful retry message + mailto fallback.

Security / privacy:
- [ ] No DB credentials present in the client bundle.
- [ ] Public anon access cannot read `owner_requests`.
- [ ] RLS blocks unauthorized reads/writes.
- [ ] Honeypot + rate limit reject spam bursts.
- [ ] No IP stored; `user_agent` only (or removed if undesired).

Ops / reliability:
- [ ] Works on a Vercel Preview deployment before production.
- [ ] `REQUESTS_DB_ENABLED=false` cleanly reverts to demo behavior.
- [ ] Public static pages (`/`, `/menu`, `/website-concept`) remain static & unaffected.
- [ ] Build passes (`npm.cmd run build`) and TypeScript is clean.

> After Phase 1 passes this checklist and the owner confirms requests are
> arriving, proceed to Phase 2 (email notifications) and beyond.
