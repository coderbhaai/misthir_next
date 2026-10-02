import { useCallback, useEffect, useState } from "react";
import { useFilterContext } from "contexts/FilterContext";
import { apiRequest, clo } from "../my-utils/admin-utils";
import OpenSelect from "@amitkk/components/basic/OpenSelect";

interface Option {
  _id: string;
  name: string;
}

export default function ProductTypeFilter() {
  const { filters, setFilter } = useFilterContext();
  const productType_id = filters.productType_id || "";

  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const initData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiRequest("GET", `product/basic?function=get_product_type_parents`);
      setOptions(res?.data ?? []);
    } catch (error) { clo(error); } finally { setLoading(false); }
  }, []);
  useEffect(() => { initData(); }, [initData]);

  return (
    <OpenSelect 
      name={String(productType_id)} 
      label="Product Type" 
      value={productType_id} 
      onChange={(val) => setFilter("productType_id", val)} 
      options={[ 
        { label: "All Product Types", value: "" }, 
        { label: "Uncategorised", value: "uncategorised" },
        ...options.map((o) => ({ label: o.name, value: o._id })) 
      ]}
    />
  );
}