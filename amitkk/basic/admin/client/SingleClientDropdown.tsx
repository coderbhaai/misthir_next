"use client";

import SingleAsyncDropdown from "@amitkk/components/admin/SingleAsyncDropdown";

interface Option {
  _id: string;
  name?: string;
}

type Props = {
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
};

export default function SingleClientDropdown({ value, onChange, required, disabled }: Props) {
  return (
    <SingleAsyncDropdown<Option>
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      label="Client"
      endpoint="basic/basic"
      listFunction="get_client_options"
      singleFunction="get_single_client"
      getOptionLabel={(o) => o?.name || ""}
    />
  );
}