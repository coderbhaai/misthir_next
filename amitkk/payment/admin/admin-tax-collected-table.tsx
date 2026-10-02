import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { TaxCollectedProps } from '@amitkk/payment/types';
import { ActionCell } from '@amitkk/components/basic/ActionCell';

export interface DataProps extends TaxCollectedProps {
  function: string;
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
        <TableCell>{row.module}</TableCell>
        <TableCell>{row.cgst || 0}</TableCell>
        <TableCell>{row.sgst || 0}</TableCell>
        <TableCell>{row.igst || 0}</TableCell>
        <TableCell>{row.total || 0}</TableCell>
        <ActionCell row={row} modelName="Blogmeta" onEdit={onEdit}/>
      </TableRow>
    </>
  );
}
