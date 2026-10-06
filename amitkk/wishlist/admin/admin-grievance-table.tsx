import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { Iconify, isPopulated } from '@amitkk/basic/utils/my-utils/admin-utils';
import UserRow from '@amitkk/basic/static/UserRow';
import { GrievanceProps } from '../types';
import DateFormat from '@amitkk/components/admin/date-format';
import { UserRowProps } from '@amitkk/basic/types/user';

export interface DataProps extends GrievanceProps{
}

type UserTableRowProps = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: UserTableRowProps) {
  return (
    <>
      <TableRow>
        <TableCell><UserRow row={row.user_id as unknown as UserRowProps}/></TableCell>
        <TableCell>
          {row.user_remarks && ( <><strong>User : </strong>{row.user_remarks}</> )}
          {row.admin_remarks && ( <><strong>Admin : </strong>{row.admin_remarks}</> )}
        </TableCell>
        <TableCell>{row.status}</TableCell>
        <TableCell><DateFormat value={row.createdAt} /></TableCell>
        <TableCell align='right'><Iconify icon='Edit' onClick={() => onEdit(row)}/></TableCell>
      </TableRow>
    </>
  );
}