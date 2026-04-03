import type { EdgeOptions } from "@sentry/nextjs";
import { getObservabilityEnvironment } from "@/monitoring/sentry/getObservabilityEnvironment";
import { isServerObservabilityEnabled } from "@/monitoring/sentry/isServerObservabilityEnabled";
import { redactBreadcrumb } from "@/monitoring/sentry/redactBreadcrumb";
import { redactEvent } from "@/monitoring/sentry/redactEvent";
import { getTraceSampleRate } from "./getTraceSampleRate";

const DEFAULT_MAX_BREADCRUMBS = 50;

/**
 * Creates the shared Edge runtime configuration so any future Edge handlers use the same observability boundaries as the Node.js runtime.
 *
 * @returns The Edge runtime Sentry options for Spinlist.
 */
export function createEdgeSentryOptions(): EdgeOptions {
  const environment = getObservabilityEnvironment();

  return {
    attachStacktrace: true,
    beforeBreadcrumb: redactBreadcrumb,
    beforeSend: redactEvent,
    dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
    enabled: isServerObservabilityEnabled(),
    environment,
    maxBreadcrumbs: DEFAULT_MAX_BREADCRUMBS,
    sendDefaultPii: false,
    tracesSampleRate: getTraceSampleRate(environment),
  };
}
