# AI Company Scheduler — build spec (v1)

> Builds on the concept in `AI_COMPANY_SCHEDULER_CONCEPT.md`. **Design only —
> not implemented.** Gated on a compliance + employee-data-security design.
> Same philosophy as the Lead Arcade: **the AI calculates, the human approves.**

## 1. Scope of v1 (the cut line)
**In:** one location, hourly demand forecast from POS history + manual event/
holiday bumps, a constraint-aware schedule proposal the owner approves, and an
employee self-serve app (availability, time-off, shift swaps, "am I on?").
**Out (later):** weather/sentiment auto-feeds, ML forecasting, multi-location,
auto-publish, payroll integration.

## 2. Data model
```
Employee   { id, name, roles[], maxHoursWeek, minHoursWeek, hourlyCost,
             isMinor, seniority, contact }
Availability{ employeeId, weekday, from, to }          // recurring windows
TimeOff    { id, employeeId, date|range, status }      // request → approved
Shift      { id, date, start, end, role, employeeId?, status }  // proposed→published
SwapRequest{ id, shiftId, fromEmployeeId, toEmployeeId?, status }
DemandPoint{ date, hour, forecastCovers, forecastSales, drivers[] } // explainability
Actuals    { date, hour, covers, sales }               // for learning
Settings   { laborBudgetPct, openHours, roleCoverage, minRestHours, ... }
```
Event-sourced where it helps auditability (requests/approvals/publishes), like
the Lead Arcade's log.

## 3. Architecture (v1)
```
POS / Client OS sales ──► Forecast ──► Optimizer ──► Proposed schedule ──► Owner approve ──► Published
                              ▲             ▲                                   │
            manual event/holiday bumps   constraints (availability,            ▼
            + lifecycle decay curve      labor law, budget, roles)      Employee app (self-serve)
                              ▲                                                 │
                          Actuals ◄───────────────── learning loop ◄───────────┘
```
- **Forecast service** — produces `DemandPoint`s per open hour.
- **Optimizer** — assigns employees to shifts to meet demand at min cost within
  constraints + fairness; emits an explained proposal.
- **Approval UI (owner)** — review/tweak/approve; publish.
- **Employee app** — schedule, requests, swaps, conversational status.
- **Learning** — compare forecast vs `Actuals`, tune.

## 4. Forecast approach
- **v1 (no ML):** baseline = average sales by **(weekday × hour)** over a trailing
  window (e.g., 8 weeks), then multiply by adjustable **driver factors**:
  - holiday/special-occasion multiplier (calendar),
  - local-event multiplier (manual or events API),
  - **lifecycle factor** — the post-"honeymoon" decay curve for new venues
    (`AI_COMPANY_SCHEDULER_CONCEPT.md`), re-ramped on marketing pushes,
  - active promotion/loyalty-campaign bump (incl. the Fina Calle game).
  Each applied factor is recorded in `DemandPoint.drivers[]` for the plain-language
  explanation.
- **v2 (ML):** gradient-boosted/seasonal model with the same signals as regressors
  + weather + sentiment; keep the driver-attribution for explainability.
- **Cold start** (new venue, little history): seed from **theme/peer priors** +
  the lifecycle curve until enough actuals accrue.

## 5. Optimizer approach
- **v1:** a constraint-aware greedy/heuristic — for each hour, staff up to the
  forecast's required coverage per role, picking available employees by lowest
  cost while honoring hard constraints and balancing fairness (hours equity).
- **v2:** an ILP/CP solver (e.g., OR-Tools-style) minimizing labor cost subject to
  the constraints; fairness + preference satisfaction as soft terms.
- **Hard constraints:** availability, role coverage, max/min hours, minor rules,
  min rest between shifts, overtime caps, labor budget.
- **Soft (penalized):** preferences, fairness/hours-equity, shift continuity.

## 6. Employee + manager experiences
- **Employee:** view schedule, set availability, request time off, post/accept
  swaps, pick up open shifts, ask status in natural language. Notifications.
- **Owner:** the AI proposes the week with a one-line "why" per heavy/light shift;
  owner edits + approves + publishes. Alerts: understaffed, overtime risk, budget
  overage, unfilled open shifts.

## 7. Compliance & safety (must clear before build)
- **Labor law:** predictive-/fair-workweek scheduling (advance-notice, change
  penalties), overtime, minors (hours/times), mandated breaks, min rest —
  **jurisdiction-specific**; encode as hard constraints + warnings.
- **Fairness & transparency:** explain allocations; avoid biased hour distribution.
- **Employee PII & security:** proper auth + data store, consent; **not** in the
  public repo; isolated from the existing Client OS data until designed.
- **Human-in-the-loop:** propose + explain; never silently auto-publish.

## 8. Integration with Fina Calle OS
A new **manager-cockpit module** (the ops twin of the sales-side Lead Arcade).
Reads sales from POS / Client OS; loyalty/game campaigns become a forecast driver
— **the game drives traffic, the scheduler staffs for it.**

## 9. Phased roadmap
1. **v0 (spike):** import sales CSV → weekday×hour baseline → static proposed
   schedule (read-only), owner-only. Proves the forecast + explanation.
2. **v1:** + employee app (availability/time-off/swaps), heuristic optimizer with
   constraints, approve→publish, notifications. **Compliance design done first.**
3. **v2:** ML forecast + solver + weather/events/sentiment feeds; learning loop.
4. **v3:** multi-location, payroll/POS deeper integration, scenario planning.

## 10. KPIs
Forecast accuracy (MAPE), labor-cost % vs sales, overtime hours, unfilled shifts,
schedule-change rate, employee satisfaction / swap-resolution time, manager time
saved.
