export function createOpenAIImagesProvider() {
  return {
    enabled: false as const,
    name: "openai-images",
    reason: "Provider integration is intentionally disabled. This scaffold supports dry-run planning only.",
    execute: () => {
      throw new Error("OpenAI Images provider is disabled. Separate approval is required before live API calls.");
    },
  };
}
