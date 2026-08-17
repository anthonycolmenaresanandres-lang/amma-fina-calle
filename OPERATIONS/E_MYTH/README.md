# The Fina Calle Org — E-Myth applied to AMMA Ventures

_Created 2026-08-17. The organizational layer for the Managerial Factory thesis
already stated in `BUSINESS/AMMA_VENTURES_BUSINESS_PLAN.md`._

## What this is

Michael Gerber's E-Myth method applied to AMMA Ventures LLC (DBA Fina Calle):
an organizational chart of **positions**, a **Position Contract** for each one, an
**AI personality** that holds it, and a **scheduled runtime** that runs the whole
thing on a clock instead of on the owner's attention.

> ## ⚠ Revision 2 — read `05_SAFETY_CORRECTIONS.md` first
>
> Adversarial review of `3dadb98` upheld seven defects in the automation plan.
> The **organizational analysis is unaffected** — twelve positions, the contracts,
> the departments, the eight reserved actions and the 11-of-12 diagnosis all stand.
> What changed is the automation runway: the caretaker is **dark**, not live;
> ledgers move into git; approvals bind to an artifact hash; the inspector becomes
> deterministic-first; and "ROI" is corrected to "engagement activity."
> **File 05 overrides files 01–04 wherever they conflict.**

## Read in this order

| File | What it answers |
|---|---|
| [`05_SAFETY_CORRECTIONS.md`](05_SAFETY_CORRECTIONS.md) | **Read first.** The seven upheld defects, the corrected rollout, and the adversarial gate |
| [`01_ORGANIZATION.md`](01_ORGANIZATION.md) | Primary Aim · Strategic Objective · the org chart · the 10 departments · the 8 things that can never be automated |
| [`02_POSITION_CONTRACTS.md`](02_POSITION_CONTRACTS.md) | **The list of responsibilities** — every position's result, accountabilities, KPI, and automation grade (A1–A4) |
| [`03_AI_STAFF.md`](03_AI_STAFF.md) | The 11 AI personalities: mandate, ledger, tools, refusal rules, wake schedule |
| [`04_AUTOMATION_ROLLOUT.md`](04_AUTOMATION_ROLLOUT.md) | The runtime · the daily shift · **the Owner Input Budget** · 5 build phases · verified gaps |

## The diagnosis, in one table

Anthony's name is currently in **11 of 12** boxes on the org chart. One box
(Platform) is genuinely systematized. One box (Intelligence) is empty — which is
exactly why MRR, churn, CAC, and demo→close rate are all *unknown*.

## The staff

| Agent | Department | Replaces the owner in |
|---|---|---|
| 🤖 **MAYORDOMO** | Orchestration | starting and sequencing the day |
| 🤖 **EXPLORADOR** | Marketing | finding and ranking prospects |
| 🤖 **RETRATISTA** | Marketing | building tailored branded demos |
| 🤖 **PREGONERO** | Marketing | brand, content, case studies |
| 🤖 **CIERRE** | Sales | preparing every close |
| 🤖 **TALLER** | Production | assembling Campaign Packs |
| 🤖 **CONSERJE** | Client Success | the help desk and value reviews |
| 🤖 **CONTADOR** | Finance | reconciliation and cash truth |
| 🤖 **MECÁNICO** | Platform | keeping production green *(partially live today)* |
| 🤖 **ADUANA** | Quality | being the last pair of eyes *(build first)* |
| 🤖 **BRÚJULA** | Intelligence | knowing what is actually true *(build first)* |

## The point of the whole thing

> Anthony's total operating input becomes **one ten-minute digest per weekday**,
> one thirty-minute steering pass per week, and **eight reserved decisions** that
> are legally or practically his — secrets, access, money, signatures,
> relationships, production publishes, and any claim about a customer's results.

Everything else runs on a schedule, writes to a ledger, passes an inspection
gate, and reports itself.

## Governing constraints (inherited, not optional)

- `CLAUDE.md` — no agent handles secrets, grants access, publishes/sends, or ships to `main`.
- `AI_HONESTY_PROTOCOL.md` — no agent invents an answer; "I don't know" beats a confident guess.
- `OPERATIONS/AMMA_OPTIMIZATION_REGISTER.md` — every fact is labeled verified / inference / unknown; an unknown is never converted to zero.
- Stable QR URLs, approved real logos only, non-human mascots, primitive fallback preserved.
