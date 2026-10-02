import { useCallback, useEffect, useState } from "react";
import { useFilterContext } from "contexts/FilterContext";
import { apiRequest, clo } from "../my-utils/admin-utils";
import OpenSelect from "@amitkk/components/basic/OpenSelect";

interface Option {
  _id: string;
  name: string;
}

export default function ProductBrandFilter() {
  const { filters, setFilter } = useFilterContext();
  const productBrand_id = filters.productBrand_id || "";

  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const initData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiRequest("GET", `product/basic?function=get_product_brand_module`);
      setOptions(res?.data ?? []);
    } catch (error) { clo(error); } finally { setLoading(false); }
  }, []);
  useEffect(() => { initData(); }, [initData]);

  return (
    <OpenSelect 
      name={String(productBrand_id)} 
      label="Product Brands" 
      value={productBrand_id} 
      onChange={(val) => setFilter("productBrand_id", val)} 
      options={[ 
        { label: "All Product Brands", value: "" }, 
        { label: "Uncategorised", value: "uncategorised" },
        ...options.map((o) => ({ label: o.name, value: o._id })) 
      ]}
    />
  );
}