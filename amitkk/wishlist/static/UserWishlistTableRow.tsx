import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { WishlistProps } from '@amitkk/wishlist/types';
import Image from "next/image";
import { isPopulated } from "@amitkk/basic/utils/my-utils/admin-utils";
import DateFormat from "@amitkk/components/admin/date-format";
import { SingleProductItemProps } from '@amitkk/product/types';
import { SkuProps } from '@amitkk/product/types';

type Props = {
  row: WishlistProps;
};

export function UserWishlistTableRow({ row }: Props) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-col gap-2">
          {row.wishlistCarts?.map((cart, index) => {
            const product = cart.product_id as SingleProductItemProps;
            const sku = cart.sku_id as SkuProps;
            const mediaHub = product?.mediaHubs?.[0];
            const mediaIdObj = typeof mediaHub?.media_id === "object" ? mediaHub.media_id : null;
            const image = Array.isArray(mediaIdObj) ? (mediaIdObj[0] as any)?.path : (mediaIdObj as any)?.path;

            return (
              <div key={index} className="flex items-center gap-3">
                {image ? (
                  <Image src={image} alt={product?.name || "Product"} width={64} height={64} className="w-16 h-16 rounded object-cover flex-shrink-0"/>
                ) : (
                  <div className="w-16 h-16 rounded bg-muted flex-shrink-0" />
                )}
                <span className="text-sm font-semibold truncate">
                  {isPopulated(product) && <>{product.name} </>}
                  {isPopulated(sku) && <>- {sku.name} </>}
                  ({cart.quantity} Units)
                </span>
              </div>
            );
          })}
        </div>
      </TableCell>
      <TableCell>
        {row.user_remarks && ( <div><strong>User : </strong>{row.user_remarks}</div> )}
        {row.admin_remarks && ( <div><strong>Admin : </strong>{row.admin_remarks}</div> )}
      </TableCell>
      <TableCell>{row.status}</TableCell>
      <TableCell><DateFormat value={row.createdAt}/></TableCell>
    </TableRow>
  );
}