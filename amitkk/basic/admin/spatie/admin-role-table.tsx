import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { ActionCell } from "@amitkk/components/basic/ActionCell";
import { SingleRoleProps } from "@amitkk/basic/types/spatie";

type Props = {
  row: SingleRoleProps;
  onEdit: (row: SingleRoleProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <TableRow>
      <TableCell>{row.name}</TableCell>
      <TableCell>
        {(row.permissionsAttached ?? [])?.map((m, i, arr) => (
          <span key={m._id} style={{ marginRight: '10px' }}>
            {m.permission_id?.name ?? ''}
            {i < arr.length - 1 && ','}
          </span>
        ))}
      </TableCell>
      <ActionCell row={row} modelName="SpatieRole" onEdit={onEdit}/>
    </TableRow>
  );
}
