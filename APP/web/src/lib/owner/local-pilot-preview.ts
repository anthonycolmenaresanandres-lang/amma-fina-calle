/** Test-workspace gate, never an authentication or production-access bypass. */
export function localPilotPreviewAllowed(enabled: string | undefined, platform: string | undefined, host: string | null): boolean {
  return enabled === "1" && !platform && typeof host === "string" && /^(localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/.test(host);
}
