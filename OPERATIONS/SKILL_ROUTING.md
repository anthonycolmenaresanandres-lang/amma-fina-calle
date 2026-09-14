# Shared skill routing

This is the single routing policy referenced by `AGENTS.md` and `CLAUDE.md`. It changes selection and discovery, not permission boundaries or the business router's operating map.

## Selection

1. Honor explicitly named skills and higher-priority session requirements. Read each selected `SKILL.md` completely, including required references.
2. AMMA management, operating checkpoints, leads, onboarding, delivery, billing review, KPIs, bottlenecks and business automation: use `amma-business-intelligence` and its exact-query deterministic router.
3. AMMA sales materials, owner messaging, demos, pitches, offers, objections and conversion work: use `amma-sales-conversion`. Preserve verified evidence and reject dark patterns.
4. Otherwise use the narrowest matching installed skill. Run `select-skill` when no specific match exists, the request spans domains, or the active model is Haiku-class/small. Use `skill-router` only after a low-confidence multi-domain result.
5. Default to one primary skill and at most one distinct verifier/format specialist. Mandatory skill requirements still apply; explain why an additional skill is necessary. Do not read every matching copy.

## Which copy to use

- AMMA-owned rules: repository `.agents/skills` are the maintained source; `.claude/skills` are deliberate compatibility mirrors. Keep corresponding files aligned when changing an AMMA skill. Do not delete a mirror merely because its name repeats.
- Vendor skills: prefer the installed official plugin's task-specific skill when it matches the runtime. If no plugin version is available, use the installed standalone copy. The available-skills catalog is the starting inventory; do not recursively scan plugin caches on every task.
- Browser CLI: use `agent-browser` and load `agent-browser skills get core` once per session before browser work. This provides instructions matching the installed CLI. Do not combine its commands with a stale copied guide. Use another browser tool when the user explicitly selects it or the required capability is unavailable.
- Version uncertainty: inspect the selected tool's version and relevant official documentation. Do not upgrade tools, rewrite vendor caches, uninstall plugins, or disable global skills just to deduplicate discovery.
- `node tools/workflow/skill-audit.mjs` compares repository mirrors without editing them. Optional explicit skill roots can be passed for an inventory review; global/plugin inventory is not loaded by default.

## Authority and efficient execution

- User instructions take precedence over skill guidelines, subject to system/developer instructions and explicit safety boundaries. A scoped implementation request authorizes ordinary reversible local steps; it does not authorize production, purchases, credentials, access or external sends.
- If a skill causes a pause or deviation, name the exact skill/instruction and explain the missing decision. Continue independent safe work when possible.
- Never interpret a high routing score as approval. Never auto-change routing from outcome logs.
- Read current queue/handoff state first. Read older history only when needed, and do not relax an explicit stop condition because it is old.
- Reuse existing test commands. Run targeted checks while iterating, then one proportional final verification; an operations-only script change does not require rebuilding unrelated application code.
- Use `tools/workflow/verify-local.ps1` for local game smoke checks. It supplements, not replaces, visual inspection, fallback/gameplay checks, security tests and a production build when app code changes.

References checked 2026-09-10: [Codex skills](https://learn.chatgpt.com/docs/build-skills), [OpenAI instruction-following guidance](https://developers.openai.com/api/docs/guides/latest-model).
