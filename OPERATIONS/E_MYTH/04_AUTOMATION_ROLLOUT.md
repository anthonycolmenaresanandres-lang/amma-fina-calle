# AMMA Ventures — Automation Runtime & Rollout Plan

_How the eleven AI positions in `03_AI_STAFF.md` actually run without Anthony
starting them, what he is left holding, and the order to build it in._

---

## 1. The runtime — four parts, all of them already exist here

The plan deliberately introduces **no new platform**. Every mechanism below is
already in use in this workspace; the work is to point them at the org chart.

| Part | What it is | Already proven by |
|---|---|---|
| **The clock** | Claude Code **Routines** — scheduled sessions that fire on cron into a fresh cloud container, with push + email summaries | the twice-daily caretaker routine documented in `AUTOMATION_STATUS.md` (verified) |
| **The jigs** | **Skills** — deterministic, versioned instructions the agent must follow (`amma-business-intelligence`, `amma-sales-conversion`, `frontend-design`, `web-design-guidelines`, `amma-video-game-visuals`, `vercel-dash-report`) | the required-skill routing already mandated in `CLAUDE.md` (verified) |
| **The memory** | **Ledgers in git** — `HANDOFF_LOG.md`, `CODEX_QUEUE.md`, `AUTOMATION_STATUS.md`, the Optimization Register, `outcomes.jsonl` | the CHECK-IN / RELEASE GATE / CHECK-OUT protocol already running (verified) |
| **The hands** | **MCP connectors** — GitHub, Vercel, Supabase, Gmail, Calendar, Drive, Slack, Resend, Docusign, Figma | connected and available in session (verified) |

**Why this matters for "works without me":** Routines fire into cloud containers.
The factory does not need Anthony's laptop on, his terminal open, or his
attention. It runs, writes to git, and pushes him one summary.

### The critical design rule

> **Every agent's output lands in a ledger and a draft PR — never directly in
> production, never directly in a customer's inbox.**

That single rule is what makes eleven unattended agents safe. It converts every
possible failure into something reviewable and reversible, and it is already how
the caretaker operates today.

---

## 2. The daily shift

```
07:00  MAYORDOMO   opens the shift · reads all ledgers · names the day's ONE constraint
       ├─ 08:00    CONTADOR    exception aging · cash ledger refresh
       ├─ 08:30    CIERRE      follow-ups due today → send-ready drafts
       ├─ 09:00    CONSERJE    request aging · SLA sweep · in-scope changes
       ├─ 09:00    MECÁNICO    caretaker sweep #1 (CI, PRs, synthetics)
       ├─ 10:00    TALLER      open builds advance one station
       ├─ (Mon)    EXPLORADOR  weekly sourcing run → ranked prospect queue
       ├─ (Tue)    PREGONERO   content/asset production run
       └─ on-call  RETRATISTA  prospect brief → demo → draft PR (≤4h)
12:30  MAYORDOMO   midday stall sweep · re-route anything blocked
   ↓
       ADUANA      inspects EVERY artifact produced above — PASS or HALT
   ↓
16:00  BRÚJULA     ingest analytics · update KPIs · founder-labor number
16:30  MAYORDOMO   assemble the digest from PASSED artifacts only
17:00  →  ANTHONY  ONE push notification + ONE email: the daily decision digest
21:00  MECÁNICO    caretaker sweep #2
```

Nothing in that column requires Anthony until 17:00.

---

## 3. The Owner Input Budget — the headline deliverable

This is the direct answer to *"I need AI to work without me and that means
minimizing my input."* Anthony's involvement becomes a **fixed, predictable
budget** instead of an open-ended demand on his day.

### 3.1 The daily decision digest (≤10 minutes)

One notification at 17:00. Every line is pre-inspected by Aduana, pre-packaged by
Mayordomo, and answerable in **one word**.

