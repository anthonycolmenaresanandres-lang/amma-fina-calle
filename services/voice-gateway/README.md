# Fina Calle Voice Gateway (v0)

The AI front-desk / booking voice agent from `PRODUCT_MODULES/AI_PHONE_ASSISTANT_PLAN.md`,
built **own-gateway**: **Twilio Media Streams ⇄ OpenAI Realtime**, with a **draft-first,
idempotent** booking core behind a **swappable connector** (mock + Cal.com to start).

## What's here
- `src/server.ts` — HTTP `/twiml` (Twilio webhook) + WS `/media` (bidirectional Media Stream).
- `src/realtime.ts` — OpenAI Realtime WS client (g711 μ-law in/out, tools, barge-in).
- `src/orchestrator.ts` — **draft-first** tool handlers; `confirm_booking` is **idempotent**;
  `take_message` captures a lead when we can't book; `finalizeCall` writes an end-of-call
  summary (booked / message / missed) and **alerts staff on a missed call**.
- `src/adapter/*` — the unified booking adapter contract + connectors: `mock`, `calcom`,
  `square` (Appointments), and **`proposeConfirm`** (the universal fallback).
- `src/tenant.ts` — **multi-tenant registry**: routes each call to a business by the
  dialled number; each tenant carries its own Knowledge Pack + connector + creds.
- `src/hours.ts` — per-tenant business-hours helper (`isOpenOn` / `slotsForDate`); the
  mock + propose-confirm connectors offer slots **only within that tenant's open
  days/hours**, so the bot never books a closed day.
- `src/store.ts` — calls / drafts / pos_sync / audit. In-memory with an optional
  **atomic JSON snapshot** (`STORE_SNAPSHOT`) so a single always-on instance survives
  restarts; calls/drafts/messages are tagged with `tenantId` and `stats(tenantId?)` rolls
  up the ROI view per business. `createStore(path)` is a factory (used by tests). For
  multi-instance scale-out, move behind `db/schema.sql` (Postgres — same entities/keys).
- `src/notify.ts` — pings staff (Slack/Make/SMS bridge via `STAFF_WEBHOOK_URL`) when a
  booking commits as **PENDING** so a human confirms it; logs only when no URL is set.
- `src/simulate.ts` — verifies the booking loop with **no phone and no keys**.

## Multi-tenant (one gateway, many businesses)
One deployed gateway serves any number of clients; an inbound call is routed to a
**tenant** by the Twilio number that was dialled.
- Point a `TENANTS_FILE` env var at a JSON array of tenants (see `tenants.example.json`).
  Each entry is merged over the env-derived default, so you only specify what differs.
  With **no** `TENANTS_FILE`, the env config becomes a single catch-all "default" tenant
  (single-client deploys keep working unchanged).
- A tenant is the **only** per-client surface: `phoneNumbers` (routing), `business`
  (Knowledge Pack — services + hours), `connector` + its creds, `notify.staffWebhookUrl`,
  `disclosure`, `voice`.
- **Routing path:** `/twiml` reads Twilio's `To` → resolves the tenant → embeds its id as
  a `<Stream><Parameter name="tenant">`; the Media Stream `start` event carries it back,
  so the `RealtimeSession` uses that business's pack + connector. A tenant with an empty
  `phoneNumbers` is the catch-all; unknown numbers fall back to it (then the first tenant).

## Call analytics / ROI
- **`GET /stats`** (`?tenant=<id>` to scope to one business) — live JSON rollup:
  `{ calls, bookings, confirmedBookings, pendingBookings, messages, missedCalls,
  conversionPct, handledPct, syncErrors, audits }`. The "answered + booked while you were
  closed" number that justifies the subscription; `handledPct` counts calls that ended in
  a booking **or** a captured message (not lost).
- **`npm run report`** — the same rollup at the CLI (reads `STORE_SNAPSHOT` if set).
- **`GET /tenants`** — ops listing of every wired-up business (id, numbers, connector,
  hours, services); no secrets. The caller's number (Twilio `From`) is carried into the
  Media Stream and recorded on the call, so missed-call/message alerts say who to ring back.

## Booking connectors (`BOOKING_CONNECTOR`)
- **`mock`** (default) — deterministic; for the simulator + keyless demo.
- **`calcom`** — Cal.com v2 (`CALCOM_API_KEY`, `CALCOM_EVENT_TYPE_ID`, `CALCOM_TIMEZONE`).
- **`square`** — Square Appointments / Bookings API (`SQUARE_ACCESS_TOKEN`,
  `SQUARE_LOCATION_ID`, `SQUARE_SERVICE_VARIATION_ID`, `SQUARE_TEAM_MEMBER_ID`,
  `SQUARE_BASE_URL`). Keep bookings + payments in Square (Orders API charges 1% on
  non-Square payments).
- **`webhook`** — generic **Zapier/Make/cloud-function bridge** for systems without a
  native connector (MoeGo, Gingr, PetExec, …). Set `WEBHOOK_BOOK_URL` (+ optional
  `WEBHOOK_AVAILABILITY_URL`, `WEBHOOK_SECRET`); the endpoint speaks a simple JSON
  contract (`{date,service}`→`{slots}`, `{slot,service,customer,idempotencyKey}`→`{bookingRef,startIso,pending}`).
- **`proposeConfirm`** — **universal fallback, no integration needed**: offers slots from
  open hours and records each booking as a **PENDING request** (provisional ref) for staff
  to confirm into whatever system they use. Lets us sell to **any** business immediately.
  A real connector that's selected but unconfigured **auto-falls back** to this.

## Verify now (no keys needed)
```bash
npm install
npm run typecheck
npm run simulate   # proves draft→confirm→commit + idempotency (no double-book)
```

## Go live (the remaining wiring — needs accounts)
1. **Deploy** to an **always-on** host — **not** Vercel serverless (media streams are
   long-lived WebSockets). A `Dockerfile` is included; `render.yaml` is a ready blueprint
   (Docker web service + a persistent disk mounted at `/data` for the snapshot). Fly /
   Railway / any VM work too. Expose HTTPS + WSS.
2. Set env: `OPENAI_API_KEY`, `PUBLIC_HOST` (your public wss host, e.g.
   `voice.example.com`), and optionally a `TENANTS_FILE` (per-client packs) or the
   single-tenant `BOOKING_CONNECTOR` + that connector's creds.
3. Buy a **Twilio** number → set its **Voice webhook** to `https://<host>/twiml`. (For
   multi-tenant, add each client's number to a tenant's `phoneNumbers`.)
4. Call the number. The agent greets + discloses, then books into the connector.
5. Durability: `STORE_SNAPSHOT` (set to `/data/store.json` in `render.yaml`) keeps state
   across restarts on a single instance. To scale to multiple instances, apply
   `db/schema.sql` to Postgres and back the store with it (`psql "$DATABASE_URL" -f db/schema.sql`).

## Notes / before production
- **Re-verify** OpenAI Realtime event names + audio formats and the Cal.com v2 endpoints
  against current docs (they evolve) — see the plan's re-verify note.
- Compliance: AI disclosure is on by default; for two-party-consent states keep it on.
  Inbound-only in v0 (outbound = TCPA-gated phase). No card-by-voice.
- The **mock** connector needs nothing; it's what the simulator and a keyless demo use.
- Swapping the voice layer later (managed platform) reuses the same `orchestrator` +
  `adapter` — that's the point of the seam.
