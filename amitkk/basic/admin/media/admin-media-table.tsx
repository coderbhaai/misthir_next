import { TableCell, TableRow } from '@amitkk/components/basic/table';
import type { SingleMediaProps } from '@amitkk/basic/types/media';
import { EditCell } from '@amitkk/components/basic/EditCell';

type Props = {
  row: SingleMediaProps;
  onEdit: (row: SingleMediaProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <TableRow>
      <TableCell><img src={typeof row.media_id === 'object' && 'path' in row.media_id? row.media_id.path: row.path || '/placeholder.jpg'} style={{ width: "48px", height: "48px", objectFit: "cover" }} /></TableCell>
      <TableCell>{row.alt}</TableCell>
      <TableCell>{row.path}</TableCell>
      <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
      <EditCell onClick={() => onEdit(row)} />
    </TableRow>
  );
}
