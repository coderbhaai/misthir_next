"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check, X } from "lucide-react";

export interface OptionProps {
  _id: string;
  name: string;
}

interface MultiOpenSelectProps {
  label: string;
  selected: string[];
  options: OptionProps[];
  onChange: (values: string[]) => void;
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
  disableEdit?: boolean;
  placeholder?: string;
}

export default function MultiOpenSelect({
  label,
  selected = [],
  options = [],
  onChange,
  required = false,
  error = false,
  disabled = false,
  placeholder = "Select options",
  disableEdit = true
}: MultiOpenSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const filteredOptions = useMemo(() => {
    return options.filter((option) => option?.name?.toLowerCase().includes(search?.toLowerCase())
    );
  }, [options, search]);

  const handleToggle = (itemId: string) => {
    if (selected.includes(itemId)) {
      onChange(selected.filter((val) => val !== itemId));
    } else {
      onChange([...selected, itemId]);
    }
  };

  return (
    <div className="relative w-full text-left block" ref={wrapperRef}>
      {label && ( <label className="block mb-1.5 text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label> )}

      <div onClick={() => !disabled && setOpen((prev) => !prev)} className={`min-h-14 w-full rounded-xl border px-4 py-2 flex items-center justify-between text-sm outline-none transition-all duration-200 cursor-pointer bg-white ${disabled ? "bg-gray-50 border-gray-200 text-gray-400 !cursor-not-allowed" : ""} ${error ? "border-red-500" : "border-gray-300 hover:border-gray-400"}`}>
        <div className="flex flex-wrap gap-1.5 max-w-[90%]">
          {selected.length > 0 ? (
            selected.map((val) => {
              const matchedOption = options.find((opt) => opt._id === val);
              if (!matchedOption) return null;
              return (
                <span key={val} className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-md border border-gray-200">{matchedOption.name} 
                {!disableEdit && ( <X size={12} className="cursor-pointer text-gray-500 hover:text-gray-800" onClick={(e) => { e.stopPropagation(); handleToggle(val); }}/> )}
                </span>
              );
            })
          ) : ( <span className="text-gray-400">{placeholder}</span> )}
        </div>
        <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}/>
      </div>
      
      {open && !disabled && (
        <div className="absolute left-0 right-0 top-full z-[99999] mt-2 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
          <input
            ref={searchInputRef}
            type="text"
            placeholder={`Search ${label}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-500"
          />

          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isChecked = selected.includes(option._id);
                return (
                  <button
                    key={option._id}
                    type="button"
                    onClick={() => handleToggle(option._id)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-gray-800 transition hover:bg-gray-100 text-left"
                  >
                    <span>{option.name}</span>
                    {isChecked && <Check size={16} className="text-blue-500" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No matching results
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}