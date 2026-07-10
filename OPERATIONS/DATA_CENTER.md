# DATA CENTER â€” the one place all work lives

_Set 2026-07-09. Supersedes any earlier "canonical clone" path. Read this before touching code._

## The rule (one sentence)
**All Claude + Codex + Clone work on AMMA / Fina Calle happens inside the hub `C:\dev\amma\` â€” never on OneDrive, the Desktop, or scattered home folders.**

## Why
Repos were previously sprawled across `OneDrive\Desktop`, the home folder, and `.codex\worktrees` as 12+ git worktrees. OneDrive actively locks `.git`, which corrupts git operations (it broke a worktree prune on 2026-07-09). One local, non-synced hub ends this whole class of problem.

## The hub layout
```
C:\dev\amma\
  amma-fina-calle\     <- canonical clone (GitHub: anthonycolmenaresanandres-lang/amma-fina-calle). main = prod.
  vbfh-media-engine\   <- sibling product (GitHub: .../vbfh-media-engine)
  voice-gateway\       <- fina-calle voice service (version-controlled here; GitHub: anthonycolmenaresanandres-lang/fina-calle-voice-gateway)
  worktrees\           <- ALL git worktrees go here, one subfolder per task
```

## Coordination contract (extends the Operating Model constitution)
> **Claude decides. Codex executes. Clone watches. Anthony approves irreversible actions.**

- **One clone per repo.** Never re-clone elsewhere. Operate with `git -C C:\dev\amma\amma-fina-calle ...`.
- **Parallel work uses worktrees, under the hub only:**
  `git -C C:\dev\amma\amma-fina-calle worktree add worktrees\<task> <branch>`.
  Never create a worktree on the Desktop, in the home folder, or under OneDrive.
- **Branches, not folders.** Feature work = a branch (+ optional worktree under `worktrees\`). When it merges, delete the branch and `worktree remove` it.
- **Every session logs IN/OUT** in `OPERATIONS/HANDOFF_LOG.md` (what you touched, result, anything flagged).
- **Codex work is queued** by Claude in `OPERATIONS/CODEX_QUEUE.md` (paths, IDs, guardrails, acceptance check).
- **If you find a repo under `OneDrive\...` or on the Desktop, stop and migrate it here** â€” do not work in place.

## Human-gated (only Anthony)
Secrets / API keys Â· access control Â· publish / email / send / purchase Â· shipping to `main` / production. Agents prep everything up to these lines, then hand Anthony exact click-by-click steps.

## Retired / do-not-use paths (as of 2026-07-09)
- `C:\Users\antho\OneDrive\Desktop\AMMA Ventures LLC DBA Fina Calle` (old clone â€” being retired)
- `C:\Users\antho\amma-cc-atlas`, `amma-news-page-wt`, `amma-owner-landing`, `amma-voice-ga`
- Scattered `C:\Users\antho\.codex\worktrees\*` and `Documents\Codex\*` session shells
- Pre-migration safety backup (keep until verified): `C:\Users\antho\AMMA_consolidation_backup_20260709-153535`

