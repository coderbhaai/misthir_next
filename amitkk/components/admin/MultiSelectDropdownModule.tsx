"use client";

import React from "react";
import { Check } from "lucide-react";
import { Badge } from "@amitkk/components/ui/badge";
import { Button } from "@amitkk/components/button/button";
import { Popover, PopoverContent, PopoverTrigger, } from "@amitkk/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, } from "@amitkk/components/ui/command";

interface Option {
  _id: string;
  name: string;
  module: string;
}

interface MultiSelectDropdownProps {
  label: string;
  options: Option[];
  selected: Option[];
  onChange: (
    selected: Option[]
  ) => void;
}

const MultiSelectDropdownModule: React.FC<MultiSelectDropdownProps> = ({label, options, selected, onChange}) => {
  const toggleOption = (option: Option) => {
    const exists = selected.some((item) => item._id === option._id);
    if (exists) {
      onChange(selected.filter((item) => item._id !== option._id));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="w-full space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start min-h-10 h-auto flex-wrap gap-2">
            {selected.length > 0 ? (
              selected.map((item) => (
                <Badge key={item._id} variant="secondary">{item.name}</Badge>
              ))
            ) : (
              <span className="text-muted-foreground">Select options</span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${label}`}/>
            <CommandEmpty>No options found</CommandEmpty>

            <CommandGroup className="max-h-64 overflow-auto">
              {options.length > 0 ? (
                options.map((opt) => {
                  const checked = selected.some((item) => item._id === opt._id);
                  return (
                    <CommandItem key={opt._id} onSelect={() => toggleOption(opt)} className="flex items-center justify-between">
                      <span>{opt.name}</span>
                      {checked && ( <Check className="h-4 w-4 text-primary"/> )}
                    </CommandItem>
                  );
                })
              ) : (
                <div className="p-3 text-sm text-muted-foreground">No options available</div>
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MultiSelectDropdownModule;