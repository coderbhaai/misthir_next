import React from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "./label";

interface RadioOption {
  label: string;
  value: boolean;
}

interface BooleanRadioGroupProps {
  value: boolean;
  onChange: (value: boolean) => void;
  options: RadioOption[];
  name?: string;
}

export function BooleanRadioGroup({ value, onChange, options, name }: BooleanRadioGroupProps) {
  return (
    <RadioGroup value={value.toString()} onValueChange={(val) => onChange(val === "true")} name={name} className="space-y-2">
      {options.map((option) => {
        const strVal = option.value.toString();
        const id = `${name || "radio"}-${strVal}`;

        return (
          <div key={strVal} className="flex items-center space-x-2 cursor-pointer">
            <RadioGroupItem value={strVal} id={id} className="border-2 border-gray-400 data-[state=checked]:border-primary data-[state=checked]:text-primary"/>
            <Label htmlFor={id} className="cursor-pointer text-sm font-medium text-foreground">{option.label}</Label>
          </div>
        );
      })}
    </RadioGroup>
  );
}