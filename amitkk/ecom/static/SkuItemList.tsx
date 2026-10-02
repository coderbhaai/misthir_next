import React from "react";
import { SkuItem } from "../types";
import ImageWithFallback from "@amitkk/basic/static/ImageWithFallback";
import { Card } from "@amitkk/components/ui/card";

interface SkuItemListProps {
  items: SkuItem[];
}

export default function SkuItemList({ items = [] }: SkuItemListProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="flex-1 overflow-y-auto w-full space-y-3">
      <ul className="space-y-3 p-0 m-0 list-none">
        {items.map((item) => {
          const sku = item.sku_id as any;
          const product = item.product_id as any;
          const price = Number(sku?.price ?? 0);
          const quantity = Number(item.quantity ?? 0);
          const totalItemPrice = quantity * price;

          return (
            <li key={item._id?.toString()} className="">
              <Card className="w-full p-3 shadow-none border border-border bg-card flex flex-col space-y-3 relative mb-2">
                <div className="flex items-center gap-3">
                  <ImageWithFallback img={product?.medias?.[0]} width={80} height={80} />
                  <div className="flex-grow">
                    <p className="text-sm font-semibold">{product?.name ?? sku?.name}</p>
                  </div>
                  <p className="text-sm font-bold">₹{price}</p>
                </div>

                <div className="flex items-center justify-between bg-muted/40 p-2 rounded-md">
                  <p className="text-xs text-muted-foreground">Qty: {quantity}</p>
                  <p className="text-sm font-bold">₹{totalItemPrice}</p>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}