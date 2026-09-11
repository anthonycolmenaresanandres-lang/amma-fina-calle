---
name: amma-ig-ordering-setup
description: Activate Instagram food ordering for one AMMA / Fina Calle restaurant client — the profile Order Food action button, the Stories FOOD ORDERS sticker, and the bio-link menu destination — using an ordering partner the client already pays for. Use whenever Anthony says to set up, wire, turn on, or check Instagram ordering, the Order Food button, or Instagram order stickers for a named restaurant, or asks which ordering partner a client should use. Produces a per-client work order, the owner-facing message, and the disclosure flags; never handles the owner's Instagram password.
---

# Instagram Ordering Activation

One-visit add-on: make a client's Instagram profile actually sell food, using the ordering
rail they already pay for. Canonical procedure: `OPERATIONS/SOPS/INSTAGRAM_ORDERING_ACTIVATION.md`.

**AMMA is not an Instagram ordering partner and cannot become one.** Meta's "Order Food"
partner list is closed. This skill does not change that. What it does is configure the
client's own partner account into the client's own Instagram profile — a setup service, not
a platform. Never tell an owner or a prospect that AMMA is an Instagram partner.

## Run the router first

```powershell
python .claude/skills/amma-ig-ordering-setup/scripts/ig_ordering_workorder.py `
  --client "<exact client name>" `
  --has <rail the client already pays for>  `
  --slot <partner currently in the action-button slot, if any> `
  --menu-url "<the client's Fina Calle menu URL>"
```

Repeat `--has` for each rail they already have. Add `--prefer <rail>` only when the owner
has explicitly chosen one. `--json` for machine output; `--list-partners` to see known rails.

The script is deterministic and offline. It decides the rail, the surfaces, and the
disclosures. **Do not override its flags from memory** — if a flag fires, it is a gate.

## The three surfaces

| Surface | Slots | Why it matters |
| --- | --- | --- |
| Profile action button | **one, contested** | The obvious one. Reservations compete for the same slot. |
| Stories FOOD ORDERS sticker | unlimited | **Does not consume the button slot**, and followers can re-share it. This is the surface most people miss, and it is why a reservations-first client can still sell food. |
| Bio link | multiple | Needs no partner at all. This is where the **Fina Calle menu** goes, so the add-on feeds the core product instead of competing with it. |

Wire the bio link on **every** engagement, even when no partner rail is available. It is the
one surface that cannot be taken away.

## Rail selection rule (do not improvise)

1. Client already pays for an **aligned** ordering rail (ChowNow, Square Online, Toast, BentoBox) → wire that. Zero new cost. Best outcome.
2. Client has only a **commission marketplace** (Uber Eats, DoorDash, Grubhub, EatStreet) → wiring it is allowed, but the commission must be disclosed in writing and the setup must never be described as commission-free.
3. Client has **nothing** → recommend a commission-free flat-fee rail and state the monthly cost plainly. Get agreement before any signup.
4. **Never** sign a client up to a new commission marketplace as part of this add-on. That contradicts the Fina Calle pitch and will be resented later.

## Hard guardrails

- **Never take the owner's Instagram or Meta password.** Two lawful paths only: a screen-share where the owner does the tapping, or the owner adds AMMA as a user in their own Meta Business Suite. Refuse a volunteered password and say why.
- **Never displace a reservations button** without the owner's explicit decision. For a sit-down room a booking is usually worth more than a takeout tap.
- **The partner picker in the client's own app is the only authoritative list.** It varies by country and changes without notice. Verify live; never quote this repo's partner table to an owner as current fact.
- **Never claim a commission rail is commission-free.** If asked "what does this save me?", the honest answer for a marketplace rail is "nothing yet — this makes ordering easier to find; the commission-free version is the Order Core roadmap."
- Do not commit client PII, credentials, account screenshots, or signed documents. Completed work orders go to the private client record.
- No pricing promise, signup, deploy, send, or account change without Anthony. This skill prepares; Anthony acts.

## Relationship to the Order Core plan

`PRODUCT_MODULES/INSTAGRAM_DM_ORDERING_PLAN.md` is the long game: AMMA's own order rail
(Order Core + hosted checkout), where the commission genuinely goes to zero. These are a
ladder, not rivals:

- **This skill = today.** Their rail, their cost, 15 minutes, immediate visible win, builds trust.
- **Order Core = later.** AMMA's rail, removes the commission, the real upsell.

Use the first to earn the right to sell the second. Never pitch them as the same thing.

## Output

One work order per client containing: the chosen rail and why, the surfaces to wire, every
fired flag, and the owner-facing message. Hand Anthony the flags first — they are the part
that needs a human decision.
