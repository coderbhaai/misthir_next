import Image from "next/image";
import { TableCell, TableRow } from "@amitkk/components/basic/table";
import { isPopulated } from "@amitkk/basic/utils/my-utils/admin-utils";
import UserRow from "@amitkk/basic/static/UserRow";
import { WishlistProps } from "../types";
import { UserRowProps } from "@amitkk/basic/types/user";
import DateFormat from "@amitkk/components/admin/date-format";

export interface DataProps extends WishlistProps {}

type UserTableRowProps = {
  row: DataProps;
};

export function AdminDataTable({ row }: UserTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <UserRow row={row.user_id as unknown as UserRowProps} />
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-2">
          {row.wishlistCarts?.map((cart, index) => {
            const product = cart.product_id;
            const sku = cart.sku_id;
            const image = isPopulated(product)
              ? product.mediaHubs?.[0]?.media_id?.path
              : null;

            return (
              <div key={index} className="flex items-center gap-3">
                {image ? (
                  <Image
                    src={image}
                    alt={isPopulated(product) ? product.name : "Product"}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded bg-muted flex-shrink-0" />
                )}
                <span className="text-sm font-semibold truncate">
                  {isPopulated(product) && <>{product.name}</>}
                  {isPopulated(sku) && <>-{sku.name} </>}- {cart.quantity} Units
                </span>
              </div>
            );
          })}
        </div>
      </TableCell>
      <TableCell>
        {row.user_remarks && (
          <div>
            <strong>User : </strong>
            {row.user_remarks}
          </div>
        )}
        {row.admin_remarks && (
          <div>
            <strong>Admin : </strong>
            {row.admin_remarks}
          </div>
        )}
      </TableCell>
      <TableCell>{row.status}</TableCell>
      <TableCell>
        <DateFormat value={row.createdAt} />
      </TableCell>
    </TableRow>
  );
}