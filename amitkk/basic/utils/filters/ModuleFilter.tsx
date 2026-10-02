import { useFilterContext } from "contexts/FilterContext";
import { modules } from "../config";
import OpenSelect from "@amitkk/components/basic/OpenSelect";
import { getFilterFieldMeta } from "../filters";

export default function ModuleFilter(props: any) {
  const { filters, setFilter } = useFilterContext();
  const { field } = getFilterFieldMeta({ name: "ModuleFilter", props });
  const value = (filters[field] as string) || "";

  return (
    <OpenSelect name={field} label="Module" value={value} onChange={(val: any) => setFilter("ModuleFilter", val, props)} options={[{ label: "All Module", value: "" }, ...modules.map((item) => ({ label: item, value: item }))]}/>
  );
}