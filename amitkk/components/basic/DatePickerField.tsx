"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@amitkk/components/button/button";
import { Popover, PopoverContent, PopoverTrigger, } from "@amitkk/components/ui/popover";
import { Calendar } from "@amitkk/components/ui/calendar";
import { cn } from "@amitkk/lib/utils";

type Props<T> = {
  label?: string;
  placeholder?: string;
  field: keyof T;
  value: Date | string | null | undefined;

  setFieldValue: <K extends keyof T>(
    field: K,
    value: T[K]
  ) => void;

  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  required?: boolean;
};

export default function DatePickerField<T>({
  label,
  placeholder = "Pick a date",
  field,
  value,
  setFieldValue,
  disabled,
  minDate,
  maxDate,
  className,
  required,
}: Props<T>) {
  const [open, setOpen] = useState(false);

  const parsedDate =
    value instanceof Date
      ? value
      : value
      ? new Date(value)
      : undefined;

  const finalLabel =
    label ||
    String(field)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const floating = open || !!parsedDate;

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-14 w-full justify-between rounded-xl border border-gray-300 bg-white px-4 text-left text-sm font-normal shadow-none transition-all duration-200 hover:bg-white focus:ring-2 focus:ring-primary/20",
              !parsedDate && "text-gray-500"
            )}
          >
            <div className="flex items-center">
              {parsedDate
                ? format(parsedDate, "dd MMM yyyy")
                : !finalLabel && placeholder}
            </div>

            <CalendarIcon className="h-4 w-4 shrink-0 text-gray-500" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="z-[9999] w-auto rounded-xl border bg-white p-0 shadow-xl"
        >
          <Calendar
            mode="single"
            selected={parsedDate}
            className="rounded-xl bg-white"
            onSelect={(date) => {
              setFieldValue(field, date as T[keyof T]);
              setOpen(false);
            }}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
          />
        </PopoverContent>
      </Popover>

      {finalLabel && (
        <label
          className={cn(
            "pointer-events-none absolute left-3 z-10 bg-white px-1 transition-all duration-200",
            floating
              ? "-top-2 text-xs text-primary"
              : "top-1/2 -translate-y-1/2 text-sm text-gray-500"
          )}
        >
          {finalLabel}

          {required && (
            <span className="ml-0.5 text-red-500">*</span>
          )}
        </label>
      )}
    </div>
  );
}