# Penalty Shootout — "Street Shootout"

_Game package built on the Fina Calle game-engine pattern (Phaser scene + level config), the same structure as Conquest._

## Status

**Playable V1.** Builds clean (`npm run build` in `APP/web`). Live route: `/penalty-shootout`. Surfaced on the R&D page (`/rd`) as a playable game-R&D track.

## What it is

A lightweight, mobile-first penalty mini-game. The player takes five shots from
the spot against a goalkeeper and tries to score as many as possible. It is
built to be branded/skinned per client the same way Conquest is.

## How it plays

1. Pick a keeper difficulty (level select screen): **Street**, **Club**, or **Pro**.
2. The goal shows six aim targets — three columns (left / center / right) across two
   height bands (top / bottom). Tap a target to shoot.
3. The ball flies while the keeper dives. Outcome resolves as **GOAL**, **SAVED**, or **MISS**.
4. After 5 shots a final score and rating are shown. Tap to play again.

## Risk / reward model

- The keeper reads the shot's **column** and **height band** with a per-difficulty
  probability. A correct column commit can produce a save; the height band and a
  `sameRowBonus` modulate how likely.
- **Top-corner** shots are the hardest for the keeper to save (`rowSaveFactor`),
  but they carry the only real **miss** risk (`missChance`) — over the bar / wide.
  Bottom shots are safe but easier to save. This is the core tension.
- A save is capped (`maxSaveProbability`) so a well-placed corner is never an
  automatic save.

## Code map

| File | Role |
|------|------|
| `APP/web/src/penalty/types.ts` | Types: zones, colors, rules, level, outcome. |
| `APP/web/src/penalty/config.ts` | `PENALTY_ZONES` (6 targets) + `PENALTY_LEVELS` (3 keepers). All tuning lives here. |
| `APP/web/src/penalty/PenaltyScene.ts` | Phaser scene. All timing/animation runs in `update()` via delta accumulators (Conquest pattern). Graphics-only rendering each frame. |
| `APP/web/src/app/penalty-shootout/PenaltyClient.tsx` | `"use client"` mount: level select, Back/Replay, dynamic Phaser import. |
| `APP/web/src/app/penalty-shootout/page.tsx` | Route + metadata. |

## Tuning

Everything balance-related is data in `config.ts`:

- `keeperReadColumn` / `keeperReadRow` — how well the keeper guesses.
- `colMatchSave`, `rowSaveFactor`, `sameRowBonus`, `maxSaveProbability` — the save model.
- `missChance` — wide/over risk per height band.
- `ballFlightMs`, `keeperDiveMs`, `resultHoldMs` — feel/pacing.
- `colors` — skin (used for a per-client reskin later).

## Suggested next steps (not yet built)

- **Win/lose callback** from the scene to the client (like the Conquest "Next Level"
  idea) so the React shell can show a result card and "Next Keeper".
- **Sudden death** after a tied/strong run.
- **Aim assist toggle** or a power/timing element for more skill depth.
- **Client skin pass**: swap colors + add a sticker/badge on the keeper or ball,
  keeping assets light (transparent WebP, <1–2 MB total) per the Conquest asset note.
- Visual smoke-test on a real mobile viewport (no automated tests exist for games here).
