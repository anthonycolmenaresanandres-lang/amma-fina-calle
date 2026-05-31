# Redis Counter — Readiness Checklist

Planning notes for adding **real, anonymous "saved X times" counts** to menu
items in the future. Today the saved-items feature is purely client-side
(localStorage, per-device). This document describes the upgrade path to a
shared counter using Redis.

> Documentation only. No code changes. Build nothing until the go/no-go
> checklist passes.

---

## Provider choice

- **Vercel KV is deprecated for new projects.** Do not start a new KV store.
- **Use Upstash Redis** provisioned through the **Vercel Marketplace**
  (Vercel → Storage / Integrations → Upstash). It's serverless Redis, pay-per-
  request friendly, and integrates env vars into the Vercel project
  automatically.

---

## Required environment variables

Provisioning Upstash via the Vercel Marketplace typically injects:

```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Plus a feature flag so the counter can be turned off instantly:

```
SAVED_COUNTS_ENABLED=true
```

All server-only — never expose the token with a `NEXT_PUBLIC_` prefix. Set in
Vercel (Production + Preview) and a git-ignored `.env.local` for development.

---

## What we WILL store

- **Item name** (the menu item label, e.g. "Churro Latte") as the Redis key.
- **An anonymous integer count** — how many times that item has been saved.

That's it. A simple key → number map:

```
saved_count:Churro Latte  ->  42
```

(Optionally namespaced per tenant later, e.g. `colattao:saved_count:<item>`.)

---

## What we will NOT store

- ❌ Names
- ❌ Emails or phone numbers
- ❌ Payment information
- ❌ Customer profiles or accounts
- ❌ IP addresses
- ❌ Device identifiers or any way to tie a count back to a person

The counter is **aggregate and anonymous only** — a tally, not a tracker.

---

## Implementation plan

1. **Add Upstash Redis** via the Vercel Marketplace; confirm env vars land in
   the project; add `SAVED_COUNTS_ENABLED` flag.
2. **Create an API route to increment** a count, e.g.
   `POST /api/saved-counts` with `{ item }`:
   - validate `item` against the known menu item list (server-side allowlist),
   - `INCR saved_count:<item>` in Redis,
   - rate-limit / debounce so one device can't inflate counts,
   - return the new count. Increment fires only on a *new* save (mirrors the
     existing analytics rule — never on unsave).
3. **Create a read path** — an API route or server helper
   (`GET /api/saved-counts` or a cached server read) that returns counts for
   the menu items, so the page can render real numbers. Cache briefly to avoid
   hammering Redis.
4. **Display "Saved X times" only when a real count exists** (X ≥ a small
   threshold, e.g. ≥ 1 or ≥ 5 to avoid "Saved 1 time" noise). If counts are
   disabled, unavailable, or below threshold, **show nothing** — never show a
   fake or zero count. The local per-device "♡ Save / ♥ Saved" behavior stays
   exactly as-is regardless.

---

## Owner privacy explanation (plain language)

> "We can show how many people have saved a drink — like a gentle 'popular
> pick' signal — **without collecting anything personal**. We only keep a
> running number per item. We never store names, emails, phone numbers,
> payment info, locations, or anything that could identify a customer. It's
> just a tally that says, for example, 'Churro Latte — saved 42 times.' You can
> turn it off at any time."

Public game/menu pages remain free of personal data; this only adds an
anonymous aggregate number.

---

## Go / no-go checklist

Before building:

- [ ] Owner approves showing public "saved X times" counts.
- [ ] Confirm Upstash Redis is provisioned via Vercel Marketplace (not KV).
- [ ] Env vars present in Production + Preview + local `.env.local`.
- [ ] `SAVED_COUNTS_ENABLED` flag wired so it can be disabled instantly.
- [ ] Server-side allowlist of valid item names defined.
- [ ] Rate limit / debounce strategy decided (anti-inflation).
- [ ] Display threshold decided (e.g. hide until ≥ 5).
- [ ] Confirmed: no names, emails, payments, profiles, or IPs stored.
- [ ] Token is server-only (no `NEXT_PUBLIC_` exposure).
- [ ] Rollback plan: flag off → page silently hides counts, local Save still works.
- [ ] `/menu` stays fast; read path is cached and non-blocking.

When every box is checked, proceed with the Implementation plan above.
