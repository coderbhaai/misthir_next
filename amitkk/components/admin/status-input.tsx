"use client";

import React from "react";
import OpenSelect from "@amitkk/components/basic/OpenSelect";

interface DataProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
  error?: boolean;
}

const StatusSelect: React.FC<DataProps> = ({
  value,
  onChange,
  error,
}) => {
  return (
    <OpenSelect
      name="status"
      label="Status"
      value={value ?? ""}
      error={error}
      onChange={(value) =>
        onChange(value as boolean)
      }
      options={[
        {
          label: "Active",
          value: true,
        },
        {
          label: "Not Active",
          value: false,
        },
      ]}
    />
  );
};

export default StatusSelect;