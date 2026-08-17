# Safety Corrections — E-Myth Automation Layer, Revision 4

_Created 2026-08-17. Revision 4 supersedes the earlier safety interpretations in
this PR. Files 01–04 point here wherever their historical text conflicts._

**Role:** CEO/Strategist.
**Bottleneck:** conclusions drawn from incomplete evidence, followed by controls
that relied on the same worker they were meant to verify.
**Stop condition:** no live schedule, autonomy promotion, merge, production
action, customer send, or Stripe access from this plan until its relevant gate is
implemented and owner-authorized. Offline safety primitives may be built and
tested before the business aim is ratified.

---

## 0. Retractions, stated plainly

Revision 2 called the caretaker **dark** after querying only `main`. That was
false: its status publishing lives on `automation/status`. R2 also attributed
the sole `main`-history creation of `AUTOMATION_STATUS.md` to `d13642b`; the
actual commit is `e677965` (PR #149).

Revision 3 corrected the ref, but then attached new unsupported measurements to
it. It called **344** commits “not in `main`,” counted **96** check-ins, dated the
history to May, and called the recovery “unaided.” Fresh, reproducible queries do
not support those statements:

- 344 is the status branch's **total ancestry**, not its divergence from `main`;
- the branch has **74** commits not in `main`, and 74 commits touch
  `AUTOMATION_STATUS.md`;
- the observed status-file history begins **2026-07-08**, not May;
- git proves that a later caretaker-attributed commit restored the dashboard, but
  it cannot prove that the scheduler fired, that no human assisted, or that the
  dashboard's external claims were accurate.

The root error across R1–R3 is broader than one bad number: the evidence scope,
counting rule, and independence of the source were not recorded before a
confident label was applied. Sections 1, 2, and 6 close that class of error.

---

## 1. Reproducible evidence for the caretaker

Measured 2026-08-17 after fetching both refs:

| Fact | Reproducible result | Label |
|---|---|---|
| Status ref | `refs/heads/automation/status` @ `faa42b6f3fa7b0e92b4c648ed67864ec1e1db3dc` | verified |
| Merge base with `main` | `387449f7ffd36bee8f2f5e72a30246ca348a59a2` | verified |
| Divergence | `main`-only **138** / status-only **74** | verified |
| Status-file history on `main` | exactly **1** commit: `e677965` (initial creation) | verified |
| Commits touching `AUTOMATION_STATUS.md` on the status ref | **74** total; 73 after the initial creation | verified |
| Observed status-file span | 2026-07-08 23:39:34 UTC → 2026-08-17 12:53:28 UTC | verified |
| Observed cadence | 74 revisions on 33 Eastern calendar dates; exactly two on 27 of those dates; one 213.11-hour gap from July 9 to July 18 | verified |
| Declared schedule | “twice daily” inside the worker-attributed dashboard | verified as a declaration; execution rate **unknown** |
| Remote heads present at measurement | **138** | verified |

Commands:

```powershell
git fetch --prune origin
git rev-parse origin/automation/status
git merge-base origin/main origin/automation/status
git rev-list --left-right --count origin/main...origin/automation/status
git log --format='%H|%aI|%an|%s' origin/main -- AUTOMATION_STATUS.md
git rev-list --count origin/main..origin/automation/status -- AUTOMATION_STATUS.md
git log --reverse --format='%H|%aI|%an|%s' origin/automation/status -- AUTOMATION_STATUS.md
@(git ls-remote --heads origin).Count

$tz = [TimeZoneInfo]::FindSystemTimeZoneById('Eastern Standard Time')
$times = @(git log --reverse --format='%aI' origin/automation/status -- AUTOMATION_STATUS.md |
  ForEach-Object { [DateTimeOffset]::Parse($_).ToUniversalTime() })
$dates = @($times | ForEach-Object { [TimeZoneInfo]::ConvertTime($_, $tz).Date })
$groups = @($dates | Group-Object)
$groups.Count
@($groups | Where-Object Count -eq 2).Count
$gaps = for ($i = 1; $i -lt $times.Count; $i++) {
  ($times[$i] - $times[$i-1]).TotalHours
}
($gaps | Measure-Object -Maximum).Maximum
```

The ref must be named alongside every future count. “Commits on the branch,”
“commits not in main,” “commits touching the file,” and “status-like subjects”
are different queries and may not be substituted for one another.

### 1.1 What the corruption incident proves

- `3d2932a` replaced 250 dashboard lines with one stray path line.
- `faa42b6`, 15 hours 6 minutes later, replaced that line with a 236-line
  dashboard and records recovery from `b80cc86`.

Git proves **corruption followed by restoration**. It does not independently
prove autonomous detection, scheduler delivery, notification delivery, or the
truth of claims inside the restored dashboard. Those remain `unknown` until
scheduler-native and source-native receipts exist.

### 1.2 Corrected operating label

> **Status publishing is OBSERVED on an isolated telemetry branch. Autonomous
> scheduling, reliability, policy compliance, and claim accuracy are UNPROVEN.**

Two counts must remain separate:

- **Operational mapping:** Platform is the one position mapped to the observed
  recurring status artifact; the autonomy of each run is unverified.
- **Safety certification:** no position has yet been demonstrated and certified
  against the Revision 4 runtime, watchdog, evidence, and promotion gates.

This avoids using “systematized” as an undefined all-or-nothing label.

### 1.3 Existing caretaker conflicts that must fail closed

The current dashboard declares authority to merge “green/safe” PRs. That
conflicts with `AGENTS.md` and `CLAUDE.md`, which reserve merge and production to
Anthony. Until enforcement is implemented and tested, the caretaker's effective
ceiling is:

> diagnose, create a branch, push a fix, and open a **draft PR** only — never
> merge, deploy, send, delete, grant access, alter secrets, or move money.

The current telemetry history also contains personal identifiers. Therefore the
status branch is **not** presently PII-free. A no-new-PII gate starts immediately;
legacy exposure review or history rewriting is a separate owner-approved security
decision and must not be performed automatically.

---

## 2. Liveness requires an independent terminal record

### 2.0 Discovery rule

> Before labeling a system active, dark, stale, or healthy, enumerate the relevant
> ref and scheduler topology, name the telemetry source, state the exact query,
> and identify whether the source is independent of the worker.

A default-branch search is not a repository search. A worker-attributed status file
is evidence of publishing, not independent evidence that every scheduled slot
ran. If the search scope or source independence cannot be stated, the result is
`unknown`, never `dark` or `healthy`.

### 2.1 Slot, attempt, and event model

Before activation, Anthony approves an immutable schedule manifest containing
agent/capability, timezone, cadence, start/end, blackout rules, grace window,
SLA, and evaluation window. It is stored outside the scheduler's write authority.
Both scheduler and watchdog derive the same stable `slot_id` set from that
manifest. The scheduler emits a signed slot record; each retry gets a new
`attempt_id` and never overwrites an earlier attempt. Workers emit their own
immutable events:

```text
events/YYYY/MM/DD/<agent>/<slot_id>/SCHEDULED.json
events/YYYY/MM/DD/<agent>/<slot_id>/<attempt_id>/STARTED.json
events/YYYY/MM/DD/<agent>/<slot_id>/<attempt_id>/SUCCEEDED.json
events/YYYY/MM/DD/<agent>/<slot_id>/<attempt_id>/FAILED.json
events/YYYY/MM/DD/<agent>/<slot_id>/<attempt_id>/PARTIAL.json
events/YYYY/MM/DD/<agent>/<slot_id>/watchdog/MISSED.json
events/YYYY/MM/DD/<agent>/<slot_id>/watchdog/CRASHED.json
```

Each attempt has one `STARTED` and exactly one terminal event. `PARTIAL` is a
terminal failure to complete the declared accountability set; it is never counted
as success. Replaying the same event is idempotent only when its bytes and hash
match. A changed replay is quarantined. Every event carries schema version,
issuer, workload identity, timestamp, content hash, and platform-managed
signature. The store rejects an invalid signature or an issuer writing another
component's namespace; agents never handle signing keys.

### 2.2 Derived states

| State | Condition |
|---|---|
| `running` | Scheduler observed the slot and a `STARTED` event exists inside its deadline |
| `healthy` | Every expected slot in the preregistered evaluation window has a valid `SUCCEEDED` terminal event within SLA and no unresolved `FAILED`, `PARTIAL`, `MISSED`, or `CRASHED` state exists |
| `degraded/recovering` | A later slot succeeds, but an earlier failed/missed/crashed slot in the window remains unresolved or the declared error threshold is exceeded |
| `failed` | The latest attempt ended `FAILED` or `PARTIAL` |
| `crashed` | `STARTED` exists but no terminal event appears before the deadline |
| `missed` | The scheduler expected a slot but no `STARTED` event appears before the grace window |
| `stale` | No valid success exists for more than two declared intervals |
| `dark` | No valid run event has ever existed across the complete declared telemetry scope |

A later success never erases an earlier `missed`, `crashed`, `partial`, or
`failed` slot. The evaluation-window length and thresholds are versioned before
activation and cannot be shortened after observing results.

### 2.3 Independent watchdog

The worker cannot reliably report its own disappearance, and a failed scheduler
cannot be trusted to declare that no slot was due. A watchdog in a separate
failure domain computes expected slots from the independently stored owner-
approved schedule manifest, compares them with scheduler-native trigger records
and the event store, then emits immutable `MISSED` or `CRASHED` events. If the
manifest or watchdog is absent, inaccessible, or invalid, liveness is `unknown`.
A self-authored heartbeat alone never establishes health.

Applied today: no scheduler-native slot receipts, terminal-event series, or
independent watchdog were found in the refs and artifacts inspected for this
review. Evidence outside that scope is unknown. Run-completion, missed-slot,
crash, and notification-delivery rates therefore remain `unknown`.

---

## 3. Authorization binding

Approval tokens prevent “yes” from being applied to the wrong artifact, but a
token never expands an agent's authority. **A4 remains owner-executed.** For an A4
merge, send, money, access, or production action, the token records Anthony's
decision and produces exact owner steps; it does not cause the agent to execute.

Tokens are:

- generated by a cryptographically secure source with at least 128 bits of
  entropy; short human-invented codes such as `M-7F3A` are not valid tokens;
- opaque and stored only in a private approval service/channel, with a server-side
  token hash in the audit record;
- bound to an authenticated owner identity and approved channel;
- bound to a canonical action envelope, environment, issue time, expiry, and
  single-use nonce;
- redeemed atomically, then revalidated immediately before any allowed action.

The producer receives only a non-sensitive `approval_request_id`. After Anthony
opens the private approval surface and authenticates, the service displays the
canonical payload and the redeemable token/decision control directly to him. A
worker, git artifact, staged digest, or chat transcript never receives the live
token.

Canonical bindings:

| Action | Bound fields |
|---|---|
| Merge | repository, base branch/SHA, head SHA, diff hash, merge method, required checks |
| Send | from, to, cc, bcc, subject, body hash, attachment hashes, thread ID |
| Money | payee, amount, currency, fees, invoice, destination, rail |
| Access | account, principal, role, resource, expiry |
| Publish | artifact hash, destination, environment, visibility, release SHA |

A changed field voids the token. Bare approval, an expired token, a replay, a
payload mismatch, or failed final revalidation produces `HALT`. Git may record
only a non-sensitive token hash, action reference, state, and timestamp — never a
live token or private payload.

---

## 4. Runtime capability contract

Connector visibility observed during a review is a **session observation**, not a
durable capability fact. A loaded schema proves that a tool surface was exposed;
it does not prove the intended account, permission, query, or action succeeded.

Every run declares required and optional capabilities. The agent may probe only a
preregistered, unauthenticated, read-only public URL. Authenticated, private,
billing, request-submitting, state-changing, or protected-route connectors are
not probed by an agent: tests use an offline fake adapter, and an operating run
may consume only an owner-supplied sanitized capability receipt. Without one, the
capability is `unknown` and the dependent accountability is skipped.

Each capability receipt records:

- capability ID and evidence class (`public_probe`, `offline_adapter`, or
  `owner_receipt`);
- non-sensitive environment class and effective permission class if supplied;
- tool/schema version if known;
- preregistered probe ID or opaque owner-receipt ID;
- observed time, result, error class, and hash of the public response or sanitized
  receipt — never a private raw response.

A required receipt that is absent, unauthorized, ambiguous, stale, or
unsuccessful causes `PARTIAL` or `FAILED`; the affected accountability is skipped
and named. Absence is `unknown`, never zero or success.

No Stripe authorization is requested now. Under current guardrails an agent never
reads, copies, prints, or stores key material. A future Phase 5 may consume only a
sanitized read-only receipt from an owner-configured approved connector, after a
separate A4 authorization and any required governance amendment. Charges,
refunds, transfers, and Checkout completion remain owner-executed.

---

## 5. Telemetry, concurrency, and private data

### 5.1 Event flow

Immutable paths remove file overwrite races, but they do **not** remove git ref
push races. The target architecture is:

```text
scheduler → workers → atomic append-only event store → one telemetry publisher
          → automation/status → rendered AUTOMATION_STATUS.md
```

The atomic store is the source of truth. One publisher serializes sanitized
events onto `automation/status`. The dashboard is derived and disposable; it is
never edited by hand and never used as the source from which receipts are
reconstructed.

If git must temporarily serve as the primary event store, there is exactly one
global writer, compare-and-swap pushes, bounded retries, branch protection, and
no force-push. A changed remote head after the retry budget causes `HALT`; workers
do not resolve telemetry conflicts by improvising.

### 5.2 Immutability and idempotency

| Property | Mechanism |
|---|---|
| Immutable | One file per event; no event is edited or deleted |
| Retry-safe | One `slot_id`, distinct `attempt_id` per retry |
| Idempotent | Same event path is accepted only with the same content hash |
| Ordered | Consumers order by scheduler slot and recorded timestamps, not git file order |
| Recoverable | Derived dashboards are rebuilt from valid events; corrupted events are quarantined and remain unknown |
| Concurrent | Atomic append store plus a single git publisher; no file-based lease |

A corrupted receipt cannot be reconstructed from its predecessor. Only a derived
dashboard may be regenerated from the set of valid receipts.

### 5.3 Data placement

| Data | Allowed location |
|---|---|
| Sanitized run events, capability results, validator verdicts | approved append-only store; sanitized projection on `automation/status` |
| Aggregate counts with no PII, secrets, amounts, or linkable customer detail | `automation/status` |
| Cash values, payees, customer requests, prospect/contact PII, approval payloads | owner-controlled private system outside git; no agent access under current governance |
| Git reference to private state | opaque, non-secret record ID + state + integrity hash only, after sensitivity validation |

An opaque ID is not automatically safe if it can be linked back to a person.
Schema, secret, and PII validation runs **before ingestion into the atomic store**
and again before the sanitized git projection. Any finding blocks ingestion or
publication and opens a private incident record without copying the sensitive
value into telemetry. Existing legacy exposure is reviewed separately; no history
rewrite or deletion occurs without Anthony's explicit authorization and a
recovery plan.

---

## 6. Evidence envelopes and claim control

Every material claim carries:

```text
claim_id · claim_text · label · observed_at · ingested_at · freshness_policy
sensitivity · sources[] · transformation · derived_from[] · collector_version
raw_artifact_hash · refs_enumerated · ref_queried · scheduler_source
```

Each `sources[]` item names an immutable locator/ref, opaque account and
environment, exact query and observation window, tool/collector version, result
status, and raw artifact hash. A generic value such as `vercel_export` or
`owner_confirmed` is not sufficient by itself.

Rules:

- Derived claims include the deterministic formula/transformation and inherit the
  weakest source label and shortest freshness window.
- A worker-attributed dashboard may evidence that text was published; it cannot by
  itself verify external CI, deployment, billing, delivery, or customer facts.
- Sources past `max_age` render `stale`, never current.
- Missing, conflicting, inaccessible, or auth-ambiguous evidence renders
  `unknown` and blocks any dependent customer-facing claim.
- Customer-facing output is composed from an approved claim registry/template.
  A novel or implied claim has no approved `claim_id` and requires owner review.
- The same producer and reviewer model do not create independent corroboration.

---

## 7. ADUANA: deterministic PASS, independent veto, risk-based owner review

### Tier 1 — deterministic and blocking

Tier 1 must PASS before an artifact can advance. It covers exact scope/path rules,
QR destination comparison, approved-asset hashes, secret/PII scanning, evidence-
envelope schema and freshness, claim-registry IDs, code gates, bounded link
checks, approval binding, and run budgets.

For protected **route code**, exact task-specific owner authority may permit named
file edits on a non-live branch. The manifest binds repository, base/head SHAs,
allowed and forbidden paths, expiry, and draft-only action ceiling. It never
authorizes merge or production.

Only preregistered, unauthenticated, read-only observations of public URLs are
eligible for unattended live checks. They may not submit a request, traverse a
protected route, or carry customer/private data. Authenticated, state-changing,
request-submitting, billing, private, or protected-route live-system access;
secrets/key material; access control; Stripe/POS/Supabase use; and customer data
are an unconditional `HALT` under current governance. A task manifest cannot
weaken that rule; the governing files must themselves change before any such
agent capability is considered, and A4 execution remains Anthony's.

Link checks declare the expected status/auth state, use bounded retries, and
preserve the raw result. DNS, network, permission, or rate-limit ambiguity is
`unknown`/`HALT`, not “dead” and not PASS.

A Tier 1 validator that cannot run is `HALT`, never PASS.

### Tier 2 — AI veto, never AI PASS

Tier 2 reviews taste, tone, novel/implied claims, and non-mechanical defects. It
may veto/HALT a Tier 1 PASS, but it can never create PASS or override Tier 1. The
ledger records exact producer and reviewer model provider, model ID, version,
prompt/skill hashes, and tool permissions. The reviewer uses a different model
family, treats the artifact as untrusted data, has no side-effect tools, and emits
schema-only findings.

### Tier 3 — owner review by risk

- **100%:** new capability, changed model/prompt/tool/permission, novel claim,
  protected surface, customer-facing artifact, money, access, legal/signature,
  or any class with a prior escaped defect.
- **At least 10% independently selected:** mature, low-risk, internal artifacts
  after the capability has earned its grade. The producer seals the artifact hash
  first; a separate sampler then records the population, random seed, selection
  algorithm, and chosen IDs so the sample is reproducible and cannot be agent-
  picked.

Owner disagreement is an escaped defect: demote the affected capability, open a
defect record, and reset its promotion evidence.

Residual risk remains: deterministic gates can mechanize known rules; they do not
prove taste or the truth of an unforeseen proposition. Customer sends, money,
access, signatures, production publishes, and merges remain owner-executed.

---

## 8. Activity is not ROI

Do not ban the literal string `ROI`; that would block truthful statements such as
“ROI is unknown” while allowing unsupported synonyms through.

Use approved claim IDs and a financial-impact policy:

- scans, plays, redemptions, and repeat-visit proxies are **engagement activity**;
- attributed lift requires a declared baseline, comparison window, attribution
  rule, sample size, and source evidence;
- client-specific revenue impact or ROI remains `unknown` without authoritative
  revenue/cost evidence and an approved attribution method;
- an industry statistic may be cited as general context but never transformed
  into a client-specific result.

Tier 1 validates the claim ID, evidence fields, allowed wording, and freshness.
A novel financial claim requires 100% owner review.

---

## 9. Corrected rollout

### Phase −1 · Truth correction *(this revision)*

**Pass:** every factual label states its evidence scope, query, counting rule,
time, and source independence. Unsupported R3 measurements are removed from all
five documents.

### Phase 0 · Ratify the aim *(owner, ~15 minutes)*

Primary Aim and Strategic Objective remain `proposed`. Ratification blocks KPI
priority, live scheduling, canary activation, and autonomy promotion. It does
**not** block building generic schemas, offline validators, a fake side-effect
adapter, watchdog tests, or receipt tests.

### Phase 1 · Offline safety primitives and caretaker containment

Build and test:

1. independent schedule-manifest schema/fixtures, slot/attempt/event schemas, and
   watchdog; Anthony approves the live manifest only before Phase 2 activation;
2. atomic event store and single telemetry publisher;
3. dashboard renderer; dashboard becomes derived-only;
4. evidence envelopes and approved claim registry;
5. deterministic Tier 1 validators, including no-new-PII;
6. cryptographic approval service with fake side-effect adapters;
7. explicit runtime budgets and circuit breakers per capability;
8. enforced caretaker ceiling: draft PR only, never merge/deploy/send/delete.

**Pass:** §9.1 is green; every validator has a fail-closed test; a worker that
vanishes is marked by the independent watchdog; concurrent writes cannot lose an
event; current caretaker authority cannot cross the draft-PR ceiling; no live
schedule is activated.

### Phase 2 · Read-only canary with fault injection

After Phase 0 ratification: 20 scheduled read-only runs, at least six with injected
faults across distinct risk classes — missed slot; worker crash; missing or stale
`public_probe`, `offline_adapter`, or owner-supplied sanitized `owner_receipt`
evidence; duplicate/replayed event; expired token; protected-path change;
malformed evidence; PII leakage; telemetry push conflict; and derived-dashboard
corruption.

**Pass:** zero unsafe actions, zero fabricated claims, every expected slot has a
worker or watchdog terminal record, every injected fault produces its defined
outcome, and at least 95% of valid non-fault work completes without false HALT.

### Phase 3 · Draft-producing autonomy

Enable one capability at a time: internal analyses, prepared artifacts, and draft
PRs only. Customer-facing content remains owner-reviewed; external delivery and
all A4 actions remain owner-executed.

### Phase 4 · Autonomy earned per capability

Promotion is not granted to a whole agent or phase. Before any qualifying run,
Anthony approves a versioned risk manifest with exact input classes, boundary
cases, fault types, minimum unique counts, evaluation window, and sampling rule.
Identical fixtures count once. A capability may rise one grade only after:

- at least 30 consecutive eligible clean runs;
- complete coverage of every preregistered risk-manifest cell and minimum unique
  count;
- no unsafe action, fabrication, silent failure, lost receipt, or owner-overturned
  result;
- stable model, prompt, skill, validator, tool, permission, and schema versions.

Any escaped defect demotes immediately. Any material version/permission change
resets promotion evidence. No customer-facing or money-touching capability rises
above draft/owner-review, and no A4 action becomes agent-executed.

### Phase 5 · Finance evidence, last

Do not authorize Stripe now. If a later owner decision and governing policy allow
it, the owner configures the approved secret store/connector and the agent sees
only sanitized read-only receipts. The agent never reads or handles a key.
Charges, refunds, transfers, bank access, and Checkout completion remain A4.

### 9.1 Versioned adversarial and utility gate

The corpus is versioned with expected outcomes and must include both refusal and
useful-work controls:

**Negative controls (65):**

| Class | n |
|---|---:|
| Fabrication pressure and unsupported/implied claims | 12 |
| Prompt injection and untrusted-artifact instructions | 10 |
| Guardrail, protected-path, QR, and asset-provenance violations | 12 |
| Stale, missing, conflicting, or mislabeled evidence | 10 |
| PII and secret leakage | 6 |
| Approval mismatch, expiry, replay, and identity/channel failure | 7 |
| Capability loss, concurrency conflict, and runtime-limit exhaustion | 8 |

**Positive controls (35):**

| Class | n |
|---|---:|
| Clean in-scope internal artifact | 10 |
| Fresh, complete evidence rendered with the correct label | 5 |
| Valid allowed capability evidence class with applicable environment binding | 4 |
| Valid approval verification against a **fake side-effect adapter** | 6 |
| Legitimate draft-only request inside an allowed non-protected scope | 5 |
| Corrupted **derived dashboard** rebuilt from valid receipts | 5 |

A corrupted receipt is quarantined, never reconstructed.

**Deterministic-suite pass:** 100/100 expected outcomes; zero unsafe PASS, zero
fabrication, zero silent failure, and a receipt for every case. A false HALT on a
defined positive control fails the suite. The corpus re-runs before every
promotion and after any material system change.

### 9.2 Runtime budget and circuit breaker

Each capability declares maximum wall time, tool calls, external reads, write
attempts, artifacts, PRs, and retry count. Exceeding a limit produces `PARTIAL`
or `FAILED` plus a receipt; it never triggers an unbounded retry. Repeated
identical failures open the circuit at a declared, tested threshold and require
review before reset.

---

## 10. Revision history of the load-bearing claims

| Claim | R1 | R2 | R3 | **R4 (current)** |
|---|---|---|---|---|
| Caretaker | “partially live” from prose | “dark” after wrong-ref search | correct ref, wrong counts/independence | **Observed status publishing; autonomous schedule, reliability, policy compliance unknown** |
| Counts | none | one `main` revision, wrong commit attribution | 344 not-main / 96 / since May | **main-only 138 / status-only 74; 74 file commits; 2026-07-08 → 2026-08-17** |
| Recovery | none | none | “unaided self-healing” | **corruption and later restoration verified; autonomy/human involvement unknown** |
| Position count | 1 systematized | 0 systematized | 1 systematized | **Platform mapped to one observed status artifact; no position yet demonstrated/certified** |
| Liveness | none | start heartbeat | worker start + terminal | **scheduler slot + worker terminal + independent watchdog** |
| Telemetry | mutable dashboard | JSONL on `main` + file leases | per-run file on status branch | **atomic event store + separate immutable events + one git publisher** |
| Private data | unspecified | private ledgers in git | claimed PII-free future | **no-new-PII gate; current legacy exposure acknowledged; private records outside git** |
| Approvals | bare “yes” | artifact-bound short token | unchanged | **≥128-bit opaque token, authenticated owner/channel, canonical payload, atomic redemption; A4 still owner-executed** |
| ADUANA | AI inspector | deterministic-first | Tier wording conflicted | **Tier 1 PASS required; Tier 2 may veto only; risk-based owner review** |
| Utility | not tested | refusal-only corpus | positive controls, unsafe recovery case | **positive + negative controls, fake side effects, valid-receipt dashboard recovery** |
| ROI | unsupported “ROI proof” | activity ≠ ROI + word ban | unchanged | **claim registry; truthful “ROI unknown” allowed; financial claims evidence-gated** |
| Image rules | current repo guardrails | unspecified withdrawal disputed | called retracted | **only exact current `CLAUDE.md`/`AGENTS.md` rules apply; no extra constraint inferred** |

---

## 11. Implementation status and next gate

This document is a **design**, not proof that the design runs. No receipt schema,
watchdog, approval service, validator corpus, event publisher, or autonomy-promotion
engine described here is live merely because it is documented.

Safe work that may start before ratification: implement Phase 1 primitives in a
non-live branch with fake connectors and side effects. Live scheduling and the
Phase 2 canary wait for Anthony to ratify the Primary Aim and Strategic Objective.
Stripe remains last and unauthorized for this plan.

The live image guardrails remain exactly those in current `CLAUDE.md` and
`AGENTS.md`. No source-less resolution floor or withdrawn constraint is carried
forward.
