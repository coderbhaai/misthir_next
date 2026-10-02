import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { BankProps } from '../types';
import UserRow from '@amitkk/basic/static/UserRow';
import { UserRowProps } from '@amitkk/basic/types/user';
import { ActionCell } from '@amitkk/components/basic/ActionCell';

export interface DataProps extends BankProps {
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
        <TableCell>{row.account}</TableCell>
        <TableCell>{row.ifsc}</TableCell>
        <TableCell>{row.branch}</TableCell>
        <TableCell>{row.bank}</TableCell>
        <ActionCell row={row} modelName="Blogmeta" onEdit={onEdit}/>
      </TableRow>
    </>
  );
}
