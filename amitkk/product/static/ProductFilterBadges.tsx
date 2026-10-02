import React from "react";

export interface ProductFilterData {
  status?: boolean;
  total_inventory?: number;
  in_stock?: boolean;
  purchased_qty?: number;
}

interface ProductFilterBadgesProps {
  filter?: ProductFilterData | null;
}

export const ProductFilterBadges: React.FC<ProductFilterBadgesProps> = ({ filter }) => {
  if (!filter) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
        <span className={`px-2 py-0.5 rounded-full font-medium ${ filter.status ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"}`}>
            {filter.status ? "Active" : "Not Active"}
        </span>

        <span className={`px-2 py-0.5 rounded-full font-medium ${ filter.in_stock ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"}`}>
            {filter.in_stock ? "In Stock" : "Out of Stock"}
        </span>

        <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Inventory: <strong className="text-foreground">{filter.total_inventory ?? 0}</strong></span>
        <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Purchased: <strong className="text-foreground">{filter.purchased_qty ?? 0}</strong></span>
    </div>
  );
};