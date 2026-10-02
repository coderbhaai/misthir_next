import { BlogMetaProps } from "@amitkk/basic/types/shared";

interface CategoryPillsProps {
  row?: BlogMetaProps[] | null;

  limit?: number | null;
}

export function CategoryPills({row, limit = null}: CategoryPillsProps) {
  const items = row ? limit ? row.slice(0, limit) : row : [];

  return (
    <div className="flex flex-wrap gap-2 py-2">
      {items.map((i) => (
        <a key={i._id} href={`/category/${i.url}`} className="rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur hover:bg-primary">{i.name}</a>
      ))}
    </div>
  );
}