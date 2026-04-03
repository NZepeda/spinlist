import { describe, expect, it } from "vitest";
import { createTracesSampler } from "./createTracesSampler";

type SamplingContext = Parameters<ReturnType<typeof createTracesSampler>>[0];

/**
 * Creates the smallest sampling context needed to exercise the route-aware sampler in unit tests.
 *
 * @param name - The trace name under evaluation.
 * @returns A sampling context double.
 */
function createSamplingContext(name: string): SamplingContext {
  return {
    inheritOrSampleWith: (fallbackRate: number): number => fallbackRate,
    name,
  };
}

describe("createTracesSampler", () => {
  it("fully samples high-value production traces", () => {
    const tracesSampler = createTracesSampler("production");

    expect(tracesSampler(createSamplingContext("page.album.load"))).toBe(1);
    expect(tracesSampler(createSamplingContext("GET /api/search"))).toBe(1);
    expect(tracesSampler(createSamplingContext("spotify.search.fetch"))).toBe(1);
  });

  it("disables preview tracing even for high-value flows", () => {
    const tracesSampler = createTracesSampler("preview");

    expect(tracesSampler(createSamplingContext("page.artist.load"))).toBe(0);
    expect(tracesSampler(createSamplingContext("POST /api/reviews"))).toBe(0);
  });

  it("falls back to the baseline rate for non-priority production traces", () => {
    const tracesSampler = createTracesSampler("production");

    expect(tracesSampler(createSamplingContext("GET /health"))).toBe(0.05);
  });

  it("drops known example traces entirely", () => {
    const tracesSampler = createTracesSampler("production");

    expect(
      tracesSampler(createSamplingContext("GET /api/sentry-example-api")),
    ).toBe(0);
    expect(
      tracesSampler(createSamplingContext("GET /sentry-example-page")),
    ).toBe(0);
  });
});
