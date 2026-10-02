"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption<T = string | number | boolean> {
  label: string;
  value: T;
}

interface OpenSelectProps<T = string | number | boolean> {
  name: string;
  label: string;
  value: T | "";
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  onSearchChange?: (search: string) => void;
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  placeholder?: string;
  showLabel?: boolean;
}

function OpenSelect<T = string | number | boolean>({
  name,
  label,
  value,
  options,
  onChange,
  onSearchChange,
  required = false,
  error = false,
  disabled = false,
  helperText,
  placeholder = "Select option",
  showLabel = true,
}: OpenSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hasValue = value !== undefined && value !== null && value !== "";
  const floating = focused || open || hasValue;
  

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
        setFocused(false);
        setSearch("");
        if (onSearchChange) onSearchChange("");
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [onSearchChange]);

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);

    return () => clearTimeout(timer);
  }, [open]);

  const filteredOptions = useMemo(() => {
    if (onSearchChange) return options;

    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const selectedOption = options.find((option) => option.value === value);

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value;
  setSearch(val);
  if (onSearchChange) { onSearchChange(val); }
};

useEffect(() => {
  const handleOutside = (event: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
      setOpen(false);
      setFocused(false);
      setSearch("");
    }
  };

  document.addEventListener("mousedown", handleOutside);
  return () => { document.removeEventListener("mousedown", handleOutside); };
}, []);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        type="button"
        disabled={disabled}
        className={`h-14 w-full rounded-xl border px-4 text-left text-sm outline-none transition-all duration-200 
          ${disabled
            ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
            : error
              ? "bg-white border-red-500"
              : "bg-white border-gray-300 hover:border-gray-400 focus:border-primary"
          }`}
        onClick={() => {
          setOpen((prev) => !prev);
          setFocused(true);
        }}
      >
        <span className="flex h-full items-center justify-between">
          <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            size={18}
            className={`transition ${open ? "rotate-180" : ""} ${disabled ? "text-gray-300" : ""}`}
          />
        </span>
      </button>

      {showLabel && (
        <label
          className={`pointer-events-none absolute left-3 z-10 px-1 transition-all duration-200 
            ${floating ? "-top-2 text-xs" : "top-1/2 -translate-y-1/2 text-sm"} 
            ${disabled
              ? "bg-transparent text-gray-400"
              : floating
                ? "bg-white text-primary"
                : "bg-white text-gray-500"
            } 
            ${error ? "text-red-500" : ""}`}
        >
          {label}
          {required && (<span className="ml-0.5 text-red-500">*</span>)}
        </label>
      )}

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-full z-[99999] mt-2 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
          <input
            ref={searchInputRef}
            type="text"
            placeholder={`Search ${label}`}
            value={search}
            onChange={handleInputChange}
            className="mb-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-primary"
          />

          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;

                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                      setFocused(false);
                      setSearch("");
                      if (onSearchChange) onSearchChange("");
                    }}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition hover:bg-gray-100"
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check size={16} className="text-primary" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">No matching {label}</div>
            )}
          </div>
        </div>
      )}

      {helperText && (
        <p className={`mt-1 px-1 text-xs ${error ? "text-red-500" : "text-gray-500"}`}>
          {helperText}
        </p>
      )}
    </div>
  );
}

export default OpenSelect;