"use client";

import { ReactNode, useState } from "react";
import { Plus, LayoutGrid, List } from "lucide-react";
import { Button } from '@amitkk/components/button/button';
import { FILTER_COMPONENTS } from "../filters";
import { useFilterContext } from "contexts/FilterContext";
import { cn } from "@amitkk/lib/utils";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@amitkk/components/basic/table";

interface FilterConfig {
  name: keyof typeof FILTER_COMPONENTS;
  grid?: string;
  props?: Record<string, any>;
}

type AdminTableLayoutProps<T> = {
  admin: any;
  title: ReactNode;
  head?: { id: string; label: string }[];
  // Change rows to accept a function that receives the active viewMode
  rows: (viewMode: "table" | "grid") => ReactNode;
  addButtonLabel?: string;
  filters?: readonly FilterConfig[];
  actionsAboveFilters?: ReactNode;
  children?: ReactNode;
  emptyMessage?: ReactNode;
  showPagination?: boolean;
  tableContainerClassName?: string;
  viewMode?: "table" | "grid";
  showViewModeSwitch?: boolean;
  gridClassName?: string;
};

export function AdminTableLayout<T>({
  admin,
  title,
  head = [],
  rows,
  addButtonLabel,
  filters = [],
  actionsAboveFilters,
  children,
  emptyMessage,
  showPagination = true,
  tableContainerClassName,
  viewMode = "table",
  showViewModeSwitch = false,
  gridClassName = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
}: AdminTableLayoutProps<T>) {
  const { onPageChange, onRowsPerPageChange, clearFilters } = useFilterContext();
  const { data, pagination, handleAddNew } = admin;  
  const [currentViewMode, setCurrentViewMode] = useState<"table" | "grid">(viewMode);

  return (
    <div className="relative pb-24">
      <div className="px-1">
        <div className="flex flex-wrap items-center justify-between gap-4 overflow-hidden">
          <div className="flex items-center justify-between w-full gap-3">
            <h1 className="text-xl font-bold">{title}</h1>

            <div className="flex flex-wrap items-end gap-4">
              {handleAddNew && addButtonLabel && (
                <Button onClick={handleAddNew} className="shrink-0">
                  <Plus className="mr-2 h-4 w-4" />{addButtonLabel}</Button>
              )}
              {actionsAboveFilters && <div className="flex justify-end gap-2">{actionsAboveFilters}</div>}

              {showViewModeSwitch && (
                <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                  <button type="button" onClick={() => setCurrentViewMode("table")} title="Table View"
                    className={cn( "p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1", currentViewMode === "table" ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:text-gray-900 hover:bg-gray-200")}>
                    <List className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setCurrentViewMode("grid")} title="Grid View" className={cn( "p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1", currentViewMode === "grid" ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:text-gray-900 hover:bg-gray-200" )}>
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="my-3 row">
          <div className="col-span-10">
            {filters.length > 0 && (
              <div className="row">
                {filters.map((filter) => {
                  const { name, grid, props } = filter;
                  const FilterComponent = FILTER_COMPONENTS[name];
                  if (!FilterComponent) return null;

                  return (
                    <div key={String(name)} className={cn(grid || "col-span-3")}>
                      <FilterComponent {...(props || {})} name={name} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="col-span-2 flex items-center justify-end">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 h-14 w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>
      </div>

      {/* Render Grid or Table dynamically using the callback */}
      {currentViewMode === "grid" ? (
        <div className={cn("row my-4", gridClassName)}>
          {rows(currentViewMode)}
          {!data?.length && (
            <div className="col-span-12 py-16 text-center text-sm text-muted-foreground bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              {emptyMessage || "No data found"}
            </div>
          )}
        </div>
      ) : (
        <div className={cn("relative w-full overflow-auto rounded-2xl border border-gray-200 bg-white shadow-sm", tableContainerClassName)}>
          <Table>
            <TableHeader>
              <TableRow>
                {head.map((item) => (
                  <TableHead key={item.id}>{item.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows(currentViewMode)}
              {!data?.length &&
                (emptyMessage || (
                  <TableRow>
                    <td colSpan={head.length || 1} className="h-24 text-center text-sm text-muted-foreground">
                      No data found
                    </td>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}

      {showPagination && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="mx-auto flex max-w-full flex-col items-center justify-between gap-4 px-4 py-2 sm:flex-row">
            <div>
              {handleAddNew && addButtonLabel && (
                <Button onClick={handleAddNew} className="shrink-0">
                  <Plus className="mr-2 h-4 w-4" />
                  {addButtonLabel}
                </Button>
              )}
            </div>

            <div className="flex items-center justify-center gap-2">
              <select value={pagination?.limit ?? 25} onChange={onRowsPerPageChange} className="h-9 rounded-md border px-3 text-sm">
                {[5, 10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>

              <div className="text-sm text-muted-foreground">Total: {pagination?.total ?? data?.length ?? 0}</div>

              <Button
                variant="outline"
                disabled={(pagination?.page ?? 0) <= 0}
                onClick={(e) => onPageChange(e, (pagination?.page ?? 0) - 1)}
                style={{ padding: 0 }}
              >
                <img src="/images/icons/static/arrow-left.svg" className="w-5 h-5 cursor-pointer" alt="Prev" />
              </Button>

              <div className="text-center text-sm">Page {(pagination?.page ?? 0) + 1}</div>

              <Button
                variant="outline"
                disabled={((pagination?.page ?? 0) + 1) * (pagination?.limit ?? 25) >= (pagination?.total ?? 0)}
                onClick={(e) => onPageChange(e, (pagination?.page ?? 0) + 1)}
                style={{ padding: 0 }}
              >
                <img src="/images/icons/static/arrow-right.svg" className="w-5 h-5 cursor-pointer" alt="Next" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}