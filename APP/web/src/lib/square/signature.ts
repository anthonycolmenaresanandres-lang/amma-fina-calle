import { createHmac, timingSafeEqual } from "node:crypto";

export function squareSignature(notificationUrl: string, rawBody: string, signatureKey: string): string {
  return createHmac("sha256", signatureKey).update(notificationUrl + rawBody).digest("base64");
}

export function verifySquareSignature(input: {
  notificationUrl: string;
  rawBody: string;
  signatureKey: string;
  signature: string | null;
}): boolean {
  if (!input.signature || !input.notificationUrl || !input.signatureKey) return false;
  const expected = Buffer.from(squareSignature(input.notificationUrl, input.rawBody, input.signatureKey));
  const provided = Buffer.from(input.signature);
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}
