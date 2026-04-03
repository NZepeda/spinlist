import type { NodeOptions } from "@sentry/nextjs";
import { getObservabilityEnvironment } from "@/monitoring/sentry/getObservabilityEnvironment";
import { isServerObservabilityEnabled } from "@/monitoring/sentry/isServerObservabilityEnabled";
import { redactBreadcrumb } from "@/monitoring/sentry/redactBreadcrumb";
import { redactEvent } from "@/monitoring/sentry/redactEvent";
import { createTracesSampler } from "./createTracesSampler";

const DEFAULT_MAX_BREADCRUMBS = 50;

/**
 * Creates the shared Node.js runtime configuration so server failures use the
 * same environment and sampling defaults as the browser.
 *
 * @returns The Node.js Sentry options for Spinlist.
 */
export function createNodeSentryOptions(): NodeOptions {
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
    tracesSampler: createTracesSampler(environment),
  };
}
