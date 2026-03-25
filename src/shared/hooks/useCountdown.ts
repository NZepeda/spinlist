"use client";

import { useEffect, useState } from "react";

interface UseCountdownResult {
  reset: (nextSeconds?: number) => void;
  secondsRemaining: number;
  start: (nextSeconds?: number) => void;
}

/**
 * Manages a one-second countdown that can be started or reset by the caller.
 */
export function useCountdown(initialSeconds = 0): UseCountdownResult {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);

  /**
   * Starts the countdown from the provided value or falls back to the initial duration.
   */
  function start(nextSeconds = initialSeconds): void {
    setSecondsRemaining(nextSeconds);
  }

  /**
   * Resets the countdown to the provided value or the initial duration.
   */
  function reset(nextSeconds = initialSeconds): void {
    setSecondsRemaining(nextSeconds);
  }

  /**
   * Ticks the countdown down once per second until it reaches zero.
   */
  useEffect(() => {
    if (secondsRemaining <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSecondsRemaining((currentSecondsRemaining) =>
        Math.max(currentSecondsRemaining - 1, 0),
      );
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [secondsRemaining]);

  return {
    reset,
    secondsRemaining,
    start,
  };
}
