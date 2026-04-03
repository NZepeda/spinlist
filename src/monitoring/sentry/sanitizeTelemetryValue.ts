const REDACTED_VALUE = "[REDACTED]";
const EMAIL_PATTERN = /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;
const SENSITIVE_KEY_PATTERN =
  /(^|[_-])(authorization|body|cookie|email|password|secret|set-cookie|token)([_-]|$)/i;

/**
 * Redacts sensitive information before storing it in Sentry.
 *
 * @param value - The unknown telemetry value to sanitize.
 * @param key - The optional key associated with the value.
 * @returns The redacted telemetry-safe value.
 */
export function sanitizeTelemetryValue(value: unknown, key?: string): unknown {
  if (typeof key === "string" && SENSITIVE_KEY_PATTERN.test(key)) {
    return REDACTED_VALUE;
  }

  if (typeof value === "string") {
    return value.replace(EMAIL_PATTERN, REDACTED_VALUE);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeTelemetryValue(item));
  }

  if (isRecord(value)) {
    const sanitizedEntries = Object.entries(value).map(
      ([entryKey, entryValue]) => [
        entryKey,
        sanitizeTelemetryValue(entryValue, entryKey),
      ],
    );

    return Object.fromEntries(sanitizedEntries);
  }

  return value;
}
/**
 * Narrows unknown values to records so nested telemetry payloads can be
 * traversed without unsafe casts.
 *
 * @param value - The unknown telemetry value to inspect.
 * @returns Whether the value is a plain object record.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
