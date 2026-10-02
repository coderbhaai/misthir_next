"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFilterContext } from "contexts/FilterContext";
import { ModuleData, fetchAllModules, filterModules, clo } from "../my-utils/admin-utils";
import OpenSelect from "@amitkk/components/basic/OpenSelect";
import { getFilterFieldMeta } from "../filters";

export default function ModuleIdFilter(props: any) {
  const { filters, setFilter } = useFilterContext();
  const { field } = getFilterFieldMeta({ name: "ModuleIdFilter", props });
  const { field: moduleField } = getFilterFieldMeta({ name: "ModuleFilter", props });

  const module = String(filters[moduleField] || "");
  const module_id = String(filters[field] || "");

  const [allModules, setAllModules] = useState<ModuleData[]>([]);
  const [loading, setLoading] = useState(false);
  const prevModuleRef = useRef(module);

  useEffect(() => {
    let mounted = true;
    const loadModules = async () => {
      try {
        setLoading(true);
        const res = await fetchAllModules();
        if (!mounted) return;
        setAllModules(Array.isArray(res) ? res : []);
      } catch (error) {
        clo(error);
        setAllModules([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadModules();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (prevModuleRef.current !== module) {
      prevModuleRef.current = module;
      setFilter("ModuleIdFilter", "", props);
    }
  }, [module, setFilter, props]);

  const filteredModules = useMemo(() => filterModules(module, "", allModules), [module, allModules]);

  return (
    <OpenSelect
      name={field}
      label="Module Item"
      value={module_id}
      disabled={loading}
      placeholder={loading ? "Loading..." : `All ${module || "Modules"}`}
      onChange={(val: any) => setFilter("ModuleIdFilter", val, props)}
      options={filteredModules.map((item) => ({ label: item.name, value: item._id }))}
    />
  );
}