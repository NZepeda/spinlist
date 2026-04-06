const VALID_ENVIRONMENTS = ["production", "preview", "development"];

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

  const vercelEnvironment = process.env.VERCEL_ENV?.trim();

  if (vercelEnvironment && !VALID_ENVIRONMENTS.includes(vercelEnvironment)) {
    throw new Error(
      "Invalid VERCEL_ENV value. Expected one of: " +
        VALID_ENVIRONMENTS.join(", "),
    );
  }

  return "development";
}
