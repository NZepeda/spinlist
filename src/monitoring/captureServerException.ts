import type { LogContext } from "@/server/logging/serverLogger";
import { logServerError } from "@/server/logging/serverLogger";
import { captureException } from "@/monitoring/captureException";
import { sanitizeObservabilityContext } from "@/monitoring/sanitizeObservabilityContext";

/**
 * Captures a server exception and mirrors the provider event identifier into the
 * structured server log so platform logs and hosted monitoring can be correlated.
 *
 * @param params - The server error payload to report.
 * @returns The provider event identifier when one was created.
 */
export function captureServerException(params: {
  context?: Record<string, boolean | number | string | null | undefined>;
  error: unknown;
  event: string;
  tags?: Record<string, string>;
}): string | undefined {
  const sanitizedContext = sanitizeObservabilityContext(params.context);
  const eventId = captureException(params.error, {
    context: sanitizedContext,
    tags: params.tags,
  });
  const logContext: LogContext = {
    ...sanitizedContext,
    eventId: eventId ?? undefined,
  };

  logServerError({
    context: logContext,
    error: params.error,
    event: params.event,
  });

  return eventId;
}
