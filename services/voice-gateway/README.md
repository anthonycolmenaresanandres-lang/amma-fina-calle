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
- `src/hours.ts` — business-hours helper (`isOpenOn` / `slotsForDate`); the mock + propose-
  confirm connectors offer slots **only within open days/hours** (`BUSINESS_OPEN_DAYS`,
  `BUSINESS_OPEN_HOUR`, `BUSINESS_CLOSE_HOUR`), so the bot never books a closed day.
- `src/store.ts` — calls / drafts / pos_sync / audit (in-memory; swap for Postgres later);
  `stats()` rolls up the ROI view (calls, bookings, call→booking %, pending vs confirmed).
- `src/notify.ts` — pings staff (Slack/Make/SMS bridge via `STAFF_WEBHOOK_URL`) when a
  booking commits as **PENDING** so a human confirms it; logs only when no URL is set.
- `src/simulate.ts` — verifies the booking loop with **no phone and no keys**.

## Call analytics / ROI
- **`GET /stats`** — live JSON rollup: `{ calls, bookings, confirmedBookings,
  pendingBookings, messages, missedCalls, conversionPct, handledPct, syncErrors, audits }`. The
  "answered + booked while you were closed" number that justifies the subscription;
  `handledPct` counts calls that ended in a booking **or** a captured message (not lost).
- **`npm run report`** — the same rollup at the CLI (reads `STORE_SNAPSHOT` if set).

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
1. `cp .env.example .env`; set `OPENAI_API_KEY`, `PUBLIC_HOST` (your public wss host),
   and optionally `BOOKING_CONNECTOR=calcom` + `CALCOM_API_KEY` + `CALCOM_EVENT_TYPE_ID`.
2. Deploy this service to an **always-on** host (Render / Fly / Railway / a VM) — **not**
   Vercel serverless (media streams are long-lived). Expose HTTPS + WSS.
3. Buy a **Twilio** number → set its **Voice webhook** to `https://<host>/twiml`.
4. Call the number. The agent greets + discloses, then books into the connector.

## Notes / before production
- **Re-verify** OpenAI Realtime event names + audio formats and the Cal.com v2 endpoints
  against current docs (they evolve) — see the plan's re-verify note.
- Compliance: AI disclosure is on by default; for two-party-consent states keep it on.
  Inbound-only in v0 (outbound = TCPA-gated phase). No card-by-voice.
- The **mock** connector needs nothing; it's what the simulator and a keyless demo use.
- Swapping the voice layer later (managed platform) reuses the same `orchestrator` +
  `adapter` — that's the point of the seam.
