import { TextField } from "@amitkk/components/basic/TextField";
import { useFilterContext } from "contexts/FilterContext";
import { getFilterFieldMeta } from "../filters";

export default function SearchFilter(props: any) {
  const { filters, setFilter } = useFilterContext();
  const { field } = getFilterFieldMeta({ name: "SearchFilter", props });
  const value = (filters[field] as string) || "";

  return (
    <TextField label="Search" value={value} name={field} onChange={(e) => setFilter("SearchFilter", e.target.value, props)}/>
  );
}