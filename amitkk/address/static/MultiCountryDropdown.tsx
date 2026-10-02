"use client";

import MultiAsyncDropdown from "@amitkk/components/admin/MultiAsyncDropdown";
import React, { useMemo } from "react";

interface Country {
  _id: string;
  name?: string;
}

type Props = {
  value?: string[];
  onChange: (value: string[]) => void;
  required?: boolean;
  disabled?: boolean;
  options?: Country[];
};

export default function MultiCountryDropdown({value = [], onChange, required, disabled, options}: Props) {
  const staticFilters = useMemo(() => ({}), []);

  return (
    <div className="w-full relative">
      <MultiAsyncDropdown<Country>
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        label="Country"
        endpoint="address/address"
        listFunction="get_country_options"
        singleFunction="get_single_country"
        filters={staticFilters}
        getOptionLabel={(o) => o?.name || ""}
        fixed_options={options}
      />
    </div>
  );
}