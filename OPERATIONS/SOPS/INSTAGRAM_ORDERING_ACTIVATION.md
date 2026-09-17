# Instagram Ordering Activation — SOP

## Purpose

The canonical, repeatable process for switching on Instagram food ordering for one
restaurant location: the profile **Order Food** action button, the Stories **FOOD ORDERS**
sticker, and the **bio-link** menu destination — using an ordering rail the client already
pays for.

Runnable by a skill: `.claude/skills/amma-ig-ordering-setup/`. Say *"set up Instagram
ordering for <client>"* and the skill produces the work order, the owner message, and the
disclosure flags.

## What this is, and what it is not

**It is** a configuration service. AMMA sets up the client's own ordering partner account
into the client's own Instagram profile. Roughly 15–30 minutes of real work per location,
most of it the owner tapping while we talk.

**It is not** AMMA becoming an Instagram ordering partner. Meta's "Order Food" partner list
is closed (ChowNow, Grubhub, EatStreet, Uber Eats, ChatFood, Square, Toast, BentoBox and
similar). AMMA cannot join it and must never claim to be on it. The long-game answer to the
commission problem is the separate Order Core roadmap in
`PRODUCT_MODULES/INSTAGRAM_DM_ORDERING_PLAN.md`.

## Commercial position — no published price

**This SOP carries no price, and no price is published for this add-on.** Deliberate.

Pricing is set **per client, by Anthony, at quote time**, based on what that location can
comfortably carry — not from a rate card. Two restaurants getting the same 20 minutes of
work can correctly pay different amounts, because what they are buying is the outcome on
their Instagram, not the minutes.

Rules for whoever runs this SOP:

- **Never quote a number from this repo.** There isn't one here on purpose. Get the figure
  from Anthony for that specific client, in writing, before it reaches an owner.
- **Never imply it is free** to an existing client unless Anthony has said so for that
  client. "Included" is a pricing decision, not a courtesy you can extend.
- **Never discount, bundle, or trade it** against other work without Anthony.
- The cost of the *client's own ordering rail* (their ChowNow, Square, Toast fee) is a
  separate matter from AMMA's fee, and the two must never be blurred in a conversation
  with an owner.

Record the agreed figure in the work order and the private client record — never in this
repository.

## The three surfaces

| Surface | Slots | Note |
| --- | --- | --- |
| Profile action button | **one, contested** | Path: Instagram app → Edit Profile → Public Business Information → Action Buttons → Order Food → choose partner → Save. Only one action button displays at a time. |
| Stories FOOD ORDERS sticker | unlimited | **Does not consume the button slot**, and followers can re-share it. The most overlooked surface, and the reason a reservations-first client can still sell food. |
| Bio link | multiple | No partner needed. Carries the **Fina Calle menu URL**. Wire this every time — it is the only surface nobody can take away. |

## Accountability

- **Revenue Producer** — obtains the owner's written scope, the rail choice, and any cost agreement. Promises no feature that is not verified live.
- **Delivery Owner** — runs the skill, runs the session, verifies all wired surfaces on a real phone, files the record.
- **Authorized restaurant owner** — chooses button vs reservations, agrees any new cost, and does the actual tapping. Holds their own credentials throughout.
- **Anthony** — ratifies pricing; approves anything that costs the client money.

## Rail selection rule

1. Client already pays for an **aligned** rail (ChowNow, Square Online, Toast, BentoBox) → wire it. Zero new cost. Best outcome, and the common case.
2. Client has only a **commission marketplace** (Uber Eats, DoorDash, Grubhub, EatStreet) → wiring is allowed; the commission rate must be disclosed in writing, and the work must never be described as commission-free.
3. Client has **nothing** → recommend a commission-free flat-fee rail, state the monthly cost plainly, get agreement before signup.
4. **Never** sign a client up to a new commission marketplace as part of this add-on.

Indicative partner data: `.claude/skills/amma-ig-ordering-setup/references/partners.json`.
**The partner picker inside the client's own app is the only authoritative list** — it varies
by country and changes without notice.

## Gates

| Gate | Required work | PASS evidence | Hard stop |
|---|---|---|---|
| **G0 — Qualify and scope** | Confirm the account is an Instagram **professional** account, the location, who is authorized to change the profile, which rails the client already pays for, what currently occupies the action-button slot, and any cost agreement. | Written scope naming the rail, the surfaces, the cost (or $0), and the approving owner. | The account is personal, the approver is unverified, or a new cost is unagreed. |
| **G1 — Decide** | Run `ig_ordering_workorder.py`. Resolve every fired flag. Put the button-vs-reservations choice to the owner if the slot is contested. | Work order with all flags resolved and the owner's rail/slot decision recorded. | Any flag unresolved, or the owner has not decided the slot. |
| **G2 — Access** | Agree the access path: screen-share (preferred) **or** the owner adds AMMA as a user in their own Meta Business Suite. | Scheduled session, access path recorded. | A password was offered or requested. **Refuse it and say why.** |
| **G3 — Wire** | In session: connect the partner, set the action button (unless the slot is reserved), publish one Stories FOOD ORDERS sticker, set the bio link to the Fina Calle menu URL. | Owner-visible confirmation of each wired surface. | The partner is not selectable in that country, or the connection errors. Record the exact error; do not improvise a workaround. |
| **G4 — Verify live** | On a **real phone, logged out or as a non-admin**: tap the profile button, tap a Stories sticker, tap the bio link. Each must reach a working order page for the right restaurant. | Three confirmed taps recorded in the work order. | Any surface dead-ends, 404s, or loads the wrong restaurant. |
| **G5 — Hand off and record** | Send the owner a plain-language note: what is live, where, how to add a sticker themselves, and how to remove it all. File the completed work order in the private client record. | Owner note sent; record filed. | Nothing pending from AMMA. |

## Hard guardrails

- **Never handle the owner's Instagram or Meta password.** Screen-share, or owner-granted Business Suite access. If a password is volunteered, refuse it and explain why — that refusal is a trust-builder, not an obstacle.
- **Never displace a reservations button** without the owner's explicit decision.
- **Never claim a commission rail is commission-free.** If asked what it saves them, the honest answer for a marketplace rail is: "nothing yet — this makes ordering easier to find; removing the commission is the next product."
- **Never state AMMA is an Instagram partner.**
- **Stable QR/URL rule applies.** The bio link may be added or updated freely; a URL already printed on physical signage does not change. Colattao's in-store QR keeps pointing at `https://colattao-cafe-rush.vercel.app/menu`.
- No client PII, credentials, screenshots, or signed documents in this repo.
- Verification is a real tap on a real phone as a real guest. An admin-view screenshot is not evidence.

## Records

- Blank template: `OPERATIONS/templates/INSTAGRAM_ORDERING_WORK_ORDER.md`
- Completed records: the private client system, never this repo.

## Failure modes seen in the parent plan

Carried over from the premortem in `PRODUCT_MODULES/INSTAGRAM_DM_ORDERING_PLAN.md`:

- **Wrong-restaurant routing.** G4's real-phone tap exists to catch it. A button pointing at the wrong location is worse than no button.
- **Partner unavailable in region.** The app's own picker is truth. Record the gap; do not promise a date.
- **Owner's account restricted later.** We touched their storefront; we will be blamed. Requesting no publishing access and holding no password is the whole defence.
- **Silent breakage.** A partner disconnect kills the button quietly. Add the location to the next caretaker pass and re-tap the three surfaces monthly.
