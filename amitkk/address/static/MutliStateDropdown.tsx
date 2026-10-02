"use client";

import MultiAsyncDropdown from "@amitkk/components/admin/MultiAsyncDropdown";

interface State {
  _id: string;
  name?: string;
}

type Props = {
  countryId?:string | string[];
  value?: string[];
  onChange: (value: string[]) => void;
  required?: boolean;
  disabled?: boolean;
};

export default function MultiStateDropdown({ value, onChange, required, disabled, countryId }: Props) {

  return (
    <MultiAsyncDropdown<State>
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      label="State"
      endpoint="address/address"
      listFunction="get_state_options"
      singleFunction="get_single_state"
      getOptionLabel={(o) => o?.name || ""}
      // parentId={countryId}
    />
  );
}