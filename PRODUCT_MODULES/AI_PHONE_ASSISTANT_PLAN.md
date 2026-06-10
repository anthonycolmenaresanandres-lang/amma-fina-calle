# AI Phone Assistant & AI Call-Center Bots — plan + best-quality setup

> **Status: PLAN / R&D.** Two products on one voice stack:
> 1. **AMMA's own AI phone assistant** (internal) — answers AMMA's line, qualifies
>    inbound interest, books demos, and can do outbound demo follow-ups.
> 2. **AI Receptionist / Call Bot for clients** (sellable) — a new Fina Calle OS
>    module: a 24/7 AI that answers a restaurant's phone — reservations, orders,
>    hours/FAQ, catering — and hands off to a human when needed.
> Both share the same engine; per-client differences are just a **Knowledge Pack**
> (greeting, menu, hours, FAQ, routing) — same Managerial-Factory model as the rest.

## Why it sells (the ROI pitch)
- **~43% of restaurant calls go unanswered** (industry average); AI answering shows
  **~87% fewer missed calls** and **$3k–18k/mo additional revenue captured per
  location**; ~34% of restaurants already use AI for guest comms. The pitch writes
  itself: *"You're missing ~4 of every 10 calls — that's reservations and orders
  walking away. This answers all of them, 24/7, in your brand's voice."*

## What the client bot does (v1 scope)
Answers every call on the first ring, 24/7: **reservations**, **takeout orders**
(read-back + confirm), **hours/location/menu FAQ**, **catering/large-party
capture**, after-hours + overflow when staff can't pick up, and **warm hand-off /
take-a-message** to a human for anything out of scope. Logs every call + outcome.
_(v1 explicitly avoids taking card payments by voice — PCI risk; send a pay link instead.)_

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
Per-client config = the Knowledge Pack + phone number + routing. Everything else (the
engine, tools, logging) is shared and frozen — interchangeable parts.

## Unit economics (illustrative)
- **Cost:** all-in ~**$0.13–0.31/min** (platform + STT/LLM/TTS + telephony); a typical
  restaurant's answered-call minutes are modest.
- **Market pricing:** $30–250/mo tiers, or ~$0.12/min; specialized cashiers ~$450/mo.
- **AMMA pricing:** **setup fee** (build the Knowledge Pack + number + routing) +
  **monthly** (e.g., $99–299 by volume) **+ usage** beyond an included-minutes bucket.
  COGS is the per-minute platform cost → healthy margin; the value anchor is the
  **$3k–18k/mo recovered revenue**, not the cost.

## Go-to-market
- **Bundle into Fina Calle OS** as the "AI Receptionist" module; it pairs naturally
  with the digital menu (the bot reads the same menu) and the loyalty/game.
- **Killer demo:** give prospects a **phone number to call** and hear their own
  brand's bot — even stronger than the Lead Arcade's visual demo. Feed it via the
  acquisition loop + Restaurant Depot flyer ("call this number to hear it").
- **Lead-in metric:** pull their Google/Yelp "calls" + the 43% missed-call stat to
  size their lost revenue.

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
1. **v0 (AMMA's own line):** stand up Retell/ElevenLabs + a Twilio number for AMMA —
   answers, qualifies, books a demo. Dogfood it; it becomes the live sales demo.
2. **v1 (first client — Colattao):** inbound receptionist — hours/FAQ + reservations
   + take-a-message + owner notification; reads the Client OS menu. Disclosure + logging.
3. **v2:** takeout orders with read-back + pay link; reservation system / POS hooks;
   call analytics in the owner dashboard.
4. **v3:** gated outbound (confirmations/wait-list callbacks) with full TCPA controls;
   multilingual (EN/ES) for the local segment.

## Risks
Voice quality on noisy lines/accents; POS/reservation integration depth; latency
regressions; per-minute cost creep at volume; regulatory (recording/TCPA) — keep
inbound-first + disclosure on. Mitigate hallucination with strict knowledge-grounding
+ hand-off.

## Sources
- Platform/latency/cost: retellai.com (best voice AI providers; Vapi/Bland/Retell),
  digitalapplied.com, softcery.com (cost calculator), inworld.ai, deepgram.com,
  hamming.ai (stack selection), medium.com (OpenAI Realtime collapses the stack).
- Restaurant market + ROI: revsquared.ai, loman.ai, slang.ai, cloudtalk.io,
  bitebuddy.ai, leadlock.ai (missed-call % + revenue + pricing).
