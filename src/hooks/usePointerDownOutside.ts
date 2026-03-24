"use client";

import { useEffect, useRef, type RefObject } from "react";

interface UsePointerDownOutsideOptions {
  enabled: boolean;
  onPointerDownOutside: (event: PointerEvent) => void;
}

/**
 * Runs a callback when a captured pointer interaction starts outside the provided element.
 *
 * @param args - The element ref, enabled state, and outside-pointer callback.
 */
export function usePointerDownOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { enabled, onPointerDownOutside }: UsePointerDownOutsideOptions,
): void {
  const callbackRef = useRef(onPointerDownOutside);

  /**
   * Keeps the latest callback available to the document listener without resubscribing.
   */
  useEffect(() => {
    callbackRef.current = onPointerDownOutside;
  }, [onPointerDownOutside]);

  /**
   * Subscribes to captured pointer interactions only while the owner surface is active.
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    function handlePointerDown(event: PointerEvent): void {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (ref.current?.contains(target)) {
        return;
      }

      callbackRef.current(event);
    }

    document.addEventListener("pointerdown", handlePointerDown, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [enabled, ref]);
}
