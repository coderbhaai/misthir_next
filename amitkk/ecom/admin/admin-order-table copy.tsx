import { TableCell, TableRow } from '@amitkk/components/basic/table';
import UserRow from '@amitkk/basic/static/UserRow';
import { UserRowProps } from '@amitkk/basic/types/user';
import { OrderProps } from '@amitkk/ecom/types';
import CartChargesDetails from './CartChargesDetails';
import CartSkuDetails from './CartSkuDetails';
import { ActionCell } from '@amitkk/components/basic/ActionCell';
import AdminRowActions from '@amitkk/components/admin/AdminRowActions';

export interface DataProps extends OrderProps{
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
          Payable : {row.paid}<br/>
        </TableCell>

        <TableCell><CartSkuDetails skus={row.orderSkus}/></TableCell>
        <TableCell><CartChargesDetails charges={row.orderCharges}/></TableCell>
        <ActionCell row={row} modelName="Blogmeta" usePopover/>
      </TableRow>

      <AdminRowActions id={row._id.toString()} actions={[
        { label: "Edit", href: `/order/${row._id}` },
      ]}/>
    </>
  );
}
