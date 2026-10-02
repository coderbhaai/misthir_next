import MediaImage from '@amitkk/components/admin/table-image';
import UserRow from '@amitkk/basic/static/UserRow';
import type { UserRowProps } from '@amitkk/basic/types/user';
import { ClientProps } from '@amitkk/basic/types';
import type { MediaProps } from '@amitkk/basic/types/media';
import { ActionCell } from "@amitkk/components/basic/ActionCell";
import { TableCell, TableRow } from '@amitkk/components/basic/table';

export interface DataProps extends ClientProps {
};

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <TableRow>
      <TableCell><UserRow row={row as UserRowProps}/>{row.role}</TableCell>
      <TableCell>{row.brand}</TableCell>
      <TableCell><MediaImage media={row.media_id as MediaProps}/></TableCell>
      <ActionCell row={row} modelName="Client" onEdit={onEdit}/>
    </TableRow>
  );
}