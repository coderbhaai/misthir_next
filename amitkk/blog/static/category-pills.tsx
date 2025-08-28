import { BlogMetaProps } from "@amitkk/blog/types/blog";
import { Box, Chip } from "@mui/material";

interface CategoryPillsProps {
  row?: BlogMetaProps[] | null;
  limit?: number | null;
}

export function CategoryPills({ row, limit = null }: CategoryPillsProps) {
  const itemsToRender = row && limit !== null ? row.slice(0, limit) : row || [];

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, py: 2, zIndex: 2 }}>
      {itemsToRender?.map((i) => (
        <Chip key={ i._id } label={ i.name } size="small" component="a" href={`/category/${i.url}`} clickable sx={{ fontSize: '0.65rem', fontWeight: 600, py: 0.5, px: 1.5, color: 'common.white', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', '&:hover': { backgroundColor: 'primary.main' } }}/>
      ))}
    </Box>
  );
}