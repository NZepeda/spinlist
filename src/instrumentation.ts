import type { Instrumentation } from "next";
import { logServerError } from "@/lib/logging/serverLogger";

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
  logServerError({
    context: {
      method: request.method,
      path: request.path,
      routePath: context.routePath,
      routeType: context.routeType,
      routerKind: context.routerKind,
    },
    error,
    event: "next_request_error",
  });
};
