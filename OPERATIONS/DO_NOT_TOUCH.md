# DO NOT TOUCH — live / production guard

_The live sites and production data are off-limits to agents **unless Anthony explicitly approves the
specific action in-session.** Default posture: hands off. This is a **gate, not a wall** — approved
work still flows; accidents don't._

## Protected — require Anthony's explicit approval EACH time
- **`main` branch** (push / merge) → Vercel auto-deploys **production**. 🔒 tripwire active (see below).
- **Vercel production** — deploys, env vars, domains, project settings; `finacalleos.com` / `www.finacalleos.com`.
- **Production Supabase** (`eipypwifiorzqopindfl`) — migrations, data writes, RLS/policies, storage buckets, and the **admin allowlist** (`admin_emails`).
- **Live Colattao Rush site** (`colattao-cafe-rush.vercel.app`) + its repo — "the vercel is the truth."
- **Secrets / API keys** (Resend, OpenAI, Stripe, …) — never enter, print, or commit.
- **DNS, domains, billing, Stripe.**

## Always allowed — no approval needed
Feature branches · local files & drafts · visual assets · reads & diagnostics · writing Codex prompts ·
memory + `OPERATIONS/` docs. (Build, render, draft freely — just don't ship.)

## The tripwire (installed + verified 2026-06-08)
A git **`pre-push` hook** blocks any push to `main` unless deliberately overridden. Verified: blocks
`main` (exit 1), allows feature branches, passes with the override.

**Approved-ship procedure** (only after Anthony says go):
```
ALLOW_MAIN_PUSH=1 git push origin <branch>:main      # one push, then it re-locks
```

**Install in another clone / for Codex** (the hook is local to each clone, not committed):
```
cp OPERATIONS/guard_pre-push.sh .git/hooks/pre-push   # then it's active
```

## Scope & honest limits
The hook only covers **git-CLI pushes from a clone that has it installed** (this clone + any where
Codex installs it). It does **NOT** cover: GitHub web UI / GitHub Desktop, direct Vercel-dashboard
deploys, or Supabase SQL-editor changes. Those still rely on this list + human discipline. The hook
stops the most common accident (an agent running `git push origin main`); the rest is policy.
