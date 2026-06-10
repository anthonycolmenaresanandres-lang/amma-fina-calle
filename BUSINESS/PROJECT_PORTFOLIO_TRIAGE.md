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
## Populated triage — 2026-06-10 (from LOCAL_CODE_INVENTORY)

**Read:** one tight **AMMA core** (the business), **two standout separate products**
(VBFH, Newsroom), and a tail of **off-thesis experiments**. WIP-cap → build **VBFH
first**; everything else is cleanup, park, or archive.

### Tier 1 — AMMA core (ship / consolidate; this is the company)
| Project | Move | Why → next action |
|---|---|---|
| **AMMA Ventures (canonical repo)** | **Double-down** | The hub — all our work lands here. Keep as source of truth. |
| 4 AMMA variant clones (Adzone, Campaign Wiring, Ball Kicker, Stadium Chrome) | **Salvage/consolidate** | Stale working copies of the same remote; work already merged. → confirm nothing unmerged, then delete the local clones (CLONE_CONTROL hygiene). |
| **Fina Calle Landing** | **Ship** | ~done static marketing site. → confirm it's the deployed public site; point the domain. Quick win. |
| **Colattao Cafe Rush** | **Ship + harvest** | Live client promo game (catch-game → discount + QR/menu). → ship for Colattao; pull reusable patterns into the OS game library. |
| Colattao asset clone · anime pack · `_finacalle_build` | **Salvage** | Asset/scripts annexes. → move useful assets into `ASSET_REGISTRY/` + scripts into `tools/`, archive the folders. |
| Fina Calle ops watchdog · **Shadow Engineer (RPA)** | **Keep (internal tooling)** | Governance/automation for clone-control + repo watchdog. → fold the watchdog into Shadow Engineer; not sold, internal force-multiplier. |

### Tier 2 — build bets (separate sellable products; one at a time)
| Project | Move | Why → next action |
|---|---|---|
| **VBFH Media Engine** ⭐ | **Productize / Sell** | Sports-facility/league **media automation** (scrape schedules → branded recaps + captions + PPTX + email). **FIRST.** ✅ Pushed to GitHub (`anthonycolmenaresanandres-lang/vbfh-media-engine`, private). ✅ **Phase 0 DONE** — daily **cloud trigger live** (scheduled GitHub Action `daily.yml`; manual run green w/ artifacts; chose **2b** over a Windows task). Next: productization Phase 1 (de-VBFH → multi-tenant via `brandConfig`), branding pack, 2nd pilot; optional: emailed delivery (add SMTP secrets + flip `EMAIL_ENABLED`). |
| **Dual Perspective Newsroom** | **Productize *or* Integrate** | Big content-automation engine (IG/X, fact/claim separation, Fina Calle publish). High potential, high effort, brand risk. → **2nd** bet; decide standalone product vs the Fina Calle "content engine" module. |

### Tier 3 — Park (real but off-core; revisit when AMMA core has revenue)
| Project | Move | Why |
|---|---|---|
| **PermitReadyFencePacket** | **Park → Productize (separate vertical)** | Genuinely sellable construction/permitting SaaS, but a different market — park until core has momentum. |
| Kalshi Research Terminal (ex Cigar-Butt) | **Park** | Personal fin-research; off-thesis. |
| Franchise Certainty (sim + Arduino) | **Park** | Early hardware PoC; off-core. |
| New Project 2 (Unity) | **Park** | Game experiment; revisit only if it feeds the OS game library. |
| Local AI Agent | **Park/Salvage** | Likely superseded by Codex + Shadow Engineer; harvest ideas, don't maintain. |

### Tier 4 — Archive (dead / off-core; document & stop)
VBFH desktop placeholder (empty) · CLMH_Analysis (astronomy stubs) · first-game ·
first-game-ever (2025 Godot) · Hail Marry (DICOM/medical — personal) · Newsroom
hardware sketch (nested appendix).

### Sequenced plan of attack (WIP-capped)
1. **VBFH** — get it on a remote → I review → productization spec → build/ship. *(active build #1)*
2. **Core cleanup (parallel, low effort):** delete the 4 stale AMMA clones, ship/confirm Landing, salvage asset/anime/build scraps into the canonical repo, fold watchdog into Shadow Engineer.
3. **Colattao Cafe Rush** — ship for Colattao + harvest into the OS. *(active build #2 candidate)*
4. **Newsroom** — decide integrate-vs-standalone; then build. *(next bet)*
5. **Park** Tier 3 with revisit triggers; **archive** Tier 4 (record why).

### Enabling steps (needed before I can touch code)
- **No-remote git repos** (VBFH, Kalshi, PermitReady, Franchise Certainty, Unity, clone):
  push each to a GitHub remote (Codex: `gh repo create <name> --private --source . --push`)
  so I can read/work it. Start with **VBFH**.
- **Secrets:** several repos contain `.env`/credentials — **do not** read/modify/migrate
  them without explicit OK; keep them out of any repo I touch.

