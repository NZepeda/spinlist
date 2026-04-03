import * as Sentry from "@sentry/nextjs";
import { sanitizeObservabilityContext } from "@/monitoring/sanitizeObservabilityContext";
import { sanitizeTags } from "@/monitoring/sanitizeTags";

/**
 * Captures an exception through the shared observability interface so app code does not depend directly on the underlying provider API.
 *
 * @param error - The thrown value that should be reported.
 * @param params - Safe context and tags to attach to the event.
 * @returns The provider event identifier.
 */
export function captureException(
  error: unknown,
  params?: {
    context?: Record<string, boolean | number | string | null | undefined>;
    tags?: Record<string, string>;
  },
): string {
  return Sentry.captureException(error, {
    extra: sanitizeObservabilityContext(params?.context),
    tags: sanitizeTags(params?.tags),
  });
}
