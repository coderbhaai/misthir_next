"use client";

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { OptionItem, useAsyncDropdown } from "hooks/useAsyncDropdown";
import { cn } from "@amitkk/lib/utils"; 

type Props<T extends OptionItem> = {
  value?: string[];
  onChange: (value: string[]) => void;
  required?: boolean;
  disabled?: boolean;
  label: string;
  endpoint: string;
  listFunction: string;
  singleFunction: string;
  filters?: Record<string, any>;
  getOptionLabel: (option: T) => string;
  fixed_options?: T[];
};

export default function MultiAsyncDropdown<T extends OptionItem>({
  value = [],
  onChange,
  required,
  disabled,
  label,
  endpoint,
  listFunction,
  singleFunction,
  filters,
  getOptionLabel,
  fixed_options: initialOptions,
}: Props<T>) {
  const { options: remoteOptions, loading: remoteLoading, inputValue, setInputValue } = useAsyncDropdown<T>({
    value,
    endpoint,
    listFunction,
    singleFunction,
    filters,
  });

  const [open, setOpen] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [selectedItemsCache, setSelectedItemsCache] = React.useState<T[]>([]);

  const isFixedMode = !!initialOptions;
  const options = React.useMemo(() => {
    if (!isFixedMode || !initialOptions) return remoteOptions;
    
    return initialOptions.filter((item) =>
      getOptionLabel(item)
        .toLowerCase()
        .includes(inputValue.toLowerCase())
    );
  }, [isFixedMode, initialOptions, remoteOptions, inputValue, getOptionLabel]);

  const loading = isFixedMode ? false : remoteLoading;
  React.useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  React.useEffect(() => {
    if (initialOptions && initialOptions.length > 0) {
      setSelectedItemsCache((prevCache) => {
        const newCache = [...prevCache];
        initialOptions.forEach((opt) => {
          if (!newCache.some((c) => c._id === opt._id)) {
            newCache.push(opt);
          }
        });
        return newCache;
      });
    }
  }, [initialOptions]);

  React.useEffect(() => {
    if (options.length > 0) {
      setSelectedItemsCache((prevCache) => {
        const newCache = [...prevCache];
        options.forEach((opt) => {
          if (value.includes(opt._id) && !newCache.some((c) => c._id === opt._id)) {
            newCache.push(opt);
          }
        });
        return newCache;
      });
    }
  }, [options, value]);
  
  const selectedValue = React.useMemo(() => {
    const activeMatches = options.filter((o) => value.includes(o._id));
    const cachedMatches = selectedItemsCache.filter(
      (c) => value.includes(c._id) && !activeMatches.some((m) => m._id === c._id)
    );
    return [...activeMatches, ...cachedMatches];
  }, [options, value, selectedItemsCache]);

  const toggleOption = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const isFloating = open || focused || selectedValue.length > 0 || inputValue.length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full text-left">
      <div
        onClick={() => {
          if (!disabled) {
            setOpen(true);
            inputRef.current?.focus();
          }
        }}
        className={cn(
          "relative min-h-14 w-full rounded-xl border bg-white pl-3 pr-10 py-3 flex flex-wrap gap-1.5 items-center transition-all duration-200 cursor-pointer select-none",
          disabled ? "bg-gray-100 cursor-not-allowed border-gray-200" : "",
          !disabled && (open || focused) ? "border-primary ring-1 ring-primary/20" : "border-gray-300 hover:border-gray-400"
        )}
      >
        {/* Floating Label Layer */}
        <label
          className={cn(
            "pointer-events-none absolute left-3 z-10 bg-white px-1 transition-all duration-200",
            isFloating
              ? "-top-2 text-xs text-primary font-medium"
              : "top-1/2 -translate-y-1/2 text-sm text-gray-400"
          )}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        {/* Dynamic Badge Multi Selected Array Elements */}
        {selectedValue.map((option) => (
          <div
            key={option._id}
            className="z-20 flex items-center gap-1 rounded-lg bg-gray-100 border border-gray-200 pl-2 pr-1 py-0.5 text-xs font-medium text-gray-700 shadow-sm max-w-xs truncate"
          >
            <span className="truncate">{getOptionLabel(option)}</span>
            <button
              type="button"
              className="hover:bg-gray-200 p-0.5 rounded text-gray-400 hover:text-gray-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                toggleOption(option._id);
              }}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Text helper control search input frame item */}
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            "flex-1 min-w-[60px] bg-transparent text-sm outline-none border-none p-0 h-6 text-gray-800 disabled:cursor-not-allowed",
            !isFloating ? "opacity-0" : "opacity-100"
          )}
        />

        {/* Right Arrow Chevron Control Element */}
        <div className="absolute right-3 top-0 h-full flex items-center pointer-events-none">
          <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform duration-200", open ? "rotate-180" : "")} />
        </div>
      </div>
      
      {/* Dropdown Options Absolute Layer Panel Overlay */}
      {open && (
        <div className="absolute left-0 right-0 z-[999999] mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl p-1">
          {loading ? (
            <div className="p-4 text-sm text-gray-400 text-center animate-pulse">Loading options...</div>
          ) : options.length === 0 ? (
            <div className="p-4 text-sm text-gray-400 text-center">No options found</div>
          ) : (
            options.map((option) => {
              const isSelected = value.includes(option._id);

              return (
                <button
                  key={option._id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(option._id);
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors text-left hover:bg-gray-50 group"
                >
                  <div
                    className={cn(
                      "h-4 w-4 shrink-0 rounded border transition-all flex items-center justify-center",
                      isSelected
                        ? "bg-primary border-primary text-white"
                        : "border-gray-300 group-hover:border-gray-400 bg-white"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>

                  <span className={cn("transition-colors", isSelected ? "font-semibold text-primary" : "text-gray-700")}>
                    {getOptionLabel(option)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}