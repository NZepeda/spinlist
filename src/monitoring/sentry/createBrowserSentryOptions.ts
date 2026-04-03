import type { BrowserOptions } from "@sentry/nextjs";
import { getObservabilityEnvironment } from "@/monitoring/sentry/getObservabilityEnvironment";
import { isClientObservabilityEnabled } from "@/monitoring/sentry/isClientObservabilityEnabled";
import { redactBreadcrumb } from "@/monitoring/sentry/redactBreadcrumb";
import { redactEvent } from "@/monitoring/sentry/redactEvent";
import { redactLog } from "@/monitoring/sentry/redactLog";
import { createTracesSampler } from "./createTracesSampler";

const DEFAULT_MAX_BREADCRUMBS = 50;

/**
 * Creates the shared browser configuration so client failures arrive with stable
 * environment metadata while replay remains limited to error sessions only.
 *
 * @returns The browser Sentry options for Spinlist.
 */
export function createBrowserSentryOptions(): BrowserOptions {
  const environment = getObservabilityEnvironment();

  return {
    attachStacktrace: true,
    beforeBreadcrumb: redactBreadcrumb,
    beforeSend: redactEvent,
    beforeSendLog: redactLog,
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    enableLogs: true,
    enabled: isClientObservabilityEnabled(),
    environment,
    maxBreadcrumbs: DEFAULT_MAX_BREADCRUMBS,
    replaysOnErrorSampleRate: 1,
    replaysSessionSampleRate: 0,
    sendDefaultPii: false,
    tracesSampler: createTracesSampler(environment),
  };
}
