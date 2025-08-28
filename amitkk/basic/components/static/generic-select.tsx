import React from "react";
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";

export interface Option {
  _id: string;
  name: string;
}

type GenericSelectProps = {
  label: string;
  name: string;
  value: string | string[];
  options: Option[];
  multiple?: boolean;
  required?: boolean;
  onChange: (value: string | string[]) => void;
};

const GenericSelect: React.FC<GenericSelectProps> = ({ label, name, value, options, multiple = false, required = false, onChange, }) => {
  const handleChange = (e: SelectChangeEvent<typeof value>) => {
    const newValue = multiple
      ? (e.target.value as string[]) // for multiple
      : (e.target.value as string); // for single

    onChange(newValue);
  };

  return (
    <FormControl sx={{ width: "100%" }}>
      <InputLabel id={`${name}-label`}>{label} {required && <span style={{ color: "red" }}>*</span>}</InputLabel>
      <Select labelId={`${name}-label`} id={name} name={name} value={value} multiple={multiple} onChange={handleChange}>
        {options.length > 0 ? (
          options.map((i) => ( <MenuItem key={i._id} value={i._id}>{i.name}</MenuItem> ))
        ) : ( <MenuItem disabled>No {label} available</MenuItem> )}
      </Select>
    </FormControl>
  );
};

export default GenericSelect;