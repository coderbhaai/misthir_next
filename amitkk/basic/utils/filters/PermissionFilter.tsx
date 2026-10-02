import { useCallback, useEffect, useState } from "react";
import { useFilterContext } from "contexts/FilterContext";
import { apiRequest, clo } from "../my-utils/admin-utils";
import OpenSelect from "@amitkk/components/basic/OpenSelect";
import { getFilterFieldMeta } from "../filters";

interface Option {
  _id: string;
  name: string;
}

export default function PermissionFilter(props: any) {
  const { filters, setFilter } = useFilterContext();
  const { field } = getFilterFieldMeta({ name: "PermissionFilter", props });
  const permission_id = (filters[field] as string) || "";

  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  const initData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiRequest("GET", `basic/spatie?function=get_all_permissions`);
      setOptions(res?.data ?? []);
    } catch (error) {
      clo(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { initData(); }, [initData]);

  return (
    <OpenSelect
      name={field}
      label="Permission"
      value={permission_id}
      disabled={loading}
      placeholder={loading ? "Loading..." : "Select Permission"}
      onChange={(val) => setFilter("PermissionFilter", val, props)}
      options={[{ label: "All Permissions", value: "" }, ...options.map((o) => ({ label: o.name, value: o._id }))]}
    />
  );
}