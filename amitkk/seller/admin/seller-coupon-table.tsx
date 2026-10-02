import { TableCell, TableRow } from '@amitkk/components/basic/table';
import MediaImage from '@amitkk/components/admin/table-image';
import { CouponProps } from '@amitkk/coupon/types';
import DateTimeFormat from '@amitkk/components/admin/date-format';
import { ActionCell } from '@amitkk/components/basic/ActionCell';
import { MediaProps } from '@amitkk/basic/types/media';

export interface DataProps extends CouponProps {
  selectedDataId: string | number | object | null;
}

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <>
      <TableRow>
        <TableCell>
          Usage Type - {row.usage_type}<br/>
          Discount Type - {row.discount_type}<br/>
          {row.name} - {row.code}
        </TableCell>
        <TableCell><DateTimeFormat value={row.valid_from}/>- <DateTimeFormat value={row.valid_to}/></TableCell>
        <TableCell><MediaImage media={row.media_id as MediaProps}/></TableCell>
        <TableCell>
          Discount - {row.discount}
          Sales - {row.sales}
        </TableCell>
        <ActionCell row={row} modelName="Coupon" onEdit={onEdit}/>
      </TableRow>
    </>
  );
}
