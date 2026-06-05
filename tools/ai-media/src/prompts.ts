export const PROMPT_RULES = {
  digitalMenuTerminology: "Use Digital Menu terminology only for Colattao campaign language.",
  overlayOnly: [
    "Do not generate logos.",
    "Do not generate QR codes.",
    "Do not generate CTA text.",
    "Do not generate Digital Menu text.",
    "Do not generate menu copy.",
  ],
  motionRules: [
    "Use one primary motion per shot.",
    "Keep z-axis blocking clear and simple.",
    "Avoid chaotic camera movement.",
  ],
  approvalRules: [
    "Use only registered assets.",
    "Stop before paid operations.",
    "Require human approval for execution.",
  ],
} as const;

export function buildDryRunPromptSummary(): string {
  return [
    PROMPT_RULES.digitalMenuTerminology,
    ...PROMPT_RULES.overlayOnly,
    ...PROMPT_RULES.motionRules,
    ...PROMPT_RULES.approvalRules,
  ].join("\n");
}
