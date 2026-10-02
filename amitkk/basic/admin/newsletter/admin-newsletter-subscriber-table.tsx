import { TableCell, TableRow } from '@amitkk/components/basic/table';
import UserRow from '@amitkk/basic/static/UserRow';
import type { UserRowProps } from '@amitkk/basic/types/user';
import { NewsLetterFormProps } from '@amitkk/basic/types';
import { ActionCell } from "@amitkk/components/basic/ActionCell";

export interface DataProps extends NewsLetterFormProps {
};

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <TableRow>
      <TableCell><UserRow row={row as UserRowProps}/></TableCell>
      <ActionCell row={row} modelName="NewsLetterSubscriber" onEdit={onEdit}/>
    </TableRow>
  );
}
