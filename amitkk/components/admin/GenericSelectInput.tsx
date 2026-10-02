"use client";

import React, {useEffect, useMemo, useState} from "react";
import { Check } from "lucide-react";
import type { OptionProps } from "@amitkk/basic/types/generic";
import { Input } from "@amitkk/components/basic/input";
import { Label } from "@amitkk/components/basic/label";
import { Popover, PopoverContent, PopoverTrigger } from "@amitkk/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, } from "@amitkk/components/ui/command";

type GenericSelectInputProps = {
  label: string;
  name: string;
  value: OptionProps | null;
  options: OptionProps[];
  required?: boolean;

  onChange: (
    data: {
      id?: string;
      new?: string;
    }
  ) => void;
};

const GenericSelectInput: React.FC<GenericSelectInputProps> = ({ label, value, options, required = false, onChange }) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedOption, setSelectedOption] = useState<OptionProps | null>(null);

  useEffect(() => {
    if (value && typeof value === "object") {
      setSelectedOption(value);
      setInputValue(value.name);
    } else {
      setSelectedOption(null);
      setInputValue("");
    }
  }, [value]);

  const filteredOptions =
    useMemo(() => {
      return options.filter((opt) => opt.name.toLowerCase().includes(inputValue.toLowerCase()));
    }, [options, inputValue]);

  const handleSelect = (option: OptionProps) => {
    setSelectedOption(option);
    setInputValue(option.name);
    onChange({ id: option._id });
    setOpen(false);
  };

  return (
    <div className="w-full space-y-2">
      <Label>{label} {required && (<span className="text-red-500">{" "} * </span>)}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div>
            <Input value={inputValue} placeholder={`Select or type ${label}`} onChange={(e) => {
              const val = e.target.value;
                setInputValue(val);
                const matched = options.find((opt) => opt.name === val);

                if (matched) {
                  setSelectedOption(matched);
                  onChange({id: matched._id});
                } else {
                  setSelectedOption(null);
                  onChange({new: val});
                }

                setOpen(true);
              }}
              onFocus={() => setOpen(true)
              }/>
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandEmpty>No results found</CommandEmpty>

            <CommandGroup className="max-h-64 overflow-auto">
              {filteredOptions.map(
                (option) => {
                  const selected = selectedOption?._id === option._id;

                  return (
                    <CommandItem key={option._id} onSelect={() => handleSelect(option)} className="flex items-center justify-between">
                      <span>{option.name}</span>
                      {selected && ( <Check className="h-4 w-4 text-primary"/>)}
                    </CommandItem>
                  );
                }
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default GenericSelectInput;