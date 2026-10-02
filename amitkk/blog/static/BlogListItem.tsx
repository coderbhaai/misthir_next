import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@amitkk/components/ui/card";
import { SingleBlogProps } from "@amitkk/basic/types/shared";
import { getProp } from "@amitkk/basic/utils/my-utils/shared-utils";

export function BlogListItem({ blog }: { blog: SingleBlogProps }) {
  const media = getProp(blog, "media_id");

  return (
    <Card className="flex items-center border-none shadow-none">
      {media && (
        <div className="relative h-[80px] w-[100px] flex-shrink-0 overflow-hidden rounded-md">
          <Image src={media.path} alt={media.alt } fill className="object-cover"/>
        </div>
      )}
      <CardContent className="flex-1 p-0 pl-4">
        <Link href={`/${blog.url}`} className="font-normal hover:underline">
          <span className="text-base font-medium text-foreground">{blog.name}</span>
        </Link>
      </CardContent>
    </Card>
  );
}