// sidebar-shop.tsx
import { Typography, Box, Grid } from "@mui/material";
import { ArrayProps } from "lib/models/types";
import { FilterCheck } from "./filter-checkboz";

interface SidebarShopProps {
  category?: ArrayProps[];
  tag?: ArrayProps[];
  productTypes?: ArrayProps[];
  productBrand?: ArrayProps[];
  ingridient?: ArrayProps[];
  flavors?: ArrayProps[];
  colors?: ArrayProps[];
  eggless?: ArrayProps[];
  glutten?: ArrayProps[];
  sugar?: ArrayProps[];
  storage?: ArrayProps[];

  selected: Record<string, string[]>;
  onChange: (key: string, values: string[]) => void;
}

export function SidebarShop({
  category = [],
  tag = [],
  productTypes = [],
  productBrand = [],
  ingridient = [],
  flavors = [],
  colors = [],
  eggless = [],
  glutten = [],
  sugar = [],
  storage = [],
  selected,
  onChange,
}: SidebarShopProps) {
  return (
    <Grid size={3}>
      <Typography variant="h5" gutterBottom>Product Types</Typography>
      <Box sx={{ borderBottom: "2px solid #ccc", mb: 2 }} />
      <FilterCheck items={productTypes} selected={selected.productTypes ?? []} onChange={(vals) => onChange("productTypes", vals)}/>

      <Typography variant="h5" gutterBottom>Brands</Typography>
      <Box sx={{ borderBottom: "2px solid #ccc", mb: 2 }} />
      <FilterCheck items={productBrand} selected={selected.productBrand ?? []} onChange={(vals) => onChange("productBrand", vals)}/>

      <Typography variant="h5" gutterBottom>Categories</Typography>
      <Box sx={{ borderBottom: "2px solid #ccc", mb: 2 }} />
      <FilterCheck items={category} selected={selected.category ?? []} onChange={(vals) => onChange("category", vals)}/>

      <Typography variant="h5" gutterBottom>Tags</Typography>
      <Box sx={{ borderBottom: "2px solid #ccc", mb: 2 }} />
      <FilterCheck items={tag} selected={selected.tag ?? []} onChange={(vals) => onChange("tag", vals)}/>

        <Typography variant="h5" gutterBottom>Flavors</Typography>
      <Box sx={{ borderBottom: "2px solid #ccc", mb: 2 }} />
      <FilterCheck items={flavors} selected={selected.flavors ?? []} onChange={(vals) => onChange("flavors", vals)}/>

      <Typography variant="h5" gutterBottom>Colors</Typography>
      <Box sx={{ borderBottom: "2px solid #ccc", mb: 2 }} />
      <FilterCheck items={colors} selected={selected.colors ?? []} onChange={(vals) => onChange("colors", vals)}/>

      <Typography variant="h5" gutterBottom>Eggless</Typography>
      <Box sx={{ borderBottom: "2px solid #ccc", mb: 2 }} />
      <FilterCheck items={eggless} selected={selected.eggless ?? []} onChange={(vals) => onChange("eggless", vals)}/>

      <Typography variant="h5" gutterBottom>Sugar</Typography>
      <Box sx={{ borderBottom: "2px solid #ccc", mb: 2 }} />
      <FilterCheck items={sugar} selected={selected.sugar ?? []} onChange={(vals) => onChange("sugar", vals)}/>

      <Typography variant="h5" gutterBottom>Glutten</Typography>
      <Box sx={{ borderBottom: "2px solid #ccc", mb: 2 }} />
      <FilterCheck items={glutten} selected={selected.glutten ?? []} onChange={(vals) => onChange("glutten", vals)}/>

      <Typography variant="h5" gutterBottom>Storage</Typography>
      <Box sx={{ borderBottom: "2px solid #ccc", mb: 2 }} />
      <FilterCheck items={storage} selected={selected.storage ?? []} onChange={(vals) => onChange("storage", vals)}/>
    </Grid>
  );
}
