import * as Sentry from "@sentry/nextjs";
import { logServerError } from "@/server/logging/serverLogger";

/**
 * Reports the error to Sentry and logs the error on the server.
 */
export function captureUnhandledRequestError(
  error: Parameters<typeof Sentry.captureRequestError>[0],
  request: Parameters<typeof Sentry.captureRequestError>[1],
  context: Parameters<typeof Sentry.captureRequestError>[2],
): void {
  Sentry.captureRequestError(error, request, context);

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
}
