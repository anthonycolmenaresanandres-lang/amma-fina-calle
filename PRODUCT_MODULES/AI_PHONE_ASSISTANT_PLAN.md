# AI Phone Assistant & AI Call-Center Bots — plan + best-quality setup

> **Status: PLAN / R&D.** Two products on one voice stack:
> 1. **AMMA's own AI phone assistant** (internal) — answers AMMA's line, qualifies
>    inbound interest, books demos, and can do outbound demo follow-ups.
> 2. **AI Front-Desk + Booking Agent for clients** (sellable) — a new Fina Calle OS
>    module: a 24/7 AI that answers the phone **and books real appointments into the
>    business's own scheduling / POS system**, then hands off to a human when needed.
>    Works across **appointment-based local businesses** — restaurants
>    (reservations/orders), **pet groomers**, salons / barbers / nails / spas, auto
>    repair, dental/clinics.
> Both share the same engine; per-client differences are a **Knowledge Pack**
> (greeting, services, hours, FAQ, routing) + a **booking connector** — same
> Managerial-Factory model (one frozen engine, per-client variables).

## Why it sells (the ROI pitch)
- **~43% of restaurant calls go unanswered** (industry average); AI answering shows
  **~87% fewer missed calls** and **$3k–18k/mo additional revenue captured per
  location**; ~34% of restaurants already use AI for guest comms. The pitch writes
  itself: *"You're missing ~4 of every 10 calls — that's reservations and orders
  walking away. This answers all of them, 24/7, in your brand's voice."*

## What the client bot does (v1 scope)
Answers every call on the first ring, 24/7, and — the key capability — **books the
appointment into the business's existing system**, reading live availability and
confirming before it hangs up. Plus hours/services/pricing FAQ, after-hours +
overflow, and **warm hand-off / take-a-message** for anything out of scope. Logs
every call + outcome. Per vertical:
- **Restaurants:** reservations + takeout orders (read-back), catering capture.
- **Pet groomers:** book grooming slots, capture pet/breed/size + pickup-drop-off.
- **Salons / barbers / spas:** book a service with the right stylist + duration.
- **Auto / clinics:** book a service/appointment, capture vehicle/patient basics.
_(v1 avoids taking card payments by voice — PCI risk; send a hosted pay link instead.)_

## Best-quality setup (the recommendation)
**Latency is the quality bar:** under ~700ms feels conversational; the best stacks
land **~550–620ms**. Two viable architectures:

**(1) Managed agent platform (recommended to start) — fastest path, production-grade.**
- **Retell AI** — best all-around for production call automation (~620ms out of the
  box, ~$0.07/min platform + components, SOC 2 / HIPAA on standard); **or**
  **ElevenLabs Conversational AI** — best voice quality, all-in ~$0.08–0.24/min; **or**
  **Vapi** — most flexible (BYO providers) if we want to tune the stack.
- **Telephony:** a **Twilio** (or Telnyx) phone number / SIP trunk into the platform
  (Retell→Twilio SIP can be live in ~45 min).
- **Brain:** the platform orchestrates STT→LLM→TTS; we supply the **Knowledge Pack**
  + tools (check availability, create reservation/order, send pay link).

**(2) BYO orchestration (later, at scale, for margin/control).**
- **Twilio/Telnyx** (telephony) → **Deepgram Nova** (STT) → **GPT-4o-mini / Claude**
  (reasoning) → **ElevenLabs Flash** (TTS); this exact combo benchmarks ~**550ms**.
- Or the **collapsed speech-to-speech** path (**OpenAI Realtime**) — one model in the
  audio loop, lowest latency, fewer moving parts, but more vendor lock-in.

**Verdict:** start on a **managed platform (Retell or ElevenLabs Conversational AI)
+ a Twilio number** — quality + compliance now, minimal glue. Revisit BYO once volume
makes the per-minute margin worth the engineering.

## Architecture
```
Caller ──► Twilio/Telnyx number/SIP ──► Voice agent platform (STT→LLM→TTS, turn-taking)
                                              │  tools ▲
                                              ▼        │
                 Knowledge Pack (menu/hours/FAQ)   Actions: create reservation / order,
                 + guardrails + persona            send pay link, take message, transfer
                                              │
                                              ▼
                 Fina Calle OS / Client OS (log call, push reservation/order, notify owner)
```
Per-client config = the Knowledge Pack + phone number + routing + **booking
connector**. Everything else (the engine, tools, logging) is shared and frozen.

## Booking / POS integration layer (the key capability)
The bot books via **tool-calling**: it asks an **Integration Adapter** for live
availability, then writes the appointment/reservation back. The adapter is the one
piece AMMA owns; the voice platform just calls its webhook tools
(`check_availability`, `book`, `reschedule`, `cancel`). This keeps the engine frozen
and the per-client work down to "pick the connector + map services."

**Connectors, by how easy + how common (priority order):**
1. **Generic calendars/booking (cover the long tail):** **Cal.com** (most API-/
   webhook-friendly — the standard target), **Google Calendar**, **Calendly**,
   **Acuity**, **Square Appointments**. These alone serve a huge share of salons/
   barbers/auto/clinics.
2. **Vertical systems:**
   - **Pet grooming:** MoeGo, Gingr, PetExec, ProPet (the AI-receptionist incumbents
     integrate exactly these).
   - **Salons/spas:** Vagaro, Booksy, Zenoti, Boulevard, Square Appointments.
   - **Restaurants:** OpenTable, Resy (Tock merging in), SevenRooms; POS Toast/Square/Clover.
