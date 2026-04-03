import * as Sentry from "@sentry/nextjs";
import type { Instrumentation } from "next";
import { captureUnhandledRequestError } from "@/monitoring/captureUnhandledRequestError";
import { createEdgeSentryOptions } from "@/monitoring/sentry/createEdgeSentryOptions";
import { createNodeSentryOptions } from "@/monitoring/sentry/createNodeSentryOptions";
import { isServerObservabilityEnabled } from "@/monitoring/sentry/isServerObservabilityEnabled";

/**
 * Initializes the runtime-specific Sentry SDK so server-side exceptions and traces can be reported before request handling begins.
 */
export function register(): void {
  if (!isServerObservabilityEnabled()) {
    return;
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init(createEdgeSentryOptions());
    return;
  }

  Sentry.init(createNodeSentryOptions());
}

/**
 * Captures uncaught server-side request failures so production logs still record
 * the route context even when a route handler does not catch the error itself.
 *
 * @param error - The server error captured by Next.js.
 * @param request - The request metadata associated with the failure.
 * @param context - The Next.js execution context for the failed request.
 */
export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context,
) => {
  captureUnhandledRequestError(error, request, context);
};
