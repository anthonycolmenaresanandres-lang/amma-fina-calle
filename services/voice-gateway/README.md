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
- `src/checkin/*` — attendance check-in scaffolding (built + unit-tested, not wired into
  live tools yet): `types.ts` (the `CheckInConnector` interface + domain types), `rules.ts`
  (a deterministic rules-pack evaluator — identity match, roster match for the session, a
  time window around the session's start/end, signed waiver on file, no account hold, and
  an authorized guardian on file for minors; every check is plain code, no AI judgment
  calls), and `mockConnector.ts` + `simulate.ts` (`npm run simulate:checkin`, 17/17 checks
  passing). See the roadmap section below.

## Multi-tenant (one gateway, many businesses)
One deployed gateway serves any number of clients; an inbound call is routed to a
**tenant** by the Twilio number that was dialled.
- Point a `TENANTS_FILE` env var at a JSON array of tenants (see `tenants.example.json`).
  Each entry is merged over the env-derived default, so you only specify what differs.
  With **no** `TENANTS_FILE`, the env config becomes a single catch-all "default" tenant
  (single-client deploys keep working unchanged).
- A tenant is the **only** per-client surface: `phoneNumbers` (routing), `business`
  (Knowledge Pack — services + hours), `connector` + its creds, `notify.staffWebhookUrl`,
  `disclosure`, `voice`, `language`.

### Speaking another language (e.g. a Chinese restaurant)
OpenAI Realtime voices are **not language-locked** — the timbre comes from `voice`, the
language/accent from the instructions. So a tenant has two knobs:
- **`voice`** — the timbre (`alloy` default; `shimmer`/`coral`/`sage` are warm choices).
  Pick whichever sounds best; any of them will speak Mandarin/Cantonese when steered.
- **`language`** (default `"English"`) — the language the agent answers in. Set it to e.g.
  `"Mandarin Chinese"` and the agent greets and converses natively, and only switches if
  the **caller** clearly leads in another language (a Chinese restaurant takes both
  Chinese- and English-speaking callers). Set the `disclosure` to a matching/bilingual
  greeting (the compliance line is read verbatim, so localize it per tenant).

See the `golden-dragon` entry in `tenants.example.json` for a ready Chinese-restaurant
tenant (Mandarin, `shimmer` voice, reservation-style services, bilingual disclosure).
Single-client deploys can do the same with env: `LANGUAGE="Mandarin Chinese"` +
`OPENAI_VOICE=shimmer`.

### Barge-in & SoundGate debounce (noisy venues)
When the caller talks over the agent, the gateway flushes the audio queued at Twilio and
truncates the model's memory to *what the caller actually heard* — using the accurate Twilio
media clock (`truncate()` in `realtime.ts`, driven from `server.ts`), so it never "remembers"
finishing a sentence that got cut off. On top of that, a local turn-taking referee
(`soundgate.ts`) holds the floor through *transient* noise: it only yields to **sustained**
speech, so a clink, cough, blender burst, or one-word backchannel ("mm-hm") doesn't kill the
agent's turn. Per-tenant `soundGate.bargeInMinMs` (env `BARGE_IN_MIN_MS`, default `150`) is
how long speech must persist before yielding; `0` = instant/legacy, raise for cafés/
restaurants. It's the first, in-process slice of the fuller SoundGate concept
(`PRODUCT_MODULES/FINA_CALLE_SOUNDGATE_CONCEPT.md`) — never an LLM round-trip, so it adds no
latency. Server-side turn detection stays the gateway's tuned `server_vad` (threshold 0.6 /
700 ms trailing silence), which already filters much line noise; the debounce is the finer
transient filter on top. Re-verify Realtime event names/semantics against current docs
before go-live (see file header).
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
- **Turn-quality KPIs** (same `/stats`, SoundGate — see `SOUNDGATE.md`): `{ speechStarts,
  bargeIns, transientsSuppressed, realtimeErrors, hangupsAfterInterruption, ttfaAvgMs,
  ttfaP50Ms }`. These make the turn-taking tunable: `ttfa*` = responsiveness (caller stop →
  first agent audio), `transientsSuppressed` = blips the debounce held, `realtimeErrors`
  surfaces a silent hang-up cause (e.g. `insufficient_quota`).
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
   single-tenant `BOOKING_CONNECTOR` + that connector's creds. Language defaults to
   English; override with `AGENT_LANGUAGE` / per-tenant `language` (see Language lock).
3. Buy a **Twilio** number → set its **Voice webhook** to `https://<host>/twiml`. (For
   multi-tenant, add each client's number to a tenant's `phoneNumbers`.)
4. Call the number. The agent greets + discloses, then books into the connector.
5. Durability: `STORE_SNAPSHOT` (set to `/data/store.json` in `render.yaml`) keeps state
   across restarts on a single instance. To scale to multiple instances, apply
   `db/schema.sql` to Postgres and back the store with it (`psql "$DATABASE_URL" -f db/schema.sql`).

## Roadmap — attendance check-in (rules pack + mock connector built, not wired live)
Extending this engine so it can **sign already-registered people in** (attendance check-in
for a league game/class, not new registration) against a client's own system — first case:
VBFH's DaySmart "Dash." Same draft-first/idempotent/swappable-connector shape as booking,
plus a deterministic rules pack that gates every check-in and a hard rule that anything the
rules can't clear (or the AI can't verify with certainty) is escalated to a human at the
front desk, never guessed.

Status: the `CheckInConnector` interface, the deterministic rules pack, and a mock
connector are built and unit-tested (`src/checkin/`, `npm run simulate:checkin`). They are
**not yet wired** into the live phone/chat tools — no client's assistant can attempt a
check-in today. A real connector against DaySmart is **blocked**: API access isn't
available yet and there's no committed timeline, which is the current bottleneck for this
capability going live. In the interim, the `vbfh-info` tenant's assistant handles a caller
asking to check in by phone the same way it handles anything it can't complete: it says
plainly it can't verify or complete a check-in by phone, takes a message (name, callback
number, session) via `take_message` so front-desk staff gets a heads-up, and tells the
caller to check in in person — a message relay, not a verified check-in. See
`PRODUCT_MODULES/AI_FRONT_DESK_CHECKIN_PLAN.md` for full detail.

## Notes / before production
- **Re-verify** OpenAI Realtime event names + audio formats and the Cal.com v2 endpoints
  against current docs (they evolve) — see the plan's re-verify note.
- Compliance: AI disclosure is on by default; for two-party-consent states keep it on.
  Inbound-only in v0 (outbound = TCPA-gated phase). No card-by-voice.
- The **mock** connector needs nothing; it's what the simulator and a keyless demo use.
- Swapping the voice layer later (managed platform) reuses the same `orchestrator` +
  `adapter` — that's the point of the seam.
