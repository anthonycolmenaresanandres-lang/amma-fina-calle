import type { FreeToolName } from "./freeToolsRegistry";

export type LocalAssetClass =
  | "character"
  | "product"
  | "environment"
  | "overlay"
  | "digital-menu-proof"
  | "video-reference"
  | "unknown";

export type LocalProcessingStep = {
  order: number;
  tool: FreeToolName | "manual-review";
  action: string;
  approvalRequiredBeforeExecution: boolean;
  stopIfUnavailable: boolean;
};

export type LocalProcessingPlanInput = {
  clientName: string;
  assetClass: LocalAssetClass;
  sourcePath: string;
  lowResolution?: boolean;
  difficultSegmentation?: boolean;
};

export type LocalProcessingPlan = {
  mode: "dry-run-only";
  clientName: string;
  sourcePath: string;
  assetClass: LocalAssetClass;
  preferredOrder: string[];
  steps: LocalProcessingStep[];
  hardRules: string[];
  nextApprovalGate: string;
};

const PREFERRED_ORDER = [
  "local crop/resize/export",
  "rembg background removal",
  "ImageMagick batch normalization",
  "Upscayl if image is low-resolution",
  "SAM 2 if segmentation is difficult",
  "paid/API tools only after approval",
];

const HARD_RULES = [
  "No paid API calls without approval.",
  "No AI-generated QR patterns.",
  "No AI-generated logos.",
  "No baked-in CTA/menu text unless explicitly approved as editable design output.",
  "Preserve original seller/client asset identity.",
  "If local tools are unavailable, document missing dependency and stop safely.",
  "Do not invent file paths.",
  "Do not install tools unless explicitly instructed.",
];

function baseSteps(assetClass: LocalAssetClass): LocalProcessingStep[] {
  switch (assetClass) {
    case "character":
      return [
        {
          order: 1,
          tool: "manual-review",
          action: "Classify view type: front portrait, 3/4 portrait, side profile, full body, or expression variant.",
          approvalRequiredBeforeExecution: false,
          stopIfUnavailable: false,
        },
        {
          order: 2,
          tool: "ImageMagick",
          action: "Plan local crop/resize/export for 9:16, 4:5, or 1:1 reference outputs.",
          approvalRequiredBeforeExecution: false,
          stopIfUnavailable: true,
        },
        {
          order: 3,
          tool: "rembg",
          action: "Plan background removal for draft owner cutout while preserving identity.",
          approvalRequiredBeforeExecution: true,
          stopIfUnavailable: true,
        },
      ];
    case "product":
      return [
        {
          order: 1,
          tool: "ImageMagick",
          action: "Plan crop/resize/export for hero product and lifestyle product references.",
          approvalRequiredBeforeExecution: false,
          stopIfUnavailable: true,
        },
        {
          order: 2,
          tool: "rembg",
          action: "Plan product isolation when a clean hero cutout is needed.",
          approvalRequiredBeforeExecution: true,
          stopIfUnavailable: true,
        },
      ];
    case "environment":
      return [
        {
          order: 1,
          tool: "ImageMagick",
          action: "Plan 9:16 and 4:5 crops for clean wide mood and decor detail references.",
          approvalRequiredBeforeExecution: false,
          stopIfUnavailable: true,
        },
      ];
    case "overlay":
      return [
        {
          order: 1,
          tool: "manual-review",
          action: "Verify overlay is logo, QR, CTA, or text reference and preserve unchanged.",
          approvalRequiredBeforeExecution: false,
          stopIfUnavailable: false,
        },
        {
          order: 2,
          tool: "ImageMagick",
          action: "Plan format normalization only; do not recreate logo, QR, or text.",
          approvalRequiredBeforeExecution: true,
          stopIfUnavailable: true,
        },
      ];
    case "digital-menu-proof":
      return [
        {
          order: 1,
          tool: "ImageMagick",
          action: "Plan clean crop/resize for Digital Menu proof without inventing menu copy or pricing.",
          approvalRequiredBeforeExecution: false,
          stopIfUnavailable: true,
        },
      ];
    case "video-reference":
      return [
        {
          order: 1,
          tool: "FFmpeg",
          action: "Plan frame extraction, trimming, compression, or format conversion for future video pass.",
          approvalRequiredBeforeExecution: true,
          stopIfUnavailable: true,
        },
      ];
    default:
      return [
        {
          order: 1,
          tool: "manual-review",
          action: "Unknown asset class. Stop for human classification before processing.",
          approvalRequiredBeforeExecution: true,
          stopIfUnavailable: false,
        },
      ];
  }
}

export function buildLocalProcessingPlan(input: LocalProcessingPlanInput): LocalProcessingPlan {
  const steps = baseSteps(input.assetClass);
  let order = steps.length + 1;

  if (input.lowResolution) {
    steps.push({
      order,
      tool: "Upscayl",
      action: "Plan low-resolution upscaling for internal-preview reference quality.",
      approvalRequiredBeforeExecution: true,
      stopIfUnavailable: true,
    });
    order += 1;
  }

  if (input.difficultSegmentation) {
    steps.push({
      order,
      tool: "SAM 2",
      action: "Plan advanced segmentation only if rembg is insufficient and boundaries are complex.",
      approvalRequiredBeforeExecution: true,
      stopIfUnavailable: true,
    });
  }

  return {
    mode: "dry-run-only",
    clientName: input.clientName,
    sourcePath: input.sourcePath,
    assetClass: input.assetClass,
    preferredOrder: PREFERRED_ORDER,
    steps,
    hardRules: HARD_RULES,
    nextApprovalGate: "Human approval is required before installing tools, processing files, paid/API escalation, final render, or client-facing use.",
  };
}

export function formatLocalProcessingPlan(plan: LocalProcessingPlan): string {
  return [
    "# Local Processing Plan",
    "",
    `Mode: ${plan.mode}`,
    `Client: ${plan.clientName}`,
    `Source path: ${plan.sourcePath}`,
    `Asset class: ${plan.assetClass}`,
    "",
    "## Preferred Processing Order",
    ...plan.preferredOrder.map((item, index) => `${index + 1}. ${item}`),
    "",
    "## Planned Steps",
    ...plan.steps.map(
      (step) =>
        `${step.order}. ${step.tool}: ${step.action}\n   - approval before execution: ${step.approvalRequiredBeforeExecution ? "yes" : "no"}\n   - stop if unavailable: ${step.stopIfUnavailable ? "yes" : "no"}`,
    ),
    "",
    "## Hard Rules",
    ...plan.hardRules.map((rule) => `- ${rule}`),
    "",
    "## Next Approval Gate",
    plan.nextApprovalGate,
  ].join("\n");
}
