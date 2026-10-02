import { useFilterContext } from "contexts/FilterContext";
import { getFilterFieldMeta } from "../filters";
import OpenSelect from "@amitkk/components/basic/OpenSelect";

const FILTER_PRESETS: Record<string, { label: string; field: string; options: { label: string; value: string }[] }> = {
  product_meta_filter: {
    label: "Module",
    field: "module",
    options: [
      { label: "Type", value: "Type" },
      { label: "Category", value: "Category" },
      { label: "Tag", value: "Tag" },
    ],
  },
};

export default function GenericFilter(props: any) {
  const { filters, setFilter } = useFilterContext();
  const preset = props.preset ? FILTER_PRESETS[props.preset] : null;
  
  const label = props.label || preset?.label || "Filter";
  const options = props.options || preset?.options || [];
  
  const targetField = preset ? preset.field : (props.filterKey || "generic");
  const { field } = getFilterFieldMeta({ name: targetField, props });
  
  const value = filters[field] ?? "";

  const formattedOptions = [
    { label: props.allLabel || `All ${label}`, value: "" },
    ...options,
  ];

  return (
    <OpenSelect<string | boolean | number>
      name={field}
      label={label}
      showLabel={false}
      value={value}
      onChange={(val) => setFilter(field, val, props)}
      options={formattedOptions}
    />
  );
}