export const SQUARE_CALLBACK_PATH = "/api/integrations/square/callback";

/** A single registered callback host also owns the short-lived OAuth state cookie. */
export function resolveSquareOAuthCallbackUrl(
  explicitUrl: string,
  appUrl: string,
  environment: "sandbox" | "production",
): URL | null {
  const configured = explicitUrl.trim();
  const fallback = appUrl.trim();
  if (!configured && !fallback) return null;
  try {
    const url = new URL(configured || SQUARE_CALLBACK_PATH, configured ? undefined : fallback);
    if (url.pathname !== SQUARE_CALLBACK_PATH || url.search || url.hash || url.username || url.password) return null;
    if (url.protocol !== "https:" && !(environment === "sandbox" && url.protocol === "http:" && url.hostname === "localhost")) return null;
    return url;
  } catch {
    return null;
  }
}

export function canonicalSquareConnectUrl(callbackUrl: URL, restaurantId: string): URL {
  const url = new URL("/api/integrations/square/connect", callbackUrl.origin);
  url.searchParams.set("restaurant_id", restaurantId);
  return url;
}
