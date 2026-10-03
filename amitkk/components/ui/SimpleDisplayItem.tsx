"use client";
import Link from "next/link";
import Image from "next/image";

interface SimpleDisplayItemProps {
  name: string;
  url: string;
  image?: string;
}

export default function SimpleDisplayItem({ name, url, image }: SimpleDisplayItemProps) {
  return (
    <div className="rounded-md border overflow-hidden p-3 text-center">
      <Link href={`${url}`}>
        <Image src={image || "/images/static/default.jpg"} alt={name} width={80} height={80} style={{ height: "60px", width: "auto", margin: "0 auto" }}/>
        <p className="mt-3">{name}</p>
      </Link>
    </div>
  );
}