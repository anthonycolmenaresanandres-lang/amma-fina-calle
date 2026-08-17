# The Fina Calle Org — E-Myth applied to AMMA Ventures

_Created 2026-08-17. The organizational layer for the Managerial Factory thesis
already stated in `BUSINESS/AMMA_VENTURES_BUSINESS_PLAN.md`._

## What this is

Michael Gerber's E-Myth method applied to AMMA Ventures LLC (DBA Fina Calle):
an organizational chart of **positions**, a **Position Contract** for each one,
proposed **AI personality** specifications, and a staged runtime design intended
to run eligible work on a clock instead of on the owner's attention. The runtime
controls are not implemented merely because they are documented here.

> ## ⚠ Revision 4 — read `05_SAFETY_CORRECTIONS.md` first
>
> Three rounds of adversarial review. The **organizational analysis is retained**
> — twelve positions, the contracts, the departments, the eight reserved actions
> and the owner-dependency diagnosis remain useful.
>
> The automation runway was corrected three times. R1
> overclaimed (called the caretaker live on a document's say-so). R2 underclaimed
> (called it **dark** after searching only `main`). R3 found the right ref but used
> total ancestry as branch divergence, overstated cadence, and treated a worker-
> authored dashboard as independent runtime proof. **R4 is the measured position:
> 74 status-side commits touch the dashboard from 2026-07-08 to 2026-08-17;
> recurring publishing is observed, while scheduler autonomy, reliability, policy
> compliance, and claim accuracy remain unknown.** Liveness now requires scheduler
> slots, terminal attempt events, and an independent watchdog. Telemetry uses an
> atomic store plus one git publisher; private data stays outside git; Tier 1 must
> PASS, Tier 2 may only veto; and A4 actions remain owner-executed.
>
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

Anthony's name is currently in **11 of 12** boxes on the org chart. Platform is
mapped to the one observed recurring status artifact, but no position has yet
been demonstrated and Revision-4 safety-certified. Intelligence has no durable
shared ledger, which is why MRR, churn, CAC, and demo→close rate remain *unknown*.

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
| 🤖 **MECÁNICO** | Platform | keeping production green *(publishing observed; runtime unproven)* |
| 🤖 **ADUANA** | Quality | being the last pair of eyes *(build first)* |
| 🤖 **BRÚJULA** | Intelligence | knowing what is actually true *(build first)* |

## The point of the whole thing

> The target is **one ten-minute staged digest per weekday**,
> one thirty-minute steering pass per week, and **eight reserved decisions** that
> are legally or practically his — secrets, access, money, signatures,
> relationships, production publishes, and any claim about a customer's results.

Under current governance Anthony opens or delivers the staged digest. A future
agent-send requires both a governing-file amendment and an exact owner-only
channel contract.

When implemented and certified, eligible internal work will run on a schedule,
write to an approved ledger, pass inspection, and report into the staged digest.

## Governing constraints (inherited, not optional)

- `CLAUDE.md` — no agent handles secrets, grants access, publishes/sends, or ships to `main`.
- `AI_HONESTY_PROTOCOL.md` — no agent invents an answer; "I don't know" beats a confident guess.
- `OPERATIONS/AMMA_OPTIMIZATION_REGISTER.md` — every fact is labeled verified / inference / unknown; an unknown is never converted to zero.
- Stable QR URLs; never generate client logos, real faces, or league/event/club marks; game mascots are non-human; approved client-logo overlays and primitive fallback are preserved.
