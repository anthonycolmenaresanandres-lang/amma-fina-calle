// Pure shot-resolution logic for Penalty Shootout. No Phaser, no DOM.
// Decides, for a given aim zone + level rules, where the keeper commits and
// whether the shot is a GOAL / SAVE / MISS. RNG is injectable for testing;
// it defaults to Math.random so production behavior is identical to V1.
//
// IMPORTANT: the order of rng() calls is preserved exactly from the V1 scene
// (keeper-column read → [random column] → keeper-row read → [random row] →
// miss check → [save check]) so the probability model is unchanged.

import type { Column, PenaltyRules, RowBand, ShotOutcome, ZoneConfig } from "../types";

export type Rng = () => number;

export type ShotResolution = {
  keeperColumn: Column;
  keeperRow: RowBand;
  outcome: ShotOutcome;
};

function randomColumn(rng: Rng): Column {
  const r = Math.floor(rng() * 3);
  return (r === 0 ? 0 : r === 1 ? 1 : 2) as Column;
}

export function resolveShot(
  zone: ZoneConfig,
  rules: PenaltyRules,
  rng: Rng = Math.random,
): ShotResolution {
  const keeperColumn: Column =
    rng() < rules.keeperReadColumn ? zone.column : randomColumn(rng);
  const keeperRow: RowBand =
    rng() < rules.keeperReadRow ? zone.row : rng() < 0.5 ? 0 : 1;

  let outcome: ShotOutcome;
  if (rng() < rules.missChance[zone.row]) {
    outcome = "miss";
  } else if (keeperColumn === zone.column) {
    let saveProb = rules.colMatchSave * rules.rowSaveFactor[zone.row];
    if (keeperRow === zone.row) {
      saveProb *= rules.sameRowBonus;
    }
    saveProb = Math.min(saveProb, rules.maxSaveProbability);
    outcome = rng() < saveProb ? "save" : "goal";
  } else {
    outcome = "goal";
  }

  return { keeperColumn, keeperRow, outcome };
}
