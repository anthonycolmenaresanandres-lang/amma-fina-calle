import "dotenv/config";

const DAY_IDX: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

// Parse open days from env: a range ("Tue-Sat"), a list ("Mon,Wed,Fri"), or numbers
// ("1,2,3"). Falls back to Tue–Sat. Returns sorted unique weekday indices (0=Sun).
function parseOpenDays(raw: string): number[] {
  const s = raw.trim().toLowerCase();
  const dayNum = (tok: string): number | undefined => {
    const t = tok.trim();
    if (/^\d$/.test(t)) return Number(t);
    return DAY_IDX[t.slice(0, 3)];
  };
  let days: number[] = [];
  if (s.includes("-")) {
    const [a, b] = s.split("-").map((x) => dayNum(x));
    if (a !== undefined && b !== undefined) {
      for (let d = a; ; d = (d + 1) % 7) { days.push(d); if (d === b) break; }
    }
  } else {
    days = s.split(",").map((x) => dayNum(x)).filter((n): n is number => n !== undefined);
  }
  const uniq = [...new Set(days)].filter((d) => d >= 0 && d <= 6).sort((x, y) => x - y);
  return uniq.length ? uniq : [2, 3, 4, 5, 6];
}

/** Central config. Everything sensitive comes from env; nothing is committed. */
export const config = {
  port: Number(process.env.PORT ?? 8080),
  publicHost: process.env.PUBLIC_HOST ?? "", // e.g. voice.finacalleos.com (for the wss Stream URL)

  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  realtimeModel: process.env.OPENAI_REALTIME_MODEL ?? "gpt-realtime",
  voice: process.env.OPENAI_VOICE ?? "alloy",

  // Booking connector: "mock" (default) | "calcom" | "square" | "webhook" | "proposeconfirm"
  connector: (process.env.BOOKING_CONNECTOR ?? "mock") as "mock" | "calcom" | "square" | "webhook" | "proposeconfirm",
  calcom: {
    apiKey: process.env.CALCOM_API_KEY ?? "",
    baseUrl: process.env.CALCOM_BASE_URL ?? "https://api.cal.com/v2",
    eventTypeId: Number(process.env.CALCOM_EVENT_TYPE_ID ?? 0),
    timeZone: process.env.CALCOM_TIMEZONE ?? "America/New_York",
  },
  square: {
    accessToken: process.env.SQUARE_ACCESS_TOKEN ?? "",
    baseUrl: process.env.SQUARE_BASE_URL ?? "https://connect.squareup.com", // sandbox: https://connect.squareupsandbox.com
    locationId: process.env.SQUARE_LOCATION_ID ?? "",
    serviceVariationId: process.env.SQUARE_SERVICE_VARIATION_ID ?? "",
    teamMemberId: process.env.SQUARE_TEAM_MEMBER_ID ?? "",
  },
  // Generic webhook bridge (Zapier/Make/cloud function) — for MoeGo/Gingr/etc.
  webhook: {
    availabilityUrl: process.env.WEBHOOK_AVAILABILITY_URL ?? "",
    bookUrl: process.env.WEBHOOK_BOOK_URL ?? "",
    secret: process.env.WEBHOOK_SECRET ?? "",
  },

  // Staff notification — when a booking commits as PENDING (propose-and-confirm, or a
  // POS that can't auto-write), ping the team to confirm it. Empty = console.log only.
  notify: {
    staffWebhookUrl: process.env.STAFF_WEBHOOK_URL ?? "", // Slack/Make/SMS-bridge incoming webhook
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
    // Structured open hours — used so the bot never offers a slot when the shop is closed.
    openDays: parseOpenDays(process.env.BUSINESS_OPEN_DAYS ?? "Tue-Sat"), // weekday indices, 0=Sun
    openHour: Number(process.env.BUSINESS_OPEN_HOUR ?? 9), // 24h local
    closeHour: Number(process.env.BUSINESS_CLOSE_HOUR ?? 18),
  },

  // Compliance: spoken AI disclosure (two-party-consent safe; default on).
  disclosure: process.env.DISCLOSURE ??
    "Hi! You've reached {business}. I'm an automated assistant and this call may be recorded. How can I help you today?",
};

export function requireOpenAI(): string {
  if (!config.openaiApiKey) throw new Error("OPENAI_API_KEY is required to run the live voice gateway");
  return config.openaiApiKey;
}
