import { sanitizeTelemetryValue } from "@/monitoring/sentry/sanitizeTelemetryValue";

/**
 * Sanitizes app-defined tags before they are attached to telemetry so future feature instrumentation cannot accidentally leak sensitive strings.
 *
 * @param tags - The tag map to attach to telemetry.
 * @returns The redacted tag map or undefined when empty.
 */
export function sanitizeTags(
  tags?: Record<string, string>,
): Record<string, string> | undefined {
  if (!tags) {
    return undefined;
  }

  const sanitizedEntries = Object.entries(tags).map(([key, value]) => [
    key,
    sanitizeTelemetryValue(value, key) as string,
  ]);

  if (sanitizedEntries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(sanitizedEntries) as Record<string, string>;
}
