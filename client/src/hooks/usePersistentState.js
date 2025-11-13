import { useEffect, useRef, useState } from 'react';

const isBrowser = typeof window !== 'undefined';

const deserialize = (value, fallback) => {
  if (value === null || value === undefined) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const serialize = (value) => {
  try {
    return JSON.stringify(value);
  } catch {
    return JSON.stringify(null);
  }
};

/**
 * Persist a piece of state in localStorage and hydrate it on mount.
 * Works like useState but synchronises with a given storage key.
 */
const usePersistentState = (key, defaultValue) => {
  const initialisedRef = useRef(false);
  const [state, setState] = useState(() => {
    if (!isBrowser) return defaultValue;
    const stored = window.localStorage.getItem(key);
    return stored !== null ? deserialize(stored, defaultValue) : defaultValue;
  });

  useEffect(() => {
    if (!isBrowser) return;
    if (!initialisedRef.current) {
      initialisedRef.current = true;
    }
    try {
      if (state === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, serialize(state));
      }
    } catch (err) {
      console.warn(`Failed to persist key "${key}"`, err);
    }
  }, [key, state]);

  return [state, setState];
};

export default usePersistentState;

