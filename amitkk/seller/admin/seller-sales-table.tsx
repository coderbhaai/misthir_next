import { TableCell, TableRow } from '@amitkk/components/basic/table';
import DateTimeFormat from '@amitkk/components/admin/date-format';
import { SaleProps } from '@amitkk/ecom/types';
import { ActionCell } from '@amitkk/components/basic/ActionCell';
import { renderDecimal } from '@amitkk/basic/utils/my-utils/shared-utils';

export interface DataProps extends SaleProps{
  totalSkus: number;
  totalProducts: number;
}

type Props = {
  row: DataProps;
  onEdit: (row: DataProps) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
    <>
      <TableRow>
        <TableCell>{row.name}</TableCell>
        <TableCell><DateTimeFormat value={row.valid_from}/>- <DateTimeFormat value={row.valid_to}/></TableCell>
        <TableCell>{row.type} - {row.type === "Amount Based" ? "₹" : null}{renderDecimal(row.discount)}{row.type === "Percent Based" ? "%" : null}</TableCell>
        <TableCell>{row.totalProducts}</TableCell>
        <TableCell>{row.totalSkus}</TableCell>
        <ActionCell row={row} modelName="Blogmeta" onEdit={onEdit}/>
      </TableRow>
    </>
  );
}
