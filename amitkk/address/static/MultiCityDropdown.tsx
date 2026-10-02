"use client";

import MultiAsyncDropdown from "@amitkk/components/admin/MultiAsyncDropdown";
import React, { useMemo } from "react";

interface City {
  _id: string;
  name?: string;
}

type Props = {
  value?: string[];
  onChange: (value: string[]) => void;
  required?: boolean;
  disabled?: boolean;
  countryId?: string | string[] | null;
  stateId?: string | string[] | null;
};

export default function MultiCityDropdown({
  value = [],
  onChange,
  required,
  disabled,
  countryId,
  stateId,
}: Props) {
  const normalizedFilters = useMemo(() => {
    const cleanCountries = Array.isArray(countryId) ? countryId.filter(Boolean) : countryId  ? [countryId] : [];
    return { countries: cleanCountries, states: stateId || [] };
  }, [JSON.stringify(countryId), JSON.stringify(stateId)]);

  return (
    <div className="w-full relative z-[9998]">
      <MultiAsyncDropdown<City>
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        label="City"
        endpoint="address/address"
        listFunction="get_city_options"
        singleFunction="get_single_city"
        filters={normalizedFilters}
        getOptionLabel={(o) => o?.name || ""}
      />
    </div>
  );
}