import "server-only";
import type { MenuSnapshot, ReviewOutcome, ReviewPriority, ReviewRequestType } from "./triage";

const DEFAULT_MODEL = "gpt-4o-mini";

type AiReview = {
  reason?: unknown;
  requestType?: unknown;
  priority?: unknown;
};

const REQUEST_TYPES = new Set<ReviewRequestType>([
  "Menu/content update",
  "Image/file upload",
  "Operational support",
  "Question for AMMA",
]);
const PRIORITIES = new Set<ReviewPriority>(["Low", "Normal", "Urgent"]);

function isRequestType(value: unknown): value is ReviewRequestType {
  return typeof value === "string" && REQUEST_TYPES.has(value as ReviewRequestType);
}

function isPriority(value: unknown): value is ReviewPriority {
  return typeof value === "string" && PRIORITIES.has(value as ReviewPriority);
}

function clean(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function noDashCopy(value: string): string {
  return value.replace(/[—–-]+/g, ".").replace(/\s+/g, " ").trim();
}

function readOpenAiConfig() {
  const apiKey = clean(process.env.OPENAI_API_KEY);
  if (!apiKey) return null;

  return {
    apiKey,
    baseUrl: (clean(process.env.OPENAI_BASE_URL) ?? "https://api.openai.com/v1").replace(/\/$/, ""),
    model:
      clean(process.env.OWNER_REQUEST_AI_MODEL) ??
      clean(process.env.EDITORIAL_MODEL) ??
      DEFAULT_MODEL,
  };
}

function coerceReview(input: AiReview, fallback: ReviewOutcome): ReviewOutcome {
  const reason =
    typeof input.reason === "string" && input.reason.trim().length > 0
      ? noDashCopy(input.reason).slice(0, 220)
      : fallback.reason;
  const requestType = isRequestType(input.requestType) ? input.requestType : fallback.requestType;
  const priority = isPriority(input.priority) ? input.priority : fallback.priority;

  return { reason, requestType, priority };
}

export async function polishReviewWithAi({
  text,
  snapshot,
  fallback,
}: {
  text: string;
  snapshot: MenuSnapshot;
  fallback: ReviewOutcome;
}): Promise<ReviewOutcome> {
  const config = readOpenAiConfig();
  if (!config) return fallback;

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You help restaurant owners in Fina Calle OS. Return only JSON with reason, requestType, and priority. Keep the reason plain, helpful, and under 22 words. Never use dash characters. Never say a change is live. Valid requestType values are Menu/content update, Image/file upload, Operational support, Question for AMMA. Valid priority values are Low, Normal, Urgent.",
          },
          {
            role: "user",
            content: JSON.stringify({
              businessName: snapshot.businessName,
              ownerRequest: text,
              deterministicReview: fallback,
              menuItems: snapshot.items.slice(0, 12).map((item) => ({
                name: item.name,
                available: item.isAvailable,
                hasDescription: Boolean(item.description),
              })),
            }),
          },
        ],
      }),
    });

    if (!response.ok) return fallback;
    const body = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    const content = body.choices?.[0]?.message?.content;
    if (!content) return fallback;
    return coerceReview(JSON.parse(content) as AiReview, fallback);
  } catch {
    return fallback;
  }
}
