# AI Company Scheduler — product concept (R&D)

> **Status: CONCEPT captured for future development. Not built.** Owner-driven;
> involves **employee data + labor law**, so a proper data/auth/compliance design
> is required before any build. Kept as a concept here so the idea isn't lost.

## One-liner
An **AI scheduling brain** for a restaurant (and later any shift business):
employees connect to it, **request time off / shifts / swaps and check status**,
and it **auto-generates the optimal schedule without managers doing the math** —
weighing as many demand and people variables as it can.

## Why it fits AMMA (the Managerial Factory thesis)
Scheduling is a recurring **managerial calculation** — exactly the kind of work to
hand to **code + AI**. Managers stop guessing headcount; the system proposes a
schedule and explains it, and the human just approves. (Same philosophy as the
Lead Arcade is for sales: the AI calculates, the human approves.)

## Two faces
- **Employee app (conversational/AI):** see your schedule, **request time off,
  swap or pick up open shifts**, set availability + preferences, get notified, and
  ask status in plain language ("Am I on Friday?"). The system answers.
- **Manager / owner cockpit:** the AI **proposes the week** and **explains it**;
  owner tweaks/approves. No spreadsheets. Alerts for understaffed shifts, overtime
  risk, or labor-budget overage.

## The demand model — variables it weighs (as many as possible)
**Demand (expected covers/sales per shift):**
- **Sales / POS history** — the backbone (per hour / day / season).
- Day-of-week, time-of-day, **seasonality**.
- **Weather** (rain kills patios; heat drives cold drinks).
- **Local public events** (games, concerts, festivals, conventions → spikes).
- **Holidays & special occasions** (Valentine's, Mother's Day, paydays).
- **Local sentiment / buzz** (review + social trend).
- **Restaurant theme / type** (brunch café vs late-night bar have different curves).
- **Lifecycle — "after the honeymoon":** new restaurants get an opening-buzz spike
  that **decays**; model the curve so you don't overstaff once the hype settles —
  and re-ramp for relaunches / marketing pushes.
- Active promotions (incl. **the Fina Calle game/loyalty pushes**), price changes,
  nearby competitor openings/closures.

**Supply / people:**
- Availability, time-off, preferences, **skills/roles** (line vs front), seniority
  & **fairness**, **labor-law constraints** (breaks, minors, max hours, overtime),
  **labor-cost budget** target, and burnout/churn signals.

## How it works (concept)
1. **Forecast** demand per shift from the variables (ML on POS history + signals).
2. **Optimize** staffing to meet the forecast at minimum labor cost within all
   constraints + fairness (an optimizer/solver, AI-assisted).
3. **Explain** the schedule in plain language ("heavier Fri — home game + payday").
4. **Self-serve** swaps/requests: employees act; the AI resolves within the rules.
5. **Learn** from actuals (forecast vs reality) → improve each week.

## MVP → full
- **MVP:** pull sales history → forecast + a simple optimizer → propose a schedule;
  employee self-serve requests; manager approve. Skip exotic signals at first.
- **v2+:** weather, events, holidays, sentiment, the lifecycle-decay model.

## Data + integration
Reads sales from **POS / Client OS**; calendars / weather / local events from
free/cheap APIs; stores employee data securely. Closes a loop with the rest of
Fina Calle OS — **the game/loyalty drives traffic, the scheduler staffs for it.**

## Risks / cautions (must address before build)
- **Labor law** — predictive-/fair-workweek scheduling laws, overtime, minors,
  breaks; jurisdiction-specific. **Compliance is mandatory.**
- **Fairness & transparency** in who gets hours (avoid biased allocation).
- **Employee PII + security** — keep OUT of the current repo until a proper
  data/auth design exists.
- **Cold start** for brand-new restaurants (little history) — lean on theme/peer
  priors + the lifecycle model.
- **Human-in-the-loop** — propose & explain, don't fully auto-publish schedules.

## Where it sits in AMMA
A future **Fina Calle OS module** — the **manager cockpit** counterpart to the
sales-side Lead Arcade. Build only after a compliance + data-security design.
