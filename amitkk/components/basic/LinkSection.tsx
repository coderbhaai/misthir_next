import React from "react";
import Link from "next/link";

type LinkItem = {
  _id: string;
  name: string;
  url: string;
};

type LinkSectionProps<T> = {
  title: string;
  items?: T[];
  getHref: (item: T) => string;
  getLabel?: (item: T) => string;
};

export function LinkSection<T extends LinkItem>({ title, items = [], getHref, getLabel }: LinkSectionProps<T>) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <div className="mb-3">
  <p className="mb-2 font-semibold">
    {title}
  </p>

  <div className="flex flex-wrap gap-2">
    {items.map(
      (item, index) => (
        <Link
          key={`${title}-${item._id}-${index}`}
          href={getHref(item)}
          className="
            rounded-full
            px-4
            py-1
            text-sm
            transition
            bg-muted
            hover:bg-primary
            hover:text-white
          "
        >
          {getLabel
            ? getLabel(item)
            : item.name}
        </Link>
      )
    )}
  </div>
</div>
  );
}