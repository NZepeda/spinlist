import { NextRequest } from "next/server";

/**
 * Reuses upstream request identifiers when they exist so one failing API call can be correlated across route responses, hosted monitoring, and platform logs.
 *
 * @param request - The incoming route handler request.
 * @returns A stable request identifier for the current request.
 */
export function getRequestId(request: NextRequest): string {
  const forwardedRequestId =
    request.headers.get("x-request-id") ?? request.headers.get("x-vercel-id");

  if (forwardedRequestId) {
    return forwardedRequestId;
  }

  return crypto.randomUUID();
}
