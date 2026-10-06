"use client";

import { clo } from "@amitkk/basic/utils/my-utils/admin-utils";
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
    } catch (err) { clo(err); } finally { setHydrated(true); }
  }, [storageKey]);

  // SAVE
  useEffect(() => {
    if (!hydrated) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (err) { clo(err); }
  }, [state, storageKey, hydrated]);

  return {
    state,
    setState,
    hydrated,
  };
}