// This prospect is deliberately absent from public navigation, sitemap and venue registries.
// The flag alone is insufficient: both direct and forwarded hosts must be loopback.
export function localReviewAllowed(flag: string | undefined, host: string | null, forwardedHost: string | null): boolean {
  const loopback = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/i;
  return flag === "1" && !!host && loopback.test(host) && (!forwardedHost || loopback.test(forwardedHost));
}
