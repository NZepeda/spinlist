/**
 * Normalizes the deployment environment into stable Sentry environment names so preview traffic is visible without being confused with production or local usage.
 *
 * @returns The environment name to attach to Sentry events.
 */
export function getObservabilityEnvironment(): string {
  const configuredEnvironment = process.env.SENTRY_ENVIRONMENT?.trim();

  if (configuredEnvironment) {
    return configuredEnvironment;
  }

  if (process.env.VERCEL_ENV === "production") {
    return "production";
  }

  if (process.env.VERCEL_ENV === "preview") {
    return "preview";
  }

  if (process.env.NODE_ENV === "production") {
    return "production";
  }

  return "development";
}
