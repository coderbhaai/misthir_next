"use client";

import SingleAsyncDropdown from "@amitkk/components/admin/SingleAsyncDropdown";

interface State {
  _id: string;
  name?: string;
}

type Props = {
  countryId?: string | string[];
  value?: string | string[];       // 1. Updated to allow string[]
  onChange: (value: any) => void;  // 2. Updated to allow array/string
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;              // 3. Added multiple prop
};

export default function SingleStateDropdown({
  value,
  onChange,
  required,
  disabled,
  countryId,
  multiple = false,                // 4. Default to false
}: Props) {
  return (
    <SingleAsyncDropdown<State>
      key={`state-${JSON.stringify(countryId)}`}
      value={value as any}          // Cast to satisfy underlying component
      onChange={onChange}
      required={required}
      disabled={disabled}
      label="State"
      endpoint="address/address"
      listFunction="get_state_options"
      singleFunction="get_single_state"
      getOptionLabel={(o) => o?.name || ""}
      parentId={countryId}
    />
  );
}