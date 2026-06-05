export function createViduProvider() {
  return {
    enabled: false as const,
    name: "vidu",
    reason: "Provider integration is intentionally disabled. This scaffold supports dry-run planning only.",
    execute: () => {
      throw new Error("Vidu provider is disabled. Separate approval is required before live API calls.");
    },
  };
}
