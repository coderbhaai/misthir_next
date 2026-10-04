import { TableCell, TableRow } from '@amitkk/components/basic/table';
import MediaImage from '@amitkk/components/admin/table-image';
import { CouponProps } from '@amitkk/coupon/types';
import { ActionCell } from '@amitkk/components/basic/ActionCell';
import { MediaProps } from '@amitkk/basic/types/media';
import UserRow from '@amitkk/basic/static/UserRow';
import { UserRowProps } from '@amitkk/basic/types/user';
import { DiscountDisplay } from '../static/DiscountDisplay';
import { DateRangeDisplay } from '@amitkk/components/basic/DateRangeBadge';

export interface DataProps extends CouponProps {
  selectedDataId: string | number | object | null;
}

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  const discountSymbol = row.discount_type === "Percent Based" ? "%" : "₹";
  return (
    <>
      <TableRow>
        <TableCell><UserRow row={row.seller_id as UserRowProps}/></TableCell>
        <TableCell>
          {row.name} - {row.coupon_code}<br/>
          Coupon By - {row.coupon_by}<br/>
          Usage Type - {row.usage_type}<br/>
        </TableCell>
        <TableCell><DateRangeDisplay validFrom={row.valid_from} validTo={row.valid_to}/></TableCell>
        <TableCell><MediaImage media={row.media_id as MediaProps}/></TableCell>
        <TableCell>
          Discount Type - {row.discount_type}<br/>
          <DiscountDisplay type={row.discount_type} value={row.discount} /><br/>
          Sales - ₹{row.sales}
        </TableCell>
        <ActionCell row={row} modelName="Coupon" onEdit={onEdit}/>
      </TableRow>
    </>
  );
}
