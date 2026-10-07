import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { OrderGuideProductsProps, OrderGuideProps } from "@amitkk/wishlist/types";
import { SingleProductItemProps, SkuProps } from '@amitkk/product/types';
import { isPopulated } from "@amitkk/basic/utils/my-utils/admin-utils";
import DateFormat from "@amitkk/components/admin/date-format";
import UserRow from '@amitkk/basic/static/UserRow';
import { UserRowProps } from '@amitkk/basic/types/user';

type Props = {
  row: OrderGuideProps;
};

export function OrderGuideTableRow({ row }: Props) {
  return (
    <TableRow>
        <TableCell><UserRow row={row.user_id as UserRowProps}/></TableCell>
        <TableCell className="font-medium text-gray-900">{row.name}</TableCell>
        <TableCell>
            <div className="flex flex-col gap-1.5 py-1">
            {row.products?.length ? (
                row.products.map((item: OrderGuideProductsProps, index: number) => {
                const product = item.product_id as unknown as SingleProductItemProps;
                const sku = item.sku_id as unknown as SkuProps;

                return (
                    <div key={index} className="text-xs flex items-center gap-2">
                    <span className="font-semibold text-gray-800">
                        {isPopulated(product) ? product.name : "Product"}
                    </span>
                    {isPopulated(sku) && (
                        <span className="text-gray-500">- {sku.name}</span>
                    )}
                    <span className="text-muted-foreground">({item.quantity} Units)</span>
                    </div>
                );
                })
            ) : (
                <span className="text-xs text-gray-400 italic">No products</span>
            )}
            </div>
        </TableCell>
        <TableCell><DateFormat value={row.createdAt}/></TableCell>
    </TableRow>
  );
}