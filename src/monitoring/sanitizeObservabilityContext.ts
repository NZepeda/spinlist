import { sanitizeTelemetryValue } from "@/monitoring/sentry/sanitizeTelemetryValue";

type ObservabilityPrimitive = boolean | number | string | null;

type ObservabilityContext = Record<string, ObservabilityPrimitive | undefined>;

/**
 * Removes undefined values and sensitive strings from app-provided context before it is attached to telemetry or logs.
 *
 * @param context - The app-level context attached to telemetry.
 * @returns The sanitized context object or undefined when empty.
 */
export function sanitizeObservabilityContext(
  context?: ObservabilityContext,
): Record<string, ObservabilityPrimitive> | undefined {
  if (!context) {
    return undefined;
  }

  const sanitizedEntries = Object.entries(context)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => [
      key,
      sanitizeTelemetryValue(value, key) as ObservabilityPrimitive,
    ]);

  if (sanitizedEntries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(sanitizedEntries) as Record<
    string,
    ObservabilityPrimitive
  >;
}
