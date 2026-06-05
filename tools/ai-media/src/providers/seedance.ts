export function createSeedanceProvider() {
  return {
    enabled: false as const,
    name: "seedance",
    reason: "Provider integration is intentionally disabled. This scaffold supports dry-run planning only.",
    execute: () => {
      throw new Error("Seedance provider is disabled. Separate approval is required before live API calls.");
    },
  };
}
