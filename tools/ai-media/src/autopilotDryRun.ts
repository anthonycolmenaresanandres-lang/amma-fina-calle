export type AutopilotStage = {
  id: number;
  name: string;
  dryRunAction: string;
  writesFiles: boolean;
  approvalRequiredBeforeExecution: boolean;
};

export type AutopilotDryRunInput = {
  clientName: string;
  assetFolder: string;
  campaignObjective: string;
  colattaoTemplateMode?: boolean;
};

export type AutopilotDryRunReport = {
  mode: "dry-run-only";
  clientName: string;
  assetFolder: string;
  campaignObjective: string;
  templateReference: "Colattao master template" | "Generic restaurant template";
  stages: AutopilotStage[];
  hardStops: string[];
  wouldCreate: string[];
  wouldNotDo: string[];
  nextApproval: string;
};

const STAGES: AutopilotStage[] = [
  {
    id: 1,
    name: "Detect new asset folder",
    dryRunAction: "Verify the provided dropzone path exists and record its exact location.",
    writesFiles: false,
    approvalRequiredBeforeExecution: false,
  },
  {
    id: 2,
    name: "Inventory files",
    dryRunAction: "List file names, sizes, extensions, dates, and safe image dimensions.",
    writesFiles: true,
    approvalRequiredBeforeExecution: false,
  },
  {
    id: 3,
    name: "Classify assets",
    dryRunAction: "Classify logos, QR overlays, Digital Menu proof, owner references, environment, product assets, and unknowns.",
    writesFiles: true,
    approvalRequiredBeforeExecution: false,
  },
  {
    id: 4,
    name: "Register assets",
    dryRunAction: "Prepare asset registry entries with source, status, intended use, forbidden use, and replacement rule.",
    writesFiles: true,
    approvalRequiredBeforeExecution: false,
  },
  {
    id: 5,
    name: "Identify missing blockers",
    dryRunAction: "Report missing logo approval, QR scan-test, Digital Menu proof, owner references, CTA approval, and environment gaps.",
    writesFiles: true,
    approvalRequiredBeforeExecution: false,
  },
  {
    id: 6,
    name: "Normalize safe assets",
    dryRunAction: "Propose local-safe crops/conversions only; do not execute until approval.",
    writesFiles: true,
    approvalRequiredBeforeExecution: true,
  },
  {
    id: 7,
    name: "Build mockup direction packet",
    dryRunAction: "Plan campaign variants, overlay zones, mobile readability, and QA checklist.",
    writesFiles: true,
    approvalRequiredBeforeExecution: false,
  },
  {
    id: 8,
    name: "Build pre-render packet",
    dryRunAction: "Define selected variant, layer stack, output naming, missing overlays, and stop rules.",
    writesFiles: true,
    approvalRequiredBeforeExecution: false,
  },
  {
    id: 9,
    name: "Create static mockup plan",
    dryRunAction: "Define 9:16, 4:5, and optional 1:1 composition plan.",
    writesFiles: true,
    approvalRequiredBeforeExecution: false,
  },
  {
    id: 10,
    name: "Stop for human approval",
    dryRunAction: "Stop before final render, client-facing output, provider call, publishing, or deployment.",
    writesFiles: true,
    approvalRequiredBeforeExecution: true,
  },
];

const HARD_STOPS = [
  "No paid API calls without explicit approval.",
  "No AI-generated logos, QR codes, text, menu copy, prices, or legal text.",
  "No final owner identity lock without sufficient approved references.",
  "No publishing or deployment.",
  "No client-facing final without approval.",
  "No invented file paths, assets, destinations, or approval statuses.",
];

export function buildAutopilotDryRunReport(input: AutopilotDryRunInput): AutopilotDryRunReport {
  return {
    mode: "dry-run-only",
    clientName: input.clientName,
    assetFolder: input.assetFolder,
    campaignObjective: input.campaignObjective,
    templateReference: input.colattaoTemplateMode === false ? "Generic restaurant template" : "Colattao master template",
    stages: STAGES,
    hardStops: HARD_STOPS,
    wouldCreate: [
      "Asset inventory document",
      "Asset classification packet",
      "Production blockers document",
      "Normalization queue",
      "Mockup direction packet",
      "Pre-render packet",
      "Static mockup assembly plan",
      "Approval gate report",
    ],
    wouldNotDo: [
      "No app code changes",
      "No routes or deployments",
      "No package/config/secret changes",
      "No provider/API calls",
      "No publishing",
      "No generated logos or QR codes",
      "No final owner identity approval",
    ],
    nextApproval: "Human approval is required before normalization execution, paid provider calls, final render, or client-facing output.",
  };
}

export function formatAutopilotDryRunReport(report: AutopilotDryRunReport): string {
  const stages = report.stages
    .map(
      (stage) =>
        `${stage.id}. ${stage.name}\n   - ${stage.dryRunAction}\n   - writes files: ${stage.writesFiles ? "planned docs/assets only" : "no"}\n   - approval before execution: ${stage.approvalRequiredBeforeExecution ? "yes" : "no"}`,
    )
    .join("\n");

  return [
    `# Campaign Autopilot Dry Run`,
    ``,
    `Client: ${report.clientName}`,
    `Asset folder: ${report.assetFolder}`,
    `Campaign objective: ${report.campaignObjective}`,
    `Template reference: ${report.templateReference}`,
    ``,
    `## Stages`,
    stages,
    ``,
    `## Hard Stops`,
    ...report.hardStops.map((item) => `- ${item}`),
    ``,
    `## Would Create`,
    ...report.wouldCreate.map((item) => `- ${item}`),
    ``,
    `## Would Not Do`,
    ...report.wouldNotDo.map((item) => `- ${item}`),
    ``,
    `## Next Approval`,
    report.nextApproval,
  ].join("\n");
}
