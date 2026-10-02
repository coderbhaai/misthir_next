import { useMemo } from "react";
import { TextField } from "@amitkk/components/basic/TextField";
import { useAuth } from "contexts/AuthContext";

interface Props {
  selected: Record<string, string[]>;
  onChange: (payload: {
    key: string;
    values: string[];
    lastSelected?: string;
    parentPath?: string[];
  }) => void;
  search: string;
  onSearchChange: (val: string) => void;
}

export function HorizontalSidebarShop({ selected, onChange, search, onSearchChange }: Props) {
  const { isLoggedIn } = useAuth();
  const isChecked = selected.in_stock?.includes("true") ?? false;

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    onChange({
      key: "in_stock",
      values: checked ? ["true"] : [],
      lastSelected: "true",
    });
  };

  return (
    <div className="col-span-12 web">
      { isLoggedIn && (
        <div className="shadow-lg rounded-xl p-3 md:p-5 overflow-y-auto hide-scrollbar flex items-center justify-end" style={{ background: "#dfdfdf" }}>
          <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-800">
            <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} className="w-4 h-4 rounded accent-primary cursor-pointer"/>
            <span>In Stock</span>
          </label>
        </div>
      )}
    </div>
  );
}