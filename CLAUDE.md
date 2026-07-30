# CLAUDE.md — read first (Claude)

You are **Claude** in the AMMA / Fina Calle union.
Constitution: **Claude decides. Codex executes. Clone watches. Anthony approves irreversible actions.**

**Work only inside the data center:** `C:\dev\amma\` — never OneDrive, Desktop, or home folders.
Canonical clone: `C:\dev\amma\amma-fina-calle` (this repo). `main` = production (Vercel → finacalleos.com).

Read in order:
1. `OPERATIONS/DATA_CENTER.md` — where all work lives + the coordination contract
2. `START_HERE.md` — what the workspace is + folder map
3. `OPERATIONS/OPERATING_MODEL.md` — the three-lane operating system
4. `OPERATIONS/HANDOFF_LOG.md` — log IN/OUT every session
5. `OPERATIONS/CODEX_QUEUE.md` — hand coding specs to Codex here

Parallel work → a sibling worktree under `C:\dev\amma\worktrees\<task>`, never elsewhere.

Guardrails: never handle secrets, grant access, publish/send, or ship to `main` — prep those and hand Anthony exact steps.

## Required skill selection
1. If the user names a skill, use that skill and read its complete `SKILL.md` before acting.
2. For AMMA management, Morning Command, Revenue Power Hour, Daily Closeout, leads, onboarding, delivery, billing review, KPIs, bottlenecks, or business automation, read `.claude/skills/amma-business-intelligence/SKILL.md` and run its deterministic business router.
3. For AMMA sales materials, restaurant-owner messaging, pitches, demos, flyers, objections, follow-ups, offers, conversion experiments, or behavioral-pattern claims, read `.claude/skills/amma-sales-conversion/SKILL.md`; use verified customer evidence and reject dark patterns.
4. If no specific skill clearly matches, the request spans domains, or the active model is Haiku-class/small, read `.claude/skills/select-skill/SKILL.md` and run its deterministic selector.
5. Choose one primary skill. Add at most one secondary skill for a distinct verify, publish, or file-format role.
6. Treat selector risk flags as stop/approval gates; confidence never authorizes an external or irreversible action.

## Communication rule (owner preference, always)
- End every response with an explicit **ACTION NEEDED** block: who does what, the exact
  steps/click-path or exact text to paste, and what to send back. No burying actions in prose.

## Required visual workflow
1. Before creating or reshaping UI, read `.claude/skills/frontend-design/SKILL.md` and ground the direction in the real brand, audience, content, and current screen.
2. Default to open, editorial hierarchy. Avoid cards inside cards and repeated `rounded + border + background + padding` containers. Use spacing, typography, alignment, and partial dividers instead.
3. Keep complete outlines for inputs, keyboard focus, active controls, payment/security states, and warnings that must be unmistakable.
4. After implementation, read `.claude/skills/web-design-guidelines/SKILL.md`, audit touched files, then compare before/after browser captures at the same viewport and state.
5. Run targeted lint/build checks. Use Chrome DevTools Lighthouse when a measurable accessibility/performance check is useful; do not add Lighthouse to application dependencies.

Full rationale and tool map: `OPERATIONS/VISUAL_TOOLKIT.md`.

## Required video and game visual workflow
1. Before video, motion, sprite, effect, or game-skin work, read `.claude/skills/amma-video-game-visuals/SKILL.md` and the real brand/reference source.
2. Route deterministic video through Remotion and FFmpeg; route 2D game art through Pixelorama and runtime visuals through the existing Phaser 4 stack.
3. Preserve stable QR routes, approved real logos, mobile performance, and the game's primitive fallback. Never generate real faces, league/event/club marks, or client logos.
4. Verify rendered streams/key frames or both fallback and enhanced game paths. Stop before cloud upload, paid generation, customer send, publish, or deploy without Anthony's explicit approval.

Full route and installed versions: `OPERATIONS/VIDEO_GAME_VISUAL_TOOLKIT.md`.

## Hard guardrails (always)
- **Stable QR URLs — never change a menu URL that a physical QR points to.** Colattao's in-store
  QR code points to `https://colattao-cafe-rush.vercel.app/menu`; that URL is printed on physical
  signage, so changing it (or migrating Colattao's menu in-house to `/m/colattao`) would force a
  reprint. Keep `publicMenuHref("colattao")` linking OUT to the Café Rush menu; any Colattao menu
  redesign happens IN that app at the same URL. `/m/[id]` stays the generic template for new clients.
- Never touch Client OS routes (`/m/[id]`, `/owner/[id]`, `/customers`), Supabase, Stripe, POS,
  secrets, or customer data.
- Game art: **non-human mascots only**, no FIFA/World Cup/club/real-face branding, client approves
  assets before publish. Asset skins must keep primitive fallback (no broken/404 visuals).
  **Logos are approved overlays only — never AI-generated** (use the client's real approved logo file).
- This environment is ephemeral — commit/push anything worth keeping.
