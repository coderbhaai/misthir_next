import { TableCell, TableRow } from '@amitkk/components/basic/table';
import UserRow from '@amitkk/basic/static/UserRow';
import { UserProps, UserRowProps } from '@amitkk/basic/types/user';
import { ActionCell } from '@amitkk/components/basic/ActionCell';
import AdminRowActions from '@amitkk/components/admin/AdminRowActions';

type Props = {
  row: UserProps;
  onEdit: (row: UserProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <>
      <TableRow>
        <TableCell><UserRow row={row as unknown as UserRowProps}/></TableCell>
        <TableCell>
          {(row.roles ?? [])?.map((m, i, arr) => (
            <span key={m._id} style={{ marginRight: '10px' }}>
              {m?.name ?? ''} {i < arr.length - 1 ? ',' : ''}
            </span>
          ))}
        </TableCell>
        <TableCell>
          {(row.permissions ?? [])?.map((m, i, arr) => (
            <span key={m._id} style={{ marginRight: '10px' }}>
              {m.name ?? ''} {i < arr.length - 1 ? ',' : ''}
            </span>
          ))}
        </TableCell>
        <ActionCell row={row} modelName="User" usePopover/>
      </TableRow>

      <AdminRowActions 
        id={row._id.toString()} 
        actions={[
          { label: "Edit", onClick: () => onEdit(row) },
          { label: "Commission", href: `/admin/commission/${row._id}` },
          // { label: "All Commissions", href: `/admin/commission/${row._id}` },
        ]}
      />
    </>
  );
}