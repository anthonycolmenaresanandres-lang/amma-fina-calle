# AI Front-Desk Check-In — plan (v0, not yet built)

> **Status: PLAN ONLY.** Nothing in this doc is wired up yet. First concrete client:
> Virginia Beach Field House (`vbfh-info` tenant, `services/voice-gateway/`), whose
> system of record is **DaySmart Recreation ("the Dash")**. The design generalizes to
> any client running a rec-management / gym / studio platform with an API, the same
> way the booking engine generalizes across Cal.com/Square/webhook.

## What "sign people in" means here (scoping the ask)

Three different things could be meant by "sign people in" — picking the wrong one
changes the whole design, so this plan scopes it explicitly:

1. **New account/league registration** — already solved: the assistant points callers
   to the DaySmart self-service portal (`apps.daysmartrecreation.com/dash/x/#/online/...`).
   Not in scope here.
2. **Attendance check-in** — an *already-registered* person/team arrives for tonight's
   game, class, or camp session and needs to be marked present / let onto the floor.
   **This is the scope of this plan.**
3. **Building/access control** (turnstile, door lock) — not assumed in scope; VBFH's
   need reads as attendance/roster check-in, not physical access hardware.

## The core principle (same one the booking engine already uses)

The voice/chat model **never decides** whether a check-in is valid. It gathers facts
via tool calls; a **deterministic rules layer**, written in code, evaluates a fixed
checklist against live data from the Dash; only an **all-pass** result commits a
check-in, and the commit itself is **idempotent** (checking in twice is a no-op, never
double-attendance). Any rule that fails, or any input the assistant can't verify with
certainty (fuzzy name match, unclear audio, disputed identity), is **not resolved by
the AI** — it's calmly explained to the person and **handed to the human at the front
desk** with the specific reason, the same way `take_message` + `notifyStaff` already
hand off a booking the AI can't complete. Nuance is a front-desk decision. Rule
evaluation is not.

This mirrors the existing `orchestrator.ts` shape exactly: `hold_slot` /
`confirm_booking` become `verify_checkin` / `commit_checkin`; the swappable
`BookingConnector` interface gets a sibling `CheckInConnector`; `take_message` +
`notifyStaff` become the escalation path when rules fail.

## What already exists on DaySmart's side (confirmed by research, re-verify before building)

- **Dash API** — a documented JSON:API-spec API (filtering, pagination, relations).
  Access requires a staff account with the **"API Key Management"** authorization to
  create a key. Docs: `help.daysmartrecreation.com/en/articles/9302111-daysmart-recreation-api`.
  Support contact for integration questions: `rec-it@daysmart.com`.
- **Native Check-in Kiosk** — DaySmart already ships a Check-in Kiosk feature:
  "customers check into facilities or events using valid memberships or passes" with
  automated attendance tracking, "without staff involvement." Docs:
  `help.daysmartrecreation.com/en/articles/9302349-kiosk-types-and-configuration`.

**Implication:** we may not need to build a walk-up check-in device at all — DaySmart
already sells one, and it already enforces its own rules (valid membership/pass) before
letting someone through. The AI's job is narrower and more valuable than reinventing
that: (a) a **phone/chat concierge layer** that pre-verifies eligibility and answers
"can I check in for tonight" before someone drives over, and (b) a **fallback/relay**
for cases the kiosk can't handle (no card on hand, forgot which session, roster dispute)
that still never adjudicates — it escalates.

## Phase 0 — research & access (blocks everything else; not code)

- [ ] Confirm whether VBFH already has Dash API access, or request a key from a staff
  account with "API Key Management" — **this is an Anthony/VBFH-admin action**, not
  something buildable from here.
- [ ] Pull the actual Dash API reference once a key exists and confirm it exposes:
  member/roster lookup, session/schedule lookup, waiver/liability-form status,
  account-hold/balance flags, and a write endpoint for attendance/check-in (or confirm
  it does **not**, in which case check-in stays kiosk-only and the AI's role is
  pre-verification + relay only, never a direct write).
- [ ] Confirm with VBFH whether the Check-in Kiosk feature is already turned on at the
  front desk — if not, turning it on may cover most of the walk-up need with zero
  custom code, and this plan's AI layer becomes purely the phone/pre-arrival piece.
- [ ] Confirm the channel: extend the existing phone line ("check me in for tonight"),
  add a front-desk tablet/kiosk **chat** surface, or both. Recommendation: phone line
  first (reuses 100% of existing infra, zero new hardware); kiosk chat later if the
  native Check-in Kiosk doesn't cover a real gap.

## Architecture (extends the existing 5-plane design, doesn't replace it)

```
Caller/arrival → Voice/chat surface → Orchestrator → Rules layer (deterministic) → CheckInConnector → Dash API
                                            ↑                    ↓ (any rule fails)
                                       LLM proposes tool calls    Escalate to front-desk staff (notify + explain)
```

