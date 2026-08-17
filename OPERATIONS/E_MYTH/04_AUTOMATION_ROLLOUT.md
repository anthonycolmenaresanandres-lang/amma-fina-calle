# AMMA Ventures — Automation Runtime & Rollout Plan

_How the eleven proposed AI positions could run without Anthony starting them,
what he would retain, and the order required to build and prove that system._

---

## 1. The runtime — existing components plus controls still to build

Some components exist, but Revision 4 adds controls that do not: an atomic event
store, independent watchdog, approval service, claim registry, and tested
validators. Documentation is not implementation.

| Part | What it is | Current evidence / gap |
|---|---|---|
| **The clock** | Claude Code **Routines** — sessions declared to run on a schedule | ⚠ R4 — recurring status publishing is observed on `automation/status` (74 status-side commits touching the file, 2026-07-08 → 2026-08-17, latest `faa42b6`). Scheduler-native trigger/terminal records and notification-delivery receipts are absent, so autonomous cadence and reliability remain **unknown** |
| **The jigs** | **Skills** — deterministic, versioned instructions the agent must follow (`amma-business-intelligence`, `amma-sales-conversion`, `frontend-design`, `web-design-guidelines`, `amma-video-game-visuals`; offline reporting over owner-supplied sanitized receipts only) | the required-skill routing already mandated in `CLAUDE.md` (verified) |
| **The memory** | Durable ledgers split by sensitivity | Non-sensitive repo records exist; the local router reports 21 outcomes but is machine-local. Revision 4 adds an atomic event store, sanitized git projection, and private owner-controlled records (`05` §5) |
| **The hands** | Connectors and local tools | Availability is session-scoped. A loaded schema is not proof of account, permission, or successful use. Agents may probe only preregistered unauthenticated public URLs; prohibited connector state requires an owner-supplied sanitized capability receipt or remains unknown (`05` §4) |

**Why this matters for "works without me":** Routines fire into cloud containers.
The target factory does not need Anthony's laptop or terminal. That remains a
**proposed outcome**, not a current fact: scheduler-native receipts, an independent
watchdog, and a separately authorized owner-only delivery channel are required.

### The critical design rule

> **Every action lands in its approved durable ledger; file changes stay on a
> branch/review package — never directly in production or a customer's inbox.**

That ceiling makes changes reviewable and reversible; it is necessary, not
sufficient. Scheduler receipts, deterministic gates, independent review, runtime
budgets, and owner-executed A4 actions are also required. The current caretaker is
not compliant until its self-declared merge authority is disabled or technically
prevented.

---

## 2. The daily shift

```
07:00  MAYORDOMO   opens the shift · reads approved sanitized indexes/receipts · names the day's ONE constraint
       ├─ 08:00    CONTADOR    exception aging · sanitized finance evidence refresh
       ├─ 08:30    CIERRE      follow-ups due today → send-ready drafts
       ├─ 09:00    CONSERJE    request aging · SLA sweep · stage non-protected drafts
       ├─ 09:00    MECÁNICO    caretaker sweep #1 (CI, PRs, synthetics)
       ├─ 10:00    TALLER      open builds advance one station
       ├─ (Mon)    EXPLORADOR  weekly sourcing run → ranked prospect queue
       ├─ (Tue)    PREGONERO   content/asset production run
       └─ on-call  RETRATISTA  prospect brief → local demo → review package (≤4h)
12:30  MAYORDOMO   midday stall sweep · re-route anything blocked
   ↓
       ADUANA      inspects EVERY artifact produced above — PASS or HALT
   ↓
16:00  BRÚJULA     ingest analytics · update KPIs · founder-labor number
16:30  MAYORDOMO   assemble the digest from PASSED artifacts only
17:00  MAYORDOMO   stage ONE daily decision digest; delivery remains owner-gated
21:00  MECÁNICO    caretaker sweep #2
```

Target after ratification and all gates: ordinary internal work needs no Anthony
before the staged digest. Exception interrupts and every A4 action remain his.

---

## 3. The Owner Input Budget — the headline deliverable

This is the target answer to *"I need AI to work without me and that means
minimizing my input."* After implementation and certification, Anthony's
involvement becomes a **fixed, predictable budget** instead of an open-ended
demand on his day.

### 3.1 The daily decision digest (≤10 minutes)

