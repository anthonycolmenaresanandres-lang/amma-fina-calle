# AMMA Project Portfolio — Triage & Plan of Attack

A repeatable method to evaluate **every program/project** (from the local code
inventory) and assign each a clear **move** + a sequence. Populate the master table
once `HANDOFFS/LOCAL_CODE_INVENTORY.md` lands (VBFH first). Philosophy follows the
business plan's **Managerial Factory** thesis: prefer projects that become reusable
modules or feed the factory, and **cap work-in-progress** (the founder is the bottleneck).

## The six moves (pick exactly one per project)
- **Double-down / Ship** — strategically core or near revenue → finish and launch.
- **Integrate** — folds into Fina Calle OS as a module (best factory fit).
- **Productize / Sell** — viable standalone product to package and sell.
- **Salvage** — keep the reusable parts (code/assets/lessons), retire the rest.
- **Park** — real potential, not now → freeze with an explicit *revisit trigger*.
- **Archive / Kill** — no fit/value → stop, document why, move on (nothing is "lost",
  it's recorded).

## Scoring rubric (1–5 each; higher = better)
- **Strategic fit** — with AMMA / the factory thesis
- **Revenue potential** — size **and** speed to first dollar
- **Completeness** — how finished it already is
- **Effort to ship** — *inverse* (less work = higher score)
- **Defensibility / moat** — relationships, density, library, integration, speed
- **Risk** — *inverse* (regulatory/technical/dependency risk lowers it)
→ Composite + a one-line rationale → the move.

## Prioritization (sequence the moves)
Plot **value** (fit × revenue × moat) against **effort**:
- **High value / low effort** → do first (quick wins).
- **High value / high effort** → the bets — pick **one** at a time.
- **Low value** → Park.
- **No fit** → Archive/Kill.
Keep **1–2 active builds max**; everything else parked with a trigger.

## Per-project template
```
### <Project name>
- Path / language / stack:
- What it does (1–3 sentences):
- State: works / WIP / abandoned
- Scores: fit _/5 · revenue _/5 · complete _/5 · effort _/5 · moat _/5 · risk _/5
- MOVE: <one of the six>
- Why (one line):
- Next concrete action:
- Blockers / dependencies (keys, accounts, data, IP/client constraints, compliance):
```

## Master table — fill from the inventory
| Project | Stack | State | Fit | Rev | Effort | MOVE | Next action |
|---|---|---|---|---|---|---|---|
| **VBFH** | _ | _ | _ | _ | _ | _ | _ |
| _ | | | | | | | |

## How we run it
1. **Inventory lands** (`HANDOFFS/LOCAL_CODE_INVENTORY.md` pushed, or pasted to chat) → I read every project.
2. I **score each**, assign a **move**, and draft the **next action + blockers**.
3. We agree the **sequence** (quick wins first); each chosen project then gets its own
   spec → build → PR, exactly like the Lead Arcade / voice gateway flow.
4. **Parked / killed** projects are documented here so the reasoning is preserved.

## Guardrails
Keep secrets out of the repo (redact keys); don't copy large binaries; respect any
client/IP/licensing constraints per project; flag anything regulated (payments,
health, employee/customer data) before building.

---
_Status: framework ready. Awaiting `LOCAL_CODE_INVENTORY.md` to populate the table._
