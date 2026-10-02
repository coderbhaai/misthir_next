"use client";

import { Check, ChevronDown, X } from "lucide-react";
import React, { useMemo, useState, useEffect, useRef } from "react";

type Option = {
  _id: string;
  name: string;
};

interface MultiSelectDropdownProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean; // Added disabled prop
}

interface DropdownItemProps {
  option: Option;
  checked: boolean;
  onSelect: (id: string) => void;
}

const DropdownItem = ({option, checked, onSelect}: DropdownItemProps) => {
  return (
    <button type="button" onClick={() => onSelect(option._id)} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition hover:bg-gray-100">
      <span>{option.name}</span>
      <div className={`flex h-5 w-5 items-center justify-center rounded border ${checked ? "border-primary bg-primary text-white" : "border-gray-300"}`}>
        {checked && <Check size={14} />}
      </div>
    </button>
  );
};

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({label, options, selected = [], onChange, placeholder = "Select options", disabled = false}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { 
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) { setOpen(false); } 
    }; 
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick); }, []
  );

  const validSelected = useMemo(() => {
    return selected.filter((id) =>
      options.some((opt) => opt._id === id)
    );
  }, [selected, options]);

  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt?.name?.toLowerCase().includes(search?.toLowerCase())
    );
  }, [options, search]);

  const sortedOptions = useMemo(() => {
    const selectedSet = new Set(validSelected);

    return [...filteredOptions].sort((a, b) => {
      const aSelected = selectedSet.has(a._id);
      const bSelected = selectedSet.has(b._id);

      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;

      return a.name.localeCompare(b.name);
    });
  }, [filteredOptions, validSelected]);

  const toggleOption = (id: string) => {
    if (disabled) return;
    const exists = validSelected.includes(id);

    if (exists) {
      onChange(validSelected.filter((item) => item !== id));
    } else {
      onChange([...validSelected, id]);
    }
  };

  const removeOption = (id: string) => {
    if (disabled) return;
    onChange(validSelected.filter((item) => item !== id));
  };

  return (
    <div 
      ref={containerRef} 
      /* 
        CRITICAL CHANGE HERE: 
        We use inline styles for z-index to explicitly override any utility class conflicts.
        When open, the entire component lifts to z-index 100, stepping above any lower form borders.
      */
      className="relative w-full"
      style={{ zIndex: open && !disabled ? 100 : 1 }}
    >
      <div className="relative">
        <div 
          onClick={() => !disabled && setOpen((prev) => !prev)} 
          className={`peer flex min-h-[56px] w-full items-center justify-between rounded-xl border px-4 py-2 text-left shadow-sm transition-all duration-200 
            ${disabled 
              ? "bg-gray-50 border-gray-200 cursor-not-allowed text-gray-400" 
              : "bg-white cursor-pointer " + (open || validSelected.length > 0 ? "border-primary" : "border-gray-300 hover:border-gray-400")
            }`}
        >
          <div className="flex flex-wrap gap-2">
            {validSelected.length > 0 ? validSelected.map((id) => { 
              const found = options.find((opt) => opt._id === id); 
              if (!found) return null; 

              return (
                <div key={id} className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${disabled ? "bg-gray-200 text-gray-500" : "bg-gray-100"}`}>
                  <span>{found.name}</span>
                  {!disabled && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeOption(id); }} className="text-gray-500 hover:text-red-500">
                      <X size={12}/>
                    </button>
                  )}
                </div>
              ); 
            }) : <span className="text-gray-400 text-sm">{placeholder}</span>}
          </div>
          <ChevronDown size={18} className={`ml-2 transition shrink-0 ${open && !disabled ? "rotate-180" : ""} ${disabled ? "text-gray-300" : ""}`}/>
        </div>

        <label className={`pointer-events-none absolute left-3 z-10 bg-white px-1 transition-all duration-200 
          ${disabled ? "bg-transparent text-gray-400" : ""}
          ${open || validSelected.length > 0 ? "-top-2 text-xs text-primary" : "top-1/2 -translate-y-1/2 text-sm text-gray-500"}`}
        >
          {label}
        </label>
      </div>

      {open && !disabled && (
        /* The absolute inner options popover menu panel */
        <div 
          className="absolute left-0 right-0 mt-2 rounded-xl border border-gray-200 bg-white p-2 shadow-xl" 
          style={{ zIndex: 110 }}
        >
          <input
            type="text" 
            placeholder="Search..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="mb-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary" 
          />

          <div className="max-h-64 overflow-y-auto space-y-1.5">
            {sortedOptions.length > 0 ? (
              sortedOptions.map((option) => (
                <DropdownItem key={option._id} option={option} checked={validSelected.includes(option._id)} onSelect={toggleOption}/>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;