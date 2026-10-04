import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { SaleProps } from '@amitkk/sales/types';
import UserRow from '@amitkk/basic/static/UserRow';
import { UserRowProps } from '@amitkk/basic/types/user';
import AdminRowActions from '@amitkk/components/admin/AdminRowActions';
import { ActionCell } from '@amitkk/components/basic/ActionCell';
import { DiscountDisplay } from '@amitkk/coupon/static/DiscountDisplay';
import { DateRangeDisplay } from '@amitkk/components/basic/DateRangeBadge';

export interface DataProps extends SaleProps{
  totalSkus: number;
  totalProducts: number;
}

type Props = {
  row: DataProps;
};

export function AdminDataTable({ row }: Props) {

  console.log("ROW", row)
  return (
    <>
      <TableRow>
        <TableCell><UserRow row={row.seller_id as unknown as UserRowProps}/></TableCell>
        <TableCell>{row.name}</TableCell>
        <TableCell><DateRangeDisplay validFrom={row.valid_from} validTo={row.valid_to}/></TableCell>
        <TableCell>
          Discount Type - {row.discount_type}<br/>
          <DiscountDisplay type={row.discount_type} value={row.discount ?? 0} /><br/>
          Sales - ₹{row.sales}
        </TableCell>
        <ActionCell row={row} modelName="Sale" usePopover/>
      </TableRow>

      <AdminRowActions id={row._id.toString()} actions={[
        { label: "Edit", href: `/admin/add-update-sales/${row._id}` },
      ]}/>
    </>
  );
}