3. **Bridge when no/limited API:** **Zapier / Make / n8n** as a connector for systems
   without a clean API.
4. **Universal fallback (so we can sell to ANY system):** **propose-and-confirm** —
   the bot captures the appointment and writes it to the **Fina Calle OS owner
   dashboard + a shared calendar + an SMS to staff**; a human confirms into the closed
   POS. Less magic, but it closes the deal even on locked systems, and upgrades to a
   real connector later.

**Reliability rules:** always **confirm before booking** and **read back** the slot;
on availability conflicts, offer alternatives; never double-book (re-check at write
time); on any adapter failure, fall back to take-a-message + notify — never drop the lead.

## Build-vs-buy
Managed voice platforms (Retell/ElevenLabs/Vapi) already support custom tool-calling
to these APIs — so we **buy the voice engine** and **build the thin Integration
Adapter + the per-client Knowledge/booking config**. That adapter (multi-connector +
the universal fallback) is the durable, reusable asset across every vertical.

## Unit economics (illustrative)
- **Cost:** all-in ~**$0.13–0.31/min** (platform + STT/LLM/TTS + telephony); a typical
  restaurant's answered-call minutes are modest.
- **Market pricing:** $30–250/mo tiers, or ~$0.12/min; specialized cashiers ~$450/mo.
- **AMMA pricing:** **setup fee** (build the Knowledge Pack + number + routing) +
  **monthly** (e.g., $99–299 by volume) **+ usage** beyond an included-minutes bucket.
  COGS is the per-minute platform cost → healthy margin; the value anchor is the
  **$3k–18k/mo recovered revenue**, not the cost.

## Go-to-market
- **Multi-vertical wedge:** the same product sells to **any appointment business** —
  restaurants, **pet groomers**, salons/barbers/spas, auto, clinics. That multiplies
  the TAM well beyond restaurants while reusing one engine. (Pet grooming especially
  has hungry incumbents — validation that the niche pays.)
- **Bundle into Fina Calle OS** as the "AI Front Desk"; it pairs with the digital
  menu/services list and the loyalty/game; the booking connector ties to their POS.
- **Killer demo:** give prospects a **phone number to call** and hear their own
  brand's bot **book a test appointment** — stronger than any visual demo. Feed it via
  the acquisition loop + Restaurant Depot/field flyers ("call this number to hear it").
- **Lead-in metric:** pull their Google/Yelp "calls" + the missed-call stat to size
  lost bookings.

## Compliance & safety (must address)
- **AI disclosure** — state it's an automated assistant where required.
- **Call recording consent** — **two-party-consent states** (e.g., CA, FL) need a
  notice/consent; play a disclosure. Virginia is one-party, but clients may operate
  elsewhere — make disclosure configurable/on by default.
- **TCPA** — outbound calling/automated dialing is heavily regulated (consent,
  do-not-call); **start inbound-only**, treat outbound as a separate, gated phase.
- **No card-by-voice** in v1 (PCI) — send a hosted pay link instead.
- **Hallucination control** — constrain answers to the Knowledge Pack; "I'm not sure,
  let me take a message / transfer" fallback; never invent menu items/prices.
- **Human hand-off** always available.

## MVP → roadmap
1. **v0 (AMMA's own line):** Retell/ElevenLabs + a Twilio number — answers, qualifies,
   books a demo into **Cal.com** (proves end-to-end booking). Dogfood it; it becomes
   the live sales demo.
2. **v1 (first booking client):** inbound front desk + **one booking connector**
   (Cal.com or Google Calendar) — check availability, confirm, book, notify owner;
   FAQ + take-a-message; disclosure + logging. Pick a pet-groomer or salon pilot.
3. **v2 — connector breadth:** add Square Appointments + Acuity/Calendly, then a
   vertical system (MoeGo/Gingr for pet; OpenTable/Resy for restaurants); ship the
   **propose-and-confirm fallback** so we can sell to any system; call analytics in
   the owner dashboard; pay link for orders.
4. **v3:** gated outbound (confirmations / wait-list / no-show callbacks) with full
   TCPA controls; **EN/ES** bilingual for the local segment.

## Risks
Voice quality on noisy lines/accents; POS/reservation integration depth; latency
regressions; per-minute cost creep at volume; regulatory (recording/TCPA) — keep
inbound-first + disclosure on. Mitigate hallucination with strict knowledge-grounding
+ hand-off.

## Sources
- Booking/POS integration: cal.com/ai, voiceinfra.ai, voiceflow.com (Cal.com agent),
  agentzap.ai + fetchdeskai.com (pet groomers → MoeGo/Gingr/PetExec), zenoti.com,
  callbirdai.com (salons/spas), opentable.com + resy.com + hostie.ai (restaurant POS/
  reservations), squareup.com / vagaro.com / booksy.com / acuityscheduling.com.
- Platform/latency/cost: retellai.com (best voice AI providers; Vapi/Bland/Retell),
  digitalapplied.com, softcery.com (cost calculator), inworld.ai, deepgram.com,
  hamming.ai (stack selection), medium.com (OpenAI Realtime collapses the stack).
- Restaurant market + ROI: revsquared.ai, loman.ai, slang.ai, cloudtalk.io,
  bitebuddy.ai, leadlock.ai (missed-call % + revenue + pricing).
