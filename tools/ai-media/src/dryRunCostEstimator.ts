import type { OutputEstimate } from "./types.js";

export type EstimateInput = {
  imageNormalizationCount?: number;
  stillVariantCount?: number;
  videoTestCount?: number;
};

export function estimateDryRunCost(input: EstimateInput): OutputEstimate {
  const imageNormalizationCount = input.imageNormalizationCount ?? 0;
  const stillVariantCount = input.stillVariantCount ?? 0;
  const videoTestCount = input.videoTestCount ?? 0;

  const lowUsd = imageNormalizationCount * 0.25 + stillVariantCount * 0.5 + videoTestCount * 2;
  const highUsd = imageNormalizationCount * 1 + stillVariantCount * 2 + videoTestCount * 8;

  return {
    outputCount: imageNormalizationCount + stillVariantCount + videoTestCount,
    lowUsd: Number(lowUsd.toFixed(2)),
    highUsd: Number(highUsd.toFixed(2)),
    requiresApproval: true,
    notes: [
      "Dry-run estimate only. Verify current provider pricing before spend.",
      "No paid action is allowed without human approval.",
      "Video tests are user-approved only.",
    ],
  };
}
