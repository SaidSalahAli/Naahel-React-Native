/**
 * Utility Hooks
 * Custom React hooks for common functionality
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

/**
 * useLocalStorage Hook
 * Similar to browser localStorage but for React Native with AsyncStorage
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Read from storage on mount
  useEffect(() => {
    const readValue = async () => {
      try {
        const item = await AsyncStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error reading ${key} from storage:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    readValue();
  }, [key]);

  // Write to storage whenever value changes
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      AsyncStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * useAsync Hook
 * Handle async operations with loading, error, and data states
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true,
) {
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Execute async function
  const execute = async () => {
    setStatus("pending");
    setValue(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setValue(response);
      setStatus("success");
      return response;
    } catch (error) {
      setError(error instanceof Error ? error : new Error(String(error)));
      setStatus("error");
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]);

  return { execute, status, value, error };
}

/**
 * usePrevious Hook
 * Get the previous value of a prop or state
 */
export function usePrevious<T>(value: T): T | undefined {
  const [prev, setPrev] = useState<T | undefined>(undefined);

  useEffect(() => {
    setPrev(value);
  }, [value]);

  return prev;
}

/**
 * useDebounce Hook
 * Debounce a value with a delay
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useThrottle Hook
 * Throttle a function call
 */
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300,
): T {
  const [lastRan, setLastRan] = useState(Date.now());

  return ((...args) => {
    if (Date.now() - lastRan >= wait) {
      func(...args);
      setLastRan(Date.now());
    }
  }) as T;
}

/**
 * useIsMounted Hook
 * Check if component is mounted
 */
export function useIsMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}
