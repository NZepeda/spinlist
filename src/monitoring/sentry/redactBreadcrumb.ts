import type { BrowserOptions } from "@sentry/nextjs";
import { sanitizeTelemetryValue } from "@/monitoring/sentry/sanitizeTelemetryValue";

type BeforeBreadcrumbHandler = NonNullable<BrowserOptions["beforeBreadcrumb"]>;
type ObservabilityBreadcrumb = Parameters<BeforeBreadcrumbHandler>[0];
type ObservabilityBreadcrumbHint = Parameters<BeforeBreadcrumbHandler>[1];

/**
 * Redacts breadcrumb strings and structured payloads before they are added to a Sentry event so sensitive inputs never leave the app.
 *
 * @param breadcrumb - The breadcrumb candidate supplied to Sentry.
 * @param hint - Additional breadcrumb hint metadata unused by the redactor.
 * @returns The redacted breadcrumb.
 */
export function redactBreadcrumb(
  breadcrumb: ObservabilityBreadcrumb,
  hint?: ObservabilityBreadcrumbHint,
): ObservabilityBreadcrumb | null {
  void hint;

  return {
    ...breadcrumb,
    data:
      typeof breadcrumb.data === "object" &&
      breadcrumb.data !== null &&
      !Array.isArray(breadcrumb.data)
        ? (sanitizeTelemetryValue(
            breadcrumb.data,
          ) as ObservabilityBreadcrumb["data"])
        : breadcrumb.data,
    message:
      typeof breadcrumb.message === "string"
        ? (sanitizeTelemetryValue(breadcrumb.message) as string)
        : breadcrumb.message,
  };
}
