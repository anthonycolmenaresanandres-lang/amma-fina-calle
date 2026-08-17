# Safety Corrections — E-Myth Automation Layer, Revision 3

_Created 2026-08-17. Revision 2 was reviewed and **its central correction was
itself wrong**; this file replaces it. Files 01–04 carry `⚠ R2` markers that
should be read as pointing here._

**Role:** CEO/Strategist.
**Bottleneck identified by review:** incorrect source-of-truth discovery.
**Stop condition:** no ratification, no merge, and no Stripe authorization until
this revision is accepted.

---

## 0. Retraction, stated plainly

Revision 2 §1.1 claimed the caretaker was **dark** — configured but never
demonstrably executed. **That claim is false and is withdrawn in full.**

It was produced by searching `AUTOMATION_STATUS.md` on `main` in a local clone
that held **2 of the repository's 138 remote heads**. The caretaker's telemetry
is deliberately kept **off `main`**, on `automation/status`. Searching the
default branch for it was the wrong query, confidently labeled.

This is the second time in this thread that an unsupported claim reached a
document. Revision 1 **overclaimed** (called a system live on a document's say-so).
Revision 2 **underclaimed** (called a system dark on an incomplete search). Both
share one root cause: **a conclusion drawn from partial evidence and then given a
confident label.** The corrective is not "be more careful" — it is the discovery
rule in §2.0, which makes the completeness of the search an explicit precondition
of the label.

---

## 1. Verified evidence for the caretaker

Measured 2026-08-17 against `origin/automation/status`:

| Fact | Value | Label |
|---|---|---|
| Branch | `refs/heads/automation/status` @ `faa42b6` | verified |
| Commits on the branch not in `main` | **344** | verified |
| Commits whose subject records a status check-in | **96** (my count; review stated 74 — the delta is a counting-rule difference, not a dispute) | verified |
| Date span | 2026-05-31 → 2026-08-17 | verified |
| Cadence | twice daily, morning and evening | verified |
| Latest run | `faa42b6`, 2026-08-17 12:53 UTC | verified |
| Remote heads in repo | 138 (local clone had 2) | verified |

**The Aug 16 → Aug 17 failure and recovery, verified:**

- `3d2932a` (08-16 17:47) overwrote `AUTOMATION_STATUS.md` with a stray path
  line, destroying the dashboard.
- `faa42b6` (08-17 12:53) **detected the corruption, recovered the file from
  `b80cc86`, and rolled it forward** — 236 insertions, 1 deletion — while also
  recording that amma `main` had moved to `3dadb98` (PR #217).

This is the single most valuable artifact in the whole review, and it cuts both
ways. It is genuine evidence of **self-healing under real failure**. It is also
genuine evidence of a **real corruption vector**: one mutable file, written by
many runs, clobbered by a careless write. That vector is exactly what §5 now
redesigns — and the redesign is empirical, not theoretical, because the failure
already happened.

### 1.1 Corrected label

> **Platform is ACTIVE on an isolated telemetry branch. Reliability and control
> maturity remain UNPROVEN.**

Active is not the same as mature. What is proven: the schedule fires, runs
produce artifacts, and at least one run recovered from corruption. What is **not**
proven: run-completion rates, undetected-failure rate, whether any run has ever
silently no-opped, and whether recovery generalizes beyond this one instance.

### 1.2 Corrected diagnosis

Revision 2's "**zero of twelve** boxes systematized" is withdrawn. The Revision 1
count stands with a sharper label:

- **Platform:** active, maturity unproven. **1 of 12.**
- **Intelligence:** empty.
- **Remaining 10:** held by Anthony.

---

## 2. Liveness, corrected

### 2.0 The discovery rule (new — this is the actual fix)

> **Before labeling any system live, dark, or stale, enumerate the complete ref
> topology and name where its telemetry lives. A search of the default branch is
> not a search of the repository.**

A liveness claim must record: refs enumerated, the ref actually queried, and the
query run. A claim that cannot state where it looked is `unknown`, never `dark`.
`dark` is an assertion about the whole repository and requires whole-repository
evidence.

### 2.1 Run states require a terminal record

Revision 2 required a heartbeat at run start. **That is insufficient** — a start
heartbeat proves a container booted, not that work happened or finished. Adopted
from review, with one addition:

Every run emits **two** records: `STARTED`, then exactly one of `COMPLETED` or
`FAILED`. Derived states:

| State | Condition |
|---|---|
| `live` | ≥1 `COMPLETED` within one declared interval |
| `degraded` | Runs terminate, but `FAILED` or partial-skip rate is above threshold |
| `crashed` | `STARTED` with no terminal record past its window — **the state Revision 2 could not express**, and the one that hides silent no-ops |
| `stale` | No `STARTED` for more than two intervals |
| `dark` | No run record has ever existed, established under §2.0 |

`crashed` is reported as loudly as `FAILED`. A run that starts and vanishes is a
failure that hid, and it is the failure mode most likely to masquerade as health.

**Applying this to the caretaker:** its 96 status commits evidence completed work
products, so it is **live**. Its `crashed` rate is **unknown**, because no
terminal records exist to measure it. That unknown is precisely the "maturity
unproven" half of the label.

---

## 3. Authorization binding (unchanged from Revision 2, still upheld)

Every decision in the owner digest carries a token bound to a hash of the exact
artifact — commit SHA for a merge; recipient + subject + body hash for a send;
payee + amount + currency + invoice ID for money.

```
1. MERGE  Las Palmas menu correction · PR #201
          commit 0f2bfa5c1d3e9a77 (locked) · diff sha256:9c1f…4ab2
          token  M-7F3A   expires 2026-08-18 17:00
          → reply: approve M-7F3A
```

Fail-closed rules: approval must quote the token; a bare "yes" executes nothing;
a changed artifact voids its token; tokens expire in 24h, are single-use, are
recorded spent, and a replay is refused and flagged; one token, one action, one
artifact — no batch tokens, no "approve all."

---

## 4. Capability contract (unchanged from Revision 2, still upheld)

Declare required capabilities, probe read-only at run start, **fail closed**.
Degraded mode must state which accountabilities were skipped. A call that did not
return success is not success, and its absence is `unknown`, never zero.

Connector presence is session-scoped and volatile — Google Calendar disconnected
and reconnected twice during this review, and the entire MCP tool surface dropped
and returned once. No document may assert availability.

**Stripe, Canva, Runway remain unauthorized.** Stripe stays last and read-only
per §9. CONTADOR is decoupled from it and starts on a manual-entry cash ledger.

---

## 5. Telemetry and ledgers, redesigned

Revision 2 put every ledger in `main` as one append-only JSONL per concern, with
file-based leases. Review rejected this on two grounds, both correct, and the
Aug 16 corruption is the proof.

### 5.1 Telemetry stays off `main`

Telemetry belongs on `automation/status`, as it already does. Keeping it off
`main` prevents high-frequency machine writes from contending with product
history, and preserves the existing, working convention. Revision 2 would have
moved a working system onto the branch most likely to conflict with it.

### 5.2 Immutable per-run receipts, not one mutable file

A single mutable JSONL is a collision surface — **demonstrated**, not
hypothesized, by `3d2932a` clobbering the dashboard. Replaced by:

```
receipts/2026/08/17/<agent>/<run_id>.json     # written once, never updated
```

| Property | Mechanism |
|---|---|
| **Immutable** | One file per run, write-once. No run edits another run's file. Corruption cannot propagate past a single receipt |
| **Collision-free** | Distinct paths mean no lock is needed for the common case, so the file-lease design is **withdrawn** — it shared the mutable-file weakness it was meant to solve |
| **Idempotent** | `run_id` is deterministic; re-running writes the same path with the same content |
| **Ordered** | Consumers derive order from path and `started_at`, not from file position |
| **Recoverable** | A damaged receipt loses one run, not the ledger. Aggregates are **rebuilt by replaying receipts**, never hand-edited |
| **Concurrency** | Two runs of one agent are prevented by the scheduler's own single-flight, not by a lock file. Overlap is detected from receipts and reported |

Dashboards such as `AUTOMATION_STATUS.md` become **rendered artifacts** of the
receipts. Had this existed on Aug 16, the corruption would have been a one-command
re-render rather than a manual recovery from an earlier commit.

### 5.3 Private data never enters git

Revision 2 placed `cash` and `requests` ledgers in git. **Withdrawn** — those hold
financial and customer data, contradicting the repository's own PII guardrail.

| Data | Location |
|---|---|
| Run receipts, heartbeats, inspection verdicts, capability probes | `automation/status` branch |
| Aggregate counts with no PII and no amounts | `automation/status` branch |
| **Cash amounts, payee identities, customer requests, prospect PII** | **Outside git** — connected Drive/CRM/finance system |
| In git, for private data | **Opaque reference only**: `{"ref":"cash:2026-08-17:a91f…","state":"reconciled"}` — an identifier and a state, never a value |

An agent may prove a private record was processed without the repository ever
holding what it said. Anything that fails this test does not get committed.

---

## 6. Evidence envelopes (unchanged from Revision 2, still upheld)

Every material fact carries `claim`, `label`, `source`, `observed_at`,
`ingested_at`, `hash`, `freshness`, `sensitivity`, `derived_from`. Claims past
`max_age_days` render **stale**, never current. Derived claims inherit the
**weakest** input label. **Added:** a liveness claim must also carry
`refs_enumerated` and `ref_queried` per §2.0 — the field whose absence produced
Revision 2's error.

---

## 7. ADUANA: deterministic gates block, AI review advises (upheld)

**Tier 1 — deterministic, blocking, no model:** protected-path allow-list, QR
byte-comparison against the registry, image SHA-256 provenance, secret scanning,
metadata assertions, evidence-file existence, claim-envelope parsing, code gates,
link liveness, money/recipient token binding. **A validator that cannot run is a
HALT, never a PASS.**

**Tier 2 — advisory:** runs on a *different model family*, sees only the artifact,
may HALT alone, may **never** PASS alone.

**Tier 3 — owner sampling:** 10% of passed artifacts, 100% of any class that has
ever produced a defect. Owner disagreement drops the agent one grade.

Residual risk, stated: Tier 1 covers mechanizable guardrails. It does not cover
taste, tone, or the truthfulness of a novel claim. Those are mitigated, not
solved — which is why customer-facing sends stay owner-executed permanently.

---

## 8. Activity is not ROI (upheld)

Engagement activity, engagement trend, and attributed lift are distinct, and
**ROI is not currently computable** — it needs per-customer revenue from the
client's POS, which Fina Calle deliberately does not touch. The KPI is "clients
with visible **engagement activity**." Tier 1 blocks the string "ROI" in
customer-facing artifacts and blocks any industry statistic placed inside a
client-specific claim.

---

## 9. Rollout

### Phase −1 · Truth correction *(this file)*
**Pass:** no label stands without stating the evidence and search scope behind it.

### Phase 0 · Ratify the aim *(owner, ~15 min)* — still blocking
Primary Aim and Strategic Objective remain `proposed`.

### Phase 1 · Instrumentation
Per-run receipts on `automation/status`; `STARTED` + terminal records; the
receipt→dashboard renderer; evidence envelopes; Tier 1 validators as tested code;
approval tokens; the private-data reference scheme.

**Pass:** §9.1 green, every validator has a test proving it fails closed, and
`AUTOMATION_STATUS.md` is rendered from receipts rather than hand-written.

**Note:** this phase *hardens the caretaker that already exists*. Revision 2
wrongly framed it as building from nothing.

### Phase 2 · Read-only canary with fault injection
20 scheduled runs, **≥6 carrying injected faults** — revoked connector, stale
receipt, duplicate `run_id`, expired token, seeded guardrail violation, malformed
envelope, and a **simulated Aug-16-style dashboard corruption**. Every fault must
produce the correct HALT or recovery *and* a correct receipt.

### Phase 3 · Draft-producing autonomy
Draft PRs and prepared artifacts only. Owner executes every A4 with a bound token.

### Phase 4 · Autonomy earned per agent
30 consecutive clean runs to rise one grade; any escaped defect demotes
immediately and resets the counter. **No grade above A3 exists for any
customer-facing or money-touching action, permanently.**

### Phase 5 · Stripe, read-only, last
Restricted read-only key, reconciliation reporting only. Charges, refunds, and
Checkout completion remain owner-executed forever.

### 9.1 The adversarial gate — now with positive controls

Review caught a fatal flaw: Revision 2's gate measured only *refusal*, so an
agent that HALTs on all 100 cases would score 100/100. **A gate that rewards
paralysis is not a safety gate.** Corrected to two halves:

**Negative controls (~65) — correct behavior is HALT or abstain:**
fabrication pressure (15), guardrail evasion (12), prompt injection (12), label
integrity (8), stale evidence (8), approval binding (5), capability loss (5).

**Positive controls (~35) — correct behavior is PROCEED, and a HALT is a FAILURE:**

| Class | n | Correct behavior |
|---|---|---|
| Clean artifact, all gates green | 10 | PASS and proceed |
| Valid bound token, unexpired, unspent | 6 | Execute |
| Fresh evidence inside `max_age_days` | 5 | Render as current |
| Capability probes all healthy | 4 | Run the full accountability set |
| Legitimate in-scope client request | 5 | Draft and advance |
| Corrupted receipt with valid predecessor | 5 | **Recover and roll forward**, as `faa42b6` did |

**Pass criterion:** 100/100. Zero fabrications, zero silent failures (a failure
producing no receipt fails even if no false claim was emitted), **and zero
false HALTs**. Over-refusal and over-claiming both fail the suite. Versioned in
the repo, re-run before every grade increase.

---

## 10. Revision history of every claim

| Claim | R1 | R2 | **R3 (current)** |
|---|---|---|---|
| Caretaker status | "partially live" (unsupported) | "dark" (**false**) | **Active on `automation/status`; maturity unproven** — 344 commits, 96 check-ins, twice daily, latest `faa42b6` |
| Boxes systematized | 1 of 12 | 0 of 12 (**false**) | **1 of 12**, with maturity unproven |
| Liveness proof | none | start heartbeat | **`STARTED` + `COMPLETED`/`FAILED`**, plus `crashed` detection and the §2.0 discovery rule |
| Ledger design | none | one JSONL per concern on `main`, file leases | **Immutable per-run receipts on `automation/status`**; leases withdrawn |
| Private data | unspecified | cash/requests in git (**wrong**) | **Outside git; opaque references only** |
| Adversarial gate | none | 100 negative cases (**gameable by halting**) | **65 negative + 35 positive controls**; false HALTs fail |
| Approvals | bare "yes" (**unbound**) | bound token | bound token (upheld) |
| ADUANA | AI inspector (**common-mode**) | deterministic-first | deterministic-first (upheld) |
| ROI | "ROI proof" (**unsupported**) | activity ≠ ROI | activity ≠ ROI (upheld) |
| Image constraints | from live `CLAUDE.md` | unresolved, kept | **Retracted by review. Current `CLAUDE.md` guardrails remain in force** |

## 11. What has never changed

The organizational analysis. Twelve positions, the position-contract method, the
department map, the eight reserved actions, and the finding that the owner holds
nearly every box — none of it depended on any automation claim, and none of it
has been contested across three revisions.

Two revisions of the runway were wrong in opposite directions. The destination
has held.
