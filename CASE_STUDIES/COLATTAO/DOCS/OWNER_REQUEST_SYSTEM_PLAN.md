# Owner Request System — Plan

A plan for a professional, reliable request-intake system so Colattao (and
future white-label clients) can submit update requests that are **saved**,
support **file uploads**, and trigger **reliable notifications** — so Anthony
never misses an owner update.

> Status: planning document only. No app code is changed by this file.
> Today the project uses a lightweight `mailto:` link (see
> `OWNER_UPDATE_PROCESS.md`). This plan describes the upgrade path.

---

## 1. Goal

Give the owner a single, dependable place to request changes (menu, prices,
photos, game copy, promos, events) and attach supporting files, while giving
Anthony a durable record, instant notification, and a simple way to triage and
act on each request.

Success looks like:
- Zero missed requests.
- Every request stored with a timestamp, status, and history.
- Owner can attach a photo/PDF/menu file.
- Anthony gets notified within seconds and can manage requests from one place.

---

## 2. Why mailto is not enough

The current `mailto:` link is great for v1, but it has real limits:

- **No persistence.** If the email is missed, deleted, or filtered to spam,
  the request is gone. There's no record of what was asked.
- **Unreliable delivery.** `mailto:` depends entirely on the user's device
  having a configured mail client; many mobile users tap and nothing happens.
- **No file uploads.** Owners can't reliably attach a photo of a new pastry or
  a PDF menu through a `mailto` body.
- **No status tracking.** No "new / in progress / done" — Anthony manages it
  all manually in an inbox.
- **No structure.** Free-text emails vary wildly; no enforced fields.
- **No analytics.** Can't see request volume, common types, or response time.
- **Not scalable to multiple clients.** A white-label product needs per-client
  request streams.

---

## 3. Recommended architecture

A small, serverless, privacy-conscious system layered on the existing
Next.js App Router app:

```
[Owner browser]
    │  (1) submits intake form (+ optional file)
    ▼
[Next.js Route Handler / Server Action]  ── validates + rate-limits
    │
    ├─(2)─► [Object storage]  (Supabase Storage or Vercel Blob)  ← file upload
    │
    ├─(3)─► [Database]  (Supabase Postgres or Vercel Postgres)   ← request row
    │
    └─(4)─► [Email provider]  (Resend / Postmark)                ← notify Anthony
                 │
                 └─► optional: SMS/push later
[Anthony]
    │  (5) reviews in Admin dashboard (auth-gated) → updates status
    ▼
[Codex workflow] → edit/build/commit/push → Vercel deploy → confirm live
```

Key properties: serverless (no server to maintain), static public site stays
fast, only the intake + admin routes are dynamic.

---

## 4. Intake form fields

Mirrors and extends the current mailto template:

- **Business / location** (prefilled for single-tenant Colattao; selectable for
  multi-tenant).
- **Requester name** (optional).
- **Contact email or phone** (optional, for follow-up).
- **Request type** (select): Menu · Price · Product · Photo · Game · Promo ·
  Event · Other.
- **Priority** (select): Low · Normal · Urgent.
- **What needs to change** (short text).
- **Current item or section** (text).
- **New text, price, or detail** (textarea).
- **Attachments** (file upload, optional — see §5).
- **Notes** (textarea).
- Hidden/auto: timestamp, source page, user agent, request ID.

Validation: require at least a request type + a description; everything else
optional. Honeypot + rate limit to deter spam.

---

## 5. File upload strategy

- **Storage:** Supabase Storage bucket (or Vercel Blob) — not the database.
- **Flow:** client requests a short-lived signed upload URL from a Route
  Handler, uploads directly to storage, then the returned file key is saved on
  the request row. Keeps large files off the serverless function.
- **Limits:** max ~10 MB/file, up to ~5 files; allow `image/*`, `application/pdf`.
- **Safety:** validate MIME + extension, randomize stored filenames, store under
  a per-request prefix, never trust client filename for paths.
- **Access:** files are private; the admin dashboard fetches them via signed
  read URLs that expire.

---

## 6. Notification strategy

- **Primary:** transactional email to Anthony via **Resend** or **Postmark**
  (reliable deliverability, unlike `mailto`). Includes request summary, type,
  priority, and links to the dashboard + any attachments.
- **Urgent priority:** optionally also send SMS (Twilio) or a push/webhook
  (e.g., a Slack/Discord/Telegram channel) so urgent requests are unmissable.