Mayordomo stages one artifact at 17:00. Every line is pre-inspected by Aduana,
pre-packaged, and carries a non-sensitive approval request ID. Anthony opens the
private approval surface; live tokens never enter the digest or git.
The staged digest contains sanitized summaries only; private recipients, message
bodies, payees, amounts, and destinations render only inside the owner surface.

Automatic notification/email delivery is **not authorized by current governance**.
Anthony opens or delivers the staged digest himself. A future agent-send requires
a governing-file amendment **and** an exact owner-only recipient, channel, sender,
data boundary, and revocation contract.

⚠ R4 — the example below is non-redeemable. A real digest is private and uses the
approval contract in `05` §3. Bare “yes” authorizes nothing; A4 remains Anthony's
action even after approval is recorded.

```
ILLUSTRATIVE ONLY — synthetic values; not a current operating report
FINA CALLE — DAILY DIGEST · Tue 2026-08-18 · constraint: revenue conversion

DECISIONS (4)
  1. MERGE   Las Palmas menu correction · PR #201
             commit 0f2bfa5c1d3e9a77 (locked) · diff sha256:9c1f…4ab2
             → request: apvreq_demo_merge_01 (non-redeemable example)
             → Anthony opens private approval view, records decision, and merges
  2. SEND    contact ref: contact_demo_02 · follow-up draft
             private payload hash sha256:2e77…10bc
             → request: apvreq_demo_send_02 (non-redeemable example)
             → Anthony opens private approval view, records decision, and sends
  3. PUBLISH Colattao case study · cites owner-verified 2,874 / 4,599 only
             → request: apvreq_demo_publish_03 (non-redeemable example)
             → Anthony opens private approval view, records decision, and publishes
  4. MONEY   finance ref: finance_demo_04 · private payload hash sha256:4b11…7a20
             → request: apvreq_demo_money_04 (non-redeemable example)
             → Anthony opens private approval view, records decision, and executes

DONE WITHOUT YOU (11)          [no action — read or skip]
  · 6 new qualified prospects sourced and ranked
  · Marisol's Kitchen demo built, gated, draft PR #217 opened
  · 3 owner-request acknowledgement drafts staged; delivery status unknown
  · CI evidence collected across configured repos · 1 synthetic advisory tracked
  · weekly close prepared for Friday

HALTED BY INSPECTION (1)       [no action — already returned for rework]
  · Marisol's collectible card — mascot read as human-adjacent · returned to RETRATISTA

UNKNOWNS (2)                   [not converted to zero]
  · Colattao paid-Checkout completion — authoritative owner evidence unavailable
  · demo→close rate — durable conversion evidence unavailable; instrumentation is Phase 1

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

## 4. Rollout

> **⚠ R4 — SUPERSEDED.** The historical phases below assumed independently proven
> caretaker liveness and an AI-based inspector. Use the corrected rollout in
> `05_SAFETY_CORRECTIONS.md` §9: truth correction → ratify → instrumentation →
> read-only canary with fault injection → draft autonomy → autonomy earned per
> capability by measurement → finance evidence last. Ratification blocks KPI
> priority and live activation, but not offline safety primitives. Phases 1–4
> below are retained only as the record of Revision 1.

### Revision 1 phases (historical)

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
  durable, source-scoped outcome entries; the current local router report is not
  shared company memory.

**PASS:** Aduana halts a deliberately seeded defect (an AI-generated logo, an
unlabeled claim, a changed QR URL) without human help; Brújula records ≥3 verified
sanitized outcome samples and produces one offline PII-free aggregate dashboard
mock. Protected/private implementation remains A4.

**Why first:** every later phase's autonomy is only as trustworthy as this gate,
and every later phase's priority is only as correct as this data.

### Phase 2 — Buy back the day *(the orchestration layer)*

- **MAYORDOMO** — the shift, the routing, the digest.
- Extend **MECÁNICO** from the observed status publisher to the full Platform
  contract: preregistered unauthenticated read-only public observations plus
  offline fake-adapter checks. Authenticated, request-submitting, billing,
  private, or protected-route live checks remain A4.

**PASS:** five consecutive weekdays where the shift opens, runs, and stages a
17:00 digest with **zero** manual starts by Anthony. Under current governance,
Anthony opens and delivers it.

**This is the phase where the internal factory starts on a clock rather than on
Anthony's attention.** Reserved owner actions remain reserved.

### Phase 3 — Automate the revenue line

- **EXPLORADOR** → standing ranked prospect queue.
- **RETRATISTA** → demo factory (already proven by hand on Las Palmas and AJ
  Gator's — this phase removes the hand).
- **CIERRE** → every exposure ends in a dated next action; send-ready drafts.

**PASS:** a prospect goes from *sourced* to *review-ready local demo or explicitly
authorized preview + send-ready outreach packet* with **zero** Anthony input until
the publish/send decisions. Demo→close stops being unknown only after durable
conversion evidence exists.

### Phase 4 — Automate delivery, care, and money

- **TALLER** → signed scope to merge-ready pack in ≤5 business days.
- **CONSERJE** → full request lifecycle + monthly value reviews per client.
- **CONTADOR** → weekly close with exception aging from owner-supplied sanitized evidence; no agent key access.
- **PREGONERO** → the content calendar runs itself.

**PASS:** one full client cycle — signed → built → live → supported → invoiced →
value-reviewed — where Anthony's only actions are the reserved eight.

---

## 5. Verified capability gaps (state them, do not route around them)

These are real blockers found in the current environment. They are listed as
**unknown/blocked**, not silently absorbed.

| Gap | Impact | Resolution | Owner |
|---|---|---|---|
| **No plan authority for agent Stripe access** | Colattao paid-Checkout stays **unknown** without authoritative owner evidence | Do **not** authorize now; Phase 5 requires a separate A4 decision, governance review, and owner-configured sanitized read-only receipt path | Anthony (A4) |
| **Canva/Runway authorization not established for this plan** | No blocker: the existing local visual stack remains available | Keep unavailable unless a later scoped gap and A4 approval justify access | Anthony (A4) |
| ~~Vercel account showed no projects~~ — **resolved 2026-08-17** | none; the `amma-fina-calle` Vercel project is connected to the GitHub repo and posts preview deployments on PRs (verified on PR #217) | none — the 2026-07-08 caretaker note is stale; Mecánico can watch deploys | — |
| **Local router outcomes are not durable shared memory** | The 2026-08-17 report returns 21 tool-labeled outcomes, but finance/conversion KPIs remain **unknown** | Phase 1 builds source-scoped durable instrumentation and validates classifications | Brújula |
| **No verified per-client engagement instrumentation** | Engagement activity is unavailable; ROI is a separate unknown requiring authoritative revenue, cost, and attribution evidence | Phase 1 defines/tests the offline event contract and dashboard mock; protected/private implementation remains A4 and no ROI claim follows automatically | Brújula |
| **4 open draft PRs** on 2026-08-17 (#197, #215, #216, #218) | decision debt exists but count is time-scoped | stage a current digest; never merge from an undated count | Mayordomo (A3) |
| Prospect **PII must stay out of git and agent access** under current rules | limits the automated pipeline to non-linkable public/sanitized facts | PII stays in an owner-controlled private system. Any future agent connector requires a governance amendment and explicit authorization | Anthony (A4) |

---

## 6. How we will know it worked

The org chart is not the deliverable — these numbers are. Every one has a
verified baseline of *"not yet measured"* today, which is itself the finding.

| KPI | Position | Baseline | Target |
|---|---|---|---|
| **Founder bespoke line-labor hours/week** | Brújula (11.7) | unknown — never measured | **0** |
| Owner daily input | Mayordomo (1.6) | unbounded | ≤10 min |
| Expected schedule slots with valid terminal/watchdog receipts | Mayordomo (1.1) | unknown — schema not live | 100% |
| Qualified prospects in queue | Explorador (2.3) | unknown | ≥10 standing |
| Hours: prospect named → demo draft PR | Retratista (3.x) | days (manual) | ≤4h unattended |
| Exposures with a dated next action | Cierre (5.3) | unknown | 100% |
| Days: signed scope → verified live portal | Taller | unknown | ≤5 business days |
| Requests with a complete timestamp lifecycle | Conserje (7.1) | unknown | 100% |
| Guardrail/brand/honesty violations reaching a customer | Aduana (10.2–10.6) | unknown | **0** |
| Durable, source-scoped outcome samples | Brújula (11.4) | local report 21; durable shared count unknown | ≥3 per workflow |
| Clients with visible **engagement activity** ⚠ R4 — not client-specific ROI (`05` §8) | Brújula (11.2) | unknown — instrumentation not verified | 100% |

---

## 7. The one-sentence version

**Anthony's name currently sits in 11 of 12 boxes on the org chart; this plan
replaces it box by box with a named AI position, a written contract, a ledger, and
a scheduled shift — leaving him eight reserved decisions delivered once a day in a
ten-minute digest.**
