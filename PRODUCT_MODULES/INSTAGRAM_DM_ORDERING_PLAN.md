# Instagram DM Ordering — plan + premortem (v1)

> **Status: PLANNED. Nothing built. Nothing connected.** No Meta app exists, no
> permission has been requested, no order table exists in Supabase. This document is the
> decision record and the build spec; it is not a claim that any of it works yet.
>
> **Headline decision:** do **not** build "an Instagram bot." Build a transport-agnostic
> **Order Core** with a hosted checkout, then attach Instagram DM as *one* transport.
> The order engine earns money from a QR code, a link in bio, and an SMS on day one —
> with zero dependency on Meta approving anything. Instagram is the growth surface, not
> the product. Reasoning in §3; the premortem in §10 is mostly a list of what happens if
> we forget this.

---

## 1. Verified platform facts (checked 2026-08-18)

These constrain the design. Each was verified against current sources this session, not
recalled. `developers.facebook.com` is blocked from this environment, so Meta's own docs
must be re-read by a human before go-live — treat everything here as *confirmed enough to
plan on, not enough to ship on*.

| Fact | Consequence for us |
| --- | --- |
| The Instagram **"Order Food" action button** routes only to Meta's closed partner list (ChowNow, Grubhub, EatStreet, Uber Eats, ChatFood, and reservation partners like OpenTable/Resy/SevenRooms). | AMMA **cannot** get that button. Confirmed. Stop wanting it. Our entry points are the DM, the link in bio, the story link, and the QR. |
| Only **one** profile action button shows at a time. | A client already wired to ChowNow/Toast has that slot occupied. Not a blocker for DM ordering, but it kills "we'll add a button" as a pitch line. |
| **24-hour standard messaging window.** A customer message opens 24h of free-form replies; each new customer message resets it. | A full order (browse → cart → pay → confirm) happens in minutes, so it fits comfortably. **Anything after the window is the problem** — see the next two rows. |
| **`HUMAN_AGENT` tag extends the window to 7 days but is for real humans only.** Meta prohibits applying it to automated messages; misuse can cost API access. | Hard-code this. The bot **never** sets `HUMAN_AGENT`. It is available only on a staff-typed reply from the takeover console. |
| **Message tags `CONFIRMED_EVENT_UPDATE`, `ACCOUNT_UPDATE`, and `POST_PURCHASE_UPDATE` were deprecated 2026-04-27 and now return error 100.** The migration path is Utility Templates / the Marketing Messages API. | This is the sharpest constraint in the whole design. **We cannot push "your order is ready" into a DM outside the 24h window.** Order status must not depend on DM delivery — capture phone/email at checkout and send status there. |
| Serving Instagram accounts **we don't own** requires **Advanced Access** to `instagram_business_manage_messages`, which requires **App Review + Business Verification** with the app in **Live** mode. | This is the long pole and the single biggest schedule risk. It is a review of AMMA Ventures LLC by Meta, with an unpredictable calendar. Phase gating in §9 exists entirely to keep this off the critical path. |

