'use client';
import { useState, useEffect } from 'react';

/**
 * Enterprise Client Hydration Gate (useHydrated)
 * Eliminates React SSR hydration mismatches when reading from localStorage-persisted Zustand state stores during initial boot.
 */
export function useHydrated(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}
