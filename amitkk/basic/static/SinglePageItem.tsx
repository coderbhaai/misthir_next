import Link from "next/link";
import { PageItemProps } from "@amitkk/basic/types";
import { Card } from "@amitkk/components/ui/card";

export function SinglePageItem({ i }: { i: PageItemProps }) {
  const pageUrl = i.url === '/' ? '/' : `/${i.url}`;
  return (
    <Card className="flex items-center border-none shadow-none">
      {i.media_id?.path && (
        <img src={i.media_id.path} alt={i.media_id.alt || i.name} className="h-20 w-[100px] rounded-lg object-cover"/>
      )}

      <div className="flex-1 pl-4">
        <Link href={pageUrl}><p className="text-sm font-semibold">{i.name}</p></Link>
      </div>
    </Card>
  );
}