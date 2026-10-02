"use client";

import * as React from "react";
import { cn } from "@amitkk/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { label?: string; error?: string; }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, label, error, id, value, required, ...props }, ref) => {
  const [focused, setFocused] = React.useState(false);

  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const floating = focused || hasValue;

  return (
    <div className="relative w-full">
      <textarea
        id={id}
        ref={ref}
        value={value}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "peer min-h-[100px] w-full rounded-xl border bg-white px-4 pt-6 pb-3 text-sm outline-none transition-all duration-200 placeholder-transparent disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20",
          className
        )}
        {...props}
      />

      {label && (
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-3 z-10 bg-white px-1 transition-all duration-200",
            floating ? "-top-2 text-xs text-primary" : "top-4 text-sm text-gray-500",
            error && "text-red-500"
          )}
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}

      {error && (
        <p className="mt-1 px-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = "Textarea";

export { Textarea };