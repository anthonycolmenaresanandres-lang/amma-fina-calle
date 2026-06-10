import "dotenv/config";

/** Central config. Everything sensitive comes from env; nothing is committed. */
export const config = {
  port: Number(process.env.PORT ?? 8080),
  publicHost: process.env.PUBLIC_HOST ?? "", // e.g. voice.finacalleos.com (for the wss Stream URL)

  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  realtimeModel: process.env.OPENAI_REALTIME_MODEL ?? "gpt-realtime",
  voice: process.env.OPENAI_VOICE ?? "alloy",

  // Booking connector: "mock" (default, no keys) | "calcom"
  connector: (process.env.BOOKING_CONNECTOR ?? "mock") as "mock" | "calcom",
  calcom: {
    apiKey: process.env.CALCOM_API_KEY ?? "",
    baseUrl: process.env.CALCOM_BASE_URL ?? "https://api.cal.com/v2",
    eventTypeId: Number(process.env.CALCOM_EVENT_TYPE_ID ?? 0),
    timeZone: process.env.CALCOM_TIMEZONE ?? "America/New_York",
  },

  // Per-client Knowledge Pack (v0 keeps it inline; later loaded per phone number).
  business: {
    name: process.env.BUSINESS_NAME ?? "Demo Pet Spa",
    kind: process.env.BUSINESS_KIND ?? "pet grooming",
    timezone: process.env.BUSINESS_TIMEZONE ?? "America/New_York",
    services: (process.env.BUSINESS_SERVICES ?? "Bath & Brush:45, Full Groom:90, Nail Trim:15")
      .split(",").map((s) => {
        const [name, dur] = s.split(":");
        return { name: (name ?? "").trim(), durationMin: Number((dur ?? "30").trim()) || 30 };
      }).filter((s) => s.name),
    hours: process.env.BUSINESS_HOURS ?? "Tue-Sat 9am-6pm",
  },

  // Compliance: spoken AI disclosure (two-party-consent safe; default on).
  disclosure: process.env.DISCLOSURE ??
    "Hi! You've reached {business}. I'm an automated assistant and this call may be recorded. How can I help you today?",
};

export function requireOpenAI(): string {
  if (!config.openaiApiKey) throw new Error("OPENAI_API_KEY is required to run the live voice gateway");
  return config.openaiApiKey;
}
