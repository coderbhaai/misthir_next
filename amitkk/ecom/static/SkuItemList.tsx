import React from "react";
import { CartSkuProps } from "../types";
import ImageWithFallback from "@amitkk/basic/static/ImageWithFallback";
import { Card } from "@amitkk/components/ui/card";

interface SkuItemListProps {
  items: CartSkuProps[];
}

export default function SkuItemList({ items = [] }: SkuItemListProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="flex-1 overflow-y-auto w-full space-y-3">
      <ul className="space-y-3 p-0 m-0 list-none">
        {items.map((item) => {
          const product = item.product_id as any;

          return (
            <li key={item._id?.toString()} className="">
              <Card className="w-full p-3 shadow-none border border-border bg-card flex flex-col space-y-3 relative mb-2">
                <div className="flex items-center gap-3">
                  <ImageWithFallback img={product?.medias?.[0]} width={80} height={80} />
                  <div className="flex-grow">
                    <p className="text-sm font-semibold">{product?.name}</p>
                  </div>
                  {item.sale && item.sale < item.price ? (
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500 line-through">₹{item.price}</p>
                      <p className="text-sm font-bold text-red-600">₹{item.sale}</p>
                    </div>
                  ) : (
                    <p className="text-sm font-bold">₹{item.price}</p>
                  )}
                </div>

                <div className="flex items-center justify-between bg-muted/40 p-2 rounded-md">
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  {item.sale && item.sale < item.price ? (
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500 line-through">₹{item.quantity * item.price}</p>
                        <p className="text-sm font-bold text-red-600">₹{item.quantity * item.sale}</p>
                      </div>
                    ) : (
                      <p className="text-sm font-bold">₹{item.quantity * item.price}</p>
                    )}
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}