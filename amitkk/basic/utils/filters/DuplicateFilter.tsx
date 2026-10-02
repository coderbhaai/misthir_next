import OpenSelect from "@amitkk/components/basic/OpenSelect";
import { useFilterContext } from "contexts/FilterContext";

export default function DuplicateFilter () {
  const { filters, setFilter } = useFilterContext();
  const value = filters.duplicate || "";

  return (
    <OpenSelect name="duplicate" label="Check Duplicacy" value={value} onChange={(value) => setFilter("duplicate", value)}
      options={[
        { label: "All", value: "" },
        { label: "Original", value: "original" },
        { label: "Duplicate", value: "duplicate" },
        { label: "Checking", value: "checking" },
      ]}/>
  );
};
