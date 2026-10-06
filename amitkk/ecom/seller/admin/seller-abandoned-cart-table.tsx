import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { UserRowProps } from '@amitkk/basic/types/user';
import { CartProps } from '@amitkk/ecom/types';
import UserName from '@amitkk/basic/static/UserName';
import CartChargesDetails from '@amitkk/ecom/admin/CartChargesDetails';
import CartSkuDetails from '@amitkk/ecom/admin/CartSkuDetails';
import { ActionCell } from '@amitkk/components/basic/ActionCell';

export interface DataProps extends CartProps{
}

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <>
      <TableRow>
        <TableCell><UserName row={row.user_id as unknown as UserRowProps}/></TableCell>
        <TableCell>
          Total : {row.total}<br/>
          Payable : {row.payable_amount}<br/>
        </TableCell>
        <TableCell><CartSkuDetails skus={row.cartSkus}/></TableCell>
        <TableCell><CartChargesDetails charges={row.cartCharges}/></TableCell>
        <ActionCell row={row} modelName="Blogmeta" onEdit={onEdit}/>
      </TableRow>
    </>
  );
}
