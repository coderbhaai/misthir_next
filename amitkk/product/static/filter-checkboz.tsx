import { Checkbox } from "@amitkk/components/basic/checkbox";
import { Types } from "mongoose";
import Link from "next/link";

export interface singleFilterItem {
  _id: string | Types.ObjectId;
  name: string;
  url?: string;
}

interface FilterCheckProps {
  items: singleFilterItem[];
  selected: string[];
  onChange: (newSelected: string[]) => void;
  withLinks?: boolean;
  basePath?: string;
}

export function FilterCheck({ items, selected, onChange, withLinks = false, basePath = "" }: FilterCheckProps) {
  const handleToggle = (id: string) => {
    const newSelected = selected.includes(id as string) ? selected.filter((s) => s !== id) : [...selected, id];
    onChange(newSelected);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const itemId = item._id.toString();
        const isChecked = selected.includes(itemId);

        return (
          <div key={itemId} className="inline-flex items-center gap-2 px-3 py-1 mb-1 mr-1 border border-border rounded-md bg-card hover:bg-muted/50 transition-colors">
            <Checkbox id={`filter-${itemId}`} checked={isChecked} onCheckedChange={() => handleToggle(itemId)}/>
            {withLinks && item.url ? (
              <Link href={`${basePath}/${item.url}`} className="cursor-pointer text-sm font-medium hover:underline">{item.name}</Link>
            ) : (
              <label htmlFor={`filter-${itemId}`} className="cursor-pointer text-sm font-medium select-none">{item.name}</label>
            )}
          </div>
        );
      })}
    </div>
  );
}