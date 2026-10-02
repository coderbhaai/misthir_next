import { useCallback, useEffect, useState } from "react";
import { useFilterContext } from "contexts/FilterContext";
import { apiRequest, clo } from "../my-utils/admin-utils";
import OpenSelect from "@amitkk/components/basic/OpenSelect";
import { getFilterFieldMeta } from "../filters";

interface Option {
  _id: string;
  name: string;
}

export default function ServiceTypeFilter(props: any) {
  const { filters, setFilter } = useFilterContext();
  const { field } = getFilterFieldMeta({ name: "ServiceTypeFilter", props });
  const serviceType_id = (filters[field] as string) || "";

  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  const initData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiRequest("GET", `service/serviceType?function=get_all_service_type`);
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
      label="Service Type"
      value={serviceType_id}
      disabled={loading}
      placeholder={loading ? "Loading..." : "Select Service Type"}
      onChange={(val) => setFilter("ServiceTypeFilter", val, props)}
      options={[{ label: "All Service Types", value: "" }, ...options.map((o) => ({ label: o.name, value: o._id }))]}
    />
  );
}