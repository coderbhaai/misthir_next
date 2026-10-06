import { TableCell, TableRow } from '@amitkk/components/basic/table';
import CartSkuDetails from '@amitkk/ecom/admin/CartSkuDetails';
import CartChargesDetails from '@amitkk/ecom/admin/CartChargesDetails';
import { OrderProps } from '@amitkk/ecom/types';

type Props = {
  row: OrderProps;
};

export function OrderTableRow({ row }: Props) {
  return (
    <>
      <TableRow>
        <TableCell><CartSkuDetails skus={row.orderSkus}/></TableCell>
        <TableCell>
          Total : {row.total}<br/>
          Paid : {row.paid}
        </TableCell>
        <TableCell><CartChargesDetails charges={row.orderCharges}/></TableCell>
      </TableRow>
    </>
  );
}