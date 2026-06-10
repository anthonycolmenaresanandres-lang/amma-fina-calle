# Fina Calle Voice Gateway (v0)

The AI front-desk / booking voice agent from `PRODUCT_MODULES/AI_PHONE_ASSISTANT_PLAN.md`,
built **own-gateway**: **Twilio Media Streams ⇄ OpenAI Realtime**, with a **draft-first,
idempotent** booking core behind a **swappable connector** (mock + Cal.com to start).

## What's here
- `src/server.ts` — HTTP `/twiml` (Twilio webhook) + WS `/media` (bidirectional Media Stream).
- `src/realtime.ts` — OpenAI Realtime WS client (g711 μ-law in/out, tools, barge-in).
- `src/orchestrator.ts` — **draft-first** tool handlers; `confirm_booking` is **idempotent**.
- `src/adapter/*` — the unified booking adapter contract + connectors: `mock`, `calcom`,
  `square` (Appointments), and **`proposeConfirm`** (the universal fallback).
- `src/store.ts` — calls / drafts / pos_sync / audit (in-memory; swap for Postgres later).
- `src/simulate.ts` — verifies the booking loop with **no phone and no keys**.

## Booking connectors (`BOOKING_CONNECTOR`)
- **`mock`** (default) — deterministic; for the simulator + keyless demo.
- **`calcom`** — Cal.com v2 (`CALCOM_API_KEY`, `CALCOM_EVENT_TYPE_ID`, `CALCOM_TIMEZONE`).
- **`square`** — Square Appointments / Bookings API (`SQUARE_ACCESS_TOKEN`,
  `SQUARE_LOCATION_ID`, `SQUARE_SERVICE_VARIATION_ID`, `SQUARE_TEAM_MEMBER_ID`,
  `SQUARE_BASE_URL`). Keep bookings + payments in Square (Orders API charges 1% on
  non-Square payments).
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
