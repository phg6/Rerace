"use client";

import { useCallback, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** Client-only snapshot value; renders `serverValue` during SSR + hydration. */
export function useClientValue<T>(getSnapshot: () => T, serverValue: T): T {
  return useSyncExternalStore(noopSubscribe, getSnapshot, () => serverValue);
}

/**
 * Wall-clock time in ms (second precision), `null` until hydrated.
 * Re-renders every `intervalMs` when > 0.
 */
export function useNow(intervalMs = 0): number | null {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (intervalMs <= 0) return () => {};
      const id = setInterval(onChange, intervalMs);
      return () => clearInterval(id);
    },
    [intervalMs]
  );
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / 1000) * 1000,
    () => null
  );
}
