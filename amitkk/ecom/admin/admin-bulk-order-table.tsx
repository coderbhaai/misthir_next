import { TableCell, TableRow } from '@amitkk/components/basic/table';
import Link from 'next/link';
import UserRow from '@amitkk/basic/static/UserRow';
import { UserRowProps } from '@amitkk/basic/types/user';
import { BulkProps } from '../types';
import { ActionCell } from '@amitkk/components/basic/ActionCell';

export interface DataProps extends BulkProps{
}

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <>
      <TableRow>
        <TableCell><UserRow row={row as unknown as UserRowProps}/></TableCell>
        <TableCell><UserRow row={row.seller_id as unknown as UserRowProps}/></TableCell>
        <TableCell>
          {row?.product_id && (row.product_id as any)?.name ? (
            <Link href={`/${(row.product_id as any)?.url}`} passHref>{(row.product_id as any)?.name}</Link>
          ) : ( "" )}
        </TableCell>
        <TableCell>{row.quantity}</TableCell>
        <TableCell>
          {row.user_remarks && ( <><strong>User:</strong> {row.user_remarks}<br/></> )}
          {row.admin_remarks && ( <><strong>Admin:</strong> {row.admin_remarks}<br/></> )}
          {row.vendor_remarks && ( <><strong>Vendor:</strong> {row.vendor_remarks}</> )}
        </TableCell>
        <ActionCell row={row} modelName="" onEdit={onEdit}/>
      </TableRow>
    </>
  );
}
