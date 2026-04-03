"use client";

import { useSyncExternalStore, ReactNode, useEffect, useState } from "react";

interface HydrationProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * HydrationProvider - Prevents hydration mismatch errors
 * 
 * This component uses useSyncExternalStore for proper hydration detection.
 * This is the recommended React 18+ pattern for client-only rendering.
 * 
 * How it works:
 * 1. On server: useSyncExternalStore returns false (serverSnapshot)
 * 2. On client: useSyncExternalStore returns true (getSnapshot)
 * 3. This ensures no hydration mismatch between server and client
 */
export function HydrationProvider({ 
  children, 
  fallback 
}: HydrationProviderProps) {
  // useSyncExternalStore is the recommended way to detect client-side rendering
  const isMounted = useSyncExternalStore(
    () => () => {}, // subscribe function (empty - no external store)
    () => true,     // getSnapshot (client): return true
    () => false     // getServerSnapshot (server): return false
  );

  // During SSR and initial hydration, show fallback or nothing
  if (!isMounted) {
    return fallback ? <>{fallback}</> : null;
  }

  // After hydration, show the actual content
  return <>{children}</>;
}

/**
 * useMounted - Hook to check if component is mounted
 * 
 * Use this hook in components that need to know if they're
 * running on the client after hydration.
 */
export function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

/**
 * useClientOnly - Hook for client-only side effects
 * 
 * Use this hook to run code only on the client.
 * The callback runs once after hydration is complete.
 */
export function useClientOnly(callback: () => void | (() => void)) {
  const isMounted = useMounted();
  
  useEffect(() => {
    if (isMounted) {
      return callback();
    }
  }, [isMounted]);
}

/**
 * useLocalStorage - Safe localStorage hook
 * 
 * A localStorage hook that works with SSR.
 * Returns initialValue on server, actual value on client.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Use lazy initialization to read from localStorage only on client
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

export default HydrationProvider;
