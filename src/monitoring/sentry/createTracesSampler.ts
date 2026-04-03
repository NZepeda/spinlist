import type { BrowserOptions } from "@sentry/nextjs";
import { getTraceSampleRate } from "@/monitoring/sentry/getTraceSampleRate";

const HIGH_VALUE_PREFIXES = [
  "page.album.",
  "page.artist.",
  "spotify.",
  "supabase.review.",
  "supabase.album.read",
  "supabase.auth.get_user",
  "supabase.profile.read",
];

const HIGH_VALUE_ROUTE_MATCHERS = [
  "/api/search",
  "/api/slug",
  "/api/reviews",
];

const IGNORED_TRACE_MATCHERS = [
  "/api/sentry-example-api",
  "/sentry-example-page",
];

type TracesSampler = NonNullable<BrowserOptions["tracesSampler"]>;
type SamplingContext = Parameters<TracesSampler>[0];

/**
 * Creates the route-aware sampler that keeps baseline tracing light while fully prioritizing the app's critical read and write flows.
 *
 * @param environment - The resolved observability environment.
 * @returns The Sentry traces sampler for the current environment.
 */
export function createTracesSampler(environment: string): TracesSampler {
  const defaultRate = getTraceSampleRate(environment);

  return (samplingContext: SamplingContext): number => {
    const traceName = samplingContext.name;

    if (matchesAnyPattern(traceName, IGNORED_TRACE_MATCHERS)) {
      return 0;
    }

    if (matchesAnyPattern(traceName, HIGH_VALUE_PREFIXES)) {
      return getHighValueTraceSampleRate(environment);
    }

    if (matchesAnyPattern(traceName, HIGH_VALUE_ROUTE_MATCHERS)) {
      return getHighValueTraceSampleRate(environment);
    }

    return samplingContext.inheritOrSampleWith(defaultRate);
  };
}

/**
 * Raises sampling on the routes and spans that are most useful for operational triage while keeping non-production tracing disabled.
 *
 * @param environment - The resolved observability environment.
 * @returns The sample rate for high-value traces in the current environment.
 */
function getHighValueTraceSampleRate(environment: string): number {
  if (environment === "production") {
    return 1;
  }

  return 0;
}

/**
 * Uses partial name matching so route and span conventions can evolve without forcing a complete sampling rewrite.
 *
 * @param traceName - The transaction or span name under consideration.
 * @param patterns - The patterns that should match the trace name.
 * @returns Whether the trace name matches any configured pattern.
 */
function matchesAnyPattern(traceName: string, patterns: string[]): boolean {
  return patterns.some((pattern) => traceName.includes(pattern));
}
