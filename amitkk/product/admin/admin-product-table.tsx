"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { Iconify } from '@amitkk/basic/utils/my-utils/admin-utils';
import Link from 'next/link';
import { ProductFilterBadges } from '../static/ProductFilterBadges';
import { MetaRow } from '@amitkk/components/admin/MetaRow';
import { ProductFilterProps, SingleProductItemProps } from '../types';
import { MediaCards } from '@amitkk/components/admin/MediaCards';
import StatusSwitch from '@amitkk/components/admin/status-switch';
import UserRow from '@amitkk/basic/static/UserRow';
import { UserRowProps } from '@amitkk/basic/types/user';
import SkuCardList from '../static/SkuCardList';

type Props = {
  row: SingleProductItemProps;
};

export function AdminDataTable({ row }: Props) {
  const [openPopover, setOpenPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const togglePopover = useCallback(() => { setOpenPopover((prev) => !prev); }, []);
  const handleClosePopover = useCallback(() => { setOpenPopover(false); }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpenPopover(false);
      }
    };

    if (openPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openPopover]);

  return (
      <div className="bg-card text-card-foreground border border-border rounded-xl p-4 shadow-sm mb-5">
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div>
            <Link href={`/${row.url}`} target="_blank" className="font-semibold text-lg hover:underline text-primary">{row.name}</Link>
            <p className="text-sm text-muted-foreground">{row.url}</p>
            <ProductFilterBadges filter={row.filter as ProductFilterProps} />
          </div>

          <div className="relative" ref={popoverRef}>
            <div className="flex items-start justify-between">
              <UserRow row={row.seller_id as unknown as UserRowProps}/>
              <button type="button" onClick={togglePopover} className="p-2 rounded-md hover:bg-accent text-muted-foreground transition-colors" aria-label="Edit Options">
                <Iconify icon="Edit" className="w-5 h-5" />
              </button>
            </div>

            {openPopover && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-popover text-popover-foreground rounded-md border border-border shadow-md z-50 p-1 flex flex-col gap-0.5 bg-white">
                <Link target="_blank" href={`/admin/add-update-product/${row._id.toString()}`} onClick={handleClosePopover} className="flex items-center gap-2 px-2.5 py-3 rounded-md hover:bg-accent transition-colors">
                  <Iconify icon="Edit" className="w-4 h-4" /> Edit
                </Link>
                <Link target="_blank" href={`/admin/faqs/Product/${row._id}`} onClick={handleClosePopover} className="flex items-center gap-2 px-2.5 py-3 rounded-md hover:bg-accent transition-colors">
                  <Iconify icon="Edit" className="w-4 h-4" /> FAQs
                </Link>
                <Link target="_blank" href={`/admin/testimonials/Product/${row._id}`} onClick={handleClosePopover} className="flex items-center gap-2 px-2.5 py-3 rounded-md hover:bg-accent transition-colors">
                  <Iconify icon="Edit" className="w-4 h-4" /> Testimonial
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
            {["Type", "Category", "Tag"].map((module) => ( 
              <MetaRow key={module} label={module} items={row.metas?.filter((m) => m.module === module)} basePath="/products/meta"/> 
            ))}
            <MetaRow label="Brands" items={row.brands} basePath="/products/brand" />
            {["Storage"].map((module) => ( 
              <MetaRow key={module} label={module} items={row.features?.filter((m) => m.module === module)} basePath="/products/feature"/> 
            ))}
            <MetaRow label="Ingridients" items={row.ingridients}/>
          </div>

          <SkuCardList skus={row.sku ?? []}/>          
          <MediaCards items={row.mediaHubs} height={50} width={60}/>
          <div className="mt-4">
            <StatusSwitch id={row._id.toString()} status={row.status} modelName="Product" />
          </div>
        </div>
      </div>
  );
}