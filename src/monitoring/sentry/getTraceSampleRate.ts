/**
 * Limits baseline tracing so the initial rollout stays useful without consuming
 * free-tier quota too aggressively before route-specific tuning exists.
 *
 * @param environment - The resolved observability environment.
 * @returns The default trace sample rate for the current environment.
 */
export function getTraceSampleRate(environment: string): number {
  if (environment === "production") {
    return 0.05;
  }

  if (environment === "preview") {
    return 0.01;
  }

  return 0;
}
