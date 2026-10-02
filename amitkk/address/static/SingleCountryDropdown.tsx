"use client";

import SingleAsyncDropdown from "@amitkk/components/admin/SingleAsyncDropdown";

interface Country {
  _id: string;
  name?: string;
}

type Props = {
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  options?: Country[];
};

export default function SingleCountryDropdown({value, onChange, required, disabled, options }: Props) {
  return (
    <SingleAsyncDropdown<Country>
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      label="Country"
      endpoint="address/address"
      listFunction="get_country_options"
      singleFunction="get_single_country"
      getOptionLabel={(o) => o?.name || ""}
      options={options}
    />
  );
}