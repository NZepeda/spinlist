import { getObservabilityEnvironment } from "@/monitoring/sentry/getObservabilityEnvironment";

/**
 * Determines whether the browser should initialize observability at all.
 *
 * @returns Whether client-side telemetry should be enabled.
 */
export function isClientObservabilityEnabled(): boolean {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    return false;
  }

  if (getObservabilityEnvironment() === "development") {
    return process.env.NEXT_PUBLIC_ENABLE_LOCAL_OBSERVABILITY === "true";
  }

  return true;
}
