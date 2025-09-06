import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { Types } from "mongoose";
import Link from "next/link";
import { useState } from "react";

export interface singleFilterItem {
  _id: string | Types.ObjectId;
  name: string;
  url?: string;
}

interface FilterCheckProps {
  items: singleFilterItem[];
  selected: string[];
  onChange: (newSelected: string[]) => void;
  withLinks?: boolean;
  basePath?: string;
}

export function FilterCheck({
  items,
  selected,
  onChange,
  withLinks = false,
  basePath = "",
}: FilterCheckProps) {
  const handleToggle = (id: string) => {
    const newSelected = selected.includes(id as string)
      ? selected.filter((s) => s !== id)
      : [...selected, id];
    onChange(newSelected);
  };

  return (
    <Box>
      {items.map((item) => {
        const isChecked = selected.includes(item._id as string);

        return (
          <Box
            key={item._id as string}
            sx={{
              px: 2,
              py: 0.5,
              mb: 1,
              mr: 1,
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Checkbox checked={isChecked} onChange={() => handleToggle(item._id as string)} size="small"/>
            {withLinks && item.url ? (
              <Link href={`${basePath}/${item.url}`} passHref>
                <Typography variant="body2" onClick={() => handleToggle(item._id as string)} sx={{ cursor: "pointer" }}>{item.name}</Typography>
              </Link>
            ) : (
              <Typography variant="body2" onClick={() => handleToggle(item._id as string)} sx={{ cursor: "pointer" }}>{item.name}</Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
