export const MEDIA_TOOL_CONFIG = {
  dryRunOnly: true,
  defaultCampaign: "colattao-encanto-launch",
  assetRegistryRoot: "ASSET_REGISTRY",
  clientSlug: "colattao",
  budgetCapsUsd: {
    imageNormalizationLow: 5,
    imageNormalizationHigh: 15,
    stillGenerationLow: 10,
    stillGenerationHigh: 25,
  },
  forbiddenGeneratedElements: [
    "logos",
    "qr-codes",
    "cta-text",
    "digital-menu-text",
    "menu-copy",
  ],
} as const;
