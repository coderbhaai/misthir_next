"use client";

import { useEffect, useState, useMemo } from "react";
import { ModuleData, fetchAllModules, clo } from "@amitkk/basic/utils/my-utils/admin-utils";
import { modules } from "@amitkk/basic/utils/config";
import OpenSelect from "@amitkk/components/basic/OpenSelect";

interface ModuleSelectorProps {
  formData: {
    module?: string;
    module_id?: any;
  };
  onFieldChange?: (name: string, value: string) => void;
  className?: string;
  allow_edit?: boolean;
}

export default function ModuleSelector({ formData, onFieldChange, className, allow_edit = true }: ModuleSelectorProps) {
  const [dbModules, setDbModules] = useState<ModuleData[]>([]);

  useEffect(() => {
    let isMounted = true;

    fetchAllModules()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setDbModules(data);
        }
      })
      .catch((err) => clo(err));

    return () => { isMounted = false; };
  }, []);
  
  const currentModuleId = useMemo(() => {
    const rawId = formData.module_id;
    if (!rawId) return "";
    return typeof rawId === "object" ? (rawId._id?.toString() || "") : String(rawId);
  }, [formData.module_id]);

  const contextualModuleOptions = useMemo(() => {
    if (!formData.module || !dbModules.length) return [];

    return dbModules
      .filter((item) => String(item.module).toLowerCase() === String(formData.module).toLowerCase())
      .map((mod) => ({
        label: mod.name || "Unnamed Resource",
        value: String(mod._id),
      }));
  }, [formData.module, dbModules]);
  
  const topLevelOptions = useMemo(() => {
    return modules.map((item) => ({ label: item, value: item }));
  }, []);

  const parentLayoutClass = className || "flex flex-col gap-5 w-full y-3";
  const isReadonly = allow_edit === false;
  
  return (
    <div className={parentLayoutClass}>
      <OpenSelect 
        name="module" 
        label="Module Category" 
        required={!isReadonly} 
        disabled={isReadonly}
        value={modules.includes(formData.module || "") ? formData.module || "" : ""} 
        options={topLevelOptions} 
        placeholder="Select Base Module" 
        onChange={(val: any) => !isReadonly && onFieldChange?.("module", val)}
      />
      <OpenSelect 
        name="module_id" 
        label="Module Name" 
        required={!isReadonly} 
        disabled={isReadonly || !formData.module} 
        value={currentModuleId} 
        options={contextualModuleOptions} 
        placeholder={formData.module ? "Select resource..." : "Select category first..."} 
        helperText={!formData.module && !isReadonly ? "Please select a base module category" : undefined} 
        onChange={(val: any) => !isReadonly && onFieldChange?.("module_id", val)}
      />
    </div>
  );
}