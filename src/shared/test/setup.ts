import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

/**
 * Runs animation callbacks in tests without depending on a real browser frame loop.
 *
 * @param callback - The animation callback that should run on the next tick.
 * @returns The timer handle used to track the scheduled callback.
 */
function requestAnimationFrameMock(callback: FrameRequestCallback): number {
  return window.setTimeout(() => {
    callback(performance.now());
  }, 0);
}

/**
 * Stops a scheduled animation callback in the test environment.
 *
 * @param handle - The scheduled callback handle to cancel.
 */
function cancelAnimationFrameMock(handle: number): void {
  window.clearTimeout(handle);
}

if (typeof globalThis.requestAnimationFrame === "undefined") {
  vi.stubGlobal("requestAnimationFrame", requestAnimationFrameMock);
}

if (typeof globalThis.cancelAnimationFrame === "undefined") {
  vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrameMock);
}
