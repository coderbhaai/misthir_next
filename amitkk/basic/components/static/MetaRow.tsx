import { Box, Typography } from "@mui/material";
import { GenericPills } from "@amitkk/basic/components/static/generic-pills";
import { ProductMetaRef } from "@amitkk/basic/types/page";
import { ArrayProps } from "lib/models/types";

type MetaRowItem = ProductMetaRef | ArrayProps;

interface MetaRowProps {
  label: string;
  items?: MetaRowItem[] | null;
  basePath?: string;
  clickable?: boolean;
}

export function MetaRow({ label, items, basePath, clickable = true }: MetaRowProps) {
  if (!items || items.length === 0) return null;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Typography component="span" sx={{ fontWeight: "bold", mr: 1, display: "block" }}>{label}:</Typography>
      <GenericPills items={items} basePath={basePath} clickable={clickable}/>
    </Box>
  );
}
