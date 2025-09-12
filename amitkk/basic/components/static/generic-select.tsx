import React from "react";
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { OptionProps } from "@amitkk/basic/types/page";

type GenericSelectProps = {
  label: string;
  name: string;
  value: string | string[];
  options: OptionProps[];
  multiple?: boolean;
  required?: boolean;
  onChange: (value: string | string[]) => void;
};

const GenericSelect: React.FC<GenericSelectProps> = ({
  label,
  name,
  value,
  options,
  multiple = false,
  required = false,
  onChange,
}) => {
  const handleChange = (e: SelectChangeEvent<typeof value>) => {
    const newValue = multiple
      ? (e.target.value as string[])
      : (e.target.value as string);

    onChange(newValue);
  };

  // ✅ Validate value
  const optionIds = options.map((o) => o._id);
  let safeValue: string | string[];

  if (multiple) {
    const arr = Array.isArray(value) ? value : [];
    safeValue = arr.filter((v) => optionIds.includes(v));
  } else {
    safeValue = optionIds.includes(value as string) ? value : "";
  }

  return (
    <FormControl sx={{ width: "100%" }}>
      <InputLabel id={`${name}-label`}>
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </InputLabel>
      <Select
        labelId={`${name}-label`}
        id={name}
        name={name}
        value={safeValue}
        multiple={multiple}
        onChange={handleChange}
      >
        {options.length > 0 ? (
          options.map((i) => (
            <MenuItem key={i._id} value={i._id}>
              {i.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No {label} available</MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

export default GenericSelect;