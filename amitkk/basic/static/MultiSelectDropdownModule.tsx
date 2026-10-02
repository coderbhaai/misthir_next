import React, { useState, useRef, useEffect } from "react";

interface Option {
  _id: string;
  name: string;
  module: string;
}

interface Props {
  label: string;
  options: Option[];
  selected: Option[];
  onChange: (selected: Option[]) => void;
}

export default function MultiSelectDropdownModule({ label, options, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSelect = (option: Option) => {
    const exists = selected.some((o) => o._id === option._id);
    if (exists) {
      onChange(selected.filter((o) => o._id !== option._id));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-left flex justify-between items-center shadow-sm hover:border-gray-400 focus:outline-none"
      >
        <span className="flex flex-wrap gap-1">
          {selected.length > 0
            ? selected.map((opt) => (
                <span key={opt._id} className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs">
                  {opt.name}
                </span>
              ))
            : "Select options"}
        </span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <li
              key={opt._id}
              className={`cursor-pointer px-3 py-2 hover:bg-blue-50 flex items-center ${
                selected.some((o) => o._id === opt._id) ? "bg-blue-100" : ""
              }`}
              onClick={() => toggleSelect(opt)}
            >
              <input
                type="checkbox"
                checked={selected.some((o) => o._id === opt._id)}
                readOnly
                className="mr-2 accent-blue-600"
              />
              {opt.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
