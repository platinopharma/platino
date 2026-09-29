"use client";
import { useEffect, useState, useCallback, useRef } from "react";

/**
 * Custom hook for managing OTP timers and cooldowns.
 */
export function useCountdown(initialSeconds: number) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((newSeconds = initialSeconds) => {
    setIsRunning(false);
    setTimeLeft(newSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning) return;
    if (timeLeft <= 0) {
      setIsRunning(false);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  return { timeLeft, isRunning, isExpired: timeLeft === 0, start, pause, reset, setTimeLeft };
}
