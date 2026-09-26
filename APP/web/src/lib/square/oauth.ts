import "server-only";
import type { SquareAppConfig } from "./config";

type SquareError = { detail?: string; code?: string };

export type SquareOAuthToken = {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  merchant_id: string;
  token_type?: string;
};

export type SquareMerchantContext = {
  merchantName?: string;
  locationId?: string;
};

function errorMessage(payload: { errors?: SquareError[] }, fallback: string) {
  return payload.errors?.[0]?.detail || payload.errors?.[0]?.code || fallback;
}

export function buildSquareAuthorizationUrl(config: SquareAppConfig, state: string): string {
  const url = new URL(`${config.oauthBase}/authorize`);
  url.searchParams.set("client_id", config.applicationId);
  url.searchParams.set("scope", config.scopes.join(" "));
  url.searchParams.set("state", state);
  if (config.environment === "production") url.searchParams.set("session", "false");
  return url.toString();
}

async function tokenRequest(config: SquareAppConfig, body: Record<string, string>): Promise<SquareOAuthToken> {
  const response = await fetch(`${config.oauthBase}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Square-Version": config.apiVersion },
    body: JSON.stringify({ client_id: config.applicationId, client_secret: config.applicationSecret, ...body }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const payload = await response.json() as Partial<SquareOAuthToken> & { errors?: SquareError[] };
  if (!response.ok || payload.errors?.length) throw new Error(errorMessage(payload, `Square OAuth returned ${response.status}.`));
  if (!payload.access_token || !payload.refresh_token || !payload.expires_at || !payload.merchant_id) {
    throw new Error("Square OAuth returned an incomplete token response.");
  }
  return payload as SquareOAuthToken;
}

export function obtainSquareOAuthToken(config: SquareAppConfig, authorizationCode: string) {
  return tokenRequest(config, { grant_type: "authorization_code", code: authorizationCode });
}

export function refreshSquareOAuthToken(config: SquareAppConfig, refreshToken: string) {
  return tokenRequest(config, { grant_type: "refresh_token", refresh_token: refreshToken });
}

export async function revokeSquareMerchantAuthorization(config: SquareAppConfig, merchantId: string) {
  const response = await fetch(`${config.oauthBase}/revoke`, {
    method: "POST",
    headers: {
      Authorization: `Client ${config.applicationSecret}`,
      "Content-Type": "application/json",
      "Square-Version": config.apiVersion,
    },
    body: JSON.stringify({ client_id: config.applicationId, merchant_id: merchantId }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const payload = await response.json() as { success?: boolean; errors?: SquareError[] };
  if (!response.ok || payload.errors?.length || payload.success !== true) {
    throw new Error(errorMessage(payload, `Square token revocation returned ${response.status}.`));
  }
}

export async function fetchSquareMerchantContext(
  config: SquareAppConfig,
  accessToken: string,
  merchantId: string,
): Promise<SquareMerchantContext> {
  const headers = { Authorization: `Bearer ${accessToken}`, "Square-Version": config.apiVersion };
  const [merchantResponse, locationsResponse] = await Promise.all([
    fetch(`${config.apiBase}/v2/merchants/${encodeURIComponent(merchantId)}`, { headers, cache: "no-store", signal: AbortSignal.timeout(10000) }),
    fetch(`${config.apiBase}/v2/locations`, { headers, cache: "no-store", signal: AbortSignal.timeout(10000) }),
  ]);

  let merchantName: string | undefined;
  let locationId: string | undefined;
  if (merchantResponse.ok) {
    const payload = await merchantResponse.json() as { merchant?: { business_name?: string } };
    merchantName = payload.merchant?.business_name?.trim() || undefined;
  }
  if (locationsResponse.ok) {
    const payload = await locationsResponse.json() as { locations?: Array<{ id?: string; status?: string }> };
    locationId = payload.locations?.find((location) => location.status === "ACTIVE" && location.id)?.id
      ?? payload.locations?.find((location) => location.id)?.id;
  }
  return { merchantName, locationId };
}
