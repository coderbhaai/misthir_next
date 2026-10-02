import { TableCell, TableRow } from '@amitkk/components/basic/table';
import UserRow from '@amitkk/basic/static/UserRow';
import type { UserRowProps } from '@amitkk/basic/types/user';

export interface DataProps {
  _id: string;
  term: string;
  frequency: number;
  user_id: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  row: DataProps;
};

export function AdminDataTable({ row }: Props) {
  return (
    <>
      <TableRow>
        <TableCell>{row.term}</TableCell>
        <TableCell>{row.frequency}</TableCell>
        <TableCell><UserRow row={row.user_id as unknown as UserRowProps}/><br/></TableCell>
        <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
      </TableRow>
    </>
  );
}
