import { useCallback, useEffect, useState } from "react";
import { useFilterContext } from "contexts/FilterContext";
import { apiRequest, clo } from "../my-utils/admin-utils";
import OpenSelect from "@amitkk/components/basic/OpenSelect";
import { getFilterFieldMeta } from "../filters";

interface Option {
  _id: string;
  name: string;
}

interface RoleFilterProps {
  filterKey?: string;
  [key: string]: any;
}

export default function RoleFilter(props: RoleFilterProps) {
  const { filters, setFilter } = useFilterContext();
  const { field } = getFilterFieldMeta({ name: "RoleFilter", props });
  const currentValue = (filters[field] as string) || "";

  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  const initData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiRequest("GET", `basic/spatie?function=get_all_roles`);
      setOptions(res?.data ?? []);
    } catch (error) { clo(error); } finally { setLoading(false); }
  }, []);

  useEffect(() => { initData(); }, [initData]);

  return (
    <OpenSelect name={field} label="Role" value={currentValue} onChange={(val) => setFilter("RoleFilter", val, props)} options={[ { label: "All Roles", value: "" }, ...options.map((o) => ({ label: o.name, value: o._id })) ]}/>
  );
}