"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@amitkk/lib/utils";

interface PasswordFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value"> {
  label?: string;
  error?: boolean;
  helperText?: string;
  containerClassName?: string;
  inputClassName?: string;
  value?: string | number | readonly string[] | null;
}

export default function PasswordField({
  label,
  name,
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
}: PasswordFieldProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        id={name}
        name={name}
        type={showPassword ? "text" : "password"}
        value={normalizedValue}
        required={required}
        disabled={disabled}
        placeholder={finalLabel ? "" : placeholder}
        className={cn(
          "peer h-14 w-full rounded-xl border bg-white px-4 pr-12 text-sm outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:bg-gray-100",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100"
            : "border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/10",
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
              ? "-top-2 text-xs font-medium text-primary"
              : "top-1/2 -translate-y-1/2 text-sm text-gray-500",
            error && "text-red-500"
          )}
        >
          {finalLabel}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}

      <button
        type="button"
        onClick={() => setShowPassword((v) => !v)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
      </button>

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