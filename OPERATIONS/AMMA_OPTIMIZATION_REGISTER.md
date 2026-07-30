# AMMA Optimization Register

_Canonical improvement backlog for AMMA Ventures / Fina Calle. Updated 2026-07-18._

## Operating rule

Optimize the constraint, not every surface at once. Every item needs an evidence label, one accountable Anthony role, one KPI, and a stop/approval gate. An optimization is not “done” until the measured result is verified; activity and aesthetics alone are not outcomes.

Evidence labels:

- **Verified:** directly supported by current repository, connected account, or measured result.
- **Inference:** plausible improvement that needs a controlled test.
- **Unknown:** required evidence is unavailable; do not convert it to zero or a claim.

Priority:

- **P0:** unlocks revenue, delivery, security, or a customer commitment now.
- **P1:** improves the next 30 days after P0 evidence exists.
- **P2:** scale or polish after the workflow is proven.

## Executive queue

| Priority | System | Evidence now | Next optimization | Owner role | KPI | Approval gate | State |
|---|---|---|---|---|---|---|---|
| P0 | Owner activation | Verified: `/owner/[id]` exists; no install manifest on base `422352b` | Make each tenant portal installable from the browser at the stable owner URL | Delivery Owner | owner installs completed / owners invited | Push, PR, merge, deploy, customer instruction | In progress |
| P0 | Revenue conversion | Verified: ethical sales system is PR #161; real conversion dataset is unknown | Merge the reviewed system, then record hook/proof/CTA exposure and dated-next-action outcomes | Revenue Producer | dated next actions / qualified exposures | Merge, deploy, prospect contact | Ready for review |
| P0 | Colattao billing | Verified: $149 monthly plan and July 20 schedule are documented; paid Checkout completion is unknown | Verify production billing state and finish only the approved payment step | Finance/Admin | cash collected and subscription status, never guessed | Login, key use, charge, Checkout completion | Blocked on live evidence/approval |
| P0 | New-client delivery | Verified: owner, ledger, billing, and intake surfaces exist | Turn the current SOP into one checklist with named evidence artifacts per gate | Delivery Owner | days from signed scope to verified portal | Client creation, access, send, deploy | Ready |
| P1 | Support/change requests | Verified: owner portal has request-oriented UI; end-to-end SLA evidence is unknown | Instrument request received → acknowledged → completed → owner confirmed | Delivery Owner | median completion time and reopen rate | Customer communication | Planned |
| P1 | Product reliability | Verified: production runs on Vercel; route-level SLO is not defined | Add synthetic checks for sign-in, manifest, public menu, request intake, and fail-closed billing | Delivery Owner | successful checks / scheduled checks | Paid monitoring or production config | Planned |
| P1 | Funnel analytics | Verified: Vercel Analytics is installed; owner and sales funnel events are not defined | Define anonymous events with no PII for proof view, CTA, request, and successful owner action | CEO/Strategist | stage conversion with sample size | Analytics schema, privacy approval, deploy | Planned |
| P1 | Performance | Unknown: current route-level Core Web Vitals and bundle costs | Establish mobile baselines before changing code; optimize only measured bottlenecks | Delivery Owner | p75 LCP, INP, CLS; JS by route | Production measurement | Planned |
| P1 | Security/access | Verified: server authorization exists; periodic access-review cadence is unknown | Quarterly tenant/team/access and dependency review with revocation evidence | Finance/Admin | overdue reviews and unauthorized-access findings | Access change, secret rotation | Planned |
| P1 | Dependency health | Verified: 2026-07-18 audit reports two moderate PostCSS-chain advisories and no high/critical findings; npm proposes an invalid breaking Next.js downgrade | Track the upstream patched dependency path; do not force-fix or downgrade the framework | Delivery Owner | high/critical findings and days-to-safe-fix | Dependency upgrade, deploy | Monitoring |
| P1 | Finance control | Verified: Stripe is authoritative recurring rail and Zelle is manual; reconciliation outcome data is unknown | Weekly cash/receivable close with exception aging | Finance/Admin | verified cash, overdue amount, exception age | Bank/Stripe login, refunds, transfers | Planned |
| P1 | Automation quality | Verified: operating rhythm and deterministic skill routing exist; outcome log has zero verified samples | Record only verified checkpoint outcomes and review routing after at least three comparable samples | CEO/Strategist | verified outcomes and correction rate | Automation/prompt change | Active |
| P2 | Retention/expansion | Unknown: quantified customer value, referrals, repeat visits, and renewal reasons | Conduct consented owner value reviews and build verified case-study evidence | Revenue Producer | renewals, referrals, expansion revenue | Customer contact, testimonial publication | Backlog |
| P2 | Brand/content | Verified: current brand and collateral exist; effectiveness is unknown | Test one visual/copy variable per comparable campaign | Revenue Producer | qualified response per exposure | Publish, send, spend | Backlog |
| P2 | People/governance | Verified: team-access controls exist; role throughput evidence is unknown | Define role scorecards and weekly handoff aging | CEO/Strategist | work items completed without rework; blocked age | Hiring, access, compensation | Backlog |

## Complete-system map

### Acquire and sell

- Source only grounded prospects; never invent accounts.
- Qualify by observable fit and owner-stated priorities.
- Use one hook, one verified proof, one CTA, and one offer ID.
- Measure qualified exposure → dated next action → proposal → close → cash.

### Onboard and deliver

- One signed scope and feature-status snapshot.
- One client record, tenant id, approved brand asset set, owner-access record, billing record, and stable public/owner URLs.
- One acceptance checklist: mobile, authorization, tenant isolation, menu, request, billing state, email routing, QR destination, and owner confirmation.

### Operate and support

- Every owner request has received, acknowledged, assigned, due, completed, and confirmed timestamps.
- Every production issue has impact, cause, fix, verification, and prevention.
- Cache public assets only; do not offline-cache authenticated owner or billing responses.

### Monetize and reconcile

- Stripe is the recurring-system record; Zelle remains reported until manually verified.
- Report unknowns as unknown, not $0.
- Close weekly: invoiced, paid, overdue, reported Zelle, verified Zelle, exceptions, and next action.

### Learn and expand

- Compare like with like and change one material variable.
- Require sample size, dates, counts, objections, loss reasons, and guardrails before naming a pattern.
- Convert verified delivery and customer outcomes into permissioned case studies and referrals.

## Weekly optimization cadence

1. **Monday:** choose one P0 constraint and its baseline.
2. **Daily:** record verified movement, blocker age, and next action.
3. **Friday:** compare outcome to baseline; keep, revise, or stop.
4. **Monthly:** re-rank P0/P1/P2 using current revenue, delivery, risk, and customer evidence.

## Definition of done

An item closes only when the artifact is shipped through the approved path, the target behavior works in the real environment, the KPI has a verified baseline and result, documentation is current, and rollback/owner handoff is clear.
