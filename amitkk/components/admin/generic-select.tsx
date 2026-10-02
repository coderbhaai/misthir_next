"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";
import { OptionProps } from "@amitkk/basic/types/generic";

type FlexibleOption = 
  | OptionProps 
  | { _id?: string; name?: string; value?: string; label?: string };

type GenericSelectProps = {
  label: string;
  name: string;
  value: string | string[];
  options: FlexibleOption[];
  multiple?: boolean;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  onChange: (value: string | string[]) => void;
  onSearch?: (value: string) => void;
};

const GenericSelect: React.FC<GenericSelectProps> = ({
  label,
  value,
  options,
  multiple = false,
  required = false,
  readOnly = false,
  onChange,
  onSearch,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedOptions = useMemo(() => {
    if (!options || !Array.isArray(options)) return [];
    return options.map((opt) => {
      const item = opt as Record<string, any>;
      const id = item._id ?? item.value ?? "";
      const text = item.name ?? item.label ?? "";
      return { id: String(id), text: String(text) };
    });
  }, [options]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => { document.removeEventListener("mousedown", handleOutsideClick); };
  }, []);

  const filteredOptions = useMemo(() => {
    return normalizedOptions.filter((o) => o.text.toLowerCase().includes(search.toLowerCase()));
  }, [normalizedOptions, search]);

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  const toggleValue = (id: string) => {
    if (!multiple) {
      onChange(id);
      setOpen(false);
      return;
    }

    const exists = selectedValues.includes(id);
    if (exists) {
      onChange(selectedValues.filter((item) => item !== id));
    } else {
      onChange([...selectedValues, id]);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <button 
          type="button" 
          disabled={readOnly || disabled} 
          onClick={() => setOpen((prev) => !prev)} 
          className={`peer flex h-14 w-full items-center justify-between rounded-xl border px-4 text-sm transition-all duration-200 
            ${disabled ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-white"}
            ${open || selectedValues.length > 0 ? "border-primary" : "border-gray-300 hover:border-gray-400"}`}
        >
          <span className={`${selectedValues.length > 0 ? "text-gray-900" : "text-gray-400"} truncate text-left`}>
            {selectedValues.length > 0 
              ? normalizedOptions
                  .filter((o) => selectedValues.includes(o.id))
                  .map((o) => o.text)
                  .join(", ") 
              : ""
            }
          </span>
          <ChevronDown size={18} className={`transition ${open ? "rotate-180" : ""}`}/>
        </button>
        
        <label className={`pointer-events-none absolute left-3 z-10 bg-white px-1 transition-all duration-200 
          ${open || selectedValues.length > 0 ? "-top-2 text-xs text-primary" : "top-1/2 -translate-y-1/2 text-sm text-gray-500"}`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>

      {open && !disabled && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
          <input 
            type="text" 
            placeholder={`Search ${label}`} 
            value={search} 
            className="mb-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none"
            onChange={(e) => {
              const val = e.target.value;
              setSearch(val);
              onSearch?.(val);
            }}
          />

          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const checked = selectedValues.includes(option.id);

                return (
                  <button 
                    key={option.id} 
                    type="button" 
                    onClick={() => toggleValue(option.id)} 
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition hover:bg-gray-100"
                  >
                    <span>{option.text}</span>
                    {checked && ( <Check size={16} className="text-primary"/> )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">No matching {label}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenericSelect;