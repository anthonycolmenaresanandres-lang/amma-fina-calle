import "server-only";

export type SquareEnvironment = "sandbox" | "production";

export type SquareAppConfig = {
  applicationId: string;
  applicationSecret: string;
  environment: SquareEnvironment;
  apiVersion: string;
  apiBase: string;
  oauthBase: string;
  scopes: readonly string[];
};

export type SquareWebhookConfig = {
  signatureKey: string;
  notificationUrl: string;
};

const DEFAULT_SCOPES = ["ITEMS_READ", "MERCHANT_PROFILE_READ"] as const;

function value(name: string) {
  return process.env[name]?.trim() ?? "";
}

export function squareApiBase(environment: SquareEnvironment) {
  return environment === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

export function getSquareAppConfig(): SquareAppConfig | null {
  const applicationId = value("SQUARE_APPLICATION_ID");
  const applicationSecret = value("SQUARE_APPLICATION_SECRET");
  if (!applicationId || !applicationSecret) return null;

  const environment: SquareEnvironment = value("SQUARE_ENVIRONMENT") === "production"
    ? "production"
    : "sandbox";
  const apiBase = squareApiBase(environment);

  return {
    applicationId,
    applicationSecret,
    environment,
    apiVersion: value("SQUARE_API_VERSION") || "2026-09-16",
    apiBase,
    oauthBase: `${apiBase}/oauth2`,
    scopes: DEFAULT_SCOPES,
  };
}

export function getSquareWebhookConfig(): SquareWebhookConfig | null {
  const signatureKey = value("SQUARE_WEBHOOK_SIGNATURE_KEY");
  const configuredUrl = value("SQUARE_WEBHOOK_URL");
  const appUrl = value("NEXT_PUBLIC_APP_URL").replace(/\/$/, "");
  const notificationUrl = configuredUrl || (appUrl ? `${appUrl}/api/integrations/square/webhook` : "");
  if (!signatureKey || !notificationUrl) return null;
  return { signatureKey, notificationUrl };
}

export function getSquareTokenEncryptionKey(): Buffer {
  const encoded = value("SQUARE_TOKEN_ENCRYPTION_KEY");
  if (!encoded) throw new Error("Square token encryption is not configured.");
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) throw new Error("SQUARE_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
  return key;
}
