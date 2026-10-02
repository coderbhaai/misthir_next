import OpenSelect from "@amitkk/components/basic/OpenSelect";
import { useFilterContext } from "contexts/FilterContext";
import { getFilterFieldMeta } from "../filters";

export default function StatusFilter(props: any) {
  const { filters, setFilter } = useFilterContext();
  const { field } = getFilterFieldMeta({ name: "StatusFilter", props });
  const value = filters[field] ?? "";

  return (
    <OpenSelect<boolean | string>
      name={field}
      label="Status"
      showLabel={false}
      value={value}
      onChange={(val) => setFilter("StatusFilter", val, props)}
      options={[
        { label: "All Status", value: "" },
        { label: "Active", value: true },
        { label: "Not Active", value: false },
      ]}
    />
  );
}