```
FINA CALLE — DAILY DIGEST · Tue 2026-08-18 · constraint: revenue conversion

DECISIONS (4)
  1. MERGE   Las Palmas menu correction — PR #201 · all gates green · rollback ready
             → reply: 1 yes / 1 no
  2. SEND    AJ Gator's follow-up (day 3) — draft ready, bilingual, offer ID FC-149
             → reply: 2 yes / 2 edit
  3. PUBLISH Colattao case study refresh — cites owner-verified 2,874 / 4,599 only
             → reply: 3 yes / 3 no
  4. MONEY   Colattao invoice #14 — exact steps prepared, 3 clicks, $149
             → reply: 4 done (after you do it)

DONE WITHOUT YOU (11)          [no action — read or skip]
  · 6 new qualified prospects sourced and ranked
  · Marisol's Kitchen demo built, gated, draft PR #217 opened
  · 3 owner requests acknowledged, 2 completed and confirmed
  · CI green across 6 repos · 1 dependency advisory tracked
  · weekly close prepared for Friday

HALTED BY INSPECTION (1)       [no action — already returned for rework]
  · Marisol's collectible card — mascot read as human-adjacent · returned to RETRATISTA

UNKNOWNS (2)                   [not converted to zero]
  · Colattao paid-Checkout completion — Stripe connector not yet authorized
  · demo→close rate — 0 verified samples; instrumentation shipping in Phase 1

FOUNDER LINE-LABOR THIS WEEK: 2.5h  (target: 0)
```

**Budget: ≤10 minutes/day.** If the digest ever needs more, that is a defect — it
means an agent is handing up work instead of decisions, and it gets logged.

### 3.2 The weekly steering pass (30 minutes, Friday)

Brújula's report + one question: *is the named constraint still the constraint?*
Anthony changes it or confirms it. That is the entire meeting.

### 3.3 Exception interrupts (rare, by design)

Only four things break through the digest: production down, a security or access
event, a customer escalation, or money at risk. Everything else waits for 17:00.

### 3.4 The budget, stated plainly

| | Before | Target at steady state |
|---|---|---|
| Daily | open-ended; owner starts every task, does all outreach, all QC, all admin | **≤10 min** — answer one digest |
| Weekly | ad hoc | **+30 min** — one steering pass |
| Monthly | ad hoc | **+30 min** — re-rank the Optimization Register |
| **Total** | unbounded | **≈45 min/weekday equivalent**, matching the Strategic Objective |
| Line labor | designer + closer + QC + admin | **0 hours** — except the eight reserved actions |

---

## 4. Rollout — five phases, each one shippable on its own

Ordered by the constraint each phase relieves, not by ease. Each phase ends with a
verifiable PASS condition.

### Phase 0 — Ratify the chart *(owner: ~15 minutes, one time)*

- Confirm or rewrite the **Primary Aim** (§1 of `01_ORGANIZATION.md`).
- Confirm or edit the **Strategic Objective** numbers (§2).
- Confirm the eight reserved actions (§5) are the right eight.

**PASS:** the two statements are signed into the file. Nothing else can be
correctly prioritized until they are — every KPI below inherits from them.

### Phase 1 — Build the inspector and the analyst *(highest leverage)*

Counter-intuitive but correct: **do not automate production first.** Build the two
positions that make autonomy safe and measurable.

- **ADUANA** — the blocking inspection gate. Encodes guardrails already written in
  `CLAUDE.md` and `AI_HONESTY_PROTOCOL.md` as an automated pass/halt station.
