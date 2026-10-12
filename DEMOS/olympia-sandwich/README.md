# Olympia Sandwich Counter

Current runtime: opt-in collector race v2. See `../collector-standard/README.md` for exact capture, timing, scoring and rival rules, and `raceLevels.ts` for the three distinct expanded layouts.

The seven inspected illustrated WebPs remain unchanged. The close follow camera and alpha-hull/rim fit are preserved; the foreground table now meets the rear deli display without an empty-floor gap. Food remains at the prior readable camera scale. The recipe is still an unnamed provisional bread/cooked-filling/pale-cheese study.

Original `gameplay.ts`, `levels.ts`, `constants.ts`, `input.ts`, `utils.ts` and `utils/helper.tsx` remain frozen references; `art/original-Game.tsx.txt` preserves the original simulation. The authorized race engine and level layouts are explicit new behavior, not a claim that the old simulation is unchanged.

Validate with `node verify.mjs`. Build using the existing package script with Vite's native config loader. Cache and generated output stay scoped to this worktree and `APP/web/public/demo/olympia-sandwich`. Never install into the shared dependency junction. No other live client imports this skin or new rules.

Anthony requested publication after required CI and minimal deployment status, with owner playtesting instead of further browser/live-play verification. See `QA.md` and `OPERATIONS/OLYMPIA/2026-10-12/SANDWICH_CAPTURE_REVIEW.md` for actual coverage and limits.
