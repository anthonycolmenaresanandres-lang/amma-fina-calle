export type SellerAssetLane = "character" | "product" | "environment" | "overlay" | "digital-menu-proof" | "unknown";

export type SellerAssetStatus = "approved" | "usable with cleanup" | "pending" | "rejected";

export type SellerAssetDryRunInput = {
  clientName: string;
  assetFolder: string;
  campaignObjective: string;
  fileNames: string[];
};

export type SellerAssetDryRunItem = {
  filename: string;
  likelyLane: SellerAssetLane;
  defaultStatus: SellerAssetStatus;
  recommendedOutputs: string[];
  reviewNotes: string[];
};

export type SellerAssetDryRunReport = {
  mode: "dry-run-only";
  clientName: string;
  assetFolder: string;
  campaignObjective: string;
  items: SellerAssetDryRunItem[];
  stages: string[];
  hardStops: string[];
  nextApprovalGate: string;
};

const STAGES = [
  "asset intake",
  "asset classification",
  "distraction detection",
  "isolation strategy",
  "regeneration strategy",
  "export targets",
  "approval gate",
];

const HARD_STOPS = [
  "No app code changes.",
  "No routes, deployments, configs, package files, or secrets.",
  "No paid API calls.",
  "No generated logos, QR codes, menu copy, pricing, legal text, or CTA text.",
  "No final owner identity lock without sufficient approved references.",
  "No client-facing output without human approval.",
];

function classifyFilename(filename: string): SellerAssetLane {
  const normalized = filename.toLowerCase();
  if (/(owner|portrait|profile|spokesperson|founder|staff|person|full[-_ ]?body)/.test(normalized)) {
    return "character";
  }
  if (/(coffee|latte|pastry|cake|croissant|cookie|drink|food|product|tres|leches|matcha)/.test(normalized)) {
    return "product";
  }
  if (/(cafe|environment|interior|fireplace|fogata|plant|shelf|decor|counter|table|seating|atmosphere)/.test(normalized)) {
    return "environment";
  }
  if (/(logo|qr|cta|overlay)/.test(normalized)) {
    return "overlay";
  }
  if (/(menu|screenshot|proof|digital)/.test(normalized)) {
    return "digital-menu-proof";
  }
  return "unknown";
}

function outputsForLane(lane: SellerAssetLane): string[] {
  switch (lane) {
    case "character":
      return ["front portrait", "3/4 portrait", "side profile", "full body", "optional expression variants"];
    case "product":
      return ["hero product isolated", "lifestyle product"];
    case "environment":
      return ["clean wide mood shot", "decor detail shot"];
    case "overlay":
      return ["overlay preservation reference only"];
    case "digital-menu-proof":
      return ["Digital Menu proof crop", "mobile proof reference"];
    default:
      return ["manual review required"];
  }
}

function notesForLane(lane: SellerAssetLane): string[] {
  switch (lane) {
    case "character":
      return [
        "Prioritize identity preservation over beautification.",
        "Remove extra people and distracting backgrounds when they interfere with identity.",
        "Keep separate from product and environment references.",
      ];
    case "product":
      return [
        "Preserve product shape, color, texture, garnish, cup/plate, and scale.",
        "Separate product references from character references.",
      ];
    case "environment":
      return [
        "Preserve venue lighting, materials, decor, and mood.",
        "Remove text overlays or readable clutter when they distract.",
      ];
    case "overlay":
      return [
        "Use logos and QR codes as overlays only.",
        "Do not regenerate, stylize, or rewrite overlay assets.",
      ];
    case "digital-menu-proof":
      return [
        "Use Digital Menu terminology only.",
        "Do not invent menu screenshots, menu copy, or pricing.",
      ];
    default:
      return ["Unknown lane requires human classification before processing."];
  }
}

export function buildSellerAssetDryRunReport(input: SellerAssetDryRunInput): SellerAssetDryRunReport {
  const items = input.fileNames.map((filename) => {
    const likelyLane = classifyFilename(filename);
    const defaultStatus: SellerAssetStatus = likelyLane === "unknown" ? "pending" : "usable with cleanup";
    return {
      filename,
      likelyLane,
      defaultStatus,
      recommendedOutputs: outputsForLane(likelyLane),
      reviewNotes: notesForLane(likelyLane),
    };
  });

  return {
    mode: "dry-run-only",
    clientName: input.clientName,
    assetFolder: input.assetFolder,
    campaignObjective: input.campaignObjective,
    items,
    stages: STAGES,
    hardStops: HARD_STOPS,
    nextApprovalGate: "Human approval is required before cleanup, regeneration, final render, provider calls, or client-facing use.",
  };
}

export function formatSellerAssetDryRunReport(report: SellerAssetDryRunReport): string {
  const items = report.items.map((item) => {
    return [
      `### ${item.filename}`,
      ``,
      `- likely lane: ${item.likelyLane}`,
      `- default status: ${item.defaultStatus}`,
      `- recommended outputs: ${item.recommendedOutputs.join(", ")}`,
      `- review notes: ${item.reviewNotes.join(" ")}`,
    ].join("\n");
  });

  return [
    `# Seller Asset Distillation Dry Run`,
    ``,
    `Client: ${report.clientName}`,
    `Asset folder: ${report.assetFolder}`,
    `Campaign objective: ${report.campaignObjective}`,
    ``,
    `## Stages`,
    ...report.stages.map((stage, index) => `${index + 1}. ${stage}`),
    ``,
    `## Items`,
    ...items,
    ``,
    `## Hard Stops`,
    ...report.hardStops.map((item) => `- ${item}`),
    ``,
    `## Next Approval Gate`,
    report.nextApprovalGate,
  ].join("\n");
}
