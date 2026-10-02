import { TableCell, TableRow } from '@amitkk/components/basic/table';
import UserRow from '@amitkk/basic/static/UserRow';
import { UserRowProps } from '@amitkk/basic/types/user';
import { ActionCell } from '@amitkk/components/basic/ActionCell';

export type DataProps = {
  function: string;
  productmeta_id: string;
  seller_id: string;
  percentage: number;
  createdAt: Date;
  updatedAt: Date;
  _id: string;
  selectedDataId: string | number | object | null;
};

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <>
      <TableRow>
        <TableCell>{(row.productmeta_id as any).name}</TableCell>
        <TableCell><UserRow row={row.seller_id as unknown as UserRowProps}/></TableCell>
        <TableCell>{row.percentage}</TableCell>
        <ActionCell row={row} modelName="Blogmeta" onEdit={onEdit}/>
      </TableRow>
    </>
  );
}
