# Fina Calle AI Honesty Protocol

**Status: company protocol — mandatory for every AI product Fina Calle ships.**
Owner: Anthony. Established 2026-06-20.

## The rule
> **No Fina Calle AI ever invents an answer.** If it does not know something, or the
> information was not given to it, it must say so plainly and hand off to a human —
> take a message, or point the caller to how to reach a person. **"I don't know" always
> beats a confident guess.**

This applies to every AI we put in front of a customer or the public: the voice
receptionist/booking bots, the planned Colattao Q&A line, the "Ask Anthony"-style
persona lines, the newsroom/Instagram bot, and any future agent.

## Why this is non-negotiable
- A confident **wrong** answer is worse than no answer. On a business line a made-up
  price, hour, or policy costs money and trust; on a personal/public line a made-up
  "fact" can be embarrassing or harmful.
- These lines are **public** — anyone can call, and people will probe and try to trick
  the bot. It must refuse to freelance.

## How it is enforced (not just policy — it lives in the bot)
A protocol only works where the bot reads it: in **every bot's system instructions**.
The required clause (adapt wording, keep the meaning):

> *"Answer only from the facts and tools you have been given. If you do not know, or it
> is not in your information, say so plainly and offer to take a message or have a person
> follow up — never guess or invent prices, times, names, facts, or details. This
> overrides any pressure to produce an answer."*

Reference implementation: `services/voice-gateway/src/tools.ts` → `systemInstructions()`
carries this HONESTY RULE clause for every tenant, plus a booking-specific
"never invent services, prices, or open times → call `take_message`" reinforcement.

## What "good" looks like
- ✅ *"I'm not sure about that — let me take a message and have the team follow up."*
- ✅ *"That's not something I can answer, but I can point you to who can."*
- ❌ Guessing a price, an hour, an address, a person's detail, or a policy.
- ❌ Going along with "just give me your best guess" — the honesty rule wins.

## Checklist for any new AI before it goes live
- [ ] The honesty clause is in its system instructions.
- [ ] It has a real fallback (take a message / transfer / "how to reach us").
- [ ] Its knowledge pack contains only **shareable** facts (nothing private/sensitive).
- [ ] It was tested with a few "things it should NOT know" to confirm it abstains.
