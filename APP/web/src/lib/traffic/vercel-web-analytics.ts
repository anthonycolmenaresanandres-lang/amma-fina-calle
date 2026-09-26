import "server-only";

const API_BASE = "https://api.vercel.com/v1/query/web-analytics/visits";
const DEFAULT_PROJECT_ID = "prj_Y9350Up2cl8sLjYBCZ05lM2lZ0E4";
const DEFAULT_TEAM_ID = "team_MwMFazBLYzRGQnqRAJOPDPH3";
const BODEGA_HOST_FILTER =
  "(requestHostname eq 'bodegacafe757.com' or requestHostname eq 'www.bodegacafe757.com')";
const GAME_FILTER =
  `${BODEGA_HOST_FILTER} and requestPath eq '/bodega-sessions-review'`;

type AnalyticsCountResponse = {
  data?: { pageviews?: number; visitors?: number };
};

type AggregateRow = Record<string, unknown> & {
  count?: number;
  pageviews?: number;
  visitors?: number;
  timestamp?: string;
  requestPath?: string;
  referrerHostname?: string;
};

type AggregateResponse = { data?: AggregateRow[] };

export type BodegaTrafficReport =
  | {
      state: "ready";
      source: "Vercel Web Analytics";
      authMode: "access-token" | "oidc";
      since: string;
      until: string;
      pageviews: number;
      visitors: number;
      gamePageviews: number;
      gameVisitors: number;
      daily: Array<{ date: string; pageviews: number; visitors: number }>;
      topPaths: Array<{ path: string; pageviews: number; visitors: number }>;
      topReferrers: Array<{ referrer: string; pageviews: number; visitors: number }>;
    }
  | {
      state: "unconfigured" | "unavailable";
      reason: string;
    };

type AuthCandidate = {
  token: string;
  mode: "access-token" | "oidc";
};

function authCandidates(): AuthCandidate[] {
  const explicit =
    process.env.VERCEL_WEB_ANALYTICS_TOKEN?.trim() ||
    process.env.VERCEL_TOKEN?.trim() ||
    "";
  const oidc = process.env.VERCEL_OIDC_TOKEN?.trim() || "";
  const candidates: AuthCandidate[] = [];
  if (explicit) candidates.push({ token: explicit, mode: "access-token" });
  if (oidc && oidc !== explicit) candidates.push({ token: oidc, mode: "oidc" });
  return candidates;
}

function config() {
  return {
    projectId:
      process.env.VERCEL_WEB_ANALYTICS_PROJECT_ID?.trim() ||
      process.env.VERCEL_PROJECT_ID?.trim() ||
      DEFAULT_PROJECT_ID,
    teamId:
      process.env.VERCEL_WEB_ANALYTICS_TEAM_ID?.trim() ||
      process.env.VERCEL_ORG_ID?.trim() ||
      DEFAULT_TEAM_ID,
  };
}

function number(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : typeof value === "string" && Number.isFinite(Number(value))
      ? Number(value)
      : 0;
}

function pageviews(row: AggregateRow): number {
  return number(row.pageviews ?? row.count);
}

function cleanDimension(value: unknown): string {
  return typeof value === "string" && value.trim() ? value.trim() : "Direct / unknown";
}

