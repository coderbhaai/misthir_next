import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { Iconify } from "@amitkk/basic/utils/my-utils/admin-utils";
import type { UserRowProps } from '@amitkk/basic/types/user';
import UserRow from '@amitkk/basic/static/UserRow';
import AdminModulePill from '@amitkk/basic/static/AdminModulePill';
import { LeadProps } from '@amitkk/basic/types';

type Props = {
  row: LeadProps;
  onEdit: (row: LeadProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <>
      <TableRow>
        <TableCell><UserRow row={row as UserRowProps}/></TableCell>
        <TableCell>
          <AdminModulePill items={row.leadModules || []} getId={m => m.module_id._id} getName={m => m.module_id.name} getUrl={m => m.module_id.url}/>
        </TableCell>
        <TableCell>{row.status}</TableCell>
        <TableCell>
          {row.user_remarks && ( <p><strong>User: </strong>{row.user_remarks}</p>)}
          {row.admin_remarks && ( <p><strong>Admin: </strong>{row.admin_remarks}</p>)}
        </TableCell>
        <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
        <TableCell align='right'><Iconify icon='Edit' onClick={() => onEdit(row)}/></TableCell>
      </TableRow>
    </>
  );
}
