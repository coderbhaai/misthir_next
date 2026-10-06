import React from "react";
import { WishlistProps } from '@amitkk/wishlist/types';
import Image from "next/image";
import { isPopulated } from "@amitkk/basic/utils/my-utils/admin-utils";
import UserRow from "@amitkk/basic/static/UserRow";
import { UserRowProps } from "@amitkk/basic/types/user";
import DateFormat from "@amitkk/components/admin/date-format";
import { SingleProductItemProps, SkuProps } from '@amitkk/product/types';
import { Package, Calendar, MessageSquare, ShieldAlert } from "lucide-react";

type Props = {
  row: WishlistProps;
};

export function WishlistCardView({ row }: Props) {
  return (
    <div className="col-span-12 md:col-span-4 card p-3">
      <div className="space-y-4">        
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs text-gray-500">
            <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                <UserRow row={row.user_id as unknown as UserRowProps} />
            </div>
            <div>
                <div className="flex items-center gap-1.5 font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">
                    <Package className="w-3.5 h-3.5 text-blue-600"/>
                    <span>{row.status || "Active"}</span>
                </div>
                {row.createdAt && (
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <DateFormat value={row.createdAt} />
                    </div>
                )}
            </div>
        </div>
        
        <div className="space-y-2">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Wishlist Items</h5>
            <div className="flex flex-col gap-2.5">
                {row.wishlistCarts?.map((cart, index) => {
                    const product = cart.product_id as SingleProductItemProps;
                    const sku = cart.sku_id as SkuProps;
                    const mediaHub = product?.mediaHubs?.[0];
                    const mediaIdObj = typeof mediaHub?.media_id === "object" ? mediaHub.media_id : null;
                    const image = Array.isArray(mediaIdObj) ? (mediaIdObj[0] as any)?.path : (mediaIdObj as any)?.path;              

                return (
                    <div key={index} className="flex items-center gap-3 bg-gray-50/30 p-2.5 rounded-xl border border-gray-100">
                        <Image src={image} alt={product?.name || "Product"} width={48} height={48} className="w-12 h-12 rounded-lg object-cover flex-shrink-0"/>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold truncate text-gray-800">
                                {isPopulated(product) && <>{product.name}</>}
                                {isPopulated(sku) && <> - {sku?.name} </>}
                            </span>
                            <span className="text-xs text-muted-foreground mt-0.5 font-medium">{cart.quantity} Units</span>
                        </div>
                    </div>
                );
                })}
            </div>
        </div>

        {(row.user_remarks || row.admin_remarks) && (
          <div className="space-y-1.5 text-xs bg-amber-50/40 p-3 rounded-xl border border-amber-100/50 text-gray-600">
            {row.user_remarks && ( <div><strong>User: </strong>{row.user_remarks}</div> )}
            {row.admin_remarks && ( <div><strong>Admin: </strong>{row.admin_remarks}</div> )}
          </div>
        )}
      </div>
    </div>
  );
}