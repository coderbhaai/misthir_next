import { EditCell } from '@amitkk/components/basic/EditCell';
import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { KeywordProps } from '@amitkk/seo/types/keyword';

export interface DataProps extends KeywordProps {
};

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <TableRow>
      <TableCell>{row.module}</TableCell>
      <TableCell></TableCell>
      <EditCell onClick={() => onEdit(row)}/>
    </TableRow>
  );
}