- **`CheckInConnector` interface** (new, sibling to `BookingConnector` in
  `src/adapter/types.ts`):
  ```ts
  interface CheckInConnector {
    readonly name: string;
    findParticipant(args: { name?: string; phone?: string; memberId?: string }): Promise<Participant[]>;
    getTodaysSessions(args: { participantId: string }): Promise<Session[]>;
    getEligibility(args: { participantId: string; sessionId: string }): Promise<EligibilitySnapshot>; // waiver, roster, hold flags — read-only, from the Dash
    checkIn(args: { participantId: string; sessionId: string; idempotencyKey: string }): Promise<CheckInResult>; // MUST be idempotent
  }
  ```
  First implementation: a `daysmart` connector against the Dash API. Until Phase 0
  confirms a write endpoint exists, ship a **`proposeConfirm`-style fallback**
  identical in spirit to the booking engine's universal connector: the AI verifies
  eligibility and stages a **pending check-in**, and pings front-desk staff to tap it
  through the native kiosk/Dash UI — never invents a check-in the Dash doesn't record.

- **New tools** (`src/tools.ts`, same function-calling contract as booking):
  - `find_participant` — read-only lookup by name/phone, always reads back an exact
    match before proceeding (never assumes on a fuzzy match).
  - `verify_checkin` — read-only: runs the deterministic rules pack against live Dash
    data for one participant + one session; returns pass/fail + the specific reason(s).
  - `commit_checkin` — only callable after a `verify_checkin` pass; idempotent on
    `(participantId, sessionId)`; on retry/duplicate, returns "already checked in."
  - Reuses the existing `take_message` unchanged as the escalation vehicle.

- **Rules pack — deterministic, versioned, code (not a prose instruction to the LLM)**,
  every check evaluated in `verify_checkin`, ALL must pass to commit:
  1. **Identity match** — participant resolved to exactly one Dash record; no action on
     an ambiguous/multiple match (route to front desk).
  2. **Roster match** — participant is on the roster/registration for *this specific*
     session (team, division, class, or camp) pulled live — not "a member somewhere."
  3. **Time window** — check-in only valid inside a defined window relative to that
     session's real scheduled start/end (e.g., 60 min before through session end),
     read from the live Dash schedule, never guessed or recited from memory.
  4. **Waiver on file** — current signed liability waiver present; missing/expired blocks.
  5. **Account standing** — no blocking balance/hold flag on the account (if the Dash
     exposes one); a flag blocks — the AI never negotiates or overrides a financial hold.
  6. **Minors** — a minor's check-in requires an authorized guardian already on file
     (per Dash's own guardian/pass rules); any ambiguity here is a hard block, always
     to a human — the AI does not make custody/guardianship judgment calls, period.
  7. **Idempotency** — same participant + same session twice → no-op, returns the
     existing check-in, never double-counts attendance.

- **Escalation protocol (any rule fails, or confidence is low)** — mirrors
  `takeMessage`/`notifyStaff` exactly:
  1. State the specific, honest reason in plain language ("I don't see a signed waiver
     on file for tonight" / "I'm not able to match that to one roster" / "that's outside
     tonight's check-in window").
  2. Never argue, override, or "figure it out" on the caller's behalf.
  3. Fire a real-time front-desk alert (reuse `notifyStaff`) with the participant's
     claimed identity, the session, and the exact blocking reason, so a human is already
     briefed when the person reaches the desk.
  4. Tell the caller: "Head to the front desk and they'll get you sorted."

## Guardrails (carried over from project memory, apply in full here)

- This never touches AMMA's own **Client OS** (`/m/[id]`, `/owner/[id]`, `/customers`),
  Supabase, Stripe, POS, or secrets — the Dash is a **separate third-party system**
  and remains the system of record; we read/write through its API only, we don't
  mirror or store member PII, waiver documents, or payment data on our side beyond
  what's needed for one call's audit trail (same `store.audit` pattern already used
  for bookings).
- No card-by-voice, no payment adjudication, no waiver signing over the phone — those
  stay human/Dash-native.
- Every check-in attempt (pass, fail, or escalated) is audited: who, when, which rule
  failed if any, session ref — same discipline as `draft.create` / `order.commit`.

## Rollout sequence

1. **Phase 0 (Anthony/VBFH action):** get Dash API access; confirm kiosk-on status;
   pick the channel. Nothing downstream can start without this.
2. **Phase 1 (buildable once API access exists):** `CheckInConnector` + `daysmart`
   connector (read-only: findParticipant, getTodaysSessions, getEligibility) + the
   rules pack, unit-testable against recorded fixtures the way `npm run simulate`
   proves the booking loop today.
3. **Phase 2:** wire `verify_checkin` into the phone line as a new capability
   ("can you check me in for tonight's 7:10 game") — read-only, pure Q&A, zero write
   risk, ships value immediately even with no write endpoint.
4. **Phase 3:** add `commit_checkin` **only if** the Dash API confirms a real
   attendance-write endpoint; otherwise ship the pending-check-in + front-desk relay
   fallback (mirrors `proposeConfirm`) so front-desk staff always taps the final action
   through the Dash/kiosk themselves.
5. **Phase 4 (optional):** front-desk kiosk **chat** surface, only if Phase 0 finds a
   real gap the native Check-in Kiosk doesn't cover.

## Open assumptions to confirm with Anthony

- "The dash" = DaySmart Recreation (high confidence — it's already the system named
  throughout the `vbfh-info` knowledge pack and its portal URL). "Operating system" is
  read here as *VBFH's front-desk/check-in system*, not AMMA's own Client OS product —
  flag immediately if that's wrong.
- "Sign people in" = attendance check-in for an existing registration, not new-account
  registration (already handled) and not physical building access control.
- Channel priority: phone line first, kiosk chat only if needed — redirect if a
  front-desk tablet experience is actually the priority.
