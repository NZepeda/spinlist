"use client";

import NextError from "next/error";
import { useEffect } from "react";
import { captureException } from "@/monitoring/captureException";

/**
 * Captures app-router fatal rendering failures so the hosted observability provider records client-visible crashes that bypass route-level handlers.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    captureException(error, {
      context: {
        digest: error.digest ?? null,
      },
      tags: {
        boundary: "global-error",
      },
    });
  }, [error]);

  return (
    <html lang="en">
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
