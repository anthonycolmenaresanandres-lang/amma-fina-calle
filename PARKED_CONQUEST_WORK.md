# Parked Conquest Work
_Created: 2026-06-02_

## Files Modified (unstaged, 262 insertions / 71 deletions)

| File | +/- |
|------|-----|
| `APP/web/src/conquest/types.ts` | +9 / -1 |
| `APP/web/src/conquest/config.ts` | +80 / -41 |
| `APP/web/src/conquest/ConquestScene.ts` | +67 / -26 |
| `APP/web/src/app/conquest/ConquestClient.tsx` | +56 / -3 |

---

## Apparent Purpose

**Multi-level Conquest game system** — converts the game from a single hardcoded level into a 3-level progressive experience with a level-selection screen.

### What was built

- **`types.ts`** — Extended `EngineConfig` with `id`, `levelNumber`, `levelName`, `selectText` fields and added optional `StickerConfig[]` (floating labels anchored to towers).

- **`config.ts`** — Replaced the single `FINA_CALLE_CONQUEST_CONFIG` export with a `CONQUEST_LEVELS: EngineConfig[]` array of three levels:
  1. **First Claim** (Level 1) — Tutorial; 3 towers, slow AI (1800–2600 ms think), 45-second match.
  2. **Flow Control** (Level 2) — 5 towers in a diamond, standard rules.
  3. **Customer Rush** (Level 3) — 5 towers, faster AI (700–1100 ms), faster growth (1.35/s), sticker badges on towers (VIP, Rush, Family, Lunch).

- **`ConquestScene.ts`** — Scene is now level-aware: constructor accepts an `EngineConfig` (defaults to Level 1), all hardcoded `FINA_CALLE_CONQUEST_CONFIG` references replaced with `this.levelConfig`. Added sticker badge rendering and per-level Phaser scene key (`ConquestScene-${level.id}`).

- **`ConquestClient.tsx`** — Added level-selection screen (shown before game starts), `Back` and `Replay` buttons during play, `replayKey` counter to force remount on replay.

---

## Current Risk

**Low — changes are self-contained and internally consistent.**

- No TypeScript type errors are apparent from reading the diff; the `EngineConfig` extensions are additive and `stickers` is optional.
- Phaser scene keys are now dynamic (`ConquestScene-first-claim`, etc.) — this is fine for fresh game instances but could surface a "scene already exists" error if the Phaser `Game` object is ever reused across level switches. The current code destroys and recreates `gameRef` on level change, so this should be safe.
- The `StickerView` layout uses `scale.gameSize` percentages — needs a quick visual check on mobile viewport.
- No tests exist for Conquest; verification requires running the app.

---

## Next Decision

| Option | When to choose |
|--------|---------------|
| **Commit** | Ready to ship. Run `next dev`, spot-check all 3 levels and the Back/Replay buttons, then `git add` the 4 files and commit. Suggested message: `feat(conquest): add 3-level progression with level selection screen`. |
| **Continue** | Before committing — add a win/lose callback from the scene so `ConquestClient` can prompt "Next Level" instead of just "Replay". Also consider persisting completed levels. |
| **Discard** | `git checkout -- APP/web/src/conquest APP/web/src/app/conquest` — loses all 4 files' changes. Only do this if the multi-level approach is being abandoned entirely. |

**Recommendation: commit after a quick visual smoke-test.** The work is coherent, low-risk, and a meaningful feature step.
