"use client";

import { useEffect, useState } from "react";

import { Check } from "lucide-react";

import { modules } from "@amitkk/basic/utils/config";
import {
  clo,
  fetchModuleData,
} from "@amitkk/basic/utils/my-utils/admin-utils";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@amitkk/components/ui/select";
import { Checkbox } from "@amitkk/components/basic/checkbox";

interface ModuleOption {
  _id: string;
  name: string;
}

interface ModuleMultiSelectorProps {
  value: {
    module?: string;
    module_ids: string[];
  };
  onChange: (data: {
    module?: string;
    module_ids: string[];
  }) => void;
  required?: boolean;
  disabled?: boolean;
}

export default function ModuleCheckboxList({
  value,
  onChange,
  required = true,
  disabled = false,
}: ModuleMultiSelectorProps) {
  const [moduleOptions, setModuleOptions] =
    useState<ModuleOption[]>([]);

  useEffect(() => {
    if (!value.module) {
      setModuleOptions([]);
      return;
    }

    const fetchData = async () => {
      try {
        const data =
          await fetchModuleData(String(value.module));

        setModuleOptions(data || []);
      } catch (error) {
        clo(error);
      }
    };

    fetchData();
  }, [value.module]);

  const toggleId = (id: string) => {
    const exists =
      value.module_ids.includes(id);

    onChange({
      ...value,
      module_ids: exists
        ? value.module_ids.filter(
            (x) => x !== id
          )
        : [...value.module_ids, id],
    });
  };

  return (
    <div className="w-full space-y-4">
      {/* MODULE SELECT */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Module{" "}
          {required && (
            <span className="text-red-500">
              *
            </span>
          )}
        </label>

        <Select
          disabled={disabled}
          value={value.module || ""}
          onValueChange={(val) =>
            onChange({
              module: val,
              module_ids: [],
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select module" />
          </SelectTrigger>

          <SelectContent>
            {modules.map((item) => (
              <SelectItem
                key={item}
                value={item}
              >
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* MODULE IDS CHECKLIST */}
      {moduleOptions.length > 0 && (
        <div className="border rounded-md p-3 space-y-2">
          <div className="text-sm font-medium">
            Select {value.module}
          </div>

          {moduleOptions.map((item) => {
            const checked =
              value.module_ids.includes(
                item._id
              );

            return (
              <label
                key={item._id}
                className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-muted"
                onClick={() =>
                  toggleId(item._id)
                }
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() =>
                    toggleId(item._id)
                  }
                />

                <span className="text-sm">
                  {item.name}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}