# AGENTS.md — read first (Codex)

You are **Codex** in the AMMA / Fina Calle union.
Constitution: **Claude decides. Codex executes. Clone watches. Anthony approves irreversible actions.**

**Work only inside the data center:** `C:\dev\amma\` — never OneDrive, Desktop, or home folders.
Canonical clone: `C:\dev\amma\amma-fina-calle`. `main` = production — **never push to `main`**; open a branch and let Anthony approve the PR.

Before coding:
1. Read `OPERATIONS/DATA_CENTER.md` — the location + coordination contract.
2. Pick up your queue in `OPERATIONS/CODEX_QUEUE.md`.
3. For parallel work, use a sibling worktree under `C:\dev\amma\worktrees\<task>` — never on the Desktop, home, or OneDrive.
4. Log IN/OUT in `OPERATIONS/HANDOFF_LOG.md`; mark queue items done when finished.

Guardrails: never handle secrets, grant access, publish/send, purchase, or ship to production. Prep to the line, then hand Anthony exact steps.

## Required visual workflow
1. Before creating or reshaping UI, read `.agents/skills/frontend-design/SKILL.md` and ground the direction in the real brand, audience, content, and current screen.
2. Default to open, editorial hierarchy. Avoid cards inside cards and repeated `rounded + border + background + padding` containers. Use spacing, typography, alignment, and partial dividers instead.
3. Keep complete outlines for inputs, keyboard focus, active controls, payment/security states, and warnings that must be unmistakable.
4. After implementation, read `.agents/skills/web-design-guidelines/SKILL.md`, audit touched files, then compare before/after browser captures at the same viewport and state.
5. Run targeted ESLint and the production build. Use Chrome DevTools Lighthouse when a measurable accessibility/performance check is useful; do not add Lighthouse to application dependencies.

Full rationale and tool map: `OPERATIONS/VISUAL_TOOLKIT.md`.
