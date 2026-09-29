import { useEffect, useState } from "react";

/**
 * Simulates an async fetch so polished skeleton states render briefly on
 * mount (and again whenever `deps` change), making the mock-data app feel
 * consistently fast and intentional.
 */
export function useSimulatedLoading(ms = 600, deps: unknown[] = []) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return loading;
}
