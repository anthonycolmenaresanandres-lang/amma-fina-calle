import { CAFERUSH_LEVELS } from "@/caferush/config";
import type { CafeRushLevel } from "@/caferush/types";

/** Approved Bodega pace; shared café difficulty presets remain available. */
export const BODEGA_LEVEL: CafeRushLevel = {
  ...CAFERUSH_LEVELS[0],
  id: "bodega-fast",
  levelName: "Bodega Rush",
  rules: {
    ...CAFERUSH_LEVELS[0].rules,
    durationSec: 20,
    targetScore: 100,
    spawnEveryMs: 600,
    spawnMinMs: 600,
    spawnRampMs: 0,
    fallSpeed: [0.42, 0.55],
    finishAtTarget: true,
    badChance: 0,
  },
};
