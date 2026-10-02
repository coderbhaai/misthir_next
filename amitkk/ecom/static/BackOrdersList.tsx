"use client";

import ImageWithFallback from "@amitkk/basic/static/ImageWithFallback";
import { Card, CardContent } from "@amitkk/components/ui/card";
import { Button } from "@amitkk/components/button/button";
import { Iconify } from "@amitkk/basic/utils/my-utils/admin-utils";
import { useEcom } from "contexts/EcomContext";

interface BackOrdersListProps {
  backOrders: any[];
}

export default function BackOrdersList({ backOrders }: BackOrdersListProps) {
  if (!backOrders || backOrders.length === 0) return null;

  const { sendAction } = useEcom();

  const handleIncreaseBackorder = (backorderId: string, currentQty: number) => {
    sendAction("update_back_order_quantity", {
      action: "update_back_order_quantity",
      backorder_id: backorderId,
      quantity: currentQty + 1,
    });
  };

  const handleDecreaseBackorder = (backorderId: string, currentQty: number) => {
    if (currentQty <= 1) {
      handleDeleteBackorder(backorderId);
      return;
    }
    sendAction("update_back_order_quantity", {
      action: "update_back_order_quantity",
      backorder_id: backorderId,
      quantity: currentQty - 1,
    });
  };

  const handleDeleteBackorder = (backorderId: string) => {
    sendAction("delete_back_order", {
      action: "delete_back_order",
      backorder_id: backorderId,
    });
  };

  return (
    <div className="w-full mt-4 space-y-2">
      <h3 className="font-semibold text-sm text-amber-600 flex items-center gap-1.5 px-1">Back Ordered Items</h3>

      <ul className="space-y-3">
        {backOrders.map((item: any) => {
          const sku = item.sku_id;
          const product = item?.product_id;
          const price = sku?.price || 0;
          const quantity = item.quantity || 1;

          return (
            <li key={item._id}>
              <Card className="w-full shadow-none border border-amber-200 bg-amber-50/30">
                <CardContent className="p-3 relative">
                  <div className="flex items-center mb-3">
                    <div className="shrink-0">
                      <ImageWithFallback img={product?.medias?.[0]} width={80} height={80} url={product?.url ? `product/${product.url}` : null}/>
                    </div>

                    <div className="flex-1 min-w-0 ml-3">
                      <p className="font-bold text-sm truncate">{product?.name || sku?.title}</p>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded inline-block mt-1">Back Order</span>
                    </div>

                    <div className="flex items-center gap-1.5 ml-2 text-right">
                      <span className="font-bold text-sm">${price}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-7 w-7 text-xs bg-white" onClick={() => handleDecreaseBackorder(item._id, quantity)}>-</Button>
                      <span className="text-sm font-medium px-1">{quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7 text-xs bg-white" onClick={() => handleIncreaseBackorder(item._id, quantity)}>+</Button>
                    </div>

                    <span className="font-bold text-sm">${(quantity * price).toFixed(2)}</span>
                  </div>

                  <Iconify icon="Trash" className="h-4 w-4 text-muted-foreground hover:text-red-500 absolute top-2 right-2 cursor-pointer transition-colors" onClick={() => handleDeleteBackorder(item._id)}/>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}