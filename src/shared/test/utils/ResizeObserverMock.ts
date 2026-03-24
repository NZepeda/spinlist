/**
 * Minimal ResizeObserver polyfill for component tests running in jsdom.
 */
export class ResizeObserverMock {
  /**
   * Starts observing an element.
   */
  observe(): void {}

  /**
   * Stops observing an element.
   */
  unobserve(): void {}

  /**
   * Disconnects all active observations.
   */
  disconnect(): void {}
}
