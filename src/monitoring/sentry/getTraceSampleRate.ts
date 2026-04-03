/**
 * Limits baseline tracing to production so errors can still be monitored in other environments without consuming tracing quota.
 *
 * @param environment - The resolved observability environment.
 * @returns The default trace sample rate for the current environment.
 */
export function getTraceSampleRate(environment: string): number {
  if (environment === "production") {
    return 0.05;
  }

  return 0;
}
