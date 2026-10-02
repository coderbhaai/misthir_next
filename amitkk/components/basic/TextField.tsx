"use client";

import React, { useState } from "react";
import { cn } from "@amitkk/lib/utils";

interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value"> {
  label?: string;
  error?: boolean;
  helperText?: string;
  containerClassName?: string;
  inputClassName?: string;
  value?: string | number | readonly string[] | null;
}

export function TextField({
  label,
  name,
  type = "text",
  error,
  helperText,
  containerClassName,
  inputClassName,
  value,
  required,
  disabled,
  placeholder,
  className,
  ...props
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  const normalizedValue = value ?? "";

  const hasValue = String(normalizedValue).length > 0;
  const floating = focused || hasValue;

  const generatedLabel = name
    ? name
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

  const finalLabel = label || generatedLabel;

  return (
    <div className={cn("relative w-full", containerClassName)}>
      <input
        name={name}
        type={type}
        value={normalizedValue}
        required={required}
        disabled={disabled}
        placeholder={finalLabel ? "" : placeholder}
        className={cn(
          "peer h-14 w-full rounded-xl border bg-white px-4 text-sm outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:bg-gray-100",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
            : "border-gray-300 focus:border-primary focus:ring-primary/20",
          inputClassName,
          className
        )}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />

      {finalLabel && (
        <label
          htmlFor={name}
          className={cn(
            "pointer-events-none absolute left-3 z-10 bg-white px-1 transition-all duration-200",
            floating
              ? "-top-2 text-xs text-primary"
              : "top-1/2 -translate-y-1/2 text-sm text-gray-500",
            error && "text-red-500"
          )}
        >
          {finalLabel}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}

      {helperText && (
        <p
          className={cn(
            "mt-1 px-1 text-xs",
            error ? "text-red-500" : "text-gray-500"
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}