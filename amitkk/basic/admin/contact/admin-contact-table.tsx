import { TableCell, TableRow } from '@amitkk/components/basic/table';
import UserRow from '@amitkk/basic/static/UserRow';
import type { UserRowProps } from '@amitkk/basic/types/user';
import { ContactProps } from '@amitkk/basic/types';
import { EditCell } from '@amitkk/components/basic/EditCell';

export interface DataProps extends ContactProps {
  _id: string;
};

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <TableRow>
      <TableCell><UserRow row={row as UserRowProps}/></TableCell>
      <TableCell>{row.status}</TableCell>
      <TableCell>
        {row.user_remarks ? `User: ${row.user_remarks}` : null }<br/>
        {row.admin_remarks ? `Admin: ${row.admin_remarks}` : null }
        </TableCell>
      <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
      <EditCell onClick={() => onEdit(row)}/>
    </TableRow>
  );
}
