import * as Sentry from "@sentry/nextjs";
import { sanitizeObservabilityContext } from "@/monitoring/sanitizeObservabilityContext";
import { sanitizeTelemetryValue } from "@/monitoring/sentry/sanitizeTelemetryValue";

/**
 * Adds a breadcrumb through the shared observability interface so future feature-level instrumentation stays consistent with the app's privacy rules.
 *
 * @param params - The breadcrumb payload to record.
 */
export function addBreadcrumb(params: {
  category: string;
  data?: Record<string, boolean | number | string | null | undefined>;
  level?: "debug" | "error" | "info" | "log" | "warning";
  message?: string;
}): void {
  Sentry.addBreadcrumb({
    category: params.category,
    data: sanitizeObservabilityContext(params.data),
    level: params.level,
    message:
      typeof params.message === "string"
        ? (sanitizeTelemetryValue(params.message) as string)
        : params.message,
  });
}
