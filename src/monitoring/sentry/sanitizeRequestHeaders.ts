import type { BrowserOptions } from "@sentry/nextjs";
import { sanitizeTelemetryValue } from "@/monitoring/sentry/sanitizeTelemetryValue";

type BeforeSendHandler = NonNullable<BrowserOptions["beforeSend"]>;
type ObservabilityEvent = Parameters<BeforeSendHandler>[0];

/**
 * Keeps request headers typed narrowly enough for event redaction to preserve the installed SDK's request shape.
 *
 * @param headers - The request headers attached to a Sentry event.
 * @returns The redacted request headers.
 */
export function sanitizeRequestHeaders(
  headers: ObservabilityEvent["request"] extends infer RequestType
    ? RequestType extends { headers?: infer HeaderType }
      ? HeaderType
      : never
    : never,
): Record<string, string> | undefined {
  if (
    typeof headers !== "object" ||
    headers === null ||
    Array.isArray(headers)
  ) {
    return undefined;
  }

  const sanitizedHeaders = sanitizeTelemetryValue(headers);

  if (
    typeof sanitizedHeaders !== "object" ||
    sanitizedHeaders === null ||
    Array.isArray(sanitizedHeaders)
  ) {
    return undefined;
  }

  const normalizedHeaders = Object.fromEntries(
    Object.entries(sanitizedHeaders).map(([headerKey, headerValue]) => [
      headerKey,
      String(headerValue),
    ]),
  );

  return normalizedHeaders;
}
