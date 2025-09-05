import { Box, Chip } from "@mui/material";
import { Types } from "mongoose";

interface PillItem {
  _id: Types.ObjectId | string;
  name: string;
  url?: string; // Make URL optional
  color?: string;
  backgroundColor?: string;
}

interface GenericPillsProps {
  items?: PillItem[] | null;
  limit?: number | null;
  basePath?: string;
  size?: 'small' | 'medium';
  color?: string;
  backgroundColor?: string;
  hoverColor?: string;
  sx?: object;
  clickable?: boolean; // New prop to control click behavior
  [key: string]: any;
}

export function GenericPills({ 
  items, 
  limit = null, 
  basePath = "",
  size = 'small',
  color = 'common.white',
  backgroundColor = 'rgba(0,0,0,0.7)',
  hoverColor = 'primary.main',
  sx = {},
  clickable = true, // Default to clickable
  row,
  ...rest 
}: GenericPillsProps) {
  const actualItems = items || row || [];
  const itemsToRender = limit !== null ? actualItems.slice(0, limit) : actualItems;

  if (itemsToRender.length === 0) { return null; }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, zIndex: 2, ...sx }} {...rest}>
      {itemsToRender.map((item: PillItem) => {
        // Determine if the chip should be clickable
        const hasUrl = !!item.url;
        const href = basePath && item.url ? `${basePath}/${item.url}` : item.url;
        
        return (
          <Chip 
            key={item._id.toString()} 
            label={item.name} 
            size={size}
            component={hasUrl && clickable ? "a" : "div"} // Use div if not clickable
            {...(hasUrl && clickable && { 
              target: "_blank",
              href: href
            })}
            clickable={hasUrl && clickable}
            sx={{ 
              fontSize: '0.65rem', 
              fontWeight: 600, 
              py: 0.5, 
              px: 1.5, 
              color: item.color || color,
              backgroundColor: item.backgroundColor || backgroundColor,
              backdropFilter: 'blur(4px)', 
              cursor: hasUrl && clickable ? 'pointer' : 'default',
              '&:hover': hasUrl && clickable ? { 
                backgroundColor: hoverColor 
              } : {}
            }}
          />
        );
      })}
    </Box>
  );
}