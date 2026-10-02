"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@amitkk/components/button/button";
import { Popover, PopoverContent, PopoverTrigger } from "@amitkk/components/ui/popover";
import { cn } from "@amitkk/lib/utils";

type Props<T> = {
  label?: string;
  placeholder?: string;
  field: keyof T;
  value: string | null | undefined; // e.g., "10:15 AM"
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  disabled?: boolean;
  className?: string;
  required?: boolean;
};

export default function TimePickerField<T>({
  label,
  placeholder = "Pick an exact time",
  field,
  value,
  setFieldValue,
  disabled,
  className,
  required,
}: Props<T>) {
  const [open, setOpen] = useState(false);

  // Parse existing value or fall back to defaults
  const currentParts = value?.match(/^(\d+):(\d+)\s(AM|PM)$/);
  const selectedHour = currentParts ? currentParts[1] : "12";
  const selectedMinute = currentParts ? currentParts[2] : "00";
  const selectedPeriod = currentParts ? currentParts[3] : "AM";

  // Generate lists for exact selections
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
  const periods = ["AM", "PM"];

  const updateExactTime = (h: string, m: string, p: string) => {
    const formattedTime = `${h}:${m} ${p}`;
    setFieldValue(field, formattedTime as T[keyof T]);
  };

  const finalLabel =
    label ||
    String(field)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const floating = open || !!value;

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
              !value && "text-gray-500"
            )}
          >
            <span>{value || (!finalLabel && placeholder)}</span>
            <Clock className="h-4 w-4 shrink-0 text-gray-500" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="z-[9999] w-64 rounded-xl border bg-white p-3 shadow-xl"
        >
          <div className="flex justify-between space-x-2 h-48">
            
            {/* 🕐 Hour Segment List */}
            <div className="flex-1 overflow-y-auto border-r pr-1 text-center scrollbar-none">
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1 sticky top-0 bg-white">Hour</div>
              {hours.map((h) => (
                <button
                  key={h}
                  type="button"
                  className={cn(
                    "w-full text-center py-1 text-sm rounded-md my-0.5 block transition-colors",
                    selectedHour === h ? "bg-primary text-white font-semibold" : "hover:bg-gray-100"
                  )}
                  onClick={() => updateExactTime(h, selectedMinute, selectedPeriod)}
                >
                  {h}
                </button>
              ))}
            </div>

            {/* ⏱️ Exact Minute Segment List */}
            <div className="flex-1 overflow-y-auto border-r px-1 text-center scrollbar-none">
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1 sticky top-0 bg-white">Min</div>
              {minutes.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={cn(
                    "w-full text-center py-1 text-sm rounded-md my-0.5 block transition-colors",
                    selectedMinute === m ? "bg-primary text-white font-semibold" : "hover:bg-gray-100"
                  )}
                  onClick={() => updateExactTime(selectedHour, m, selectedPeriod)}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* ☀️/🌙 AM/PM Segment Choice */}
            <div className="w-14 flex flex-col justify-center pl-1 text-center">
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Period</div>
              {periods.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={cn(
                    "w-full text-center py-2 text-xs rounded-md my-1 font-bold transition-colors border",
                    selectedPeriod === p ? "bg-gray-900 text-white border-gray-900" : "hover:bg-gray-100 border-gray-200"
                  )}
                  onClick={() => updateExactTime(selectedHour, selectedMinute, p)}
                >
                  {p}
                </button>
              ))}
            </div>

          </div>
          
          {/* Action Confirmation Button */}
          <Button 
            type="button" 
            className="w-full mt-3 h-9 text-xs rounded-lg bg-primary text-white" 
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
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
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
    </div>
  );
}