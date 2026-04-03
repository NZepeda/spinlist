import { getObservabilityEnvironment } from "@/monitoring/sentry/getObservabilityEnvironment";

/**
 * Determines whether the server runtime should initialize observability at all.
 *
 * @returns Whether server-side telemetry should be enabled.
 */
export function isServerObservabilityEnabled(): boolean {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    return false;
  }

  if (getObservabilityEnvironment() === "development") {
    return process.env.NEXT_PUBLIC_ENABLE_LOCAL_OBSERVABILITY === "true";
  }

  return true;
}
