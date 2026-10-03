import { Button } from "@amitkk/components/button/button";
import Image from "next/image";
import Link from "next/link";

interface SingleProductItemProps {
  row: any
}

export function SingleProductItem({ row }: SingleProductItemProps) {
  const hasMultipleImages = row.mediaHubs && row.mediaHubs.length > 1;
  const firstImage = row.mediaHubs?.[0]?.media_id?.path || "/images/static/default.jpg";
  const secondImage = hasMultipleImages ? row.mediaHubs?.[1]?.media_id?.path : firstImage;

  return (
    <div className="col-span-12 md:col-span-4 group">
      <div className="relative overflow-hidden rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,0.2)] cursor-pointer">
        <Link href={`/${row.url}`} className="block relative">
          <div className="relative cursor-pointer">
            <div className="relative w-full h-[350px] transition-all duration-500 ease-in-out group-hover:opacity-0 group-hover:scale-105">
              <Image src={firstImage} alt={row.mediaHubs?.[0]?.alt || row.name} fill className="object-cover" />
            </div>
            {hasMultipleImages && (
              <div className="absolute top-0 left-0 w-full h-[350px] opacity-0 scale-105 transition-all duration-500 ease-in-out group-hover:opacity-100 group-hover:scale-100">
                <Image src={secondImage} alt={row.mediaHubs?.[1]?.alt || row.name} fill className="object-cover" />
              </div>
            )}

            <div className="absolute w-full bottom-0 left-0 right-0 text-black p-4 text-center transition-all duration-300 ease-in-out backdrop-blur-md group-hover:opacity-0 group-hover:translate-y-full">
              <p className="text-center text-white font-medium">{row.name}</p>
              {row.dietary_type && (
                <p className="text-white absolute top-1 right-2 text-xs font-semibold">{row.dietary_type}</p>
              )}
            </div>
          </div>
        </Link>

        <Link href={`/${row.url}`}>
          <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center opacity-0 translate-y-5 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:translate-y-0 text-white p-4">
            {row.weight && <p className="mb-2 text-sm">{row.weight}</p>}
            <div className="absolute bottom-4">
              <Button variant="secondary">Check Product</Button>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}