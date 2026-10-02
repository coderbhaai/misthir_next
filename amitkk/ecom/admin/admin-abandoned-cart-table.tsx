import { TableCell, TableRow } from '@amitkk/components/basic/table';
import UserRow from '@amitkk/basic/static/UserRow';
import { CartProps } from '@amitkk/ecom/types';
import CartChargesDetails from './CartChargesDetails';
import CartSkuDetails from './CartSkuDetails';
import AdminRowActions from '@amitkk/components/admin/AdminRowActions';
import { ActionCell } from '@amitkk/components/basic/ActionCell';
import { UserRowProps } from '@amitkk/basic/types/user';

export interface DataProps extends CartProps{
}

type Props = {
  row: DataProps;
};

export function AdminDataTable({ row }: Props) {
  return (
    <>
      <TableRow>
        <TableCell><UserRow row={row.user_id as unknown as UserRowProps}/></TableCell>
        <TableCell>
          Total : {row.total}<br/>
          Payable : {row.payable_amount}<br/>
        </TableCell>

        <TableCell><CartSkuDetails skus={row.cartSkus}/></TableCell>
        <TableCell><CartChargesDetails charges={row.cartCharges}/></TableCell>
        <ActionCell row={row} show_status={false} usePopover/>
      </TableRow>

      <AdminRowActions id={row._id.toString()} actions={[
        { label: "Edit", href: `/admin/abandoned-cart/${row._id}` },
      ]}/>
    </>
  );
}
