import { createHash } from "node:crypto";
import { isIP } from "node:net";

/** Only trust the address supplied by the deployment platform, never a form field. */
export function guestNoteClientKey(
  headers: Headers,
  environment: { vercel: boolean; production: boolean },
): string | null {
  let address = "local-development";
  if (environment.vercel) {
    const forwarded = headers.get("x-vercel-forwarded-for")?.trim() ?? "";
    if (!isIP(forwarded)) return null;
    // Canonicalize IPv6 spelling so equivalent addresses share one bucket.
    address = isIP(forwarded) === 6 ? new URL(`http://[${forwarded}]/`).hostname : forwarded;
  } else if (environment.production) {
    // A different host needs an explicitly trusted proxy adapter before enabling intake.
    return null;
  }
  // Store a pseudonymous bucket key, not the raw network address. SQL expires buckets.
  return createHash("sha256").update(`bodega-guest-notes:v1:${address}`).digest("hex");
}
