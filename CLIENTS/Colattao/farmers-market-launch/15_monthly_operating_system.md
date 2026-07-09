# Monthly Operating System — Colattao Community Market

Status: Draft strategy (added 2026-06-18). Builds on `01_site_launch_plan.md`,
`08_pilot_revenue_model.md`, and `09_fina_calle_os_market_module_spec.md`.

## Purpose

Turn the Colattao Community Market from a one-off event Anthony personally runs
into a **recurring monthly market that does NOT depend on Anthony**. The whole
design goal: after setup, the market runs every month whether Anthony is there
or not.

## Core Principle

Build the hard parts ONCE, then repeat a small loop monthly. Anthony shrinks to
**approvals + sponsor/brand relationships only** — never the critical path.

---

## 1. Cadence — monthly (CONFIRMED)

- Run **one proof pilot** first (prove the lot, landlord, city/fire/health path).
- Then run on a **fixed recurring slot** so customers and vendors build a habit and
  nobody re-decides anything each month.
- **Confirmed slot: 2nd Saturday of every month, 9:00 AM–1:00 PM.**
- **Rain date:** 3rd Saturday, same hours.
- A fixed date is itself a system — it removes a monthly decision.

## 2. The real unlock — set the hard stuff up ONCE (standing, not per-event)

This is the difference between monthly being 12× the work vs. set-once-run-monthly.
Make every heavy approval a **standing/recurring** arrangement:

- **Landlord:** one season-long or annual written approval for the recurring
  slot — not 12 separate asks.
- **Insurance:** one **annual** event-liability policy that covers the recurring
  market — not a new policy each month.
- **City / zoning / fire / health:** on the calls (`05_permit_call_scripts.md`),
  ask specifically: *"Can a recurring private-property market be approved once
  for the series rather than per event?"* Often yes.
- **Vendors:** a **standing roster** who simply re-up each month, plus one
  always-open online application for new vendors.

Capture each standing approval in `11_approval_evidence_log.md` with its renewal
date so nothing silently lapses.

## 3. Who owns what — the 4 owners (so it never needs Anthony)

| Owner | Responsible for | Effort |
| --- | --- | --- |
| **The OS (software)** — see `09_fina_calle_os_market_module_spec.md` | Vendor applications, approval status, reminders, QR directory, day-of check-in, attendance + sponsor reporting | Automated |
| **Market Manager (HIRED, paid)** | Runs the monthly loop: approve vendors, send reminders, run check-in, manage the lot, close out | ~3–4 hrs/month + event morning |
| **Parking / entry guide** | Stationed outside to direct parking and walk customers safely into the bazaar zone (regular staffer, or an off-duty police officer if required) | event morning |
| **Day-of helper** | Load-in/out, trash, lot sweep | 1 morning/month |
| **Anthony (owner)** | Approvals only (new vendor categories, sponsors) + brand/sponsor face | Minutes/month |

The **Market Manager is a hired, paid local lead** — not Anthony, not unpaid. The
Fina Calle Operator may oversee at a portfolio level, but day-to-day the paid
Market Manager owns the event so it never depends on Anthony.

### Staffing & pay (per market)

| Role | Who | Pay per market |
| --- | --- | --- |
| **Market Manager** | Hired part-time lead | **~$200** (≈ $20/hr × ~10 hrs incl. event morning; range $150–250) |
| **Parking / entry guide** | One person outside directing parking + walking customers into the bazaar | **~$100** (regular staffer, ~5–6 hrs) |
| ↳ Upgrade | Off-duty police officer instead of the guide (traffic + security) | **~$200–250** (special-detail rate, usually a 3–4 hr minimum) |
| **Day-of helper** | Load-in/out, trash, sweep | folded into supplies (~$0–75) |

Guidance: for the small monthly bazaar, use the **regular parking/entry guide
(~$100)**. Reserve the **off-duty police officer** for larger events (coffee-fest
scale) or if the city/police special-events review or the landlord requires one —
arrange it through the VA Beach PD extra-duty program (see `05_permit_call_scripts.md`).

**Baseline monthly labor:** Market Manager $200 + parking guide $100 = **~$300/market**
(≈ **$425** if an off-duty officer is used instead of the guide).

## 4. The repeatable monthly loop (identical every month)

The Operator runs this; most steps are automated by the OS.

- **Week 1:** OS auto-opens applications + emails the standing roster ("you're in
  for the 2nd"). New vendors apply via the standing form.
- **Week 2:** Operator approves vendors on one screen; confirms the count.
- **Week 3:** OS sends reminders + the pre-pay link; QR directory auto-updates as
  vendors are approved + paid.
- **Week 4:** Operator prints the site map + check-in sheet (`13_site_map.md`,
  `06_vendor_layout_plan.md`).
- **Event day:** 7:30 load-in → check-in via OS → 9:00 open → 1:00 close →
  helper sweeps → OS logs attendance.
- **Anthony's only touch:** approving a sponsor. That's it.

See `16_operator_role_card.md` for the one-page version the Operator runs from.

## 5. Money — kept in clean, separate buckets

**Bucket A — Market P&L (its own ledger / bank line):**
- IN: booth fees + sponsors (see `08_pilot_revenue_model.md`).
- OUT: **staff (Market Manager ~$200 + parking guide ~$100)**, insurance, any
  permit, supplies.
- Reality with paid staff: the small pilot (8 vendors) is roughly **break-even**;
  real profit comes from scale, standard pricing, and **sponsors**. Rule of thumb:
  **one sponsor (~$150–300) covers the parking guide plus most of the manager** —
  sell at least one sponsor per market to cover labor.
- **Best practice: vendors PRE-PAY online.** Zero cash for anyone to handle —
  removes a major "needs Anthony" failure point and makes closeout clean.

**Bucket B — Fina Calle OS (separate, do not mix):**
- $900 setup + $150/month — Colattao's founding-client deal for the software /
  agency layer. The market *module* is part of what that OS does, but the market
  is never funded from this fee and this fee is never funded from booth income.

Track A and B separately in every report.

## 6. Dependence audit — failure points removed

| Used to need Anthony | Now handled by |
| --- | --- |
| Re-asking landlord each event | One standing annual approval |
| New permit/insurance each event | One annual policy + recurring-series approval |
| Chasing/approving vendors | Standing roster + OS application + Operator approves |
| Reminding vendors | OS automated reminders |
| Collecting booth cash | Online pre-pay (no cash) |
| Day-of check-in + map | OS check-in + printed map by Operator |
| Deciding the date | Fixed recurring slot |
| Reporting to landlord/sponsors | OS auto-report |

What remains Anthony-only: approve new vendor *categories*, approve *sponsors*,
own the landlord + sponsor relationships. Everything else runs without him.

## 7. Next steps to stand this up

1. Run the one proof pilot (existing package covers this).
2. Convert landlord + insurance + city path to **standing/annual** (Section 2).
3. Hire and onboard the Market Manager; line up the parking/entry guide.
4. Turn on online pre-pay for booth fees.
5. Build the OS market module MVP (`09_fina_calle_os_market_module_spec.md`)
   once the production queue/migration numbering is clear.
6. Hand the Operator the role card (`16_operator_role_card.md`) and run month 1.
