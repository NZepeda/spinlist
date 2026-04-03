import * as Sentry from "@sentry/nextjs";

type StartSpanOptions = Parameters<typeof Sentry.startSpan>[0];
type StartSpanParameter = Parameters<Parameters<typeof Sentry.startSpan>[1]>[0];

/**
 * Starts a span through the shared observability interface so feature code can participate in tracing without depending on the provider directly.
 *
 * @param options - The span metadata.
 * @param callback - The traced callback body.
 * @returns The callback result.
 */
export function startSpan<T>(
  options: StartSpanOptions,
  callback: (span: StartSpanParameter) => T,
): T {
  return Sentry.startSpan(options, callback);
}
