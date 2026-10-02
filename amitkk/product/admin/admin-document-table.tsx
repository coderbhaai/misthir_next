import { TableCell, TableRow } from '@amitkk/components/basic/table';
import MediaImage from '@amitkk/components/admin/table-image';
import { DocumentProps } from '../types';
import UserRow from '@amitkk/basic/static/UserRow';
import { UserRowProps } from '@amitkk/basic/types/user';
import { ActionCell } from '@amitkk/components/basic/ActionCell';
import { MediaProps } from '@amitkk/basic/types/media';

export interface DataProps extends DocumentProps {
};

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <>
      <TableRow>
        <TableCell><UserRow row={row.user_id as unknown as UserRowProps}/></TableCell>
        <TableCell>{row.name}</TableCell>
        <TableCell><MediaImage media={row.media_id as MediaProps}/></TableCell>
        <ActionCell row={row} modelName="Blogmeta" onEdit={onEdit}/>
      </TableRow>
    </>
  );
}
