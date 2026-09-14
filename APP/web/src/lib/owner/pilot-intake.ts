export const PILOT_APPROVAL_GATES = ["locationConfirmed", "ownerMenuApproved", "privateAccessAuthorizationRecorded", "pilotFeeAndTermsApproved", "productionReleaseApproved", "publicMenuExposureApproved"] as const;

/** Read-only readiness report. A passing document never grants access or launches. */
export function pilotIntakeGaps(input: Record<string, unknown>): string[] {
  const gaps: string[] = PILOT_APPROVAL_GATES.filter(gate => input[gate] !== true);
  if (typeof input.candidateRestaurantId !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.candidateRestaurantId)) gaps.push("valid restaurant ID");
  if (typeof input.startDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input.startDate) || Number.isNaN(Date.parse(input.startDate)) || new Date(input.startDate).toISOString().slice(0, 10) !== input.startDate) gaps.push("agreed start date");
  for (const ref of ["ownerMenuEvidenceReference", "privateAccessEvidenceReference", "commercialEvidenceReference"]) {
    if (typeof input[ref] !== "string" || !input[ref].trim()) gaps.push(ref);
  }
  return gaps;
}
