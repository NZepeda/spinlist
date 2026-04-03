import type { BrowserOptions } from "@sentry/nextjs";
import { sanitizeTelemetryValue } from "@/monitoring/sentry/sanitizeTelemetryValue";

type BeforeSendLogHandler = NonNullable<BrowserOptions["beforeSendLog"]>;
type ObservabilityLog = Parameters<BeforeSendLogHandler>[0];

/**
 * Redacts structured log payloads before they are sent to Sentry so log search does not expose sensitive fields.
 *
 * @param log - The Sentry log candidate.
 * @returns The redacted log payload.
 */
export function redactLog(log: ObservabilityLog): ObservabilityLog | null {
  return {
    ...log,
    attributes:
      typeof log.attributes === "object" &&
      log.attributes !== null &&
      !Array.isArray(log.attributes)
        ? (sanitizeTelemetryValue(log.attributes) as ObservabilityLog["attributes"])
        : log.attributes,
    message: sanitizeTelemetryValue(log.message) as ObservabilityLog["message"],
  };
}
