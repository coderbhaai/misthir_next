import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { ActionCell } from "@amitkk/components/basic/ActionCell";
import { SinglePermissionProps } from '@amitkk/basic/types/spatie';

type Props = {
  row: SinglePermissionProps;
  onEdit: (row: SinglePermissionProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <TableRow>
      <TableCell>{row.name}</TableCell>
      <TableCell>
        {(row.rolesAttached ?? [])?.map((m, i, arr) => (
          <span key={m._id} style={{ marginRight: '10px' }}>
            {m.role_id?.name ?? ''}
            {i < arr.length - 1 && ','}
          </span>
        ))}
      </TableCell>
      <ActionCell row={row} modelName="SpatiePermission" onEdit={onEdit}/>
    </TableRow>
  );
}