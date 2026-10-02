"use client";

import { getFilterFieldMeta } from "@amitkk/basic/utils/filters";
import { usePersistentFilters } from "hooks/usePersistentFilters";
import { usePathname } from "next/navigation";
import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";  

export type FilterMap = {
  [key: string]: any;
};

type Pagination = {
  page: number;
  limit: number;
};

type RouteFilterState = {
  [pathname: string]: {
    filters: FilterMap;
    pagination: Pagination;
  };
};

let currentFilters: FilterMap = {};
export const getCurrentFilters = () => currentFilters;

let currentPagination = { page: 0, limit: 25 };
export const getCurrentPagination = () => currentPagination;

type FilterContextType = {
  filters: FilterMap;
  setFilter: (filterNameOrKey: string, value: any, props?: Record<string, any>) => void;
  clearFilters: () => void;
  page: number;
  rowsPerPage: number;
  setPage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
  hydrated: boolean;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);
const STORAGE_KEY = "app_filters_by_route_v3";

export const FilterProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname() || "default";
  const { state, setState, hydrated } = usePersistentFilters<RouteFilterState>(STORAGE_KEY, {});

  // Get current page filters
  const currentPageState = state[pathname] || {
    filters: {},
    pagination: { page: 0, limit: 25 },
  };

  const activeFilters = currentPageState.filters || {};
  const page = currentPageState.pagination?.page ?? 0;
  const rowsPerPage = currentPageState.pagination?.limit ?? 25;

  // Keep global sync variables updated for `apiRequest`
  useEffect(() => {
    currentFilters = activeFilters;
    currentPagination = { page, limit: rowsPerPage };
  }, [activeFilters, page, rowsPerPage]);

  // Unified setFilter that uses `getFilterFieldMeta`
  const setFilter = useCallback(
    (filterNameOrKey: string, value: any, props?: Record<string, any>) => {
      // Resolve the actual DB field using single source of truth
      const { field } = getFilterFieldMeta({ name: filterNameOrKey, props });

      setState((prev) => {
        const pageState = prev[pathname] || { filters: {}, pagination: { page: 0, limit: 25 } };
        const updatedFilters = { ...pageState.filters };

        if (value === "" || value === undefined || value === null) {
          delete updatedFilters[field];
        } else {
          updatedFilters[field] = value;
        }

        const updated = {
          ...prev,
          [pathname]: {
            ...pageState,
            filters: updatedFilters,
            pagination: { ...pageState.pagination, page: 0 }, // Reset to page 0 on filter change
          },
        };

        currentFilters = updated[pathname].filters;
        currentPagination = updated[pathname].pagination;
        return updated;
      });
    },
    [pathname, setState]
  );

  const clearFilters = useCallback(() => {
    setState((prev) => {
      const updated = {
        ...prev,
        [pathname]: {
          filters: {},
          pagination: { page: 0, limit: rowsPerPage },
        },
      };
      currentFilters = {};
      currentPagination = { page: 0, limit: rowsPerPage };
      return updated;
    });
  }, [pathname, rowsPerPage, setState]);

  const setPage = useCallback(
    (newPage: number) => {
      setState((prev) => {
        const pageState = prev[pathname] || { filters: {}, pagination: { page: 0, limit: 25 } };
        const updated = {
          ...prev,
          [pathname]: {
            ...pageState,
            pagination: { ...pageState.pagination, page: newPage },
          },
        };
        currentPagination = updated[pathname].pagination;
        return updated;
      });
    },
    [pathname, setState]
  );

  const setRowsPerPage = useCallback(
    (rows: number) => {
      setState((prev) => {
        const pageState = prev[pathname] || { filters: {}, pagination: { page: 0, limit: 25 } };
        const updated = {
          ...prev,
          [pathname]: {
            filters: { ...pageState.filters },
            pagination: { page: 0, limit: rows },
          },
        };
        currentFilters = updated[pathname].filters;
        currentPagination = updated[pathname].pagination;
        return updated;
      });
    },
    [pathname, setState]
  );

  const onPageChange = useCallback((_: unknown, newPage: number) => setPage(newPage), [setPage]);

  const onRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
    },
    [setRowsPerPage]
  );

  const value = useMemo(
    () => ({
      filters: activeFilters,
      setFilter,
      clearFilters,
      page,
      rowsPerPage,
      setPage,
      setRowsPerPage,
      onPageChange,
      onRowsPerPageChange,
      hydrated,
    }),
    [activeFilters, setFilter, clearFilters, page, rowsPerPage, setPage, setRowsPerPage, onPageChange, onRowsPerPageChange, hydrated]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};

export const useFilterContext = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (!context) {
    // Graceful fallback for layout/hydration edge cases matching other working projects
    return {
      filters: {},
      setFilter: () => {},
      clearFilters: () => {},
      page: 0,
      rowsPerPage: 25,
      setPage: () => {},
      setRowsPerPage: () => {},
      onPageChange: () => {},
      onRowsPerPageChange: () => {},
      hydrated: false,
    };
  }
  return context;
};