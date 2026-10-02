"use client";

import React from "react";
import { TextField } from "@amitkk/components/basic/TextField";

interface DataProps {
  value: number | null;
  onChange: (value: number | null) => void;
  error?: boolean;
}

const DisplayOrder: React.FC<DataProps> = ({value, onChange, error}) => {
  return (
    <TextField type="number" label="Display Order" name="displayOrder" value={value ?? ""} error={error} onChange={(value) => { onChange(Number(value)); }}/>
  );
};

export default DisplayOrder;