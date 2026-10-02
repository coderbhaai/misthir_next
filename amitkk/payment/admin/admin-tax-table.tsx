import {Types} from 'mongoose';
import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { TaxProps } from '@amitkk/payment/types';
import { ActionCell } from '@amitkk/components/basic/ActionCell';

export interface DataProps extends TaxProps {
  function: string;
  _id: string | Types.ObjectId;
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
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.rate}</TableCell>
        <ActionCell row={row} modelName="Tax" onEdit={onEdit}/>
      </TableRow>
    </>
  );
}
