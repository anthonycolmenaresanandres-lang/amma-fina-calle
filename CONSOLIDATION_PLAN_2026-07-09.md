# AMMA / Fina Calle — Repo Consolidation Plan
**Generated:** 2026-07-09 by the Clone (read-only audit + safe preservation)
**Canonical repo:** `C:\Users\antho\OneDrive\Desktop\AMMA Ventures LLC DBA Fina Calle`
**Remote:** `github.com/anthonycolmenaresanandres-lang/amma-fina-calle` (main = prod, Vercel finacalleos.com)
**Backup:** `C:\Users\antho\AMMA_consolidation_backup_20260709-153535`

---

## TL;DR
You did **not** duplicate the app. There is **one** local clone of `amma-fina-calle` with **12 git worktrees** and 43 branches checked out across your home folder and Desktop. The "duplicate work" feeling = worktree/branch sprawl, not copied repos. Most branches are already merged into GitHub `main`. Three branches held work that existed **only on your disk** — those are now backed up and pushed to GitHub. Separately, the main checkout carries a large body of **uncommitted** work (billing, coaches, migrations, client packets) — now backed up, but it still needs to be committed to reach GitHub.

---

## What was done today (safe, reversible)
1. **Backed up** everything at-risk to `C:\Users\antho\AMMA_consolidation_backup_20260709-153535`:
   - `at-risk-branches.bundle` — unique commits of the 3 local-only branches (verified OK).
   - `main-tracked-changes.patch` (146 KB) + `main-untracked\` (74 files) — **all 40 uncommitted items from the main checkout** (Stripe billing, coaches module, Supabase migrations 0007/0010, CLIENTS/Colattao packets, OPERATIONS docs).
   - `amma-cc-atlas-uncommitted\` — the 6 uncommitted files from that worktree.
   - `lead-arcade-*` — the 1 uncommitted item from the lead-arcade worktree.
2. **Pushed** the 3 local-only branches to GitHub (new remote branches):
   - `claude/owner-landing`, `docs/portfolio-audit-2026-06-10`, `feat/command-center-code-atlas`.

Nothing was committed, merged, deleted, or force-pushed. Every worktree working tree is untouched.

---

## The map

### Canonical repo + its 12 worktrees
| Worktree path | Branch | Status |
|---|---|---|
| `OneDrive\Desktop\AMMA Ventures LLC DBA Fina Calle` (main) | `codex/local-code-inventory` | KEEP — main checkout, +1 pushed; **40 uncommitted items backed up, not committed** |
| `amma-owner-landing` | `claude/owner-landing` | KEEP — +4, **now pushed** |
| `amma-cc-atlas` | `docs/portfolio-audit-2026-06-10` | KEEP — +2 **now pushed**; 6 files backed up |
| `amma-news-page-wt` | `claude/news-page` | KEEP — +1, pushed (PR decision) |
| `amma-voice-ga` | `voice/field-house-tester` | PRUNE — merged into main |
| `.codex\worktrees\colattao-owner-polish` | `codex/colattao-owner-polish` | PRUNE — merged |
| `Documents\Codex\2026-06-11\wire-the-lead-arcade-pitch-step` | `claude/lead-arcade-pitch-email` | KEEP — +2 (behind remote 3) |
| `Desktop\AMMA Fina Calle Colattao Adzone` | `codex/colattao-adzone-coffee-pastry` | PRUNE — merged |
| `Desktop\AMMA Fina Calle Colattao Campaign Wiring` | `codex/colattao-campaign-adzone-wiring` | PRUNE — merged |
| `Desktop\AMMA Fina Calle Stadium Ball Kicker` | `codex/stadium-ball-kicker-art` | KEEP — +5, pushed (PR decision) |
| `Desktop\AMMA Fina Calle Stadium Chrome` | `codex/stadium-chrome-flags` | PRUNE — merged |
| `Desktop\AMMA Fina Calle Traffic PR132` | `pr-132-traffic-counter` | PRUNE — merged |

### Separate repos (NOT duplicates — leave alone)
- **vbfh-media-engine** — own GitHub repo. Clone: `OneDrive\Documents\soccer\VBFH APP email`; worktree `vbfh-engine-wt` (branch `feat/facility-info`).
- **APP Designs** (`C:\Users\antho\APP Designs`) — PermitReadyFence / Streamlit, branch `master`, **no remote**, local-only. Plus `APP_Backups` (zip snapshots of same).
- **cigar-butt-scanner** — Kalshi research terminal, branch `kalshi-research-terminal`, no remote, unrelated.

### Loose working copies (no git — decide)
- `voice-gateway-run` (`fina-calle-voice-gateway`) — the repo already carries `feat/voice-gateway-*` branches, so this may be a superseded copy. **Review before deleting.**
- `_finacalle_build` — flyer/build helper (node). Standalone utility; likely keep.
- `fina-calle-ops` — ops scripts (watchdog.ps1, newsroom-alerter). The Clone's domain; keep.

### Trash — 8 empty/failed Codex session shells (empty `.git` + `error.log`)
```
C:\Users\antho\Documents\Codex\2026-06-17\this-is-our-new-prospect-for
C:\Users\antho\Documents\Codex\2026-06-20\i-need-you-to-find-the
C:\Users\antho\Documents\Codex\2026-06-20\you-manage-the-voice-personalities-for
C:\Users\antho\Documents\Codex\2026-06-22\changing-lanes-how-can-we-make
C:\Users\antho\Documents\Codex\2026-06-22\find-out-if-there-is-a
C:\Users\antho\Documents\Codex\2026-06-28\repo-c-dev-escapethebomb-dc-first
C:\Users\antho\Documents\Codex\2026-07-07\anthony-here-new-focused-task-diagnose
C:\Users\antho\Documents\Codex\2026-07-07\full-handoff-is-committed-to-the
```

---

## PRUNE LIST — review, then run ONLY on your OK
> All targets below were verified as ancestors of `origin/main` (fully merged). Backup exists. Still gated — nothing here has been run.

Set once:
```powershell
$R = 'C:\Users\antho\OneDrive\Desktop\AMMA Ventures LLC DBA Fina Calle'
```

### Step 1 — remove the 6 merged worktrees
> Verified 2026-07-09: all six target worktrees are clean (0 uncommitted files) — safe to remove.
```powershell
git -C $R worktree remove 'C:/Users/antho/amma-voice-ga'
git -C $R worktree remove 'C:/Users/antho/.codex/worktrees/colattao-owner-polish'
git -C $R worktree remove 'C:/Users/antho/OneDrive/Desktop/AMMA Fina Calle Colattao Adzone'
git -C $R worktree remove 'C:/Users/antho/OneDrive/Desktop/AMMA Fina Calle Colattao Campaign Wiring'
git -C $R worktree remove 'C:/Users/antho/OneDrive/Desktop/AMMA Fina Calle Stadium Chrome'
git -C $R worktree remove 'C:/Users/antho/OneDrive/Desktop/AMMA Fina Calle Traffic PR132'
git -C $R worktree prune
```

### Step 2 — delete the merged branches (worktree ones + branch-only)
> `-d` is safe (merge-verified). If git refuses because HEAD isn't `main`, `-D` is safe for these specific verified-merged branches.
```powershell
$merged = @(
 'voice/field-house-tester','codex/colattao-owner-polish','codex/colattao-adzone-coffee-pastry',
 'codex/colattao-campaign-adzone-wiring','codex/stadium-chrome-flags','pr-132-traffic-counter',
 'codex/colattanini-campaign-plan','codex/colattao-winner-background','codex/preserve-client-os-routes',
 'docs/voice-personalities-runbook','feat/call-timing-warm-bookends','feat/colattao-info-line',
 'feat/owner-dashboard-premium','feat/vbfh-info-line','feat/voice-gateway-realtime-ga',
 'feat/voice-quality-tuning','fix/auth-confirm-verify-types','fix/owner-login-token-hash',
 'fix/render-blueprint-paths','voice/colattao-tester','voice/colattao-tester-073433',
 'voice/natural-turn-taking','voice/original-barge-in-plus-noise-reduction','voice/realtime-model-hotfix',
 'voice/realtime-probe','voice/remove-noise-reduction-hotfix','voice/restore-barge-in',
 'voice/runtime-diagnostics','voice/session-probe','voice/vbfh-tester-171128'
)
foreach($b in $merged){ git -C $R branch -d $b }
git -C $R remote prune origin
```

### Step 3 — delete the 8 empty Codex shells (optional cleanup)
```powershell
# review first, then:
# Remove-Item -Recurse -Force '<each path from the Trash list above>'
```

### Keep (unmerged — all pushed to GitHub; these are PR/merge decisions, not deletions)
`codex/local-code-inventory`, `claude/owner-landing`, `docs/portfolio-audit-2026-06-10`,
`claude/news-page`, `claude/lead-arcade-pitch-email`, `codex/stadium-ball-kicker-art`,
`feat/ai-request-desk-phase-0`, `feat/vbfh-facts`, `feat/command-center-code-atlas`, `voice/twiml-stream-fallback`

---

## Housekeeping notes
- Local `main` is behind `origin/main` by 33 and isn't checked out in any worktree. Refresh with: `git -C $R fetch origin && git -C $R branch -f main origin/main`.
- After pruning, `git -C $R worktree list` should show ~6 worktrees (the KEEP set), and `git -C $R branch` a much shorter list.

## Verify after prune
```powershell
git -C $R worktree list
git -C $R branch -vv
git -C $R status
```

## Open decisions for Anthony
1. **Main checkout has 40 uncommitted items** (billing, coaches, migrations 0007/0010, CLIENTS/OPERATIONS docs) — backed up but not in git. Commit to `codex/local-code-inventory` and push / open a PR? *(Recommended — biggest unsaved surface.)*
2. Run the prune list (Steps 1–2)? Delete the 8 empty shells (Step 3)?
3. `voice-gateway-run` and `_finacalle_build` — superseded by in-repo work, or keep as-is?
4. Merge any KEEP branches into `main` via PR now, or leave them?
