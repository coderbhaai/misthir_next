"use client";

import React, { useState, useRef } from "react";
import { cn } from "@amitkk/lib/utils";

interface FileFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value"> {
  label?: string;
  error?: boolean;
  helperText?: string;
  containerClassName?: string;
  inputClassName?: string;
  selectedFile: File | null;
}

export function FileField({
  label,
  name,
  error,
  helperText,
  containerClassName,
  inputClassName,
  required,
  disabled,
  className,
  selectedFile,
  onChange,
  ...props
}: FileFieldProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generatedLabel = name ? name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";
  const finalLabel = label || generatedLabel || "Choose File";
  
  // Highlighting state for floating UI elements
  const hasFile = !!selectedFile;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0] && onChange) {
      // Create a mock event to match standard HTML input onChange signature
      const mockEvent = {
        target: { files: e.dataTransfer.files }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange(mockEvent);
    }
  };

  return (
    <div 
      className={cn("relative w-full", containerClassName)}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      {/* Hidden native input to retain standard form/ref mechanics */}
      <input
        ref={fileInputRef}
        name={name}
        type="file"
        required={required}
        disabled={disabled}
        className="sr-only" 
        onChange={onChange}
        {...props}
      />

      {/* Styled visual UI wrapper matching your TextField size */}
      <div
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={cn(
          "flex h-14 w-full cursor-pointer items-center justify-between rounded-xl border bg-white px-4 text-sm transition-all duration-200",
          dragActive && "border-primary bg-primary/5 ring-4 ring-primary/10",
          error ? "border-red-500 bg-red-50/10 focus:border-red-500" : "border-gray-300 hover:border-gray-400",
          disabled && "cursor-not-allowed bg-gray-100 opacity-60",
          inputClassName,
          className
        )}
      >
        {/* Dynamic Inner Text displaying selected file or state placeholder */}
        <span className={cn("truncate pr-6", hasFile ? "text-gray-800 font-medium" : "text-gray-400")}>
          {hasFile ? selectedFile.name : "No file selected..."}
        </span>

        {/* Action Icon Trigger */}
        <div className="flex items-center text-gray-400 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
          </svg>
        </div>
      </div>

      {/* Matching floating floating label structure */}
      {finalLabel && (
        <label
          htmlFor={name}
          className={cn(
            "pointer-events-none absolute left-3 z-10 bg-white px-1 transition-all duration-200 -top-2 text-xs",
            hasFile || dragActive ? "text-primary font-medium" : "text-gray-500",
            error && "text-red-500"
          )}
        >
          {finalLabel}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}

      {/* Helper text error handling */}
      {helperText && (
        <p className={cn("mt-1 px-1 text-xs", error ? "text-red-500" : "text-gray-500")}>
          {helperText}
        </p>
      )}
    </div>
  );
}