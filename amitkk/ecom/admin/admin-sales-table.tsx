import { TableCell, TableRow } from '@amitkk/components/basic/table';
import DateTimeFormat from '@amitkk/components/admin/date-format';
import { SaleProps } from '@amitkk/ecom/types';
import UserRow from '@amitkk/basic/static/UserRow';
import { UserRowProps } from '@amitkk/basic/types/user';
import AdminRowActions from '@amitkk/components/admin/AdminRowActions';
import { ActionCell } from '@amitkk/components/basic/ActionCell';
import { renderDecimal } from '@amitkk/basic/utils/my-utils/shared-utils';

export interface DataProps extends SaleProps{
  totalSkus: number;
  totalProducts: number;
}

type Props = {
  row: DataProps;
};

export function AdminDataTable({ row }: Props) {
  return (
    <>
      <TableRow>
        <TableCell><UserRow row={row.seller_id as unknown as UserRowProps}/></TableCell>
        <TableCell>{row.name}</TableCell>
        <TableCell><DateTimeFormat value={row.valid_from}/>- <DateTimeFormat value={row.valid_to}/></TableCell>
        <TableCell>{row.type} - {row.type === "Amount Based" ? "₹" : null}{renderDecimal(row.discount)}{row.type === "Percent Based" ? "%" : null}</TableCell>
        <TableCell>{row.totalProducts}</TableCell>
        <TableCell>{row.totalSkus}</TableCell>
        <ActionCell row={row} modelName="Blog" usePopover/>
      </TableRow>

      <AdminRowActions id={row._id.toString()} actions={[
        { label: "Edit", href: `/admin/single-sales/${row._id}` },
      ]}/>
    </>
  );
}