- **Owner confirmation:** auto-reply email to the requester ("We got your
  request — here's your reference ID") if they provided contact info.
- **Digest (optional):** a daily summary of open requests.
- **Reliability:** notifications are best-effort *after* the DB write succeeds,
  so a failed email never loses the request.

---

## 7. Admin dashboard concept

A simple authenticated `/admin/requests` area (not in the public static site):

- **List view:** all requests with type, priority, status, date, requester.
- **Filters:** by status (New / In progress / Done / Archived), type, priority.
- **Detail view:** full request, attachments (signed previews), and an internal
  notes/activity log.
- **Actions:** change status, add a note, mark done, archive, copy a ready-made
  Codex prompt from the request.
- **Metrics (later):** request volume, average response time, common types.

Keep it deliberately minimal — this is an operations tool, not a CMS.

---

## 8. Privacy and access control

- **Public site stays data-free.** The game/menu/concept pages collect no
  personal data (consistent with the current privacy posture).
- **Intake form** only collects what the owner voluntarily types/uploads, and
  states clearly how it's used (to process the request, nothing else).
- **Admin auth:** dashboard gated behind authentication (Supabase Auth or a
  simple password/NextAuth). No public access to requests or files.
- **Least privilege:** DB row-level security so each tenant only sees its own
  requests; storage buckets private with signed URLs.
- **Retention:** define a retention window; allow deleting a request + its files.
- **Secrets:** all keys in environment variables, never in the client bundle.
- **No third-party profiling / ad trackers.** Analytics stays anonymous
  (Vercel Web Analytics).

---

## 9. Recommended stack

- **Framework:** existing **Next.js App Router** (Route Handlers / Server
  Actions for the dynamic endpoints).
- **Hosting:** **Vercel** (serverless functions, free/low tier to start).
- **Database:** **Supabase Postgres** (preferred — includes Auth + Storage +
  row-level security in one) *or* **Vercel Postgres** if staying fully in the
  Vercel ecosystem.
- **File storage:** **Supabase Storage** (or **Vercel Blob**).
- **Email:** **Resend** or **Postmark** for transactional notifications.
- **Optional urgent channel:** Twilio (SMS) or a Slack/Telegram webhook.
- **Auth (admin):** Supabase Auth or NextAuth.

Rationale: Supabase bundles DB + storage + auth + RLS, minimizing moving parts
for a small team; Vercel-native alternatives work if single-vendor is preferred.

---

## 10. Implementation phases

1. **Phase 1 — Persisted intake (MVP).** Add an intake form page + Route
   Handler that writes a request row to the DB and emails Anthony via Resend.
   No file upload yet. Replaces reliance on `mailto`.
2. **Phase 2 — File uploads.** Signed-URL uploads to storage; attach file keys
   to requests; signed previews.
3. **Phase 3 — Admin dashboard.** Auth-gated list + detail + status management.
4. **Phase 4 — Reliability & urgency.** Owner confirmation emails, urgent
   SMS/webhook, daily digest, retries.
5. **Phase 5 — Multi-tenant (white-label).** Per-client request streams, RLS,
   tenant-scoped dashboards, and theming via `theme.ts`.
6. **Phase 6 — Insights.** Volume/response-time metrics, common-request
   templates, one-click Codex prompt generation.

Each phase is independently shippable; `mailto` remains the fallback until
Phase 1 is live.

---

## 11. Owner experience

- Opens a clean, on-brand request form (linked from `/menu`, the owner
  presentation, and a QR sign).
- Picks a type and priority, describes the change, optionally attaches a photo
  or PDF, and submits.
- Gets an instant on-screen confirmation with a reference ID, and (if they
  shared contact info) a confirmation email.
- No account required for basic submission; the flow is fast and mobile-first.

---

## 12. Anthony workflow

1. Receives a reliable notification (email, plus SMS/webhook if urgent).
2. Opens `/admin/requests`, reviews the request and any attachments.
3. Sets status to **In progress**, optionally copies the auto-generated Codex
   prompt.
4. Runs the change through Codex → build → commit → push.
5. Vercel auto-deploys; Anthony marks the request **Done** and (optionally)
   notifies the owner with the live URL.
6. Request history stays searchable for accountability.

---

## 13. Risks and safeguards

| Risk | Safeguard |
|---|---|
| Spam / abuse of public form | Honeypot field, rate limiting, optional captcha, server-side validation |
| Malicious file uploads | MIME + extension allowlist, size caps, randomized names, private buckets, signed URLs |
| Notification provider outage | Write to DB first; notifications are best-effort; retries + dashboard as source of truth |
| Data exposure | RLS, private storage, admin auth, secrets in env vars, least-privilege keys |
| Vendor lock-in | Standard Postgres + S3-style storage; portable schema; abstract the email sender |
| Cost creep | Start on free tiers; alerts on usage; cap upload sizes |
| Scope creep into a full CMS | Keep admin minimal and ops-focused; content edits still flow through Codex |
| PII over-collection | Collect only optional contact info; clear usage notice; retention policy + delete |
| Losing the simple path | Keep `mailto` fallback available until the persisted system is proven |

---

> Next action when ready: greenlight **Phase 1 (Persisted intake)** and choose
> Supabase vs Vercel Postgres + Resend vs Postmark. This document changes no
> code; it is the blueprint for that build.
