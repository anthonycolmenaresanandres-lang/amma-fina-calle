import "server-only";

export type SquareEnvironment = "sandbox" | "production";
export type SquareConfig = {
  accessToken: string;
  merchantId: string;
  locationId: string;
  webhookSignatureKey: string;
  webhookUrl: string;
  environment: SquareEnvironment;
  apiVersion: string;
  apiBase: string;
};

function value(name: string) {
  return process.env[name]?.trim() ?? "";
}

export function getBodegaSquareConfig(): SquareConfig | null {
  const environment: SquareEnvironment = value("SQUARE_BODEGA_ENVIRONMENT") === "production" ? "production" : "sandbox";
  const accessToken = value("SQUARE_BODEGA_ACCESS_TOKEN");
  const merchantId = value("SQUARE_BODEGA_MERCHANT_ID");
  const locationId = value("SQUARE_BODEGA_LOCATION_ID");
  const webhookSignatureKey = value("SQUARE_BODEGA_WEBHOOK_SIGNATURE_KEY");
  const webhookUrl = value("SQUARE_BODEGA_WEBHOOK_URL");
  if (!accessToken || !merchantId || !locationId || !webhookSignatureKey || !webhookUrl) return null;
  return {
    accessToken,
    merchantId,
    locationId,
    webhookSignatureKey,
    webhookUrl,
    environment,
    apiVersion: value("SQUARE_API_VERSION") || "2026-09-16",
    apiBase: environment === "production" ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com",
  };
}
