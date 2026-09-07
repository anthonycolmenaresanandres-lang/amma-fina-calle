# Module Library

Reusable modules planned for AMMA/Fina Calle:

- Digital Menu
- Mini Game (customization governed by `GAME_CUSTOMIZATION_PROTOCOL.md`; first package: Penalty Shootout)
- Website Concept
- Owner Command Center
- Request Intake
- QR/Sticker Package
- Hosted Billing Links
- Analytics Report
- Seasonal Campaigns
- AI Company Scheduler (R&D — concept `AI_COMPANY_SCHEDULER_CONCEPT.md` + build
  spec `AI_COMPANY_SCHEDULER_SPEC.md`; AI staff scheduling that weighs sales/events/
  sentiment/lifecycle; owner-driven, needs labor-law + data-security design before build)
- AI Phone Assistant / Call-Center Bot (plan `AI_PHONE_ASSISTANT_PLAN.md`; 24/7 AI
  receptionist for reservations/orders/FAQ — sellable Fina Calle OS module + AMMA's
  own line; recommended setup: Retell/ElevenLabs + Twilio; inbound-first, disclosure on)
- AI Front-Desk Check-In (R&D — plan `AI_FRONT_DESK_CHECKIN_PLAN.md`; lets an AI
  assistant handle attendance check-in for an already-registered person arriving to a
  league game/class/camp — not new-account registration, not building/door access;
  deterministic rules-pack evaluator (identity/roster/time-window/waiver/hold/guardian
  checks) built and unit-tested in `services/voice-gateway/src/checkin/`, but not wired
  into any live phone/chat tool; real go-live is blocked on the client's booking-system
  API access, which has no committed timeline — planned/in development only)
- Instagram DM Ordering / Order Core (PLANNED — plan `INSTAGRAM_DM_ORDERING_PLAN.md`;
  turns a client's Instagram DMs into a commission-free ordering channel. Key decision: build
  a transport-agnostic **Order Core** with hosted Stripe Connect checkout first — it earns from
  QR/link-in-bio with no Meta dependency — then attach Instagram DM as one transport. Meta's
  "Order Food" button is a closed partner list and is not available to AMMA; out-of-window
  order-status DMs are impossible since the 2026-04-27 message-tag deprecation, so status goes
  by SMS/email. Nothing built; blocked on Anthony for the Meta app, Stripe Connect, and pricing)
- Fina Calle SoundGate (R&D — concept `FINA_CALLE_SOUNDGATE_CONCEPT.md`; human turn-taking
  layer for the phone assistant: listen/wait/ignore-noise/stop/ask-to-repeat. First slice
  shipped in `services/voice-gateway` — the `bargeInMinMs` barge-in debounce over the
  gateway's client-owned floor control; full noise-intelligence layer is a premium tier
  for noisy venues, next voice bet after VBFH)
