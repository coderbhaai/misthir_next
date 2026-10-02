import { useFilterContext } from "contexts/FilterContext";
import { block_count } from "../my-utils/client-utils";
import OpenSelect from "@amitkk/components/basic/OpenSelect";
import { getFilterFieldMeta } from "../filters";

export default function BlockFilter(props: any) {
  const { filters, setFilter } = useFilterContext();
  const { field } = getFilterFieldMeta({ name: "BlockFilter", props });
  const value = (filters[field] as string) || "";
  const blocks = Array.from({ length: block_count }, (_, i) => i + 1);

  return (
    <OpenSelect
      name={field}
      label="Block"
      value={value}
      onChange={(val) => setFilter("BlockFilter", val, props)}
      options={[
        { label: "All Blocks", value: "" },
        ...blocks.map((i) => ({ label: String(i), value: String(i) })),
      ]}
    />
  );
}