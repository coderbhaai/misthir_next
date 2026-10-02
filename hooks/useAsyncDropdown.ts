"use client";

import * as React from "react";
import { apiRequest, clo } from "@amitkk/basic/utils/my-utils/admin-utils";

type Params<T extends OptionItem> = {
  value?: string | string[];
  endpoint: string;
  listFunction: string;
  singleFunction: string;
  search?: string;
  limit?: number;
  filters?: Record<string, any>;
};

export interface OptionItem {
  _id: string;
  name?: string;
}

function filterValidIds(
  ids?: string[]
): string[] {
  return (ids || []).filter(Boolean);
}

function mergeOptions<T extends OptionItem>(
  prev: T[],
  next: T[]
): T[] {
  const map = new Map<string, T>();

  prev.forEach((item) => {
    map.set(item._id, item);
  });

  next.forEach((item) => {
    map.set(item._id, item);
  });

  return Array.from(map.values());
}

export function useAsyncDropdown<T extends OptionItem>({
  value,
  endpoint,
  listFunction,
  singleFunction,
  limit = 20,
  filters = {},
}: Params<T>) {

  const [options, setOptions] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const ids = React.useMemo(() => {
    if (!value) return [];

    if (Array.isArray(value)) {
      return filterValidIds(value);
    }
    return value ? [value] : [];
  }, [value]);
  
  const fetchOptions = async (search = "") => {
    try {
      setLoading(true);

      const payload: any = {
        function: listFunction,
        search,
        limit,
      };

      Object.entries(filters).forEach(
        ([key, val]) => {
          if (!val) return;

          if (Array.isArray(val)) {
            const filtered = filterValidIds(val);
            if (filtered.length) {
              payload[key] = JSON.stringify(filtered);
            }
            return;
          }

          payload[key] = JSON.stringify([val]);
        }
      );

      const res = await apiRequest("POST", endpoint, payload);
      const fetched: T[] = res?.data || [];
      setOptions(fetched);
    } catch (err) { clo(err); } finally { setLoading(false); }
  };

  React.useEffect(() => { fetchOptions(""); }, [JSON.stringify(filters)]);
  
  React.useEffect(() => {
    const t = setTimeout(() => {
      fetchOptions(inputValue);
    }, 400);
    return () => clearTimeout(t);
  }, [inputValue]);
  
  React.useEffect(() => {
    const fetchMissing = async () => {
      try {
        const missingIds = ids.filter( (id) => !options.some( (o) => o._id === id ) );
        if (!missingIds.length) return;

        const responses = await Promise.all( missingIds.map((id) => apiRequest("GET", `${endpoint}?function=${singleFunction}&id=${id}`)) );

        const fetched = responses.map((r) => r?.data).filter(Boolean);
        setOptions(fetched);
      } catch (err) { clo(err); }
    };

    fetchMissing();
  }, [JSON.stringify(ids)]);

  return {
    options,
    loading,
    inputValue,
    setInputValue,
  };
}