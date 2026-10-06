import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { ActionCell } from '@amitkk/components/basic/ActionCell';
import { SingleMediaProps } from '@amitkk/basic/types/media';

type Props = {
  row: SingleMediaProps;
  onEdit: (row: SingleMediaProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <>
      <TableRow>
        <TableCell><img src={typeof row.media_id === 'object' && 'path' in row.media_id? row.media_id.path: row.path || '/placeholder.jpg'} style={{ width: "48px", height: "48px", objectFit: "cover" }} /></TableCell>
        <TableCell>{row.path}</TableCell>
        <ActionCell row={row} modelName="Blogmeta" onEdit={onEdit}/>
      </TableRow>
    </>
  );
}
