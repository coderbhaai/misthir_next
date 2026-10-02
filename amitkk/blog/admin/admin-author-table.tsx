import { TableCell, TableRow } from '@amitkk/components/basic/table';
import MediaImage from '@amitkk/components/admin/table-image';
import { ActionCell } from "@amitkk/components/basic/ActionCell";
import type { MediaProps } from '@amitkk/basic/types/media';
import type { SingleAuthorProps } from "../types";

type Props = {
  row: SingleAuthorProps;
  onEdit: (row: SingleAuthorProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <TableRow>
      <TableCell>{row.name}</TableCell>
      <TableCell><MediaImage media={row.media_id as MediaProps}/></TableCell>
      <ActionCell row={row} modelName="Author" onEdit={onEdit}/>
    </TableRow>
  );
}