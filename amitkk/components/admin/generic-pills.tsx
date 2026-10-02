import Link from "next/link";
import { Badge } from "@amitkk/components/ui/badge";

interface PillItem {
  _id: string;
  name: string;
  url?: string;
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
  clickable?: boolean;
  [key: string]: any;
}

export function GenericPills({ 
  items, 
  limit = null, 
  basePath = "",
  size = 'small',
  color = '#fff',
  backgroundColor = 'rgba(0,0,0,0.7)',
  hoverColor = 'primary.main',
  sx = {},
  clickable = true,
  row,
  ...rest 
}: GenericPillsProps) {
  const actualItems = items || row || [];
  const itemsToRender = limit !== null ? actualItems.slice(0, limit) : actualItems;

  if (itemsToRender.length === 0) { return null; }

  return (
    <div className="flex flex-wrap gap-2 relative z-10"{...rest}>
      {itemsToRender.map(
        (item: PillItem) => {
          const hasUrl = !!item.url;
          const href = basePath && item.url ? `${basePath}/${item.url}` : item.url;

          const content = (
            <Badge>{item.name}</Badge>
          );

          if (hasUrl && clickable) {
            return (
              <Link key={item._id.toString()} href={href!} target="_blank" className="hover:opacity-80">{content}</Link>
            );
          }

          return (
            <div key={item._id.toString()}>{content}</div>
          );
        }
      )}
    </div>
  );
}