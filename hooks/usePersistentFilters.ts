"use client";

import { useEffect, useState } from "react";

export function usePersistentFilters<T>(
  storageKey: string,
  initialState: T
) {
  const [state, setState] = useState<T>(initialState);
  const [hydrated, setHydrated] = useState(false);

  // LOAD
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);

      if (raw) {
        setState(JSON.parse(raw));
      }
    } catch (err) {
      console.error("Load filter error:", err);
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  // SAVE
  useEffect(() => {
    if (!hydrated) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (err) {
      console.error("Save filter error:", err);
    }
  }, [state, storageKey, hydrated]);

  return {
    state,
    setState,
    hydrated,
  };
}