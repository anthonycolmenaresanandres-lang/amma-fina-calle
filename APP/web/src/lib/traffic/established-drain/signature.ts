// Authenticates inbound drain requests. The drain endpoint is public, so an
// unauthenticated POST must never be stored.
//
// Primary mechanism (the one we control): when the drain is created we attach a
// custom header `x-traffic-secret: <TRAFFIC_DRAIN_SECRET>`. We compare it in
// constant time. Secondary: if Vercel signs the body with `x-vercel-signature`
// (HMAC-SHA1 of the raw body using the same secret), we accept that too. Either
// match authenticates the request; neither configured/matching rejects it.

import { createHmac, timingSafeEqual } from "node:crypto";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export interface VerifyInput {
  rawBody: string;
  secret: string | undefined;
  headerSecret: string | null;
  vercelSignature: string | null;
}

export function verifyDrainRequest({ rawBody, secret, headerSecret, vercelSignature }: VerifyInput): boolean {
  if (!secret) return false; // fail closed if no secret is configured

  if (headerSecret && safeEqual(headerSecret, secret)) return true;

  if (vercelSignature) {
    const expected = createHmac("sha1", secret).update(rawBody).digest("hex");
    if (safeEqual(vercelSignature, expected)) return true;
  }

  return false;
}