- **BRÚJULA** — instrumentation. Funnel events, the per-client engagement
  dashboard (the plan's own "most important missing piece"), and the first
  verified entries in an outcomes log that currently holds **zero**.

**PASS:** Aduana halts a deliberately seeded defect (an AI-generated logo, an
unlabeled claim, a changed QR URL) without human help; Brújula records ≥3 verified
outcome samples and publishes one per-client engagement view.

**Why first:** every later phase's autonomy is only as trustworthy as this gate,
and every later phase's priority is only as correct as this data.

### Phase 2 — Buy back the day *(the orchestration layer)*

- **MAYORDOMO** — the shift, the routing, the digest.
- Extend **MECÁNICO** from twice-daily caretaker to the full Platform contract
  (synthetic checks on sign-in, manifest, public menu, request intake, billing).

**PASS:** five consecutive weekdays where the shift opens, runs, and delivers a
17:00 digest with **zero** manual starts by Anthony.

**This is the phase where "AI works without me" becomes literally true.** After
it, the factory runs on a clock rather than on his attention.

### Phase 3 — Automate the revenue line

- **EXPLORADOR** → standing ranked prospect queue.
- **RETRATISTA** → demo factory (already proven by hand on Las Palmas and AJ
  Gator's — this phase removes the hand).
- **CIERRE** → every exposure ends in a dated next action; send-ready drafts.

**PASS:** a prospect goes from *sourced* to *live owner-review demo + send-ready
outreach packet* with **zero** Anthony input until the "send" decision in the
digest. Demo→close rate stops being **unknown**.

### Phase 4 — Automate delivery, care, and money

- **TALLER** → signed scope to merge-ready pack in ≤5 business days.
- **CONSERJE** → full request lifecycle + monthly value reviews per client.
- **CONTADOR** → weekly close with exception aging (gated on Stripe authorization).
- **PREGONERO** → the content calendar runs itself.

**PASS:** one full client cycle — signed → built → live → supported → invoiced →
value-reviewed — where Anthony's only actions are the reserved eight.

---

## 5. Verified capability gaps (state them, do not route around them)

These are real blockers found in the current environment. They are listed as
**unknown/blocked**, not silently absorbed.

| Gap | Impact | Resolution | Owner |
|---|---|---|---|
| **Stripe connector not authorized** in session | Contador cannot read live billing; Colattao paid-Checkout stays **unknown** | Anthony authorizes the Stripe connector in claude.ai connector settings | Anthony (A4) |
| **Canva and Runway not authorized** | Pregonero limited to the Remotion/FFmpeg/Pixelorama stack (which is sufficient today) | authorize only if a gap appears | Anthony (A4) |
| ~~Vercel account showed no projects~~ — **resolved 2026-08-17** | none; the `amma-fina-calle` Vercel project is connected to the GitHub repo and posts preview deployments on PRs (verified on PR #217) | none — the 2026-07-08 caretaker note is stale; Mecánico can watch deploys | — |
| **Outcomes log holds 0 verified samples** | routing cannot learn; every conversion KPI is **unknown** | Phase 1 (Brújula) | Brújula |
| **No per-client engagement instrumentation** | ROI is unprovable to clients — the plan's own #2 risk | Phase 1 | Brújula |
| **12 open PRs awaiting owner decisions** on amma-fina-calle | decision debt accumulating outside any digest | route the backlog through the first digest as a batch | Mayordomo (A3) |
| Prospect **PII must stay out of git** | limits what the pipeline ledger can hold in-repo | keep identifiers + public facts in git; PII in the connected Drive/CRM only | Explorador |

---

## 6. How we will know it worked

The org chart is not the deliverable — these numbers are. Every one has a
verified baseline of *"not yet measured"* today, which is itself the finding.

| KPI | Position | Baseline | Target |
|---|---|---|---|
| **Founder bespoke line-labor hours/week** | Brújula (11.7) | unknown — never measured | **0** |
| Owner daily input | Mayordomo (1.6) | unbounded | ≤10 min |
| Weekdays the shift ran unstarted | Mayordomo (1.1) | 0 | 5/5 |
| Qualified prospects in queue | Explorador (2.3) | unknown | ≥10 standing |
| Hours: prospect named → demo draft PR | Retratista (3.x) | days (manual) | ≤4h unattended |
| Exposures with a dated next action | Cierre (5.3) | unknown | 100% |
| Days: signed scope → verified live portal | Taller | unknown | ≤5 business days |
| Requests with a complete timestamp lifecycle | Conserje (7.1) | unknown | 100% |
| Guardrail/brand/honesty violations reaching a customer | Aduana (10.2–10.6) | unknown | **0** |
| Verified outcome samples | Brújula (11.4) | **0** | ≥3 per workflow |
| Clients with visible ROI proof | Brújula (11.2) | 0 | 100% |

---

## 7. The one-sentence version

**Anthony's name currently sits in 11 of 12 boxes on the org chart; this plan
replaces it box by box with a named AI position, a written contract, a ledger, and
a scheduled shift — leaving him eight reserved decisions delivered once a day in a
ten-minute digest.**