Sources: [About action button partners on Instagram](https://help.instagram.com/313280685976255/) · [ChowNow — Instagram food ordering](https://get.chownow.com/blog/how-to-use-instagrams-food-ordering-tool-to-help-your-restaurants-sales/) · [ChatFood — activate the Order Food button](https://docs.chatfood.io/en/articles/4297634-how-to-activate-your-instagram-order-food-button-and-stickers) · [Messenger Platform changelog (tag deprecation)](https://developers.facebook.com/docs/messenger-platform/changelog/) · [Messenger / IG messaging policy](https://developers.facebook.com/documentation/business-messaging/messenger-platform/policy) · [Instagram messaging 24-hour window guide](https://www.keyapi.ai/blog/instagram-messaging-api-policy/) · [Instagram Messaging API approval guide](https://singhamandeep.com/instagram-messaging-api-approval-getting-instagram_business_manage_messages-2026/) · [Instagram Platform overview](https://developers.facebook.com/docs/instagram-platform/overview/)

---

## 2. What we are actually selling

> "Your Instagram DMs already get order questions. Right now they get answered late, or
> never. This answers them in seconds, takes the order, takes the money, and drops a
> ticket on your counter — with no commission."

The buyer is the same restaurant owner as the rest of Fina Calle OS. The wedge is that
delivery marketplaces charge 15–30% and own the customer; a DM order is **commission-free
and the customer stays theirs**. That is the whole pitch, and it is honest.

It is only true for a client whose DMs actually carry order intent. **Qualification gate:
before selling, the owner shows their DM inbox.** Fewer than ~10 order-shaped DMs a week
means this module will produce a visible zero and churn them. Sell them the QR/link
ordering instead — same engine, no Meta dependency.

---

## 3. The architecture decision: one engine, many mouths

We already own a multi-tenant transaction engine. `services/voice-gateway/` is a
**draft-first, idempotent, connector-swappable** booking core that routes an inbound
conversation to a tenant, validates against that tenant's Knowledge Pack and hours,
assembles an auditable draft, commits once, notifies staff, and reports ROI at `/stats`.

**Instagram DM ordering is that same engine with a different transport and a different
noun (order instead of booking).** Building a second, parallel bot would be the most
expensive mistake available to us.

```
   Instagram DM        Voice call        QR / link-in-bio       SMS (later)
        │                   │                   │                   │
   ig-transport        twilio-transport    web-transport       sms-transport
        └───────────────────┴─────────┬─────────┴───────────────────┘
                                      ▼
                            ORDER CORE  (new, transport-agnostic)
             tenant resolve · catalog validate · draft · price · commit-once
                                      │
        ┌──────────────┬──────────────┼──────────────┬──────────────┐
        ▼              ▼              ▼              ▼              ▼
   Supabase        Hosted          Stripe        Staff ticket    Status
   catalog +       checkout        Connect       (sound + ack)   notify
   orders          (finacalleos)   (client MOR)                  (SMS/email)
```

**Reuse map — what exists vs. what is new:**

| Piece | State |
| --- | --- |
| Multi-tenant registry, draft-first commit, idempotency, staff notify, `/stats` | **Exists** in `services/voice-gateway/` — patterns to lift, not rewrite |
| Catalog: `public.restaurants`, `menu_categories`, `menu_items` (+ `sizes` jsonb), `hours`, `promos`, `get_public_menu()` | **Exists** in `APP/web/supabase/migrations/0001` + `0007` |
| Owner portal, owner auth, admin gating, RLS + security-definer RPC pattern | **Exists** (`/owner/[id]`, migrations `0001`–`0014`) |
| Stripe server module + webhook route | **Exists** (`src/lib/stripe/`, `src/app/api/stripe/webhook/route.ts`) — but for *subscription billing*, not customer orders |
| Order Core (cart, tax, order lifecycle, capacity guard) | **New** |
| Hosted checkout page + Stripe Connect direct charges | **New** |
| Instagram transport (webhook, tenant routing by IG account id, quick replies, takeover) | **New** |
| Kitchen ticket surface with **acknowledgement** | **New — and the piece most likely to decide whether this succeeds** (§10, F-1) |
| Modifiers in the catalog schema | **New — currently only `sizes` exists** (§10, F-4) |

---

## 4. Data model (new Supabase migrations)

> Migration numbers here are **proposals, not reservations**. `0014` is the highest in
> repo; **applied production migration state is unknown** and must be verified by Anthony
> before any migration is written or applied. Do not apply these from an agent session.

```
public.ig_accounts      -- one row per connected client IG account
  restaurant_id  text  -> restaurants(id)
  ig_user_id     text  unique          -- routing key (the voice gateway's "dialled number")
  ig_username    text
  token_ref      text                  -- pointer to the secret store; NEVER the token itself
  token_expires_at timestamptz
  status         text                  -- active | expired | revoked | paused
  connected_at   timestamptz

public.ig_threads       -- conversation state per customer thread
  ig_account_id, ig_sender_id (scoped-id), state, draft_order_id,
  window_expires_at timestamptz,       -- the 24h clock, enforced in code
  human_takeover_until timestamptz, last_inbound_mid text

public.orders
  id, restaurant_id, channel ('instagram'|'web'|'voice'|'sms'),
  status,                              -- draft|awaiting_payment|paid|
                                       -- awaiting_shop_ack|accepted|ready|
                                       -- completed|rejected|refunded|expired
  fulfilment ('pickup'|'dinein'), scheduled_for,
  subtotal, tax, tip, total, currency,
  customer_name, customer_phone, customer_email,   -- captured at CHECKOUT, not in DM
  stripe_payment_intent_id, idempotency_key unique,
  source_ref,                          -- ig thread id / table id / call id
  created_at, acked_at, ready_at

public.order_items
  order_id, menu_item_id, name_snapshot, size_label, unit_price_snapshot,
  qty, notes, modifiers jsonb

public.order_events     -- append-only audit: every state change, actor, payload
```

**Snapshot rule:** every line item stores the name and price *as sold*. A menu edit must
never retroactively change a historical order. The voice gateway learned this; so does this.

**No card data ever touches our database, our logs, or a DM.** Stripe holds it.

---

## 5. The conversation contract

Deterministic state machine; the LLM is a **parser and a phrasebook**, never the authority
on price, availability, or totals.

| State | Bot does | Customer input |
| --- | --- | --- |
| `greet` | Confirms it's an assistant (disclosure, always on), offers: **Order** / **Hours** / **Talk to a person** | quick reply |
| `browse` | Sends category quick replies from `get_public_menu()`; only `is_available = true` items | quick reply / free text |
| `build` | Adds item → asks size (from `sizes`) → asks quantity → "anything else?" | quick reply / free text |
| `fulfil` | Pickup or dine-in. **Delivery is out of scope for v1** (§10, F-9) | quick reply |
| `review` | Reads the cart back with a running total (tax computed server-side) | confirm / edit |
| `pay` | Sends **one hosted checkout link** to `finacalleos.com/o/<token>` — name, phone, email and card are collected **there** | tap |
| `await_ack` | "Paid. Waiting for the shop to confirm — you'll get a text." **Never says "confirmed."** | — |
| `accepted` | Staff acked → pickup time sent to DM (still in window) **and** SMS | — |
| `handoff` | Any of: customer types "human", low parser confidence, allergy/refund/complaint keyword, three failed turns | staff console |

**Hard rules**
1. The bot never states a price it did not read from the catalog in that same turn.
2. The bot never confirms an order the shop has not acknowledged.
3. The bot never asks for card, CVV, or bank details in a DM. If a customer *sends* card
   digits, the message is redacted before storage and the bot replies with the secure link.
4. Allergy, intolerance, refund, and complaint keywords go straight to `handoff`. No LLM
   improvisation about what is in the food.
5. Disclosure that this is an automated assistant appears in the first message of every
   new thread.

---

## 6. Payments — the part that must not be improvised

**Stripe Connect, direct charges, the restaurant as merchant of record.** AMMA never takes
custody of customer funds. AMMA's fee is the existing Fina Calle OS subscription, billed
separately — *not* a cut of order volume.

This is a deliberate, non-negotiable call. Collecting order money into an AMMA account and
paying restaurants out is money transmission. It invites state licensing questions, it puts
chargeback liability on AMMA, and it converts a software subscription into a financial
product. Direct charges keep refunds, chargebacks, and tax reporting where they belong: on
the restaurant's Stripe account.

Consequences to plan for: each client must complete Stripe Connect onboarding (KYC — an
owner task, real friction, sometimes a week); sales tax rates are per-jurisdiction and must
be configured per client, not guessed; tips are a line on the checkout page, not a DM turn.

---

## 7. Meta compliance envelope

- **Permissions:** `instagram_business_basic` + `instagram_business_manage_messages`,
  Advanced Access. **Do not request publishing permissions.** Asking for the ability to
  post as the client is both unnecessary and a trust-destroying line in the consent screen.
- **App Review needs:** Business Verification of AMMA Ventures LLC, the app in Live mode, a
  screencast of the real flow, a public privacy policy and data-deletion endpoint, and a
  written use-case description. **Build the screencast against a demo account we own.**
- **Window discipline:** every outbound send checks `window_expires_at` first. Outside the
  window there is no bot send — the fallback is SMS/email, captured at checkout.
- **No `HUMAN_AGENT` from automation.** Available only to a staff-typed message.
- **Webhook idempotency by `mid`.** Meta retries. A retried delivery must never create a
  second order — the same discipline as the voice gateway's `confirm_booking`.
- **Data:** store the scoped sender id and the minimum needed. Retention window on message
  bodies. A deletion request must be honourable end-to-end.

---

## 8. Guardrails inherited from the workspace

- **Stable QR URLs.** Colattao's printed QR points at
  `https://colattao-cafe-rush.vercel.app/menu` and does not change. Ordering is **additive**
  — a new `/o/...` route — and `publicMenuHref("colattao")` keeps linking out to Café Rush.
- No agent touches secrets, grants access, applies migrations, deploys, or merges to `main`.
- `/m/[id]`, `/owner/[id]`, `/customers` behaviour stays as-is until an explicit queued task
  says otherwise.
- Every phase stops at a human gate before anything customer-facing goes live.

---

## 9. Build phases (each with a PASS condition)

Sequenced so that **the first paying outcome does not depend on Meta**.

| Phase | Scope | PASS |
| --- | --- | --- |
| **P0 — Order Core, offline** | Cart/price/tax/lifecycle as a pure module with a keyless simulator, mirroring `npm run simulate`. No network, no Meta, no Stripe. | Simulator builds a multi-item order from the real Colattao catalog, computes a total, refuses an unavailable item, refuses a `price = 0` "Ask" item, and commits exactly once under duplicate input. |
| **P1 — Schema + owner surfaces** | Migrations for §4; owner portal gets **86 toggle** and **kitchen ticket with acknowledge**. Local only; migrations written, not applied. | Owner can 86 an item and see it vanish from the public menu locally; an order appears on the ticket surface and requires a tap to accept. |
| **P2 — Hosted checkout + Stripe Connect (test mode)** | `/o/<token>` page, contact capture, Connect direct charge, webhook → `paid`, refund path. | Test-mode order goes draft → paid → awaiting_shop_ack → accepted; a refund reverses cleanly; no card data in our DB or logs. |
| **P3 — Ship the no-Meta channel** | QR / link-in-bio ordering live for one pilot client. **This is the first revenue and the first real proof.** | A real customer completes a real paid pickup order end-to-end; staff acked it within the SLA; the ticket printed/sounded. |
| **P4 — Meta app + App Review** | Meta app, webhook verify, OAuth connect flow in the owner portal, screencast on an AMMA-owned demo account, Business Verification. Runs **in parallel with P3** because its calendar is out of our control. | Advanced Access granted for `instagram_business_manage_messages`. |
| **P5 — Instagram transport** | Webhook → tenant routing by `ig_user_id` → the §5 state machine → the *same* Order Core. Staff takeover console. Capacity guard. | 20 consecutive simulated threads produce correct orders with zero duplicates and zero out-of-window sends; then one pilot client live for two weeks. |

P0–P2 are ordinary product work with no external dependency. P4 is a waiting game started
early. If P4 never lands, P0–P3 still stand on their own — that is the point.

---

## 10. Premortem

*It is 2027-05-18. The Instagram DM ordering module shipped and failed. Nobody uses it, or
worse, it hurt a client. Here is the autopsy, written in advance.*

Ranked by **probability × damage**. Each has an early-warning signal, a preventive control
that must be built in (not bolted on), and a kill criterion.

### F-1 — The restaurant never saw the order *(highest combined risk)*
Orders arrived in a dashboard nobody was watching. Two customers paid and showed up to
blank stares. The owner refunded by hand, decided "the AI thing loses orders," and churned —
and told three other owners.
- **Signal:** median acknowledge time creeping past a few minutes; any order accepted by
  timeout rather than by a human tap.
- **Control:** an order is **never** "confirmed" to the customer until staff acknowledge on
  a device that makes noise. No ack within the SLA → auto-cancel, auto-refund, and the DM
  says the shop couldn't take it. Ack rate is a monitored metric from day one, not an
  afterthought.
- **Kill:** ack rate under 90% in the pilot's first two weeks → pull the channel, fix the
  counter workflow before anything else.

### F-2 — Meta App Review never approved us, and it was the critical path
Months went into a channel that could not legally open. Advanced Access for an unknown LLC
is not a formality.
- **Signal:** first submission rejected without a specific remediable reason; verification
  stalled on business documents.
- **Control:** the phase order in §9. P3 ships revenue with zero Meta dependency. The
  Instagram transport is a ~2-week attachment to a finished engine, not the engine.
- **Kill:** two rejections with no actionable path → park the transport, keep selling
  QR/link ordering, revisit in a quarter. **Nothing else is lost.**

### F-3 — Order status died outside the 24-hour window
Built on the assumption that "your order is ready" could always be DM'd. The tags that
allowed that were deprecated 2026-04-27 and now error. Scheduled and next-day orders went
silently unnotified.
- **Signal:** any send attempt where `window_expires_at` is in the past.
- **Control:** status notification is **SMS/email first**, DM opportunistically and only
  in-window. Contact details are captured at checkout precisely for this. Scheduled orders
  beyond the window are simply not offered in v1.
- **Kill:** n/a — this is a design constraint, not a gamble. It fails only by being ignored.

### F-4 — The bot sold food the kitchen couldn't make
The catalog has `sizes` and no modifier schema. An LLM cheerfully accepted "oat milk, no
foam, extra shot, gluten-free bread" — unpriced, unfulfillable, and in one case an allergy
question answered by a model that does not know what is in the food.
- **Signal:** rising share of orders with free-text notes; any staff rejection citing
  "we can't make this."
- **Control:** v1 sells the **fixed catalog only** — item + size + quantity. Notes are
  captured verbatim, shown to staff, and labelled to the customer as *"the shop may not be
  able to honour this."* Allergy/intolerance keywords force human handoff, no exceptions.
  Modifiers get a real schema and real prices before they get a conversation turn.
- **Kill:** any allergy-related incident → the channel stops the same day.

### F-5 — We built it for restaurants that don't get DMs
The pitch assumed inbound DM volume. Most local spots get a handful a week. The pilot's
dashboard read zero orders for a month and the owner correctly concluded it did nothing.
- **Signal:** at qualification, an inbox with under ~10 order-shaped DMs a week.
- **Control:** the §2 qualification gate — the owner shows the inbox *before* we sell. Low
  volume is not a lost sale, it is a redirect to QR/link ordering on the same engine.
- **Kill:** if fewer than 2 of the first 10 qualified prospects clear the gate, the DM
  channel is a feature for a niche, not a product line. Price and position it accordingly.

### F-6 — Sold on a rounding error
Sales tax was wrong, or tips were mishandled, or a refund left money in the wrong place.
One accounting complaint from an owner erases a year of goodwill.
- **Signal:** any mismatch between our order total and the client's Stripe payout.
- **Control:** tax rates configured per client and reconciled against a real receipt during
  onboarding; Stripe Connect direct charges keep the money and the liability on the
  restaurant's account; a weekly automated reconciliation of orders vs. Stripe.
- **Kill:** any unexplained discrepancy → payments pause for that client until reconciled.

### F-7 — Duplicate orders from webhook retries
Meta redelivers. A retried `mid` created a second charge. The customer was billed twice at
the worst possible moment — right after trusting a new system.
- **Signal:** two orders, same thread, same items, seconds apart.
- **Control:** idempotency on `mid` at ingest **and** on `idempotency_key` at commit —
  exactly the discipline `confirm_booking` already enforces in the voice gateway. Tested by
  replaying the same webhook payload 50 times in P5's PASS condition.

### F-8 — A viral post melted the kitchen
One good reel, 200 DMs in ten minutes. The bot took every order. The kitchen had a 90-minute
queue and a lobby of angry people.
- **Signal:** open orders per 15 minutes crossing the client's configured ceiling.
- **Control:** a per-tenant capacity guard and a one-tap **pause ordering** switch in the
  owner portal. At capacity the bot politely stops taking orders instead of queueing them.
  Also respects hours — closed means closed, as the voice gateway already does.

### F-9 — Scope crept into delivery and POS
"Can it push to Toast?" "Can it do delivery?" Three months disappeared into integration work
for one client, with no second buyer.
- **Signal:** any task that requires a POS vendor's partner approval or a courier API.
- **Control:** v1 is **pickup and dine-in only**, and the fulfilment surface is a ticket
  (screen + optional print/email). No POS write. Delivery and POS are separate, separately
  priced, separately sequenced modules.
- **Kill:** POS integration does not start until two paying clients ask for the *same* POS.

### F-10 — The client's Instagram account became our liability
An account got restricted, or hacked by an unrelated phish, and AMMA was blamed — because
we were the last thing that touched it. Their Instagram *is* their storefront; the perceived
risk is larger than the technical one.
- **Signal:** any owner hesitation at the OAuth consent screen. Take it seriously; it is the
  real objection.
- **Control:** request the **narrowest** permission set — messaging only, **never
  publishing**. A one-page plain-language consent sheet: what we can see, what we cannot do,
  how to revoke in two taps. Token status visible in the owner portal.
- **Kill:** any account action attributable to our integration → disconnect every client,
  disclose immediately, do not wait to be asked.

### F-11 — Tokens expired quietly and ordering just stopped
Long-lived tokens lapse. Nobody noticed for eleven days. Orders had been silently failing.
- **Signal:** `token_expires_at` inside 14 days; any auth error from the Send API.
- **Control:** a token-health check on the existing caretaker cadence, an owner-portal
  banner, and a refresh path that takes the owner two taps. Failing silent is not allowed —
  the same reason the voice gateway alerts on missed calls.

### F-12 — Multi-tenant misrouting
A DM to restaurant A produced an order for restaurant B. Catastrophic, unrecoverable trust
damage, and the kind of bug that ends a vendor relationship in one message.
- **Signal:** any order whose `restaurant_id` disagrees with its thread's `ig_account_id`.
- **Control:** routing by `ig_user_id` with **no catch-all fallback** — the voice gateway's
  unknown-number fallback pattern is right for phones and **wrong here**; an unrecognised
  account must hard-fail, not guess. Plus a database constraint tying every order to its
  thread's account, and a cross-tenant test in the P5 suite.

### F-13 — The support burden landed on Anthony
Every ambiguous DM escalated to a human, and the human was the founder, at 9pm, for a client
paying $200/month. The founder-labor KPI — already the tracked risk in the business plan —
got worse, not better.
- **Signal:** escalations routed to AMMA rather than to the client's staff.
- **Control:** handoff goes to the **restaurant's** console with their hours attached.
  Outside hours the bot takes a message instead of escalating. AMMA is not in the loop by
  design, and "AMMA answers the DMs" is never sold.
- **Kill:** more than ~3 founder-hours a week across all clients → the escalation design is
  wrong; fix it before adding a single new client.

### F-14 — It worked, and nobody paid more for it
Orders flowed, the owner was happy, and it was bundled into the existing subscription at no
uplift. A commission-free channel worth real money was given away.
- **Control:** price it before building it. It is a paid add-on tier with a stated
  commission-free value story. Instrument orders-per-month per client from P3 so the renewal
  conversation cites the client's own numbers.

### Cross-cutting lesson
Ten of these fourteen are *operational*, not technical. The code is the easy part. The
module fails at the counter, at the consent screen, at the tax line, and in the founder's
calendar — which is why the phase order, the ack requirement, the qualification gate, and
the direct-charge decision matter more than any model choice.

---

## 11. Go / no-go gates

1. **Before any code:** Anthony confirms applied production migration state, and confirms
   the Stripe Connect direct-charge model is what he wants. *(Blocking — §6 is a business
   decision, not a technical one.)*
2. **Before P2:** one pilot client agrees in writing to a paid pilot of QR/link ordering.
3. **Before P4:** AMMA Ventures LLC business documents are ready for Meta verification.
4. **Before P5 goes live:** F-1's ack workflow is proven at the counter with real staff.
5. **Before client #2:** the pilot has run two weeks with ack rate ≥ 90%, zero duplicates,
   zero out-of-window sends, and reconciled payouts.

---

## 12. Ready-to-paste Codex queue entry (P0 only)

Not yet in `OPERATIONS/CODEX_QUEUE.md` — this is a spec awaiting Anthony's go. P0 is local,
keyless, reversible, and touches no live surface.

````markdown
## [ ] N — Build the transport-agnostic Order Core (offline simulator)

**State:** READY
**Codex effort:** MEDIUM
**Scope:** new `services/order-core/` only — cart, catalog validation, pricing, tax, order
lifecycle, idempotent commit, and a keyless simulator. Reads a fixture copy of the Colattao
catalog. Excluded: Supabase migrations, `APP/web`, Stripe, Instagram, any network call, any
secret.
**Token-saving rule:** targeted reads; changed lines/new files only; final verification only.
**Why:** the order engine must exist and be proven before any transport attaches to it.
Plan: `PRODUCT_MODULES/INSTAGRAM_DM_ORDERING_PLAN.md`.
**Exact prompt to paste:**
```text
Anthony: build services/order-core per PRODUCT_MODULES/INSTAGRAM_DM_ORDERING_PLAN.md §4-§5.
Mirror the voice-gateway's draft-first, idempotent, keyless-simulator patterns. No network,
no secrets, no migrations, no changes outside services/order-core/.
PASS = `npm run simulate` in services/order-core builds a multi-item order from the Colattao
fixture, computes subtotal/tax/total, refuses an unavailable item, refuses a price=0 "Ask"
item, refuses an item outside opening hours, and commits exactly once when the same
idempotency key is submitted 50 times.
```
````

---

## 13. What only Anthony can do

Per the constitution, no agent does any of these:

- Create the Meta app, complete Business Verification, submit App Review.
- Enter any Instagram token, app secret, or webhook verify token.
- Complete Stripe Connect onboarding for AMMA and for each client.
- Confirm applied Supabase production migration state; apply migrations.
- Approve the pricing tier; sign the pilot client.
- Deploy, merge to `main`, or send anything to a customer.
