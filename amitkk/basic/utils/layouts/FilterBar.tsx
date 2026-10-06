"use client";

import { Plus } from "lucide-react";
import { FILTER_COMPONENTS } from "../filters"; // Update path relative to your directory
import { useFilterContext } from "contexts/FilterContext";
import { Button } from "@amitkk/components/button/button";
import { cn } from "@amitkk/lib/utils";

export interface FilterConfig {
  name: keyof typeof FILTER_COMPONENTS;
  grid?: string;
  props?: Record<string, any>;
}

interface FilterBarProps {
  filters?: readonly FilterConfig[];
  showClearAll?: boolean;
  className?: string;
}

export function FilterBar({ filters = [], showClearAll = true, className }: FilterBarProps) {
  const { clearFilters } = useFilterContext();

  if (!filters.length) return null;

  return (
    <div className={cn("my-3 grid grid-cols-12 gap-4 items-center", className)}>
      <div className={cn(showClearAll ? "col-span-10" : "col-span-12")}>
        <div className="grid grid-cols-12 gap-4">
          {filters.map((filter) => {
            const { name, grid, props } = filter;
            const FilterComponent = FILTER_COMPONENTS[name];
            if (!FilterComponent) return null;

            return (
              <div key={String(name)} className={cn(grid || "col-span-3")}>
                <FilterComponent {...(props || {})} />
              </div>
            );
          })}
        </div>
      </div>

      {showClearAll && (
        <div className="col-span-2 flex items-center justify-end">
          <Button
            variant="outline"
            onClick={clearFilters}
            className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 h-14 w-full"
          >
            <Plus className="mr-2 h-4 w-4" /> Clear All
          </Button>
        </div>
      )}
    </div>
  );
}