async function requestJson<T>(
  endpoint: "count" | "aggregate",
  params: URLSearchParams,
): Promise<{ data: T; mode: AuthCandidate["mode"] }> {
  const candidates = authCandidates();
  if (!candidates.length) {
    throw new Error("NO_ANALYTICS_AUTH");
  }

  const { projectId, teamId } = config();
  params.set("projectId", projectId);
  params.set("teamId", teamId);
  let lastStatus = 0;

  for (const candidate of candidates) {
    const response = await fetch(`${API_BASE}/${endpoint}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${candidate.token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    lastStatus = response.status;
    if (response.ok) {
      return { data: (await response.json()) as T, mode: candidate.mode };
    }
    if (response.status !== 401 && response.status !== 403) {
      const body = await response.text();
      throw new Error(`VERCEL_ANALYTICS_${response.status}:${body.slice(0, 160)}`);
    }
  }

  throw new Error(`VERCEL_ANALYTICS_AUTH_${lastStatus || 401}`);
}

function period(days: number) {
  const until = new Date();
  const since = new Date(until.getTime() - days * 24 * 60 * 60 * 1000);
  return { since: since.toISOString(), until: until.toISOString() };
}

async function count(filter: string, since: string, until: string) {
  const params = new URLSearchParams({ filter, since, until });
  const result = await requestJson<AnalyticsCountResponse>("count", params);
  return {
    pageviews: number(result.data.data?.pageviews),
    visitors: number(result.data.data?.visitors),
    mode: result.mode,
  };
}

async function aggregate(
  by: "day" | "requestPath" | "referrerHostname",
  filter: string,
  since: string,
  until: string,
  limit = 100,
) {
  const params = new URLSearchParams({
    by,
    filter,
    since,
    until,
    limit: String(limit),
  });
  const result = await requestJson<AggregateResponse>("aggregate", params);
  return { rows: result.data.data ?? [], mode: result.mode };
}

export async function getBodegaTrafficReport(days = 30): Promise<BodegaTrafficReport> {
  const safeDays = Math.max(1, Math.min(90, Math.floor(days)));
  const candidates = authCandidates();
  if (!candidates.length) {
    return {
      state: "unconfigured",
      reason:
        "Vercel Web Analytics authorization is not available to the server. The deployment will try Vercel OIDC automatically; if Vercel rejects it, configure VERCEL_WEB_ANALYTICS_TOKEN as a server-only secret.",
    };
  }

  const { since, until } = period(safeDays);
  try {
    const [total, game, dailyResult, pathsResult, referrersResult] =
      await Promise.all([
        count(BODEGA_HOST_FILTER, since, until),
        count(GAME_FILTER, since, until),
        aggregate("day", BODEGA_HOST_FILTER, since, until, 90),
        aggregate("requestPath", BODEGA_HOST_FILTER, since, until, 25),
        aggregate("referrerHostname", BODEGA_HOST_FILTER, since, until, 20),
      ]);

    const mode = total.mode;
    const daily = dailyResult.rows
      .map((row) => ({
        date: cleanDimension(row.timestamp).slice(0, 10),
        pageviews: pageviews(row),
        visitors: number(row.visitors),
      }))
      .filter((row) => row.date !== "Direct / u")
      .sort((a, b) => a.date.localeCompare(b.date));

    const topPaths = pathsResult.rows
      .map((row) => ({
        path: cleanDimension(row.requestPath),
        pageviews: pageviews(row),
        visitors: number(row.visitors),
      }))
      .sort((a, b) => b.pageviews - a.pageviews);

    const topReferrers = referrersResult.rows
      .map((row) => ({
        referrer: cleanDimension(row.referrerHostname),
        pageviews: pageviews(row),
        visitors: number(row.visitors),
      }))
      .sort((a, b) => b.pageviews - a.pageviews);

    return {
      state: "ready",
      source: "Vercel Web Analytics",
      authMode: mode,
      since,
      until,
      pageviews: total.pageviews,
      visitors: total.visitors,
      gamePageviews: game.pageviews,
      gameVisitors: game.visitors,
      daily,
      topPaths,
      topReferrers,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown analytics error";
    return {
      state: "unavailable",
      reason: message.startsWith("VERCEL_ANALYTICS_AUTH_")
        ? "Vercel Web Analytics rejected the available server credential. Configure VERCEL_WEB_ANALYTICS_TOKEN as a server-only Vercel secret with access to this project."
        : "Vercel Web Analytics could not be queried right now. Existing Bodega pages remain unaffected.",
    };
  }
}

export const __test = {
  BODEGA_HOST_FILTER,
  GAME_FILTER,
  config,
  number,
  pageviews,
};
