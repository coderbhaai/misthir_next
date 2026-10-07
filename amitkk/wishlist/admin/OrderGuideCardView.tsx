import React from "react";
import { OrderGuideProps, OrderGuideProductsProps } from "@amitkk/wishlist/types";
import { SingleProductItemProps, SkuProps } from "@amitkk/product/types";
import { isPopulated } from "@amitkk/basic/utils/my-utils/admin-utils";
import DateFormat from "@amitkk/components/admin/date-format";
import { Package, Calendar, Layers } from "lucide-react";
import UserRow from "@amitkk/basic/static/UserRow";
import { UserRowProps } from "@amitkk/basic/types/user";

type Props = {
  row: OrderGuideProps;
};

export function OrderGuideCardView({ row }: Props) {
  return (
    <div className="col-span-12 md:col-span-4 card p-3">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs text-gray-500">
            <UserRow row={row.user_id as UserRowProps}/>
            <div>
                <div className="flex items-center gap-1.5 font-semibold text-gray-800 text-sm">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span>{row.name}</span>
                </div>
                {row.createdAt && (
                    <div className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <DateFormat value={row.createdAt} />
                    </div>
                )}
            </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <Layers className="w-3.5 h-3.5" />
            <span>Products ({row.products?.length || 0})</span>
          </div>
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
            {row.products?.length ? (
              row.products.map((item: OrderGuideProductsProps, idx: number) => {
                const product = item.product_id as unknown as SingleProductItemProps;
                const sku = item.sku_id as unknown as SkuProps;

                return (
                  <div key={idx} className="bg-gray-50/60 p-2.5 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-gray-800">{isPopulated(product) ? product.name : "Product"}</span>
                      {isPopulated(sku) && ( <span className="text-gray-500">SKU: {sku.name}</span> )}
                    </div>
                    <div className="bg-blue-50 text-blue-700 font-semibold px-2 py-1 rounded-lg">{item.quantity} Units</div>
                  </div>
                );
              })
            ) : ( <div className="text-xs text-gray-400 italic py-2">No products added</div> )}
          </div>
        </div>
      </div>
    </div>
  );
}